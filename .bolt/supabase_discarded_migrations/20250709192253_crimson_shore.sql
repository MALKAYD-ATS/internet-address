/*
  # Fix Principles Section with Color Fields

  1. Schema Updates
    - Add color_from and color_to columns to principles table
    - Update existing principles with proper gradient colors
    - Ensure all required fields are populated

  2. Data Updates
    - Set proper Tailwind gradient classes for Vision and Mission
    - Ensure symbols are properly set
*/

-- Add color columns to principles table
DO $$
BEGIN
  -- Add color_from column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'principles' AND column_name = 'color_from'
  ) THEN
    ALTER TABLE principles ADD COLUMN color_from text DEFAULT 'from-blue-600';
  END IF;

  -- Add color_to column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'principles' AND column_name = 'color_to'
  ) THEN
    ALTER TABLE principles ADD COLUMN color_to text DEFAULT 'to-blue-800';
  END IF;
END $$;

-- Update existing principles with proper colors and ensure all fields are set
UPDATE principles 
SET 
  color_from = CASE 
    WHEN LOWER(title) = 'vision' THEN 'from-blue-600'
    WHEN LOWER(title) = 'mission' THEN 'from-green-600'
    ELSE 'from-gray-600'
  END,
  color_to = CASE 
    WHEN LOWER(title) = 'vision' THEN 'to-blue-800'
    WHEN LOWER(title) = 'mission' THEN 'to-green-800'
    ELSE 'to-gray-800'
  END,
  symbol = CASE 
    WHEN symbol IS NULL OR symbol = '' THEN
      CASE 
        WHEN LOWER(title) = 'vision' THEN 'Eye'
        WHEN LOWER(title) = 'mission' THEN 'Target'
        ELSE 'Award'
      END
    ELSE symbol
  END
WHERE color_from IS NULL OR color_to IS NULL OR symbol IS NULL OR symbol = '';

-- Insert principles if they don't exist with all required fields
INSERT INTO principles (symbol, title, text, color_from, color_to, order_index) 
SELECT * FROM (VALUES 
  ('Eye', 'Vision', 'Create Leaders, Innovators, Entrepreneurs, and Strong Youth within Indigenous Communities', 'from-blue-600', 'to-blue-800', 1),
  ('Target', 'Mission', 'Train and Prepare Individuals, Organizations, First Nations Peoples & Communities for Drone Technology and Innovation', 'from-green-600', 'to-green-800', 2)
) AS v(symbol, title, text, color_from, color_to, order_index)
WHERE NOT EXISTS (SELECT 1 FROM principles);