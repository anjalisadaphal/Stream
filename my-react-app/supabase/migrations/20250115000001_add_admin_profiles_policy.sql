-- Migration to add RLS policy allowing admins to view all profiles
-- This fixes the issue where admin panel only shows 1 user instead of all users

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

