/*
  # Create student module progress tracking

  1. New Tables
    - `student_module_progress` - Track student completion of modules
    - Add practice exam fields to courses_ats if they don't exist

  2. Security
    - Enable RLS on student_module_progress
    - Add policies for students to access only their own progress

  3. Indexes
    - Add indexes for efficient querying
*/

-- Create student_module_progress table
CREATE TABLE IF NOT EXISTS student_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses_ats(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES ats_course_modules(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, module_id)
);

-- Add practice exam fields to courses_ats if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses_ats' AND column_name = 'practice_exam_time_limit'
  ) THEN
    ALTER TABLE courses_ats ADD COLUMN practice_exam_time_limit integer DEFAULT 60; -- minutes
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses_ats' AND column_name = 'practice_exam_question_count'
  ) THEN
    ALTER TABLE courses_ats ADD COLUMN practice_exam_question_count integer DEFAULT 20;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE student_module_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for student_module_progress
CREATE POLICY "Students can view their own progress"
  ON student_module_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress"
  ON student_module_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress"
  ON student_module_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_module_progress_student_id ON student_module_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_course_id ON student_module_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_module_id ON student_module_progress(module_id);

-- Update existing courses with practice exam settings
UPDATE courses_ats 
SET 
  practice_exam_time_limit = CASE 
    WHEN level = 'Beginner' THEN 45
    WHEN level = 'Advanced' THEN 60
    WHEN level = 'Expert' THEN 90
    ELSE 60
  END,
  practice_exam_question_count = CASE 
    WHEN level = 'Beginner' THEN 15
    WHEN level = 'Advanced' THEN 25
    WHEN level = 'Expert' THEN 30
    ELSE 20
  END
WHERE practice_exam_time_limit IS NULL OR practice_exam_question_count IS NULL;