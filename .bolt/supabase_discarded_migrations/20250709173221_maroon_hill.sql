/*
  # Create Home Page Dynamic Content Tables

  1. New Tables
    - `home_page_title_section` - Hero section content
    - `home_numbers` - Statistics boxes
    - `choose_ats` - Why choose ATS section
    - `drone_solutions` - Comprehensive solutions bullets
    - `principles` - Vision & Mission cards
    - `heading` - Where we are heading cards
    - `ventures` - Group of ventures/partners
    - `contact_information` - Main contact info
    - `contact_locations` - Multiple locations
    - `student_success_stories` - Testimonials
    - `newsletter` - Newsletter subscriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access where appropriate
    - Add policies for newsletter submissions

  3. Sample Data
    - Insert sample data for all sections to populate the home page
*/

-- Home Page Title Section
CREATE TABLE IF NOT EXISTS home_page_title_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  slogan text NOT NULL,
  video text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Home Numbers (Statistics)
CREATE TABLE IF NOT EXISTS home_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL,
  label text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Choose ATS Section
CREATE TABLE IF NOT EXISTS choose_ats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  text text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Drone Solutions
CREATE TABLE IF NOT EXISTS drone_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  text text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Principles (Vision & Mission)
CREATE TABLE IF NOT EXISTS principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  title text NOT NULL,
  text text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Heading (Where We Are Heading)
CREATE TABLE IF NOT EXISTS heading (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  title text NOT NULL,
  text text NOT NULL,
  video text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ventures (Group of Ventures)
CREATE TABLE IF NOT EXISTS ventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  text text NOT NULL,
  video_url text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Contact Information
CREATE TABLE IF NOT EXISTS contact_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact Locations
CREATE TABLE IF NOT EXISTS contact_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_information_id uuid REFERENCES contact_information(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  address text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Student Success Stories
CREATE TABLE IF NOT EXISTS student_success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL,
  name text NOT NULL,
  position text NOT NULL,
  company text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE home_page_title_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE choose_ats ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE heading ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (only if they don't exist)
DO $$
BEGIN
  -- Home Page Title Section policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'home_page_title_section' 
    AND policyname = 'Allow public read access to home_page_title_section'
  ) THEN
    CREATE POLICY "Allow public read access to home_page_title_section"
      ON home_page_title_section FOR SELECT TO public USING (true);
  END IF;

  -- Home Numbers policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'home_numbers' 
    AND policyname = 'Allow public read access to home_numbers'
  ) THEN
    CREATE POLICY "Allow public read access to home_numbers"
      ON home_numbers FOR SELECT TO public USING (true);
  END IF;

  -- Choose ATS policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'choose_ats' 
    AND policyname = 'Allow public read access to choose_ats'
  ) THEN
    CREATE POLICY "Allow public read access to choose_ats"
      ON choose_ats FOR SELECT TO public USING (true);
  END IF;

  -- Drone Solutions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'drone_solutions' 
    AND policyname = 'Allow public read access to drone_solutions'
  ) THEN
    CREATE POLICY "Allow public read access to drone_solutions"
      ON drone_solutions FOR SELECT TO public USING (true);
  END IF;

  -- Principles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'principles' 
    AND policyname = 'Allow public read access to principles'
  ) THEN
    CREATE POLICY "Allow public read access to principles"
      ON principles FOR SELECT TO public USING (true);
  END IF;

  -- Heading policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'heading' 
    AND policyname = 'Allow public read access to heading'
  ) THEN
    CREATE POLICY "Allow public read access to heading"
      ON heading FOR SELECT TO public USING (true);
  END IF;

  -- Ventures policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ventures' 
    AND policyname = 'Allow public read access to ventures'
  ) THEN
    CREATE POLICY "Allow public read access to ventures"
      ON ventures FOR SELECT TO public USING (true);
  END IF;

  -- Contact Information policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_information' 
    AND policyname = 'Allow public read access to contact_information'
  ) THEN
    CREATE POLICY "Allow public read access to contact_information"
      ON contact_information FOR SELECT TO public USING (true);
  END IF;

  -- Contact Locations policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_locations' 
    AND policyname = 'Allow public read access to contact_locations'
  ) THEN
    CREATE POLICY "Allow public read access to contact_locations"
      ON contact_locations FOR SELECT TO public USING (true);
  END IF;

  -- Student Success Stories policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_success_stories' 
    AND policyname = 'Allow public read access to student_success_stories'
  ) THEN
    CREATE POLICY "Allow public read access to student_success_stories"
      ON student_success_stories FOR SELECT TO public USING (true);
  END IF;

  -- Newsletter policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'newsletter' 
    AND policyname = 'Allow public insert to newsletter'
  ) THEN
    CREATE POLICY "Allow public insert to newsletter"
      ON newsletter FOR INSERT TO public WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'newsletter' 
    AND policyname = 'Allow public read access to newsletter'
  ) THEN
    CREATE POLICY "Allow public read access to newsletter"
      ON newsletter FOR SELECT TO public USING (true);
  END IF;
