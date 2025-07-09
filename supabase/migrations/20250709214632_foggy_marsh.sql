/*
  # Create Indigenous Relations Page Tables

  1. New Tables
    - `indigenous_title_section` - Hero section content
    - `indigenous_values` - Core values with flipping cards
    - `indigenous_technology` - Technology section
    - `indigenous_heritage` - Heritage section
    - `indigenous_applications` - Applications with benefit points
    - `indigenous_commitments` - Commitments section

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access

  3. Sample Data
    - Insert sample data for all sections
*/

-- Indigenous Title Section
CREATE TABLE IF NOT EXISTS indigenous_title_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text,
  slogan text,
  video_url text,
  created_at timestamptz DEFAULT now()
);

-- Indigenous Values
CREATE TABLE IF NOT EXISTS indigenous_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  title text NOT NULL,
  text text,
  saying text,
  video_url text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indigenous Technology
CREATE TABLE IF NOT EXISTS indigenous_technology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  title text NOT NULL,
  text text,
  video_url text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indigenous Heritage
CREATE TABLE IF NOT EXISTS indigenous_heritage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  title text NOT NULL,
  text text,
  video_url text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indigenous Applications
CREATE TABLE IF NOT EXISTS indigenous_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  title text NOT NULL,
  text text,
  benefit_points jsonb,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indigenous Commitments
CREATE TABLE IF NOT EXISTS indigenous_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  title text NOT NULL,
  text text,
  video_url text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE indigenous_title_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE indigenous_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE indigenous_technology ENABLE ROW LEVEL SECURITY;
ALTER TABLE indigenous_heritage ENABLE ROW LEVEL SECURITY;
ALTER TABLE indigenous_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE indigenous_commitments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DO $$
BEGIN
  -- Indigenous Title Section policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'indigenous_title_section' 
    AND policyname = 'Allow public read access to indigenous_title_section'
  ) THEN
    CREATE POLICY "Allow public read access to indigenous_title_section"
      ON indigenous_title_section FOR SELECT TO public USING (true);
  END IF;

  -- Indigenous Values policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'indigenous_values' 
    AND policyname = 'Allow public read access to indigenous_values'
  ) THEN
    CREATE POLICY "Allow public read access to indigenous_values"
      ON indigenous_values FOR SELECT TO public USING (true);
  END IF;

  -- Indigenous Technology policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'indigenous_technology' 
    AND policyname = 'Allow public read access to indigenous_technology'
  ) THEN
    CREATE POLICY "Allow public read access to indigenous_technology"
      ON indigenous_technology FOR SELECT TO public USING (true);
  END IF;

  -- Indigenous Heritage policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'indigenous_heritage' 
    AND policyname = 'Allow public read access to indigenous_heritage'
  ) THEN
    CREATE POLICY "Allow public read access to indigenous_heritage"
      ON indigenous_heritage FOR SELECT TO public USING (true);
  END IF;

  -- Indigenous Applications policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'indigenous_applications' 
    AND policyname = 'Allow public read access to indigenous_applications'
  ) THEN
    CREATE POLICY "Allow public read access to indigenous_applications"
      ON indigenous_applications FOR SELECT TO public USING (true);
  END IF;

  -- Indigenous Commitments policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'indigenous_commitments' 
    AND policyname = 'Allow public read access to indigenous_commitments'
  ) THEN
    CREATE POLICY "Allow public read access to indigenous_commitments"
      ON indigenous_commitments FOR SELECT TO public USING (true);
  END IF;
END $$;

-- Insert sample data only if tables are empty

-- Indigenous Title Section
INSERT INTO indigenous_title_section (name, text, slogan, video_url) 
SELECT 'Indigenous Relations & Modern Technology', 'Keepers of the land, keepers of the data, and keepers of the environment', 'Honoring Indigenous values while advancing drone technology for environmental protection, community service, and cultural preservation.', null
WHERE NOT EXISTS (SELECT 1 FROM indigenous_title_section);

