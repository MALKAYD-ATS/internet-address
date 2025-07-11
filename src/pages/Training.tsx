import React, { useState, useEffect } from 'react';
import { Award, Users, CheckCircle, Calendar, BookOpen, Plane, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CourseCard from '../components/CourseCard';
import { CourseData } from '../data/courseData';

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
  created_at: string;
}

const Training: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Regulation' | 'Application'>('Regulation');
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses only once when component mounts
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Single query to fetch all active courses
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
          // Ensure no duplicates by filtering unique IDs
          const uniqueCourses = data ? data.filter((course, index, self) => 
            index === self.findIndex(c => c.id === course.id)
          ) : [];
          
          setCourses(uniqueCourses);
          console.log('Fetched courses:', uniqueCourses.length);
          console.log('Course types:', uniqueCourses.map(c => ({ id: c.id, title: c.title, type: c.type })));
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

  // Convert Supabase course to CourseData format
  const convertToCourseData = (course: SupabaseCourse): CourseData => {
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

    // Parse document_requirement into array
    let documentRequirements: string[] = [];
    if (course.document_requirement) {
      if (typeof course.document_requirement === 'string') {
        try {
          const parsed = JSON.parse(course.document_requirement);
          documentRequirements = Array.isArray(parsed) ? parsed : [course.document_requirement];
        } catch {
          documentRequirements = [course.document_requirement];
        }
      }
    }

    // Parse suggested_preparation into array
    let preparationRequirements: string[] = [];
    if (course.suggested_preparation) {
      if (typeof course.suggested_preparation === 'string') {
        try {
          const parsed = JSON.parse(course.suggested_preparation);
          preparationRequirements = Array.isArray(parsed) ? parsed : [course.suggested_preparation];
        } catch {
          preparationRequirements = [course.suggested_preparation];
        }
      }
    }

    // Parse equipment_requirement into array for requirements
    let equipmentRequirements: string[] = [];
    if (course.equipment_requirement) {
      if (typeof course.equipment_requirement === 'string') {
        try {
          const parsed = JSON.parse(course.equipment_requirement);
          equipmentRequirements = Array.isArray(parsed) ? parsed : [course.equipment_requirement];
        } catch {
          equipmentRequirements = [course.equipment_requirement];
        }
      }
    }

    // Format price
    const formattedPrice = course.price 
      ? `${course.currency || 'USD'} $${course.price.toLocaleString()}`
      : undefined;

    // Format next date
    const nextDate = course.start_date 
      ? new Date(course.start_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Contact for scheduling';

    // Format capacity
    const capacity = course.max_students 
      ? `${course.max_students} students`
      : 'Contact for details';

    return {
      id: parseInt(course.id.replace(/-/g, '').substring(0, 8), 16) || Math.floor(Math.random() * 1000000), // Convert UUID to number for compatibility
      title: course.title || 'Untitled Course',
      description: course.description || 'No description available.',
      level: course.level || 'All Levels',
      minimumAge: course.age_requirement || 18,
      duration: course.duration || 'Contact for details',
      price: formattedPrice,
      capacity: capacity,
      nextDate: nextDate,
      features: features,
      prerequisites: {
        age: course.age_requirement ? `${course.age_requirement}+ years` : '',
        experience: course.experience_requirement || '',
        equipment: course.equipment_requirement || '',
        other: []
      },
      requirements: {
        documents: documentRequirements,
        equipment: equipmentRequirements,
        preparation: preparationRequirements
      }
    };
  };

  // Filter courses by selected type and convert to CourseData format
  const filteredCourses = React.useMemo(() => {
    const filtered = courses.filter(course => course.type === selectedType);
    console.log(`Filtering for ${selectedType}:`, filtered.length, 'courses');
    return filtered.map(convertToCourseData);
  }, [courses, selectedType]);

  // Calculate stats
  const totalCourses = courses.length;
  const totalRegulation = courses.filter(course => course.type === 'Regulation').length;
  const totalApplication = courses.filter(course => course.type === 'Application').length;

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
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{filteredCourses.length}</div>
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

              {filteredCourses.length === 0 ? (
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard key={`${selectedType}-${course.id}`} course={course} />
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
    </div>
  );
};

export default Training;