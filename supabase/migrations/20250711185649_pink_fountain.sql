/*
  # Update lesson resources with correct Supabase Storage paths
  
  1. Updates existing resources with proper Storage paths including courses folder
  2. Maps course types to correct Storage folders within courses directory
  3. Inserts missing PDF resources for all lessons
  4. Ensures all courses have accessible PDF materials in courses folder
*/

-- Update existing resources to use correct Storage paths with courses folder
UPDATE ats_lesson_resources 
SET file_path = CASE 
  WHEN file_path LIKE '%basic-operations%' THEN 'basic-operations-online/basic-operations-online-session-1.pdf'
  WHEN file_path LIKE '%advanced-operations%' THEN 'advanced-operations-online/advanced-operations-online-session-1.pdf'
  WHEN file_path LIKE '%recency-requirements%' THEN 'recency-requirements-online/recency-requirements-online-session-1.pdf'
  WHEN file_path LIKE '%reference-material%' THEN 'reference-material-online/reference-material-online-session-1.pdf'
  ELSE file_path
END
WHERE resource_type = 'file' AND (url IS NULL OR url = '');

-- Insert PDF resources for lessons that don't have them
INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  l.id,
  l.title || ' - PDF Slides',
  'file',
  CASE 
    WHEN c.title ILIKE '%basic%operations%online%' THEN 'basic-operations-online/basic-operations-online-session-1.pdf'
    WHEN c.title ILIKE '%advanced%operations%online%' THEN 'advanced-operations-online/advanced-operations-online-session-1.pdf'
    WHEN c.title ILIKE '%recency%requirements%' THEN 'recency-requirements-online/recency-requirements-online-session-1.pdf'
    WHEN c.title ILIKE '%reference%material%' THEN 'reference-material-online/reference-material-online-session-1.pdf'
    ELSE 'basic-operations-online/basic-operations-online-session-1.pdf'
  END
FROM ats_module_lessons l
JOIN ats_course_modules m ON l.module_id = m.id
JOIN courses_ats c ON m.course_id = c.id
WHERE l.id NOT IN (
  SELECT lesson_id 
  FROM ats_lesson_resources 
  WHERE resource_type = 'file' 
  AND lesson_id IS NOT NULL
);

-- Update any existing URLs to include courses folder if they don't already
UPDATE ats_lesson_resources 
SET url = CASE 
  WHEN url IS NOT NULL AND url != '' AND url NOT LIKE '%/courses/%' 
  THEN REPLACE(url, '/media-assets/', '/media-assets/courses/')
  ELSE url
END
WHERE resource_type = 'file' AND url IS NOT NULL AND url != '';