END $$;

-- Insert sample data only if tables are empty

-- Home Page Title Section
INSERT INTO home_page_title_section (name, text, slogan, video_url) 
SELECT 'Professional Drone Academy', 'Advocate, Encourage, and Unite Indigenous Peoples & Communities to lead the Drone Industry.', 'Training for the Future', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/building-future-workforce.mp4'
WHERE NOT EXISTS (SELECT 1 FROM home_page_title_section);

-- Home Numbers
INSERT INTO home_numbers (number, description, order_index) 
SELECT * FROM (VALUES 
  ('500+', 'Students Trained', 1),
  ('98%', 'Pass Rate', 2),
  ('50+', 'Corporate Clients', 3),
  ('10+', 'Years Experience', 4)
) AS v(number, label, order_index)
WHERE NOT EXISTS (SELECT 1 FROM home_numbers);

-- Choose ATS
INSERT INTO choose_ats (symbol, name, text, order_index) 
SELECT * FROM (VALUES 
  ('Award', 'Professional Certification', 'Industry-recognized RPAS training programs with comprehensive certification pathways for professional drone operations.', 1),
  ('Shield', 'Safety First Approach', 'Comprehensive safety training ensuring responsible and compliant drone operations.', 2),
  ('Users', 'Expert Instructors', 'Learn from experienced professionals with extensive commercial drone operation backgrounds.', 3),
  ('Plane', 'Modern Equipment', 'Access to the latest drone technology and equipment for hands-on training experience.', 4),
  ('Triangle', 'Indigenous Values', 'Rooted in tradition, guided by community.', 5),
  ('Cpu', 'Innovative Training Solutions', 'Blending cutting-edge tech with practical skills.', 6)
) AS v(symbol, name, text, order_index)
WHERE NOT EXISTS (SELECT 1 FROM choose_ats);

-- Drone Solutions
INSERT INTO drone_solutions (symbol, text, order_index) 
SELECT * FROM (VALUES 
  ('CheckCircle', 'RPAS Basic, Advanced & Level 1 Complex Certification', 1),
  ('CheckCircle', 'Commercial and Industrial Applications', 2),
  ('CheckCircle', 'Professional RPAS Regulations and Applications Courses', 3),
  ('CheckCircle', 'Corporate Training Programs', 4),
  ('CheckCircle', 'Customized Training Solutions', 5),
  ('CheckCircle', 'First Nations, Métis, and Inuit Training', 6),
  ('CheckCircle', 'First Nations Service Agreements', 7)
) AS v(symbol, text, order_index)
WHERE NOT EXISTS (SELECT 1 FROM drone_solutions);

-- Principles (Vision & Mission)
INSERT INTO principles (symbol, title, text, order_index) 
SELECT * FROM (VALUES 
  ('Eye', 'Vision', 'Create Leaders, Innovators, Entrepreneurs, and Strong Youth within Indigenous Communities', 1),
  ('Target', 'Mission', 'Train and Prepare Individuals, Organizations, First Nations Peoples & Communities for Drone Technology and Innovation', 2)
) AS v(symbol, title, text, order_index)
WHERE NOT EXISTS (SELECT 1 FROM principles);

