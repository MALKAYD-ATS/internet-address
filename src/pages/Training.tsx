import React, { useState, useEffect } from 'react';
import { Award, Users, CheckCircle, Calendar, BookOpen, Plane, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

interface FlippedCard {
  [courseId: string]: boolean;
}

interface LoadingStates {
  [courseId: string]: boolean;
}

interface RegistrationStates {
  [courseId: string]: boolean;
}

const Training: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Regulation' | 'Application'>('Regulation');
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [regulationCourses, setRegulationCourses] = useState<CourseDisplayData[]>([]);
  const [applicationCourses, setApplicationCourses] = useState<CourseDisplayData[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<FlippedCard>({});
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [registrationStates, setRegistrationStates] = useState<RegistrationStates>({});
  const [registrationMessages, setRegistrationMessages] = useState<{[key: string]: string}>({});
  
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Fetch user enrollments if logged in
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) {
        setEnrollments([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id);

        if (error) {
          console.error('Error fetching enrollments:', error);
          return;
        }

        setEnrollments(data?.map(enrollment => enrollment.course_id) || []);
      } catch (err) {
        console.error('Enrollment fetch error:', err);
      }
    };

    fetchEnrollments();
  }, [user]);

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

  // Get current courses based on selected type
  const currentCourses = selectedType === 'Regulation' ? regulationCourses : applicationCourses;

  // Calculate stats
  const totalCourses = courses.length;
  const totalRegulation = regulationCourses.length;
  const totalApplication = applicationCourses.length;

  // Handle course registration
  const handleRegisterNow = async (courseId: string) => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if already enrolled
    if (enrollments.includes(courseId)) {
      setRegistrationMessages({
        ...registrationMessages,
        [courseId]: 'You are already registered for this course.'
      });
      setTimeout(() => {
        setRegistrationMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[courseId];
          return newMessages;
        });
      }, 3000);
      return;
    }

    setRegistrationStates({ ...registrationStates, [courseId]: true });

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert([
          {
            student_id: user.id,
            course_id: courseId,
            enrolled_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Registration error:', error);
        setRegistrationMessages({
          ...registrationMessages,
          [courseId]: 'Registration failed. Please try again.'
        });
      } else {
        setRegistrationMessages({
          ...registrationMessages,
          [courseId]: 'You have been registered for this course.'
        });
        
        // Update enrollments list
        setEnrollments([...enrollments, courseId]);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationMessages({
        ...registrationMessages,
        [courseId]: 'Registration failed. Please try again.'
      });
    } finally {
      setRegistrationStates({ ...registrationStates, [courseId]: false });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setRegistrationMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[courseId];
          return newMessages;
        });
      }, 3000);
    }
  };

  // Handle learn more card flip
  const handleLearnMore = async (courseId: string) => {
    const isCurrentlyFlipped = flippedCards[courseId];
    
    if (isCurrentlyFlipped) {
      // Just flip back if already showing details
      setFlippedCards({ ...flippedCards, [courseId]: false });
      return;
    }

    setLoadingStates({ ...loadingStates, [courseId]: true });

    try {
      // Fetch detailed course information
      const { data, error } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course details:', error);
        return;
      }

      // Update the course data in our state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId ? { ...course, ...data } : course
        )
      );

      // Flip the card
      setFlippedCards({ ...flippedCards, [courseId]: true });
    } catch (err) {
      console.error('Learn more error:', err);
    } finally {
      setLoadingStates({ ...loadingStates, [courseId]: false });
    }
  };

  // Format whats_included as bullet list
  const formatWhatsIncluded = (whatsIncluded: any): string[] => {
    if (!whatsIncluded) return [];
    
    if (Array.isArray(whatsIncluded)) {
      return whatsIncluded;
    }
    
    if (typeof whatsIncluded === 'string') {
      try {
        const parsed = JSON.parse(whatsIncluded);
        return Array.isArray(parsed) ? parsed : [whatsIncluded];
      } catch {
        return [whatsIncluded];
      }
    }
    
    return [];
  };

  // Get detailed course data for flipped card
  const getDetailedCourse = (courseId: string) => {
    return courses.find(course => course.id === courseId);
  };

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
                    <div key={course.id} className="relative h-auto perspective-1000">
                      <div
                        className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${
                          flippedCards[course.id] ? 'rotate-y-180' : ''
                        }`}
                      >
                        {/* Front of Card */}
                        <div className="absolute inset-0 w-full backface-hidden">
                          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl h-full">
                            <div className="p-6">
                              {/* Course Header */}
                              <div className="mb-4">
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
                                  {enrollments.includes(course.id) && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Enrolled
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                {course.price && (
                                  <div className="text-lg font-bold text-blue-700 mb-2">
                                    {course.price}
                                  </div>
                                )}
                              </div>

                              {/* Course Description */}
                              <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                                {course.description}
                              </p>

                              {/* Course Details */}
                              <div className="space-y-2 mb-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>Duration: {course.duration}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>Next Start: {course.nextStartDate}</span>
                                </div>
                                {course.maxStudents && (
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>Max Students: {course.maxStudents}</span>
                                  </div>
                                )}
                              </div>

                              {/* What's Included */}
                              {course.whatsIncluded.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">What's Included:</h4>
                                  <ul className="space-y-1">
                                    {course.whatsIncluded.slice(0, 3).map((item, index) => (
                                      <li key={index} className="flex items-start text-xs">
                                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                      </li>
                                    ))}
                                    {course.whatsIncluded.length > 3 && (
                                      <li className="text-xs text-gray-500 italic pl-5">
                                        +{course.whatsIncluded.length - 3} more features...
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}

                              {/* Registration Message */}
                              {registrationMessages[course.id] && (
                                <div className={`mb-4 p-3 rounded-lg text-sm ${
                                  registrationMessages[course.id].includes('failed') 
                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                    : registrationMessages[course.id].includes('already')
                                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                    : 'bg-green-50 text-green-800 border border-green-200'
                                }`}>
                                  {registrationMessages[course.id]}
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => handleRegisterNow(course.id)}
                                  disabled={registrationStates[course.id] || enrollments.includes(course.id)}
                                  className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm ${
                                    enrollments.includes(course.id)
                                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                      : registrationStates[course.id]
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-blue-700 hover:bg-blue-800 text-white'
                                  }`}
                                  aria-label={`Register for ${course.title}`}
                                >
                                  {registrationStates[course.id] ? (
                                    <>
                                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                      Registering...
                                    </>
                                  ) : enrollments.includes(course.id) ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Enrolled
                                    </>
                                  ) : (
                                    <>
                                      <span>Register Now</span>
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleLearnMore(course.id)}
                                  disabled={loadingStates[course.id]}
                                  className="w-full border-2 border-gray-300 hover:border-blue-700 hover:text-blue-700 text-gray-700 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm flex items-center justify-center"
                                  aria-label={`Learn more about ${course.title}`}
                                >
                                  {loadingStates[course.id] ? (
                                    <>
                                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                      Loading...
                                    </>
                                  ) : (
                                    'Learn More'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Back of Card - Detailed Information */}
                        <div className="absolute inset-0 w-full backface-hidden rotate-y-180">
                          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                            <div className="p-6 h-full overflow-y-auto">
                              {(() => {
                                const detailedCourse = getDetailedCourse(course.id);
                                if (!detailedCourse) return <div>Loading...</div>;
                                
                                return (
                                  <>
                                    {/* Header */}
                                    <div className="mb-4">
                                      <h3 className="text-xl font-bold text-gray-900 mb-2">{detailedCourse.title}</h3>
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {detailedCourse.type}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          {detailedCourse.level}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-4">
                                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Description:</h4>
                                      <p className="text-gray-700 text-sm leading-relaxed">{detailedCourse.description}</p>
                                    </div>

                                    {/* Course Details Grid */}
                                    <div className="space-y-3 mb-4 text-sm">
                                      {detailedCourse.price && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Price: </span>
                                          <span className="text-blue-700 font-bold">
                                            {detailedCourse.currency || 'USD'} ${detailedCourse.price}
                                          </span>
                                        </div>
                                      )}
                                      
                                      <div>
                                        <span className="font-semibold text-gray-900">Duration: </span>
                                        <span className="text-gray-700">{detailedCourse.duration}</span>
                                      </div>

                                      {detailedCourse.start_date && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Start Date: </span>
                                          <span className="text-gray-700">
                                            {new Date(detailedCourse.start_date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </span>
                                        </div>
                                      )}

                                      {detailedCourse.age_requirement && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Age Requirement: </span>
                                          <span className="text-gray-700">{detailedCourse.age_requirement}+ years</span>
                                        </div>
                                      )}

                                      {detailedCourse.max_students && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Max Students: </span>
                                          <span className="text-gray-700">{detailedCourse.max_students}</span>
                                        </div>
                                      )}

                                      {detailedCourse.experience_requirement && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Experience Required: </span>
                                          <span className="text-gray-700">{detailedCourse.experience_requirement}</span>
                                        </div>
                                      )}

                                      {detailedCourse.equipment_requirement && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Equipment Required: </span>
                                          <span className="text-gray-700">{detailedCourse.equipment_requirement}</span>
                                        </div>
                                      )}

                                      {detailedCourse.document_requirement && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Documents Required: </span>
                                          <span className="text-gray-700">{detailedCourse.document_requirement}</span>
                                        </div>
                                      )}

                                      {detailedCourse.suggested_preparation && (
                                        <div>
                                          <span className="font-semibold text-gray-900">Suggested Preparation: </span>
                                          <span className="text-gray-700">{detailedCourse.suggested_preparation}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* What's Included */}
                                    {detailedCourse.whats_included && (
                                      <div className="mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">What's Included:</h4>
                                        <ul className="space-y-1">
                                          {formatWhatsIncluded(detailedCourse.whats_included).map((item, index) => (
                                            <li key={index} className="flex items-start text-xs">
                                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                              <span className="text-gray-700">{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Back Button */}
                                    <div className="mt-6">
                                      <button 
                                        onClick={() => handleLearnMore(course.id)}
                                        className="w-full border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                                        aria-label={`Close details for ${course.title}`}
                                      >
                                        Back to Summary
                                      </button>
                                    </div>
                                  </>
                                );
                              })()}
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

      {/* Custom CSS for line clamping and card flipping */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
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
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                          {course.price && (
                            <div className="text-lg font-bold text-blue-700 mb-2">
                              {course.price}
                            </div>
                          )}
                        </div>

                        {/* Course Description */}
                        <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                          {course.description}
                        </p>

                        {/* Course Details */}
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Duration: {course.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Next Start: {course.nextStartDate}</span>
                          </div>
                          {course.maxStudents && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Max Students: {course.maxStudents}</span>
                            </div>
                          )}
                        </div>

                        {/* What's Included */}
                        {course.whatsIncluded.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">What's Included:</h4>
                            <ul className="space-y-1">
                              {course.whatsIncluded.slice(0, 3).map((item, index) => (
                                <li key={index} className="flex items-start text-xs">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{item}</span>
                                </li>
                              ))}
                              {course.whatsIncluded.length > 3 && (
                                <li className="text-xs text-gray-500 italic pl-5">
                                  +{course.whatsIncluded.length - 3} more features...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm">
                            <span>Register Now</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                          <button className="w-full border-2 border-gray-300 hover:border-blue-700 hover:text-blue-700 text-gray-700 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm">
                            Learn More
                          </button>
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Training;