-- Indigenous Values
INSERT INTO indigenous_values (logo_url, title, text, saying, video_url, order_index) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400', 'Land Stewardship', 'Our responsibility to protect and preserve the land for future generations through sustainable technology practices.', 'We are the keepers of the land, using drone technology to monitor, protect, and understand our environment.', null, 1),
  ('https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400', 'Data Guardianship', 'Protecting and responsibly managing the information we gather, ensuring it serves the community''s best interests.', 'We are the keepers of the data, maintaining accuracy, privacy, and ethical use of all collected information.', null, 2),
  ('https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=400', 'Environmental Protection', 'Using technology as a tool to safeguard our natural world and monitor environmental changes.', 'We are the keepers of the environment, utilizing drones to protect ecosystems and wildlife habitats.', null, 3),
  ('https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400', 'Community Service', 'Ensuring our technological capabilities serve the broader community and Indigenous nations.', 'Technology should strengthen communities and preserve cultural connections to the land.', null, 4)
) AS v(logo_url, title, text, saying, video_url, order_index)
WHERE NOT EXISTS (SELECT 1 FROM indigenous_values);

-- Indigenous Technology
INSERT INTO indigenous_technology (image_url, title, text, video_url, order_index) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=600', 'Traditional Knowledge Meets Modern Technology', 'Combining centuries of Indigenous land knowledge with cutting-edge drone technology to create comprehensive environmental monitoring solutions.', null, 1),
  ('https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600', 'Respectful Data Collection', 'Implementing protocols that honor Indigenous data sovereignty and ensure community consent in all data gathering activities.', null, 2),
  ('https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=600', 'Environmental Monitoring', 'Using drone technology to monitor traditional territories, track environmental changes, and support conservation efforts.', null, 3),
  ('https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=600', 'Space & Indigenous Knowledge', 'Exploring the ancestral understanding of space, celestial bodies, and the deep relationship between Indigenous teachings and the cosmos, inspiring innovative pathways in aerospace technologies.', null, 4)
) AS v(image_url, title, text, video_url, order_index)
WHERE NOT EXISTS (SELECT 1 FROM indigenous_technology);

-- Indigenous Heritage
INSERT INTO indigenous_heritage (logo_url, title, text, video_url, order_index) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=200', 'Connection to Land', 'Deep spiritual and practical connection to the territories we serve and protect.', null, 1),
  ('https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=200', 'Respect for Nature', 'Understanding that technology must work in harmony with natural systems.', null, 2),
  ('https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=200', 'Wisdom of Elders', 'Incorporating traditional knowledge and guidance in our technological applications.', null, 3),
  ('https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=200', 'Sustainable Practices', 'Ensuring our operations support long-term environmental and community health.', null, 4),
  ('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=200', 'Community First', 'Prioritizing community needs and cultural values in all our services.', null, 5),
  ('https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=200', 'Guided Purpose', 'Using technology with clear intention and respect for its impact on communities.', null, 6)
) AS v(logo_url, title, text, video_url, order_index)
WHERE NOT EXISTS (SELECT 1 FROM indigenous_heritage);

-- Indigenous Applications
INSERT INTO indigenous_applications (logo_url, title, text, benefit_points, order_index) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=200', 'Traditional Territory Mapping', 'Creating detailed maps of traditional territories to support land claims, resource management, and cultural preservation.', '["Accurate boundary documentation", "Historical site preservation", "Resource management planning", "Cultural education support"]'::jsonb, 1),
  ('https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=200', 'Environmental Monitoring', 'Monitoring ecosystem health, wildlife populations, and environmental changes to support conservation efforts.', '["Wildlife habitat assessment", "Water quality monitoring", "Forest health evaluation", "Climate change documentation"]'::jsonb, 2),
  ('https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=200', 'Cultural Site Documentation', 'Preserving and documenting important cultural and historical sites for future generations.', '["3D site reconstruction", "Historical preservation", "Educational resource creation", "Cultural heritage protection"]'::jsonb, 3),
  ('https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=200', 'Community Development', 'Supporting infrastructure development and community planning while respecting cultural values.', '["Sustainable development planning", "Infrastructure assessment", "Community consultation support", "Cultural impact evaluation"]'::jsonb, 4)
) AS v(logo_url, title, text, benefit_points, order_index)
WHERE NOT EXISTS (SELECT 1 FROM indigenous_applications);

-- Indigenous Commitments
INSERT INTO indigenous_commitments (logo_url, title, text, video_url, order_index) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=200', 'Global Perspective', 'Connecting Indigenous communities worldwide through shared knowledge and technology.', null, 1),
  ('https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=200', 'Community Partnership', 'Working alongside communities as partners, not just service providers.', null, 2),
  ('https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=200', 'Cultural Respect', 'Honoring traditions while embracing innovation for community benefit.', null, 3)
) AS v(logo_url, title, text, video_url, order_index)
WHERE NOT EXISTS (SELECT 1 FROM indigenous_commitments);