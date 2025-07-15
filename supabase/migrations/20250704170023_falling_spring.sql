/*
  # Create practice questions table

  1. New Tables
    - `practice_questions`
      - `id` (bigint, primary key)
      - `question` (text, required)
      - `option_a`, `option_b`, `option_c`, `option_d` (text, required)
      - `correct_answer` (text, A/B/C/D only)
      - `explanation` (text, required)
      - `image_url` (text, optional)
      - `course_id` (uuid, foreign key to courses_ats.id)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `practice_questions` table
    - Add policy for public read access to practice questions

  3. Sample Data
    - Insert practice questions for existing courses
    - Questions cover basic and advanced RPAS topics
*/

CREATE TABLE IF NOT EXISTS practice_questions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text NOT NULL,
  image_url text,
  course_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
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
CREATE POLICY "Allow public read access to practice questions"
  ON practice_questions
  FOR SELECT
  TO public
  USING (true);

-- Insert sample practice questions using actual course UUIDs from courses_ats table
-- First, let's get some course IDs to use for sample data
DO $$
DECLARE
  course_uuid_1 uuid;
  course_uuid_2 uuid;
  course_uuid_3 uuid;
BEGIN
  -- Get the first few course UUIDs from courses_ats table
  SELECT id INTO course_uuid_1 FROM courses_ats ORDER BY created_at LIMIT 1;
  SELECT id INTO course_uuid_2 FROM courses_ats ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO course_uuid_3 FROM courses_ats ORDER BY created_at LIMIT 1 OFFSET 2;
  
  -- Only insert if we have at least one course
  IF course_uuid_1 IS NOT NULL THEN
    -- Insert sample questions for first course
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What is the minimum age requirement for RPAS Basic Certification in Canada?', '14 years', '16 years', '18 years', '21 years', 'A', 'Transport Canada requires pilots to be at least 14 years old for RPAS Basic Certification.', course_uuid_1),
    ('What does RPAS stand for?', 'Remote Pilot Aircraft System', 'Remotely Piloted Aircraft System', 'Remote Powered Aircraft System', 'Remotely Powered Aircraft System', 'B', 'RPAS stands for Remotely Piloted Aircraft System, which is the official term used by Transport Canada.', course_uuid_1),
    ('What is the maximum altitude for RPAS operations without special authorization?', '300 feet AGL', '400 feet AGL', '500 feet AGL', '1000 feet AGL', 'B', 'The maximum altitude for RPAS operations is 400 feet above ground level (AGL) without special authorization.', course_uuid_1),
    ('Which document must RPAS pilots carry during flight operations?', 'Pilot certificate only', 'Aircraft registration only', 'Both pilot certificate and aircraft registration', 'Insurance documents only', 'C', 'RPAS pilots must carry both their pilot certificate and aircraft registration documents during flight operations.', course_uuid_1),
    ('What is the minimum distance from airports for RPAS operations?', '3 nautical miles', '5.5 kilometers', '9 kilometers', '15 kilometers', 'C', 'RPAS operations must maintain a minimum distance of 9 kilometers from airports unless authorized.', course_uuid_1),
    ('What weather condition is most dangerous for RPAS operations?', 'Light rain', 'High winds', 'Overcast skies', 'Cold temperatures', 'B', 'High winds pose the greatest risk to drone operations as they can cause loss of control and crashes.', course_uuid_1),
    ('What is required before flying in controlled airspace?', 'Weather check only', 'ATC authorization', 'Insurance verification', 'Equipment inspection', 'B', 'Air Traffic Control (ATC) authorization is required before flying in controlled airspace.', course_uuid_1),
    ('What is the maximum weight for micro RPAS category?', '100 grams', '250 grams', '500 grams', '1 kilogram', 'B', 'Micro RPAS category includes drones weighing 250 grams or less.', course_uuid_1);
  END IF;
  
  -- Insert questions for second course if it exists
  IF course_uuid_2 IS NOT NULL THEN
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What additional requirements apply to RPAS Advanced operations?', 'Night flying only', 'Complex airspace operations', 'International flights', 'Commercial insurance', 'B', 'RPAS Advanced certification allows operations in complex airspace and controlled airspace.', course_uuid_2),
    ('What is the minimum age for RPAS Advanced Certification?', '14 years', '16 years', '18 years', '21 years', 'B', 'RPAS Advanced Certification requires pilots to be at least 16 years old.', course_uuid_2),
    ('What type of medical certificate is required for RPAS Advanced operations?', 'Class 1 medical', 'Class 3 medical', 'Aviation medical', 'No medical required', 'D', 'No medical certificate is required for RPAS operations under current regulations.', course_uuid_2),
    ('What is the maximum distance for BVLOS operations?', '1 kilometer', '5 kilometers', 'No specific limit', 'Requires special authorization', 'D', 'Beyond Visual Line of Sight (BVLOS) operations require special authorization from Transport Canada.', course_uuid_2),
    ('What equipment is mandatory for night RPAS operations?', 'Strobe lights only', 'Navigation lights only', 'Both strobe and navigation lights', 'Thermal camera', 'C', 'Night operations require both strobe lights and navigation lights for visibility and safety.', course_uuid_2),
    ('What is the validity period for RPAS Advanced Certificate?', '1 year', '2 years', '5 years', '10 years', 'C', 'RPAS Advanced certificates are valid for 5 years from the date of issue.', course_uuid_2),
    ('Which airspace requires RPAS Advanced certification?', 'Class G only', 'Class E and above', 'Controlled airspace', 'International airspace', 'C', 'Operations in controlled airspace require RPAS Advanced certification.', course_uuid_2),
    ('What is required for commercial RPAS operations?', 'Basic certificate only', 'Advanced certificate', 'Special endorsement', 'Commercial license', 'B', 'Commercial RPAS operations typically require Advanced certification.', course_uuid_2);
  END IF;
  
  -- Insert questions for third course if it exists
  IF course_uuid_3 IS NOT NULL THEN
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What is the primary advantage of online RPAS training?', 'Lower cost', 'Self-paced learning', 'No exams required', 'Shorter duration', 'B', 'Online training allows students to learn at their own pace and schedule.', course_uuid_3),
    ('How long is an RPAS certificate valid?', '1 year', '2 years', '5 years', '10 years', 'C', 'RPAS certificates are valid for 5 years from the date of issue.', course_uuid_3),
    ('What happens if you fail the RPAS exam?', 'Retake immediately', 'Wait 24 hours', 'Wait 30 days', 'Retake training', 'B', 'If you fail the RPAS exam, you must wait 24 hours before retaking it.', course_uuid_3),
    ('Which organization regulates RPAS in Canada?', 'NAV CANADA', 'Transport Canada', 'Canadian Aviation Regulations', 'ICAO', 'B', 'Transport Canada is the regulation authority for RPAS operations in Canada.', course_uuid_3),
    ('What is the maximum takeoff weight for small RPAS?', '25 kg', '35 kg', '45 kg', '55 kg', 'A', 'Small RPAS category includes aircraft with maximum takeoff weight of 25 kg or less.', course_uuid_3),
    ('What documentation is required for RPAS registration?', 'Proof of purchase only', 'Owner information only', 'Both owner info and aircraft details', 'Insurance documents', 'C', 'RPAS registration requires both owner information and detailed aircraft specifications.', course_uuid_3);
  END IF;
  
END $$;