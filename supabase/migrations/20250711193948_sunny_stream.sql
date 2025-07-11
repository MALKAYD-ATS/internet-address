/*
  # Update Course PDF Resources with Correct Supabase Storage Paths

  1. Updates existing lesson resources with correct PDF file paths
  2. Maps course titles to their corresponding PDF files in Supabase Storage
  3. Ensures all lessons have accessible PDF materials
  4. Uses the actual filenames from the media-assets bucket

  Based on the Supabase Storage structure:
  - basic-operations-online/basic-operations-online-section-0.pdf
  - advanced-operations-online/rpas-advanced-operations-slides-0.pdf  
  - recency-requirements-online/recency-course-online-slide-set.pdf
  - reference-material-online/[multiple PDFs]
*/

-- First, let's update existing resources with correct file paths
UPDATE ats_lesson_resources 
SET file_path = CASE 
  WHEN lesson_id IN (
    SELECT l.id FROM ats_module_lessons l
    JOIN ats_course_modules m ON l.module_id = m.id
    JOIN courses_ats c ON m.course_id = c.id
    WHERE c.title ILIKE '%basic operations%online%'
  ) THEN 'basic-operations-online/basic-operations-online-section-0.pdf'
  
  WHEN lesson_id IN (
    SELECT l.id FROM ats_module_lessons l
    JOIN ats_course_modules m ON l.module_id = m.id
    JOIN courses_ats c ON m.course_id = c.id
    WHERE c.title ILIKE '%advanced operations%online%'
  ) THEN 'advanced-operations-online/rpas-advanced-operations-slides-0.pdf'
  
  WHEN lesson_id IN (
    SELECT l.id FROM ats_module_lessons l
    JOIN ats_course_modules m ON l.module_id = m.id
    JOIN courses_ats c ON m.course_id = c.id
    WHERE c.title ILIKE '%recency%' OR c.title ILIKE '%flight review%'
  ) THEN 'recency-requirements-online/recency-course-online-slide-set.pdf'
  
  WHEN lesson_id IN (
    SELECT l.id FROM ats_module_lessons l
    JOIN ats_course_modules m ON l.module_id = m.id
    JOIN courses_ats c ON m.course_id = c.id
    WHERE c.title ILIKE '%reference material%'
  ) THEN 'reference-material-online/06-knowledge-requirements-for-pilots-of-remotely-piloted-aircraft-systems.pdf'
  
  ELSE file_path
END
WHERE resource_type = 'file' AND (url IS NULL OR url = '');

-- Insert missing PDF resources for lessons that don't have them
INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  l.id,
  CONCAT('Slides for ', l.title),
  'file',
  CASE 
    WHEN c.title ILIKE '%basic operations%online%' 
      THEN 'basic-operations-online/basic-operations-online-section-0.pdf'
    WHEN c.title ILIKE '%advanced operations%online%' 
      THEN 'advanced-operations-online/rpas-advanced-operations-slides-0.pdf'
    WHEN c.title ILIKE '%recency%' OR c.title ILIKE '%flight review%' 
      THEN 'recency-requirements-online/recency-course-online-slide-set.pdf'
    WHEN c.title ILIKE '%reference material%' 
      THEN 'reference-material-online/06-knowledge-requirements-for-pilots-of-remotely-piloted-aircraft-systems.pdf'
    ELSE NULL
  END as file_path
FROM ats_module_lessons l
JOIN ats_course_modules m ON l.module_id = m.id
JOIN courses_ats c ON m.course_id = c.id
WHERE l.id NOT IN (
  SELECT DISTINCT lesson_id 
  FROM ats_lesson_resources 
  WHERE resource_type = 'file' 
  AND lesson_id IS NOT NULL
)
AND c.title IS NOT NULL;

-- Add additional reference materials for the Reference Material course
INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  l.id,
  'Advanced Pre-Reading Guide',
  'file',
  'reference-material-online/01-T_D_OPS018_(ADVANCED_PRE_READING_GUIDE).pdf'
FROM ats_module_lessons l
JOIN ats_course_modules m ON l.module_id = m.id
JOIN courses_ats c ON m.course_id = c.id
WHERE c.title ILIKE '%reference material%'
AND l.title ILIKE '%advanced%'
AND NOT EXISTS (
  SELECT 1 FROM ats_lesson_resources r 
  WHERE r.lesson_id = l.id 
  AND r.file_path LIKE '%ADVANCED_PRE_READING_GUIDE%'
);

INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  l.id,
  'Flight Review Pre-Reading Guide',
  'file',
  'reference-material-online/02-T&D_OPS017_(FLIGHT_REVIEW_PRE_READING_GUIDE).pdf'
FROM ats_module_lessons l
JOIN ats_course_modules m ON l.module_id = m.id
JOIN courses_ats c ON m.course_id = c.id
WHERE c.title ILIKE '%reference material%'
AND l.title ILIKE '%flight review%'
AND NOT EXISTS (
  SELECT 1 FROM ats_lesson_resources r 
  WHERE r.lesson_id = l.id 
  AND r.file_path LIKE '%FLIGHT_REVIEW_PRE_READING_GUIDE%'
);

INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  l.id,
  'From the Ground Up',
  'file',
  'reference-material-online/04-from-the-ground-up.pdf'
FROM ats_module_lessons l
JOIN ats_course_modules m ON l.module_id = m.id
JOIN courses_ats c ON m.course_id = c.id
WHERE c.title ILIKE '%reference material%'
AND l.title ILIKE '%ground up%'
AND NOT EXISTS (
  SELECT 1 FROM ats_lesson_resources r 
  WHERE r.lesson_id = l.id 
  AND r.file_path LIKE '%from-the-ground-up%'
);

INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  l.id,
  'RPAS 101',
  'file',
  'reference-material-online/10-rpas-101.pdf'
FROM ats_module_lessons l
JOIN ats_course_modules m ON l.module_id = m.id
JOIN courses_ats c ON m.course_id = c.id
WHERE c.title ILIKE '%reference material%'
AND l.title ILIKE '%rpas 101%'
AND NOT EXISTS (
  SELECT 1 FROM ats_lesson_resources r 
  WHERE r.lesson_id = l.id 
  AND r.file_path LIKE '%rpas-101%'
);