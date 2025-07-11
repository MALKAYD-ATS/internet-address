/*
  # Update lesson resources with correct PDF file names

  This migration updates the lesson resources to use the actual file names
  that exist in Supabase Storage, based on the provided screenshots.
*/

-- First, let's clear existing incorrect file paths
UPDATE ats_lesson_resources 
SET file_path = NULL, url = NULL 
WHERE resource_type = 'file';

-- Update resources for Basic Operations Online course
UPDATE ats_lesson_resources 
SET file_path = 'courses/basic-operations-online/basic-operations-online-session-1.pdf',
    url = NULL
WHERE lesson_id IN (
  SELECT aml.id 
  FROM ats_module_lessons aml
  JOIN ats_course_modules acm ON aml.module_id = acm.id
  JOIN courses_ats ca ON acm.course_id = ca.id
  WHERE ca.title ILIKE '%basic%operations%online%'
  AND aml.order = 1
);

UPDATE ats_lesson_resources 
SET file_path = 'courses/basic-operations-online/basic-operations-online-session-2.pdf',
    url = NULL
WHERE lesson_id IN (
  SELECT aml.id 
  FROM ats_module_lessons aml
  JOIN ats_course_modules acm ON aml.module_id = acm.id
  JOIN courses_ats ca ON acm.course_id = ca.id
  WHERE ca.title ILIKE '%basic%operations%online%'
  AND aml.order = 2
);

-- Update resources for Advanced Operations Online course
-- Using the actual filename pattern: rpas-advanced-operations-slides-0.pptx.pdf
UPDATE ats_lesson_resources 
SET file_path = 'courses/advanced-operations-online/rpas-advanced-operations-slides-0.pdf',
    url = NULL
WHERE lesson_id IN (
  SELECT aml.id 
  FROM ats_module_lessons aml
  JOIN ats_course_modules acm ON aml.module_id = acm.id
  JOIN courses_ats ca ON acm.course_id = ca.id
  WHERE ca.title ILIKE '%advanced%operations%online%'
  AND aml.order = 1
);

-- If there are multiple advanced operations slides, add them
UPDATE ats_lesson_resources 
SET file_path = 'courses/advanced-operations-online/rpas-advanced-operations-slides-1.pptx.pdf',
    url = NULL
WHERE lesson_id IN (
  SELECT aml.id 
  FROM ats_module_lessons aml
  JOIN ats_course_modules acm ON aml.module_id = acm.id
  JOIN courses_ats ca ON acm.course_id = ca.id
  WHERE ca.title ILIKE '%advanced%operations%online%'
  AND aml.order = 2
);

-- Update resources for Recency Requirements Online course
UPDATE ats_lesson_resources 
SET file_path = 'courses/recency-requirements-online/recency-requirements-online-session-1.pdf',
    url = NULL
WHERE lesson_id IN (
  SELECT aml.id 
  FROM ats_module_lessons aml
  JOIN ats_course_modules acm ON aml.module_id = acm.id
  JOIN courses_ats ca ON acm.course_id = ca.id
  WHERE ca.title ILIKE '%recency%requirements%online%'
  AND aml.order = 1
);

-- Update resources for Reference Material Online course
UPDATE ats_lesson_resources 
SET file_path = 'courses/reference-material-online/reference-material-online-session-1.pdf',
    url = NULL
WHERE lesson_id IN (
  SELECT aml.id 
  FROM ats_module_lessons aml
  JOIN ats_course_modules acm ON aml.module_id = acm.id
  JOIN courses_ats ca ON acm.course_id = ca.id
  WHERE ca.title ILIKE '%reference%material%online%'
  AND aml.order = 1
);

-- Insert missing resources if they don't exist
-- For lessons that don't have any PDF resources yet
INSERT INTO ats_lesson_resources (lesson_id, title, resource_type, file_path)
SELECT 
  aml.id,
  'Slides for ' || aml.title,
  'file',
  CASE 
    WHEN ca.title ILIKE '%basic%operations%online%' THEN 
      'courses/basic-operations-online/basic-operations-online-session-' || aml.order || '.pdf'
    WHEN ca.title ILIKE '%advanced%operations%online%' THEN 
      'courses/advanced-operations-online/rpas-advanced-operations-slides-' || (aml.order - 1) || '.pptx.pdf'
    WHEN ca.title ILIKE '%recency%requirements%online%' THEN 
      'courses/recency-requirements-online/recency-requirements-online-session-' || aml.order || '.pdf'
    WHEN ca.title ILIKE '%reference%material%online%' THEN 
      'courses/reference-material-online/reference-material-online-session-' || aml.order || '.pdf'
    ELSE 
      'courses/unknown/lesson-' || aml.order || '.pdf'
  END
FROM ats_module_lessons aml
JOIN ats_course_modules acm ON aml.module_id = acm.id
JOIN courses_ats ca ON acm.course_id = ca.id
WHERE ca.is_online = true
AND ca.is_active = true
AND aml.id NOT IN (
  SELECT lesson_id 
  FROM ats_lesson_resources 
  WHERE resource_type = 'file' 
  AND lesson_id IS NOT NULL
);