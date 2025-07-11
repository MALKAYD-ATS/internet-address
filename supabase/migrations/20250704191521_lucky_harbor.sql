/*
  # Add is_online column to courses_ats table

  1. Schema Changes
    - Add `is_online` boolean column to `courses_ats` table
    - Set default value to `false` for existing courses
    - Update some sample courses to be online for testing

  2. Data Updates
    - Mark appropriate courses as online based on course type and delivery method
*/

-- Add is_online column to courses_ats table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses_ats' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE courses_ats ADD COLUMN is_online boolean DEFAULT false;
  END IF;
END $$;

-- Update existing courses to mark some as online
-- This is a sample update - in production, you would set this based on actual course delivery methods
UPDATE courses_ats 
SET is_online = true 
WHERE 
  title ILIKE '%online%' 
  OR description ILIKE '%online%'
  OR type = 'Regulation'  -- Assuming regulation courses can be delivered online
  OR duration ILIKE '%self-paced%';

-- If no courses are marked as online yet, mark the first few as online for demonstration
DO $$
BEGIN
  -- Check if any courses are marked as online
  IF NOT EXISTS (SELECT 1 FROM courses_ats WHERE is_online = true) THEN
    -- Mark first 3 courses as online for demonstration
    UPDATE courses_ats 
    SET is_online = true 
    WHERE id IN (
      SELECT id FROM courses_ats 
      WHERE is_active = true 
      ORDER BY created_at 
      LIMIT 3
    );
  END IF;
END $$;