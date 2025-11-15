-- Create enums if they don't exist (drop and recreate to avoid conflicts)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.quiz_domain AS ENUM ('programmer', 'analytics', 'tester');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (CRITICAL: separate table for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  option_1 TEXT NOT NULL,
  option_2 TEXT NOT NULL,
  option_3 TEXT NOT NULL,
  option_4 TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 1 AND 4),
  domain quiz_domain NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_domain quiz_domain NOT NULL,
  programmer_score INTEGER NOT NULL DEFAULT 0,
  analytics_score INTEGER NOT NULL DEFAULT 0,
  tester_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quiz_responses table
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL CHECK (selected_answer BETWEEN 1 AND 4),
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions;
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can view their own responses" ON public.quiz_responses;
DROP POLICY IF EXISTS "Users can insert their own responses" ON public.quiz_responses;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for questions
CREATE POLICY "Authenticated users can view questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questions"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questions"
  ON public.questions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_responses
CREATE POLICY "Users can view their own responses"
  ON public.quiz_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own responses"
  ON public.quiz_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop and recreate update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample questions (only if table is empty)
INSERT INTO public.questions (question_text, option_1, option_2, option_3, option_4, correct_answer, domain, difficulty)
SELECT * FROM (VALUES
  ('What is the output of print(2 ** 3)?', '6', '8', '9', '5', 2, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('Which data structure uses LIFO?', 'Queue', 'Stack', 'Array', 'Tree', 2, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('What does SQL stand for?', 'Structured Query Language', 'Simple Query Language', 'System Query Language', 'Standard Query Language', 1, 'analytics'::quiz_domain, 'easy'::difficulty_level),
  ('Which chart is best for showing proportions?', 'Line Chart', 'Bar Chart', 'Pie Chart', 'Scatter Plot', 3, 'analytics'::quiz_domain, 'medium'::difficulty_level),
  ('What is a test case?', 'A bug report', 'A set of conditions to verify functionality', 'A user story', 'A code review', 2, 'tester'::quiz_domain, 'easy'::difficulty_level),
  ('What is regression testing?', 'Testing new features', 'Re-testing after fixes', 'Performance testing', 'Security testing', 2, 'tester'::quiz_domain, 'medium'::difficulty_level)
) AS v(question_text, option_1, option_2, option_3, option_4, correct_answer, domain, difficulty)
WHERE NOT EXISTS (SELECT 1 FROM public.questions LIMIT 1);