/*
  # Create student certificates table

  1. New Tables
    - `student_certificates`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `course_id` (uuid, foreign key to courses_ats)
      - `certificate_url` (text, URL to generated certificate PDF)
      - `issued_at` (timestamp)
      - `student_name` (text, name as it appears on certificate)
      - `course_title` (text, course title as it appears on certificate)

  2. Security
    - Enable RLS on `student_certificates` table
    - Add policy for students to read their own certificates
*/

CREATE TABLE IF NOT EXISTS student_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses_ats(id) ON DELETE CASCADE,
  certificate_url text NOT NULL,
  issued_at timestamptz DEFAULT now(),
  student_name text NOT NULL,
  course_title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own certificates"
  ON student_certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own certificates"
  ON student_certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);