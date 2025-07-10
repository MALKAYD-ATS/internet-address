/*
  # Add profile_image column to students table

  1. Changes
    - Add `profile_image` column to `students` table
    - Column is nullable text type for storing image URLs
    - No breaking changes to existing data

  2. Security
    - No RLS changes needed as students table already has proper policies
*/

-- Add profile_image column to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE students ADD COLUMN profile_image text;
  END IF;
END $$;