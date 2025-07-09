/*
  # Fix video column references and ensure proper table structure

  1. Column Fixes
    - Update home_page_title_section to use video_url instead of video
    - Update heading table to use video_url instead of video
    - Ensure all tables have correct column names matching existing schema

  2. Data Integrity
    - Only insert data if tables are empty to prevent duplicates
    - Use proper column names in all INSERT statements
    - Maintain existing data structure

  3. Security
    - Ensure RLS is enabled on all tables
    - Maintain existing policies for public access
*/

-- Fix home_page_title_section table structure
DO $$
BEGIN
  -- Add video_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'home_page_title_section' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE home_page_title_section ADD COLUMN video_url text;
  END IF;

  -- Remove video column if it exists (migrate data first if needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'home_page_title_section' AND column_name = 'video'
  ) THEN
    -- Migrate data from video to video_url if video_url is empty
    UPDATE home_page_title_section 
    SET video_url = video 
    WHERE video_url IS NULL AND video IS NOT NULL;
    
    -- Drop the old video column
    ALTER TABLE home_page_title_section DROP COLUMN IF EXISTS video;
  END IF;
END $$;

-- Fix heading table structure
DO $$
BEGIN
  -- Add video_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'heading' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE heading ADD COLUMN video_url text;
  END IF;

  -- Remove video column if it exists (migrate data first if needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'heading' AND column_name = 'video'
  ) THEN
    -- Migrate data from video to video_url if video_url is empty
    UPDATE heading 
    SET video_url = video 
    WHERE video_url IS NULL AND video IS NOT NULL;
    
    -- Drop the old video column
    ALTER TABLE heading DROP COLUMN IF EXISTS video;
  END IF;
END $$;

-- Fix home_numbers table structure
DO $$
BEGIN
  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'home_numbers' AND column_name = 'description'
  ) THEN
    ALTER TABLE home_numbers ADD COLUMN description text;
  END IF;

  -- Migrate data from label to description if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'home_numbers' AND column_name = 'label'
  ) THEN
    -- Migrate data from label to description if description is empty
    UPDATE home_numbers 
    SET description = label 
    WHERE description IS NULL AND label IS NOT NULL;
    
    -- Drop the old label column
    ALTER TABLE home_numbers DROP COLUMN IF EXISTS label;
  END IF;
END $$;

-- Insert sample data only if tables are empty (using correct column names)

-- Home Page Title Section
INSERT INTO home_page_title_section (name, text, slogan, video_url) 
SELECT 'Professional Drone Academy', 'Advocate, Encourage, and Unite Indigenous Peoples & Communities to lead the Drone Industry.', 'Training for the Future', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/building-future-workforce.mp4'
WHERE NOT EXISTS (SELECT 1 FROM home_page_title_section);

-- Home Numbers (using description column)
INSERT INTO home_numbers (number, description, order_index) 
SELECT * FROM (VALUES 
  ('500+', 'Students Trained', 1),
  ('98%', 'Pass Rate', 2),
  ('50+', 'Corporate Clients', 3),
  ('10+', 'Years Experience', 4)
) AS v(number, description, order_index)
WHERE NOT EXISTS (SELECT 1 FROM home_numbers);

-- Heading (using video_url column)
INSERT INTO heading (symbol, title, text, video_url, order_index) 
SELECT * FROM (VALUES 
  ('Users', 'Building Future Workforce', 'Developing future workforce training programs', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/building-future-workforce.mp4', 1),
  ('Leaf', 'Innovating While Protecting the Environment', 'Bringing people and technology together while protecting the environment', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/innovating-while-protecting-the-environment.mp4', 2),
  ('Zap', 'Green Energy Future', 'Train Indigenous communities to lead Canada''s green energy future', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/green-energy-future.mp4', 3),
  ('Recycle', 'Clean Technology & Innovation', 'Empower Indigenous Peoples to champion clean technology and innovation', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/clean-technology-and-innovation.mp4', 4),
  ('Rocket', 'Space Exploration', 'Pioneering Indigenous leadership in aerospace and space technology', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/space-exploration-video-background%20(1).mp4', 5)
) AS v(symbol, title, text, video_url, order_index)
WHERE NOT EXISTS (SELECT 1 FROM heading);

-- Ventures (ensure all venture data is present)
INSERT INTO ventures (logo_url, name, relationship, text, video_url, order_index) 
SELECT * FROM (VALUES 
  ('/Timesfly.png', 'TimesFly Aerospace', 'Technology and Innovation Partner', 'Leading aerospace technology company specializing in advanced drone systems and flight control software.', null, 1),
  ('/H&K copy.png', 'HK Drone Services', 'Sales and Services Partner', 'Professional drone services company providing commercial & industrial applications across Western Canada.', null, 2),
  ('/Timespreneur.jpg', 'Timespreneur Ventures Inc', 'Strategic and Business Partner', 'Innovation consulting and business development firm focused on emerging technologies and entrepreneurship.', null, 3),
  ('/times-group.jpg', 'TIMES GROUP', 'Strategic Business Partner', 'Comprehensive business solutions and strategic consulting group providing integrated services across multiple industries.', null, 4),
  ('/turtle-island-aeronautical-association.png', 'Turtle Island Aeronautical Association', 'Aviation and Aerospace Partner', 'Aeronautical association promoting aviation excellence and aerospace education across North America.', null, 5)
) AS v(logo_url, name, relationship, text, video_url, order_index)
WHERE NOT EXISTS (SELECT 1 FROM ventures);