/*
  # Create and populate home page tables

  1. New Tables
    - Creates tables that don't exist yet
    - Uses existing tables where they already exist
    - Populates all tables with sample data

  2. Security
    - Enable RLS on all new tables
    - Add policies for public read access
    - Newsletter table allows public inserts

  3. Sample Data
    - Populates all tables with content matching current home page
    - Uses proper foreign key relationships
*/

-- Create tables that don't exist yet (some already exist based on schema)

-- Home Numbers (Statistics) - Create if not exists
CREATE TABLE IF NOT EXISTS home_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL,
  description text NOT NULL
);

-- Choose ATS Section - Create if not exists  
CREATE TABLE IF NOT EXISTS choose_ats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  symbol text NOT NULL
);

-- Drone Solutions - Create if not exists
CREATE TABLE IF NOT EXISTS drone_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  text text NOT NULL
);

-- Principles (Vision & Mission) - Create if not exists
CREATE TABLE IF NOT EXISTS principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  title text NOT NULL,
  text text NOT NULL
);

-- Heading (Where We Are Heading) - Create if not exists
CREATE TABLE IF NOT EXISTS heading (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  symbol text,
  text text NOT NULL,
  video_url text
);

-- Ventures (Group of Ventures) - Create if not exists
CREATE TABLE IF NOT EXISTS ventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  name text NOT NULL,
  relationship text,
  text text,
  video_url text
);

-- Home Page Title Section - Create if not exists
CREATE TABLE IF NOT EXISTS home_page_title_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  slogan text NOT NULL,
  video_url text
);

-- Contact Information - Create if not exists
CREATE TABLE IF NOT EXISTS contact_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text,
  email text
);

-- Contact Locations - Create if not exists
CREATE TABLE IF NOT EXISTS contact_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_information_id uuid REFERENCES contact_information(id) ON DELETE CASCADE,
  location_name text,
  address text
);

-- Student Success Stories - Create if not exists
CREATE TABLE IF NOT EXISTS student_success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text,
  name text,
  position text,
  company text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  text text
);

-- Newsletter Subscriptions - Create if not exists
CREATE TABLE IF NOT EXISTS newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT timezone('utc'::text, now())
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

-- Create policies for public read access
DO $$
BEGIN
  -- Home Page Title Section policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'home_page_title_section' AND policyname = 'Allow public read access to home_page_title_section') THEN
    CREATE POLICY "Allow public read access to home_page_title_section"
      ON home_page_title_section FOR SELECT TO public USING (true);
  END IF;

  -- Home Numbers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'home_numbers' AND policyname = 'Allow public read access to home_numbers') THEN
    CREATE POLICY "Allow public read access to home_numbers"
      ON home_numbers FOR SELECT TO public USING (true);
  END IF;

  -- Choose ATS policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'choose_ats' AND policyname = 'Allow public read access to choose_ats') THEN
    CREATE POLICY "Allow public read access to choose_ats"
      ON choose_ats FOR SELECT TO public USING (true);
  END IF;

  -- Drone Solutions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drone_solutions' AND policyname = 'Allow public read access to drone_solutions') THEN
    CREATE POLICY "Allow public read access to drone_solutions"
      ON drone_solutions FOR SELECT TO public USING (true);
  END IF;

  -- Principles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'principles' AND policyname = 'Allow public read access to principles') THEN
    CREATE POLICY "Allow public read access to principles"
      ON principles FOR SELECT TO public USING (true);
  END IF;

  -- Heading policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'heading' AND policyname = 'Allow public read access to heading') THEN
    CREATE POLICY "Allow public read access to heading"
      ON heading FOR SELECT TO public USING (true);
  END IF;

  -- Ventures policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ventures' AND policyname = 'Allow public read access to ventures') THEN
    CREATE POLICY "Allow public read access to ventures"
      ON ventures FOR SELECT TO public USING (true);
  END IF;

  -- Contact Information policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_information' AND policyname = 'Allow public read access to contact_information') THEN
    CREATE POLICY "Allow public read access to contact_information"
      ON contact_information FOR SELECT TO public USING (true);
  END IF;

  -- Contact Locations policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_locations' AND policyname = 'Allow public read access to contact_locations') THEN
    CREATE POLICY "Allow public read access to contact_locations"
      ON contact_locations FOR SELECT TO public USING (true);
  END IF;

  -- Student Success Stories policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_success_stories' AND policyname = 'Allow public read access to student_success_stories') THEN
    CREATE POLICY "Allow public read access to student_success_stories"
      ON student_success_stories FOR SELECT TO public USING (true);
  END IF;

  -- Newsletter policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter' AND policyname = 'Allow public insert to newsletter') THEN
    CREATE POLICY "Allow public insert to newsletter"
      ON newsletter FOR INSERT TO public WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter' AND policyname = 'Allow public read access to newsletter') THEN
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
INSERT INTO home_numbers (number, description) 
SELECT * FROM (VALUES 
  ('500+', 'Students Trained'),
  ('98%', 'Pass Rate'),
  ('50+', 'Corporate Clients'),
  ('10+', 'Years Experience')
) AS v(number, description)
WHERE NOT EXISTS (SELECT 1 FROM home_numbers);

