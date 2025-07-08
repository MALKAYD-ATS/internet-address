/*
  # Insert Sample Practice Questions Data

  1. Sample Data
    - Insert practice questions for existing courses
    - Questions cover RPAS regulations, safety, and operations
    - Uses dynamic course ID lookup to match existing courses

  2. Data Structure
    - Questions with multiple choice answers (A, B, C, D)
    - Explanations for each correct answer
    - Course-specific content based on course titles
*/

-- Insert sample practice questions using actual course UUIDs from courses_ats table
DO $$
DECLARE
  course_uuid uuid;
BEGIN
  -- Insert questions for Basic/Beginner courses
  FOR course_uuid IN 
    SELECT id FROM courses_ats 
    WHERE title ILIKE '%basic%' OR title ILIKE '%beginner%' 
    LIMIT 3
  LOOP
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What is the minimum age requirement for RPAS Basic Certification in Canada?', '14 years', '16 years', '18 years', '21 years', 'A', 'Transport Canada requires pilots to be at least 14 years old for RPAS Basic Certification.', course_uuid),
    ('What does RPAS stand for?', 'Remote Pilot Aircraft System', 'Remotely Piloted Aircraft System', 'Remote Powered Aircraft System', 'Remotely Powered Aircraft System', 'B', 'RPAS stands for Remotely Piloted Aircraft System, which is the official term used by Transport Canada.', course_uuid),
    ('What is the maximum altitude for RPAS operations without special authorization?', '300 feet AGL', '400 feet AGL', '500 feet AGL', '1000 feet AGL', 'B', 'The maximum altitude for RPAS operations is 400 feet above ground level (AGL) without special authorization.', course_uuid),
    ('Which document must RPAS pilots carry during flight operations?', 'Pilot certificate only', 'Aircraft registration only', 'Both pilot certificate and aircraft registration', 'Insurance documents only', 'C', 'RPAS pilots must carry both their pilot certificate and aircraft registration documents during flight operations.', course_uuid),
    ('What is the minimum distance from airports for RPAS operations?', '3 nautical miles', '5.5 kilometers', '9 kilometers', '15 kilometers', 'C', 'RPAS operations must maintain a minimum distance of 9 kilometers from airports unless authorized.', course_uuid),
    ('What weather condition is most dangerous for drone operations?', 'Light rain', 'High winds', 'Overcast skies', 'Cold temperatures', 'B', 'High winds pose the greatest risk to drone operations as they can cause loss of control and crashes.', course_uuid),
    ('What is required before flying in controlled airspace?', 'Weather check only', 'ATC authorization', 'Insurance verification', 'Equipment inspection', 'B', 'Air Traffic Control (ATC) authorization is required before flying in controlled airspace.', course_uuid),
    ('What is the maximum weight for micro RPAS category?', '100 grams', '250 grams', '500 grams', '1 kilogram', 'B', 'Micro RPAS category includes drones weighing 250 grams or less.', course_uuid);
  END LOOP;

  -- Insert questions for Advanced courses
  FOR course_uuid IN 
    SELECT id FROM courses_ats 
    WHERE title ILIKE '%advanced%' 
    LIMIT 3
  LOOP
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What additional requirements apply to RPAS Advanced operations?', 'Night flying only', 'Complex airspace operations', 'International flights', 'Commercial insurance', 'B', 'RPAS Advanced certification allows operations in complex airspace and controlled airspace.', course_uuid),
    ('What is the minimum age for RPAS Advanced Certification?', '14 years', '16 years', '18 years', '21 years', 'B', 'RPAS Advanced Certification requires pilots to be at least 16 years old.', course_uuid),
    ('What type of medical certificate is required for RPAS Advanced operations?', 'Class 1 medical', 'Class 3 medical', 'Aviation medical', 'No medical required', 'D', 'No medical certificate is required for RPAS operations under current regulations.', course_uuid),
    ('What is the maximum distance for BVLOS operations?', '1 kilometer', '5 kilometers', 'No specific limit', 'Requires special authorization', 'D', 'Beyond Visual Line of Sight (BVLOS) operations require special authorization from Transport Canada.', course_uuid),
    ('What equipment is mandatory for night RPAS operations?', 'Strobe lights only', 'Navigation lights only', 'Both strobe and navigation lights', 'Thermal camera', 'C', 'Night operations require both strobe lights and navigation lights for visibility and safety.', course_uuid),
    ('What is the validity period for RPAS Advanced Certificate?', '1 year', '2 years', '5 years', '10 years', 'C', 'RPAS Advanced certificates are valid for 5 years from the date of issue.', course_uuid),
    ('Which airspace requires RPAS Advanced certification?', 'Class G only', 'Class E and above', 'Controlled airspace', 'International airspace', 'C', 'Operations in controlled airspace require RPAS Advanced certification.', course_uuid),
    ('What is required for commercial RPAS operations?', 'Basic certificate only', 'Advanced certificate', 'Special endorsement', 'Commercial license', 'B', 'Commercial RPAS operations typically require Advanced certification.', course_uuid);
  END LOOP;

  -- Insert questions for Mapping/Surveying courses
  FOR course_uuid IN 
    SELECT id FROM courses_ats 
    WHERE title ILIKE '%mapping%' OR title ILIKE '%survey%' OR title ILIKE '%photogrammetry%'
    LIMIT 2
  LOOP
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What is the recommended overlap for aerial photography mapping?', '30%', '60%', '80%', '90%', 'C', 'For accurate photogrammetry, images should have 80% overlap to ensure proper 3D reconstruction.', course_uuid),
    ('Which file format is best for mapping photography?', 'JPEG', 'RAW', 'TIFF', 'PNG', 'B', 'RAW format preserves the most image data and provides better results for photogrammetry processing.', course_uuid),
    ('What is Ground Sample Distance (GSD)?', 'Camera resolution', 'Flight altitude', 'Pixel size on ground', 'Image overlap', 'C', 'GSD represents the real-world distance between pixel centers measured on the ground.', course_uuid),
    ('What weather condition is ideal for mapping flights?', 'Partly cloudy', 'Overcast', 'Clear skies', 'Light rain', 'C', 'Clear skies provide consistent lighting and avoid shadows that can affect mapping accuracy.', course_uuid),
    ('What is the purpose of ground control points (GCPs)?', 'Landing markers', 'Survey accuracy', 'Flight planning', 'Safety zones', 'B', 'GCPs are used to improve the accuracy and georeferencing of mapping surveys.', course_uuid);
  END LOOP;

  -- Insert questions for Thermal Inspection courses
  FOR course_uuid IN 
    SELECT id FROM courses_ats 
    WHERE title ILIKE '%thermal%' OR title ILIKE '%inspection%'
    LIMIT 2
  LOOP
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What time of day is best for thermal inspections?', 'Early morning', 'Midday', 'Late afternoon', 'Night', 'A', 'Early morning provides the best thermal contrast before solar heating affects the results.', course_uuid),
    ('What does emissivity affect in thermal imaging?', 'Image resolution', 'Temperature accuracy', 'Flight altitude', 'Battery life', 'B', 'Emissivity affects how accurately the thermal camera can measure surface temperatures.', course_uuid),
    ('What is the main advantage of thermal imaging for inspections?', 'Cost savings', 'Non-contact measurement', 'High resolution', 'Weather independence', 'B', 'Thermal imaging allows temperature measurement without physical contact with the subject.', course_uuid),
    ('Which material has the highest emissivity?', 'Polished metal', 'Glass', 'Painted surface', 'Plastic', 'C', 'Painted surfaces typically have high emissivity values, making them ideal for thermal imaging.', course_uuid);
  END LOOP;

  -- Insert general questions for any remaining courses
  FOR course_uuid IN 
    SELECT id FROM courses_ats 
    WHERE id NOT IN (
      SELECT DISTINCT course_id FROM practice_questions WHERE course_id IS NOT NULL
    )
    LIMIT 5
  LOOP
    INSERT INTO practice_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, course_id) VALUES
    ('What is the primary purpose of pre-flight checks?', 'Legal requirement', 'Safety assurance', 'Equipment testing', 'Weather assessment', 'B', 'Pre-flight checks ensure the aircraft and systems are safe for operation.', course_uuid),
    ('Which organization regulates RPAS in Canada?', 'NAV CANADA', 'Transport Canada', 'Canadian Aviation Regulations', 'ICAO', 'B', 'Transport Canada is the regulatory authority for RPAS operations in Canada.', course_uuid),
    ('What is the maximum takeoff weight for small RPAS?', '25 kg', '35 kg', '45 kg', '55 kg', 'A', 'Small RPAS category includes aircraft with maximum takeoff weight of 25 kg or less.', course_uuid),
    ('What documentation is required for RPAS registration?', 'Proof of purchase only', 'Owner information only', 'Both owner info and aircraft details', 'Insurance documents', 'C', 'RPAS registration requires both owner information and detailed aircraft specifications.', course_uuid),
    ('How long is an RPAS certificate valid?', '1 year', '2 years', '5 years', '10 years', 'C', 'RPAS certificates are valid for 5 years from the date of issue.', course_uuid),
    ('What happens if you fail the RPAS exam?', 'Retake immediately', 'Wait 24 hours', 'Wait 30 days', 'Retake training', 'B', 'If you fail the RPAS exam, you must wait 24 hours before retaking it.', course_uuid);
  END LOOP;

END $$;