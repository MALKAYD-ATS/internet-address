/*
  # Practice Questions Table Setup

  1. Table Structure
    - Ensures practice_questions table exists with correct schema
    - Uses UUID for course_id to match courses_ats table
    - Includes proper constraints and foreign key relationships

  2. Security
    - Enable RLS on practice_questions table
    - Add policy for public read access to practice questions

  3. Data
    - No sample data insertion (existing data will be used)
*/

-- Ensure practice_questions table exists with correct structure
-- (This is safe to run even if table already exists)
CREATE TABLE IF NOT EXISTS practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses_ats(id) ON DELETE CASCADE,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text,
  image_url text,
  created_at timestamp without time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'practice_questions' 
    AND policyname = 'Allow public read access to practice questions'
  ) THEN
    CREATE POLICY "Allow public read access to practice questions"
      ON practice_questions
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;