-- Choose ATS
INSERT INTO choose_ats (symbol, name, text) 
SELECT * FROM (VALUES 
  ('Award', 'Professional Certification', 'Industry-recognized RPAS training programs with comprehensive certification pathways for professional drone operations.'),
  ('Shield', 'Safety First Approach', 'Comprehensive safety training ensuring responsible and compliant drone operations.'),
  ('Users', 'Expert Instructors', 'Learn from experienced professionals with extensive commercial drone operation backgrounds.'),
  ('Plane', 'Modern Equipment', 'Access to the latest drone technology and equipment for hands-on training experience.'),
  ('Triangle', 'Indigenous Values', 'Rooted in tradition, guided by community.'),
  ('Cpu', 'Innovative Training Solutions', 'Blending cutting-edge tech with practical skills.')
) AS v(symbol, name, text)
WHERE NOT EXISTS (SELECT 1 FROM choose_ats);

-- Drone Solutions
INSERT INTO drone_solutions (symbol, text) 
SELECT * FROM (VALUES 
  ('CheckCircle', 'RPAS Basic, Advanced & Level 1 Complex Certification'),
  ('CheckCircle', 'Commercial and Industrial Applications'),
  ('CheckCircle', 'Professional RPAS Regulations and Applications Courses'),
  ('CheckCircle', 'Corporate Training Programs'),
  ('CheckCircle', 'Customized Training Solutions'),
  ('CheckCircle', 'First Nations, Métis, and Inuit Training'),
  ('CheckCircle', 'First Nations Service Agreements')
) AS v(symbol, text)
WHERE NOT EXISTS (SELECT 1 FROM drone_solutions);

-- Principles (Vision & Mission)
INSERT INTO principles (symbol, title, text) 
SELECT * FROM (VALUES 
  ('Eye', 'Vision', 'Create Leaders, Innovators, Entrepreneurs, and Strong Youth within Indigenous Communities'),
  ('Target', 'Mission', 'Train and Prepare Individuals, Organizations, First Nations Peoples & Communities for Drone Technology and Innovation')
) AS v(symbol, title, text)
WHERE NOT EXISTS (SELECT 1 FROM principles);

-- Heading (Where We Are Heading)
INSERT INTO heading (symbol, title, text, video_url) 
SELECT * FROM (VALUES 
  ('Users', 'Building Future Workforce', 'Developing future workforce training programs', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/building-future-workforce.mp4'),
  ('Leaf', 'Innovating While Protecting the Environment', 'Bringing people and technology together while protecting the environment', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/innovating-while-protecting-the-environment.mp4'),
  ('Zap', 'Green Energy Future', 'Train Indigenous communities to lead Canada''s green energy future', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/green-energy-future.mp4'),
  ('Recycle', 'Clean Technology & Innovation', 'Empower Indigenous Peoples to champion clean technology and innovation', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/clean-technology-and-innovation.mp4'),
  ('Rocket', 'Space Exploration', 'Pioneering Indigenous leadership in aerospace and space technology', 'https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/space-exploration-video-background%20(1).mp4')
) AS v(symbol, title, text, video_url)
WHERE NOT EXISTS (SELECT 1 FROM heading);

-- Ventures
INSERT INTO ventures (logo_url, name, relationship, text, video_url) 
SELECT * FROM (VALUES 
  ('/Timesfly.png', 'TimesFly Aerospace', 'Technology and Innovation Partner', 'Leading aerospace technology company specializing in advanced drone systems and flight control software.', null),
  ('/H&K copy.png', 'HK Drone Services', 'Sales and Services Partner', 'Professional drone services company providing commercial & industrial applications across Western Canada.', null),
  ('/Timespreneur.jpg', 'Timespreneur Ventures Inc', 'Strategic and Business Partner', 'Innovation consulting and business development firm focused on emerging technologies and entrepreneurship.', null),
  ('/times-group.jpg', 'TIMES GROUP', 'Strategic Business Partner', 'Comprehensive business solutions and strategic consulting group providing integrated services across multiple industries.', null),
  ('/turtle-island-aeronautical-association.png', 'Turtle Island Aeronautical Association', 'Aviation and Aerospace Partner', 'Aeronautical association promoting aviation excellence and aerospace education across North America.', null)
) AS v(logo_url, name, relationship, text, video_url)
WHERE NOT EXISTS (SELECT 1 FROM ventures);

-- Contact Information
INSERT INTO contact_information (phone, email) 
SELECT '+1 (587) 524-0275', 'darcy@abtraining.ca'
WHERE NOT EXISTS (SELECT 1 FROM contact_information);

-- Contact Locations
INSERT INTO contact_locations (contact_information_id, location_name, address) 
SELECT 
  ci.id,
  location_data.location_name,
  location_data.address
FROM contact_information ci,
(VALUES 
  ('Edmonton, Alberta, Canada', 'Edmonton, Alberta, Canada'),
  ('Chicago, Illinois, USA', 'Chicago, Illinois, USA'),
  ('Karachi, Sindh, Pakistan', 'Karachi, Sindh, Pakistan')
) AS location_data(location_name, address)
WHERE NOT EXISTS (SELECT 1 FROM contact_locations);

-- Student Success Stories
INSERT INTO student_success_stories (photo_url, name, position, company, rating, text) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150', 'Sarah Mitchell', 'Commercial Drone Pilot', 'SkyView Surveying', 5, 'The RPAS Advanced Certification course at ATS was exceptional. The instructors'' expertise and hands-on approach gave me the confidence to start my commercial drone business.'),
  ('https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', 'David Chen', 'Safety Manager', 'Alberta Infrastructure', 5, 'ATS provided our team with comprehensive drone safety training. Their customized corporate program addressed our specific operational needs and Regulation requirements.'),
  ('https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=150', 'Maria Rodriguez', 'Real Estate Photographer', 'Horizon Properties', 5, 'Started with zero drone experience and now I''m confidently shooting aerial real estate photography. The basic certification course was well-structured.')
) AS v(photo_url, name, position, company, rating, text)
WHERE NOT EXISTS (SELECT 1 FROM student_success_stories);