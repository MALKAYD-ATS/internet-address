/*
  # Update lesson resources with Supabase Storage paths

  1. Updates existing lesson resources to use proper Supabase Storage paths
  2. Sets up proper file paths for PDF resources in the media-assets bucket
  3. Ensures all courses have accessible PDF materials

  This migration updates the ats_lesson_resources table to reference
  the correct Supabase Storage paths for PDF files.
*/

-- Update lesson resources to use Supabase Storage paths
-- Basic Operations Online Course PDFs
UPDATE ats_lesson_resources 
SET file_path = 'basic-operations-online/basic-operations-online-session-1.pdf'
WHERE lesson_id IN (
  SELECT ml.id FROM ats_module_lessons ml
  JOIN ats_course_modules cm ON ml.module_id = cm.id
  JOIN courses_ats c ON cm.course_id = c.id
  WHERE c.title ILIKE '%basic%operations%online%'
  AND ml.title ILIKE '%introduction%'
)
AND resource_type = 'file'
AND (url IS NULL OR url = '');

-- Advanced Operations Online Course PDFs
UPDATE ats_lesson_resources 
SET file_path = 'advanced-operations-online/advanced-operations-online-session-1.pdf'
WHERE lesson_id IN (
  SELECT ml.id FROM ats_module_lessons ml
  JOIN ats_course_modules cm ON ml.module_id = cm.id
  JOIN courses_ats c ON cm.course_id = c.id
  WHERE c.title ILIKE '%advanced%operations%online%'
  AND ml.title ILIKE '%air%law%'
)
AND resource_type = 'file'
AND (url IS NULL OR url = '');

-- Basic Operations In-Person Course PDFs
UPDATE ats_lesson_resources 
SET file_path = 'basic-operations-online/basic-operations-online-session-1.pdf'
WHERE lesson_id IN (
  SELECT ml.id FROM ats_module_lessons ml
  JOIN ats_course_modules cm ON ml.module_id = cm.id
  JOIN courses_ats c ON cm.course_id = c.id
  WHERE c.title ILIKE '%basic%operations%' AND c.title NOT ILIKE '%online%'
)
AND resource_type = 'file'
AND (url IS NULL OR url = '');

-- Recency Requirements Online Course PDFs
UPDATE ats_lesson_resources 
SET file_path = 'recency-requirements-online/recency-requirements-online-session-1.pdf'
WHERE lesson_id IN (
  SELECT ml.id FROM ats_module_lessons ml
  JOIN ats_course_modules cm ON ml.module_id = cm.id
  JOIN courses_ats c ON cm.course_id = c.id
  WHERE c.title ILIKE '%recency%requirements%'
)
AND resource_type = 'file'
AND (url IS NULL OR url = '');

-- Insert sample PDF resources for lessons that don't have any
INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  ml.id,
  'Slides for ' || ml.title,
  'file',
  CASE 
    WHEN c.title ILIKE '%basic%operations%online%' THEN 'basic-operations-online/basic-operations-online-session-1.pdf'
    WHEN c.title ILIKE '%advanced%operations%online%' THEN 'advanced-operations-online/advanced-operations-online-session-1.pdf'
    WHEN c.title ILIKE '%basic%operations%' THEN 'basic-operations-online/basic-operations-online-session-1.pdf'
    WHEN c.title ILIKE '%recency%requirements%' THEN 'recency-requirements-online/recency-requirements-online-session-1.pdf'
    ELSE 'basic-operations-online/basic-operations-online-session-1.pdf'
  END
FROM ats_module_lessons ml
JOIN ats_course_modules cm ON ml.module_id = cm.id
JOIN courses_ats c ON cm.course_id = c.id
WHERE ml.id NOT IN (
  SELECT DISTINCT lesson_id 
  FROM ats_lesson_resources 
  WHERE resource_type = 'file' 
  AND lesson_id IS NOT NULL
)
AND c.is_active = true
ON CONFLICT DO NOTHING;