-- Heading (Where We Are Heading)
INSERT INTO heading (symbol, title, text, video_url, order_index) 
SELECT * FROM (VALUES 
  ('Users', 'Building Future Workforce', 'Developing future workforce training programs', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/building-future-workforce.mp4', 1),
  ('Leaf', 'Innovating While Protecting the Environment', 'Bringing people and technology together while protecting the environment', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/innovating-while-protecting-the-environment.mp4', 2),
  ('Zap', 'Green Energy Future', 'Train Indigenous communities to lead Canada''s green energy future', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/green-energy-future.mp4', 3),
  ('Recycle', 'Clean Technology & Innovation', 'Empower Indigenous Peoples to champion clean technology and innovation', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/clean-technology-and-innovation.mp4', 4),
  ('Rocket', 'Space Exploration', 'Pioneering Indigenous leadership in aerospace and space technology', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/space-exploration-video-background%20(1).mp4', 5)
) AS v(symbol, title, text, video, order_index)
WHERE NOT EXISTS (SELECT 1 FROM heading);

-- Ventures
INSERT INTO ventures (logo_url, name, relationship, text, video_url, order_index) 
SELECT * FROM (VALUES 
  ('/Timesfly.png', 'TimesFly Aerospace', 'Technology and Innovation Partner', 'Leading aerospace technology company specializing in advanced drone systems and flight control software.', null, 1),
  ('/H&K copy.png', 'HK Drone Services', 'Sales and Services Partner', 'Professional drone services company providing commercial & industrial applications across Western Canada.', null, 2),
  ('/Timespreneur.jpg', 'Timespreneur Ventures Inc', 'Strategic and Business Partner', 'Innovation consulting and business development firm focused on emerging technologies and entrepreneurship.', null, 3),
  ('/times-group.jpg', 'TIMES GROUP', 'Strategic Business Partner', 'Comprehensive business solutions and strategic consulting group providing integrated services across multiple industries.', null, 4),
  ('/turtle-island-aeronautical-association.png', 'Turtle Island Aeronautical Association', 'Aviation and Aerospace Partner', 'Aeronautical association promoting aviation excellence and aerospace education across North America.', null, 5)
) AS v(logo_url, name, relationship, text, video_url, order_index)
WHERE NOT EXISTS (SELECT 1 FROM ventures);

-- Contact Information
INSERT INTO contact_information (phone, email) 
SELECT '+1 (587) 524-0275', 'darcy@abtraining.ca'
WHERE NOT EXISTS (SELECT 1 FROM contact_information);

-- Contact Locations
INSERT INTO contact_locations (contact_information_id, location_name, address, order_index) 
SELECT 
  ci.id,
  location_data.location_name,
  location_data.address,
  location_data.order_index
FROM contact_information ci,
(VALUES 
  ('Edmonton, Alberta, Canada', 'Edmonton, Alberta, Canada', 1),
  ('Chicago, Illinois, USA', 'Chicago, Illinois, USA', 2),
  ('Karachi, Sindh, Pakistan', 'Karachi, Sindh, Pakistan', 3)
) AS location_data(location_name, address, order_index)
WHERE NOT EXISTS (SELECT 1 FROM contact_locations);

-- Student Success Stories
INSERT INTO student_success_stories (photo_url, name, position, company, rating, text, order_index) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150', 'Sarah Mitchell', 'Commercial Drone Pilot', 'SkyView Surveying', 5, 'The RPAS Advanced Certification course at ATS was exceptional. The instructors'' expertise and hands-on approach gave me the confidence to start my commercial drone business.', 1),
  ('https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', 'David Chen', 'Safety Manager', 'Alberta Infrastructure', 5, 'ATS provided our team with comprehensive drone safety training. Their customized corporate program addressed our specific operational needs and regulatory requirements.', 2),
  ('https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=150', 'Maria Rodriguez', 'Real Estate Photographer', 'Horizon Properties', 5, 'Started with zero drone experience and now I''m confidently shooting aerial real estate photography. The basic certification course was well-structured.', 3)
) AS v(photo_url, name, position, company, rating, text, order_index)
WHERE NOT EXISTS (SELECT 1 FROM student_success_stories);