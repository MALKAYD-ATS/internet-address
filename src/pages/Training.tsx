import React, { useState, useEffect } from 'react';
import { Award, Users, CheckCircle, Calendar, BookOpen, Plane, ArrowRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SupabaseCourse {
  id: string;
  title: string | null;
  description: string | null;
  type: string | null;
  level: string | null;
  age_requirement: number | null;
  experience_requirement: string | null;
  equipment_requirement: string | null;
  document_requirement: string | null;
  suggested_preparation: string | null;
  price: number | null;
  currency: string | null;
  duration: string | null;
  max_students: number | null;
  start_date: string | null;
  whats_included: any;
  is_active: boolean | null;
  is_online: boolean | null;
  created_at: string;
}

interface CourseDisplayData {
  id: string;
  title: string;
  description: string;
  duration: string;
  nextStartDate: string;
  price: string | null;
  level: string;
  type: string;
  ageRequirement: number | null;
  maxStudents: number | null;
  whatsIncluded: string[];
}

const Training: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Regulation' | 'Application'>('Regulation');
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [regulationCourses, setRegulationCourses] = useState<CourseDisplayData[]>([]);
  const [applicationCourses, setApplicationCourses] = useState<CourseDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses only once when component mounts
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all active courses
        const { data, error } = await supabase
          .from('courses_ats')
          .select('*')
          .eq('is_active', true)
          .order('title', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
          if (isMounted) {
            setError('Failed to load courses. Please try again later.');
          }
          return;
        }

        if (isMounted) {
          const coursesData = data || [];
          setCourses(coursesData);
          
          // Process and group courses
          const processedCourses = coursesData.map(transformCourse);
          const regulation = processedCourses.filter(course => course.type.toLowerCase() === 'regulation');
          const application = processedCourses.filter(course => course.type.toLowerCase() === 'application');
          
          setRegulationCourses(regulation);
          setApplicationCourses(application);
          
          console.log('Fetched courses:', coursesData.length);
          console.log('Regulation courses:', regulation.length);
          console.log('Application courses:', application.length);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (isMounted) {
          setError('An unexpected error occurred while loading courses.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once

  // Transform Supabase course to display format
  const transformCourse = (course: SupabaseCourse): CourseDisplayData => {
    // Parse whats_included field
    let features: string[] = [];
    if (course.whats_included) {
      if (Array.isArray(course.whats_included)) {
        features = course.whats_included;
      } else if (typeof course.whats_included === 'string') {
        try {
          const parsed = JSON.parse(course.whats_included);
          features = Array.isArray(parsed) ? parsed : [course.whats_included];
        } catch {
          features = [course.whats_included];
        }
      }
    }

    // Format price
    const formattedPrice = course.price && course.price > 0
      ? `${course.currency || 'USD'} $${course.price.toLocaleString()}`
      : null;

    // Format next start date
    const nextStartDate = course.start_date 
      ? new Date(course.start_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Contact us for next available date';

    return {
      id: course.id,
      title: course.title || 'Untitled Course',
      description: course.description || 'No description available.',
      duration: course.duration || 'Contact for details',
      nextStartDate,
      price: formattedPrice,
      level: course.level || 'All Levels',
      type: course.type || 'General',
      ageRequirement: course.age_requirement,
      maxStudents: course.max_students,
      whatsIncluded: features
    };
  };

  // State for card flipping
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  // Helper function to toggle card flip state
  const toggleCardFlip = (courseId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(courseId)) {
      newFlipped.delete(courseId);
    } else {
      newFlipped.add(courseId);
    }
    setFlippedCards(newFlipped);
  };

  // Get current courses based on selected type
  const currentCourses = selectedType === 'Regulation' ? regulationCourses : applicationCourses;

  // Calculate stats
  const totalCourses = courses.length;
  const totalRegulation = regulationCourses.length;
  const totalApplication = applicationCourses.length;

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12 transform transition-all duration-500" style={{ scrollBehavior: 'smooth' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-blue-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-400 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 transform transition-all duration-500 hover:scale-105">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Professional Drone Training Courses
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Comprehensive training programs designed to advance your drone expertise, from basic certification 
            to advanced commercial operations. All courses meet Transport Canada standards.
          </p>
        </div>

        {/* Course Type Toggle */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-white rounded-xl shadow-lg p-1 sm:p-2 transform transition-all duration-500 hover:shadow-xl">
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setSelectedType('Regulation')}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base flex items-center ${
                  selectedType === 'Regulation'
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                Regulation Courses
                <span className="ml-2 bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {totalRegulation}
                </span>
              </button>
              <button
                onClick={() => setSelectedType('Application')}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base flex items-center ${
                  selectedType === 'Application'
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <Plane className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                Application Courses
                <span className="ml-2 bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {totalApplication}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Courses</h3>
            <p className="text-gray-600">Fetching the latest course information...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-110 hover:shadow-xl">
                <Award className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalCourses}</div>
                <div className="text-gray-600 text-xs sm:text-base">Total Courses</div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-110 hover:shadow-xl">
                <div className={`h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2 sm:mb-3 ${selectedType === 'Regulation' ? 'text-blue-600' : 'text-green-600'}`}>
                  {selectedType === 'Regulation' ? <BookOpen className="h-full w-full" /> : <Plane className="h-full w-full" />}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{currentCourses.length}</div>
                <div className="text-gray-600 text-xs sm:text-base">{selectedType} Courses</div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-110 hover:shadow-xl">
                <Users className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600 text-xs sm:text-base">Graduates</div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-110 hover:shadow-xl">
                <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-gray-900">Year-Round</div>
                <div className="text-gray-600 text-xs sm:text-base">Scheduling</div>
              </div>
            </div>

            {/* Selected Course Type Section */}
            <section className="mb-12 sm:mb-16">
              <div className="text-center mb-8 sm:mb-12">
                <div className="flex items-center justify-center mb-4">
                  {selectedType === 'Regulation' ? (
                    <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                  ) : (
                    <Plane className="h-8 w-8 text-blue-600 mr-3" />
                  )}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {selectedType} Courses
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {selectedType === 'Regulation' 
                    ? 'Essential certification courses covering Transport Canada regulations, safety protocols, and compliance requirements for professional drone operations.'
                    : 'Specialized hands-on training for commercial drone applications including mapping, surveying, inspection, and industry-specific operations.'
                  }
                </p>
              </div>

              {currentCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                  {selectedType === 'Regulation' ? (
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  ) : (
                    <Plane className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No {selectedType} Courses Available</h3>
                  <p className="text-gray-600">
                    {selectedType} courses are currently being updated. Please check back later or contact us for more information.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {currentCourses.map((course) => (
                    <div key={course.id} className="relative h-[500px] perspective-1000">
                        <div
                          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                            flippedCards.has(course.id) ? 'rotate-y-180' : ''
                          }`}
                        >
                          {/* Front of Card */}
                          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="h-full flex flex-col">
                              {/* Course Header - Fixed */}
                              <div className="p-6 pb-4 flex-shrink-0">
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {course.type}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {course.level}
                                  </span>
                                  {course.ageRequirement && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Age {course.ageRequirement}+
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                {course.price && (
                                  <div className="text-lg font-bold text-blue-700">
                                    {course.price}
                                  </div>
                                )}
                              </div>

                              {/* Scrollable Content */}
                              <div className="flex-1 px-6 overflow-y-auto">
                                {/* Course Description */}
                                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                                  {course.description}
                                </p>

                                {/* Course Details */}
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>Duration: {course.duration}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>Next Start: {course.nextStartDate}</span>
                                  </div>
                                  {course.maxStudents && (
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                                      <span>Max Students: {course.maxStudents}</span>
                                    </div>
                                  )}
                                </div>

                                {/* What's Included */}
                                {course.whatsIncluded.length > 0 && (
                                  <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">What's Included:</h4>
                                    <ul className="space-y-1">
                                      {course.whatsIncluded.map((item, index) => (
                                        <li key={index} className="flex items-start text-xs">
                                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                          <span className="text-gray-700">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons - Fixed at Bottom */}
                              <div className="p-6 pt-4 flex-shrink-0 bg-white border-t border-gray-100">
                                <div className="flex flex-col gap-2">
                                  <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm">
                                    <span>Register Now</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => toggleCardFlip(course.id)}
                                    className="w-full border-2 border-gray-300 hover:border-blue-700 hover:text-blue-700 text-gray-700 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                                  >
                                    Learn More
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Back of Card */}
                          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg overflow-hidden">
                            <div className="h-full flex flex-col">
                              {/* Header - Fixed */}
                              <div className="p-6 pb-4 flex-shrink-0 border-b border-blue-200">
                                <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                                <button
                                  onClick={() => toggleCardFlip(course.id)}
                                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-white/50"
                                >
                                  <ArrowLeft className="h-5 w-5" />
                                </button>
                              </div>
                              </div>
                              
                              {/* Scrollable Content */}
                              <div className="flex-1 p-6 pt-4 overflow-y-auto">
                                <h4 className="font-semibold text-gray-900 mb-3">Course Description</h4>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                  {course.description}
                                </p>
                                
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="font-medium text-gray-900 mb-1">Course Level</h5>
                                    <p className="text-gray-600 text-sm">{course.level}</p>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-gray-900 mb-1">Duration</h5>
                                    <p className="text-gray-600 text-sm">{course.duration}</p>
                                  </div>
                                  
                                  {course.ageRequirement && (
                                    <div>
                                      <h5 className="font-medium text-gray-900 mb-1">Age Requirement</h5>
                                      <p className="text-gray-600 text-sm">{course.ageRequirement}+ years</p>
                                    </div>
                                  )}
                                  
                                  {course.maxStudents && (
                                    <div>
                                      <h5 className="font-medium text-gray-900 mb-1">Class Size</h5>
                                      <p className="text-gray-600 text-sm">Maximum {course.maxStudents} students</p>
                                    </div>
                                  )}
                                  
                                  {course.whatsIncluded.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-gray-900 mb-2">Complete Feature List</h5>
                                      <ul className="space-y-1">
                                        {course.whatsIncluded.map((item, index) => (
                                          <li key={index} className="flex items-start text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action Buttons - Fixed at Bottom */}
                              <div className="p-6 pt-4 flex-shrink-0 border-t border-blue-200">
                                <div className="flex flex-col gap-2">
                                  <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm">
                                    <span>Register Now</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => toggleCardFlip(course.id)}
                                    className="w-full border-2 border-blue-300 hover:border-blue-500 text-blue-700 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                                  >
                                    Back to Summary
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-all duration-500 hover:shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Course Information & Requirements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">General Prerequisites</h3>
                  <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                    <li className="transform transition-all duration-300 hover:translate-x-2">• Minimum age varies by course (14-21 years)</li>
                    <li className="transform transition-all duration-300 hover:translate-x-2">• Valid government-issued photo ID</li>
                    <li className="transform transition-all duration-300 hover:translate-x-2">• Basic English language proficiency</li>
                    <li className="transform transition-all duration-300 hover:translate-x-2">• No prior drone experience required for basic courses</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">What to Bring</h3>
                  <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                    <li className="transform transition-all duration-300 hover:translate-x-2">• Notepad and pen for theory sessions</li>
                    <li className="transform transition-all duration-300 hover:translate-x-2">• Weather-appropriate outdoor clothing</li>
                    <li className="transform transition-all duration-300 hover:translate-x-2">• Lunch (or purchase on-site)</li>
                    <li className="transform transition-all duration-300 hover:translate-x-2">• All equipment and materials provided</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-lg transform transition-all duration-300 hover:bg-blue-100">
                <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">Group Discounts Available</h3>
                <p className="text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base">
                  Register 3 or more students from the same organization and receive a 15% group discount. 
                  Perfect for companies implementing drone programs.
                </p>
                <a
                  href="https://calendly.com/majid-abtraining/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center transform transition-all duration-300 hover:translate-x-2 text-sm sm:text-base"
                >
                  Schedule group pricing consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Custom CSS for line clamping */}
      <style jsx>{`
        /* Custom CSS for flip animations */
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Training;