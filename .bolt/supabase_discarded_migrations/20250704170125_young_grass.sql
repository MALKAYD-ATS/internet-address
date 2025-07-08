/*
  # Create practice questions table

  1. New Tables
    - `practice_questions`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses_ats)
      - `question` (text)
      - `option_a`, `option_b`, `option_c`, `option_d` (text)
      - `correct_answer` (text, constrained to A, B, C, D)
      - `explanation` (text)
      - `image_url` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `practice_questions` table
    - Add policy for public read access to practice questions

  3. Sample Data
    - Insert sample practice questions for existing courses
*/

-- Create practice_questions table with UUID primary key to match courses_ats
CREATE TABLE IF NOT EXISTS practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid,
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

-- Add foreign key constraint to courses_ats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'practice_questions_course_id_fkey'
  ) THEN
    ALTER TABLE practice_questions 
    ADD CONSTRAINT practice_questions_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses_ats(id) ON DELETE CASCADE;
  END IF;
END $$;

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

-- Insert sample practice questions using actual course UUIDs from courses_ats table
-- First, let's get the course IDs and insert questions for existing courses

-- Insert sample questions for the first available course (Basic Operations)
INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the minimum age requirement for RPAS Basic Certification in Canada?',
  '14 years',
  '16 years', 
  '18 years',
  '21 years',
  'A',
  'Transport Canada requires pilots to be at least 14 years old for RPAS Basic Certification.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What does RPAS stand for?',
  'Remote Pilot Aircraft System',
  'Remotely Piloted Aircraft System',
  'Remote Powered Aircraft System', 
  'Remotely Powered Aircraft System',
  'B',
  'RPAS stands for Remotely Piloted Aircraft System, which is the official term used by Transport Canada.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the maximum altitude for RPAS operations without special authorization?',
  '300 feet AGL',
  '400 feet AGL',
  '500 feet AGL',
  '1000 feet AGL',
  'B',
  'The maximum altitude for RPAS operations is 400 feet above ground level (AGL) without special authorization.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'Which document must RPAS pilots carry during flight operations?',
  'Pilot certificate only',
  'Aircraft registration only',
  'Both pilot certificate and aircraft registration',
  'Insurance documents only',
  'C',
  'RPAS pilots must carry both their pilot certificate and aircraft registration documents during flight operations.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the minimum distance from airports for RPAS operations?',
  '3 nautical miles',
  '5.5 kilometers',
  '9 kilometers',
  '15 kilometers',
  'C',
  'RPAS operations must maintain a minimum distance of 9 kilometers from airports unless authorized.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What weather condition is most dangerous for drone operations?',
  'Light rain',
  'High winds',
  'Overcast skies',
  'Cold temperatures',
  'B',
  'High winds pose the greatest risk to drone operations as they can cause loss of control and crashes.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is required before flying in controlled airspace?',
  'Weather check only',
  'ATC authorization',
  'Insurance verification',
  'Equipment inspection',
  'B',
  'Air Traffic Control (ATC) authorization is required before flying in controlled airspace.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the maximum weight for micro RPAS category?',
  '100 grams',
  '250 grams',
  '500 grams',
  '1 kilogram',
  'B',
  'Micro RPAS category includes drones weighing 250 grams or less.',
  id
FROM courses_ats 
WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%'
LIMIT 1;

-- Insert sample questions for advanced courses
INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What additional requirements apply to RPAS Advanced operations?',
  'Night flying only',
  'Complex airspace operations',
  'International flights',
  'Commercial insurance',
  'B',
  'RPAS Advanced certification allows operations in complex airspace and controlled airspace.',
  id
FROM courses_ats 
WHERE title ILIKE '%advanced%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the minimum age for RPAS Advanced Certification?',
  '14 years',
  '16 years',
  '18 years',
  '21 years',
  'B',
  'RPAS Advanced Certification requires pilots to be at least 16 years old.',
  id
FROM courses_ats 
WHERE title ILIKE '%advanced%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What type of medical certificate is required for RPAS Advanced operations?',
  'Class 1 medical',
  'Class 3 medical',
  'Aviation medical',
  'No medical required',
  'D',
  'No medical certificate is required for RPAS operations under current regulations.',
  id
FROM courses_ats 
WHERE title ILIKE '%advanced%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the maximum distance for BVLOS operations?',
  '1 kilometer',
  '5 kilometers',
  'No specific limit',
  'Requires special authorization',
  'D',
  'Beyond Visual Line of Sight (BVLOS) operations require special authorization from Transport Canada.',
  id
FROM courses_ats 
WHERE title ILIKE '%advanced%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What equipment is mandatory for night RPAS operations?',
  'Strobe lights only',
  'Navigation lights only',
  'Both strobe and navigation lights',
  'Thermal camera',
  'C',
  'Night operations require both strobe lights and navigation lights for visibility and safety.',
  id
FROM courses_ats 
WHERE title ILIKE '%advanced%'
LIMIT 1;

-- Insert questions for application/mapping courses
INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the primary advantage of photogrammetry over traditional surveying?',
  'Lower cost only',
  'Faster data collection',
  'Higher accuracy only',
  'No equipment needed',
  'B',
  'Photogrammetry allows for much faster data collection over large areas compared to traditional ground surveying methods.',
  id
FROM courses_ats 
WHERE title ILIKE '%mapping%' OR title ILIKE '%photogrammetry%' OR title ILIKE '%survey%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What overlap percentage is typically required for aerial photography in mapping?',
  '30%',
  '50%',
  '80%',
  '95%',
  'C',
  'Aerial photography for mapping typically requires 80% overlap to ensure proper image processing and 3D reconstruction.',
  id
FROM courses_ats 
WHERE title ILIKE '%mapping%' OR title ILIKE '%photogrammetry%' OR title ILIKE '%survey%'
LIMIT 1;

-- Insert questions for thermal inspection courses
INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What is the ideal time of day for thermal inspections of buildings?',
  'Early morning',
  'Midday',
  'Late afternoon',
  'Midnight',
  'A',
  'Early morning provides the best thermal contrast for building inspections as structures have had time to cool overnight.',
  id
FROM courses_ats 
WHERE title ILIKE '%thermal%' OR title ILIKE '%inspection%'
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What does a "hot spot" in thermal imaging typically indicate?',
  'Normal operation',
  'Potential problem area',
  'Cold temperature',
  'Camera malfunction',
  'B',
  'Hot spots in thermal imaging often indicate potential problem areas such as electrical faults, insulation issues, or mechanical problems.',
  id
FROM courses_ats 
WHERE title ILIKE '%thermal%' OR title ILIKE '%inspection%'
LIMIT 1;

-- Insert general questions for any remaining courses
INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'How long is an RPAS certificate valid?',
  '1 year',
  '2 years',
  '5 years',
  '10 years',
  'C',
  'RPAS certificates are valid for 5 years from the date of issue.',
  id
FROM courses_ats 
LIMIT 1;

INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id)
SELECT 
  'What happens if you fail the RPAS exam?',
  'Retake immediately',
  'Wait 24 hours',
  'Wait 30 days',
  'Retake training',
  'B',
  'If you fail the RPAS exam, you must wait 24 hours before retaking it.',
  id
FROM courses_ats 
LIMIT 1;