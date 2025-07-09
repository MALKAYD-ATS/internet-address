/*
  # Create header_logo table

  1. New Tables
    - `header_logo` - Dynamic header logo management
      - `id` (uuid, primary key)
      - `logo_url` (text, logo image URL)
      - `alt_text` (text, alt text for accessibility)
      - `order_index` (integer, for ordering multiple logos)
      - `is_active` (boolean, to enable/disable logos)
      - `created_at` (timestamptz, creation timestamp)

  2. Security
    - Enable RLS on header_logo table
    - Add policy for public read access

  3. Sample Data
    - Insert default ATS logo with proper configuration
*/

-- Create header_logo table
CREATE TABLE IF NOT EXISTS header_logo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text NOT NULL,
  alt_text text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE header_logo ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'header_logo' 
    AND policyname = 'Allow public read access to header_logo'
  ) THEN
    CREATE POLICY "Allow public read access to header_logo"
      ON header_logo FOR SELECT TO public USING (true);
  END IF;
END $$;

-- Insert default logo
INSERT INTO header_logo (logo_url, alt_text, order_index, is_active) 
SELECT '/ATS.png', 'Aboriginal Training Services', 0, true
WHERE NOT EXISTS (SELECT 1 FROM header_logo WHERE order_index = 0);