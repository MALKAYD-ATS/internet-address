/*
  # Add sample data to google_reviews table

  1. Sample Data
    - Insert realistic Google review data for demonstration
    - All reviews marked as published (is_new = false)
    - Variety of ratings, dates, and review content
    - Proper company attribution

  2. Data Structure
    - Uses existing google_reviews table structure
    - Includes all required fields for the carousel
    - Realistic review content and dates
*/

-- Insert sample Google reviews data
INSERT INTO google_reviews (name, image_url, rating, review_date, text, is_new, review_count, company, order_index) 
SELECT * FROM (VALUES 
  ('Sarah Mitchell', 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150', 5, '2024-11-15', 'Exceptional RPAS training! The instructors at Aboriginal Training Services are incredibly knowledgeable and patient. I went from zero drone experience to confidently operating commercial drones. The hands-on approach and real-world scenarios made all the difference. Highly recommend for anyone serious about drone certification.', false, 3, 'Aboriginal Training Services', 1),
  ('David Chen', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', 5, '2024-10-28', 'Outstanding corporate training program! ATS provided customized drone safety training for our entire infrastructure team. The curriculum was perfectly tailored to our operational needs and regulatory requirements. Professional, thorough, and practical. Our team is now confidently using drones for inspections.', false, 1, 'Aboriginal Training Services', 2),
  ('Maria Rodriguez', 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=150', 5, '2024-12-02', 'Started with the basic certification course and now I''m running my own aerial photography business! The training was comprehensive, covering everything from regulations to practical flight techniques. The instructors'' expertise in both technical and business aspects was invaluable. Worth every penny!', false, 2, 'Aboriginal Training Services', 3),
  ('James Thompson', null, 5, '2024-09-20', 'Best drone training in Alberta! The advanced certification course exceeded my expectations. The combination of classroom theory and hands-on practice was perfect. The instructors have real-world commercial experience and share practical insights you won''t find elsewhere. Highly professional organization.', false, 1, 'Aboriginal Training Services', 4),
  ('Lisa Park', 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150', 5, '2024-11-08', 'Incredible learning experience! The Indigenous approach to technology and environmental stewardship really resonated with me. Not just technical training, but a holistic understanding of responsible drone operations. The instructors are passionate and knowledgeable. Couldn''t be happier with my choice.', false, 4, 'Aboriginal Training Services', 5),
  ('Michael Brown', null, 5, '2024-10-12', 'Top-notch training facility and equipment. The course materials are up-to-date with current regulations and industry best practices. Small class sizes ensure personalized attention. The practical flight training in various weather conditions was particularly valuable. Excellent preparation for the Transport Canada exam.', false, 1, 'Aboriginal Training Services', 6),
  ('Jennifer Wilson', 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150', 5, '2024-11-25', 'Fantastic instructor team! They made complex aviation regulations easy to understand and remember. The hands-on training with professional-grade equipment gave me confidence to start my commercial operations immediately after certification. The ongoing support and advice have been invaluable for my business.', false, 2, 'Aboriginal Training Services', 7),
  ('Robert Kim', null, 4, '2024-09-05', 'Very thorough and professional training program. Covered all aspects of drone operations from basic safety to advanced commercial applications. The only minor issue was the weather during our outdoor sessions, but the instructors adapted well. Overall, excellent value and highly recommended for serious drone operators.', false, 1, 'Aboriginal Training Services', 8),
  ('Amanda Foster', 'https://images.pexels.com/photos/3785076/pexels-photo-3785076.jpeg?auto=compress&cs=tinysrgb&w=150', 5, '2024-12-10', 'Exceeded all expectations! The combination of Indigenous values and cutting-edge technology creates a unique and meaningful learning environment. The instructors'' commitment to environmental stewardship and community service is inspiring. Technical training was excellent, but the cultural perspective made it truly special.', false, 3, 'Aboriginal Training Services', 9),
  ('Kevin Martinez', null, 5, '2024-10-30', 'Professional, comprehensive, and practical training. The course structure is well-designed, building from fundamentals to advanced operations. Real-world scenarios and case studies made the learning relevant and engaging. The certification preparation was thorough - passed the Transport Canada exam on first try!', false, 1, 'Aboriginal Training Services', 10)
) AS v(name, image_url, rating, review_date, text, is_new, review_count, company, order_index)
WHERE NOT EXISTS (SELECT 1 FROM google_reviews WHERE name = 'Sarah Mitchell');