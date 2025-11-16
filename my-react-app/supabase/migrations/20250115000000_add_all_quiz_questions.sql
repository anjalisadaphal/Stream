-- Migration to add all 50 quiz questions
-- This migration inserts all questions from the assessment

-- Insert all questions (only if they don't already exist)
INSERT INTO public.questions (question_text, option_1, option_2, option_3, option_4, correct_answer, domain, difficulty)
SELECT * FROM (VALUES
  -- Section 1: Programming & Logic (P-Focused) - 10 questions
  ('Which data structure works on the principle of LIFO?', 'Queue', 'Stack', 'Array', 'Tree', 2, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('What is the purpose of an API?', 'To test system performance', 'To connect applications and exchange data', 'To clean datasets', 'To measure accuracy', 2, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('Which of the following is an OOP concept?', 'Aggregation', 'Encapsulation', 'Summarization', 'Visualization', 2, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('What does SQL stand for?', 'Structured Query Language', 'Simple Quality Logic', 'Secure Query Level', 'System Query List', 1, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('A loop that never ends is called:', 'Limited loop', 'Infinite loop', 'Dead loop', 'Null loop', 2, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('Which of the following is a backend language?', 'HTML', 'CSS', 'Java', 'Figma', 3, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('What is the output of 10 % 3?', '1', '3', '10', '0', 1, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('Which is best for writing server-side applications?', 'JavaScript', 'Python', 'Java', 'All of the above', 4, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('What does DevOps mainly focus on?', 'UI design', 'Combining development and operations', 'Building datasets', 'Only testing', 2, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('A compiler:', 'Executes code line by line', 'Converts full code into machine language', 'Fixes errors automatically', 'Only tests code', 2, 'programmer'::quiz_domain, 'medium'::difficulty_level),

  -- Section 2: Analytics & Data Interpretation (A-Focused) - 10 questions
  ('Mean of values 4, 6, 10 is:', '6', '7', '8', '10', 2, 'analytics'::quiz_domain, 'easy'::difficulty_level),
  ('Which chart is best for displaying trends over time?', 'Pie chart', 'Bar chart', 'Line chart', 'Scatter plot', 3, 'analytics'::quiz_domain, 'easy'::difficulty_level),
  ('Data cleaning mainly involves:', 'Designing UI', 'Removing errors & inconsistencies', 'Running test cases', 'Building APIs', 2, 'analytics'::quiz_domain, 'medium'::difficulty_level),
  ('In statistics, "correlation" measures:', 'Similarity in software', 'Relationship between variables', 'File duplication', 'Code quality', 2, 'analytics'::quiz_domain, 'medium'::difficulty_level),
  ('A dataset with large outliers should use which central measure?', 'Mean', 'Mode', 'Median', 'None', 3, 'analytics'::quiz_domain, 'medium'::difficulty_level),
  ('Which of these describes Big Data?', 'Volume, Velocity, Variety', 'Value, Version, Variance', 'Vectors, Variables, Views', 'None', 1, 'analytics'::quiz_domain, 'medium'::difficulty_level),
  ('Which tool is commonly used for data visualization?', 'GitHub', 'Tableau', 'Jenkins', 'JMeter', 2, 'analytics'::quiz_domain, 'easy'::difficulty_level),
  ('Regression is used to:', 'Predict numerical values', 'Test software', 'Count duplicates', 'Sort strings', 1, 'analytics'::quiz_domain, 'medium'::difficulty_level),
  ('Outliers impact:', 'Mean', 'Mode', 'Both', 'Neither', 1, 'analytics'::quiz_domain, 'medium'::difficulty_level),
  ('A confusion matrix is used in:', 'Testing', 'Machine learning', 'Database design', 'UI development', 2, 'analytics'::quiz_domain, 'medium'::difficulty_level),

  -- Section 3: Testing & Quality Assurance (T-Focused) - 10 questions
  ('Which test checks system performance under load?', 'Smoke testing', 'Regression testing', 'Load testing', 'Unit testing', 3, 'tester'::quiz_domain, 'medium'::difficulty_level),
  ('"Bug" in testing refers to:', 'Good feature', 'Error in software', 'Updated version', 'External plugin', 2, 'tester'::quiz_domain, 'easy'::difficulty_level),
  ('Selenium is used for:', 'Backend development', 'Automation testing', 'UI design', 'Data cleaning', 2, 'tester'::quiz_domain, 'easy'::difficulty_level),
  ('Unit testing focuses on:', 'Entire application', 'A group of modules', 'Individual components', 'User experience', 3, 'tester'::quiz_domain, 'easy'::difficulty_level),
  ('Which test ensures new changes do not break existing features?', 'Regression testing', 'Sanity testing', 'Smoke testing', 'Beta testing', 1, 'tester'::quiz_domain, 'medium'::difficulty_level),
  ('Test cases should be:', 'Random', 'Well structured', 'Complicated', 'Private', 2, 'tester'::quiz_domain, 'easy'::difficulty_level),
  ('Black-box testing means:', 'Tester knows internal code', 'Tester doesn''t know internal structure', 'Only developer works', 'Only automation allowed', 2, 'tester'::quiz_domain, 'medium'::difficulty_level),
  ('Beta testing is performed by:', 'Developers', 'Testers', 'End users', 'Security team', 3, 'tester'::quiz_domain, 'easy'::difficulty_level),
  ('A test scenario represents:', 'Test tools', 'High-level testing requirement', 'Code block', 'Dataset', 2, 'tester'::quiz_domain, 'medium'::difficulty_level),
  ('JUnit is used in:', 'Java automation testing', 'Database design', 'Machine learning', 'Cloud computing', 1, 'tester'::quiz_domain, 'easy'::difficulty_level),

  -- Section 4: Mixed General Aptitude (Neutral) - 10 questions
  ('If A = 1, B = 2, … Z = 26, what is the sum of C + D?', '6', '7', '3', '10', 1, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('What comes next in the series: 2, 4, 8, 16, ?', '20', '24', '32', '64', 3, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('15% of 200 is:', '15', '20', '30', '40', 3, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('Identify the odd one out:', 'SQL', 'MongoDB', 'Oracle', 'Python', 4, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('A man facing north turns right, then right again. He is facing:', 'East', 'South', 'West', 'North', 2, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('Solve: 125 ÷ 5', '20', '25', '30', '35', 2, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('Which is a text-based data format?', 'PNG', 'JSON', 'MP3', 'GIF', 2, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('RAM stands for:', 'Random Access Memory', 'Remote Access Mode', 'Read And Modify', 'None', 1, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('A flowchart is used for:', 'Data collection', 'Testing UI', 'Representing program logic', 'Displaying database', 3, 'programmer'::quiz_domain, 'easy'::difficulty_level),
  ('Which is an example of cloud storage?', 'MySQL', 'Google Drive', 'Figma', 'Eclipse', 2, 'programmer'::quiz_domain, 'easy'::difficulty_level),

  -- Section 5: Personality & Skill Inclination (Stream Prediction) - 10 questions
  -- Note: These are personality questions, assigning to programmer domain as default
  ('You enjoy tasks that involve:', 'Finding logical solutions', 'Finding patterns in data', 'Finding issues in systems', 'None', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('You are more comfortable with:', 'Writing code', 'Working with numbers', 'Testing software', 'All', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('You prefer:', 'Building systems', 'Analyzing performance', 'Validating quality', 'All of the above', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('Which task excites you most?', 'Creating an app', 'Predicting outcomes', 'Breaking software to find bugs', 'All of the above', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('Your ideal working style:', 'Creative coding', 'Logical interpretation', 'Detailed checking', 'All of the above', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('You are frustrated most by:', 'Syntax errors', 'Incomplete data', 'Software crashes', 'All of the above', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('A perfect day at work includes:', 'Solving bugs in code', 'Playing with charts', 'Running test scripts', 'All of the above', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('You are best at:', 'Debugging', 'Finding trends', 'Spotting issues', 'All of the above', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('If given a project, you will:', 'Start coding features', 'Analyze requirements', 'Create test plans', 'All of the above', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level),
  ('Which field would you choose if all pay is equal?', 'Programming', 'Analytic', 'Testing', 'Not sure', 1, 'programmer'::quiz_domain, 'medium'::difficulty_level)
) AS v(question_text, option_1, option_2, option_3, option_4, correct_answer, domain, difficulty)
WHERE NOT EXISTS (
  SELECT 1 FROM public.questions q 
  WHERE q.question_text = v.question_text
);

