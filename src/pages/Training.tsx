import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Calendar, DollarSign, BookOpen, Award, ChevronRight, Loader2, Filter, GraduationCap } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  age_requirement: string;
  experience_requirement: string;
  equipment_requirement: string;
  document_requirement: string;
  suggested_preparation: string;
  price: number;
  currency: string;
  duration: string;
  max_students: number;
  start_date: string;
  whats_included: any;
  is_active: boolean;
  is_online: boolean;
}

interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
}

const Training: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Regulation' | 'Application'>('all');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [courseDetails, setCourseDetails] = useState<Record<string, Course>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [registering, setRegistering] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [totalGraduates] = useState(247); // Mock data - replace with actual data from database
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  // Filter courses when courses or selectedFilter changes
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(course => course.type === selectedFilter));
    }
  }, [courses, selectedFilter]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    if (courseDetails[courseId]) return;

    setLoadingDetails(prev => new Set(prev).add(courseId));

    try {
      const { data, error } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      
      setCourseDetails(prev => ({
        ...prev,
        [courseId]: data
      }));
    } catch (error) {
      console.error('Error fetching course details:', error);
      setMessage({ type: 'error', text: 'Failed to load course details' });
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleLearnMore = async (courseId: string) => {
    if (flippedCards.has(courseId)) {
      // Flip back
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    } else {
      // Flip to details
      await fetchCourseDetails(courseId);
      setFlippedCards(prev => new Set(prev).add(courseId));
    }
  };

  const handleRegisterNow = async (courseId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if already enrolled
    const isEnrolled = enrollments.some(enrollment => enrollment.course_id === courseId);
    if (isEnrolled) {
      setMessage({ type: 'error', text: 'You are already registered for this course' });
      return;
    }

    setRegistering(prev => new Set(prev).add(courseId));

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'You have been registered for this course.' });
      await fetchEnrollments(); // Refresh enrollments
    } catch (error) {
      console.error('Error registering for course:', error);
      setMessage({ type: 'error', text: 'Failed to register for course' });
    } finally {
      setRegistering(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const formatWhatsIncluded = (whatsIncluded: any) => {
    if (!whatsIncluded) return null;
    
    try {
      if (typeof whatsIncluded === 'string') {
        const parsed = JSON.parse(whatsIncluded);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } else if (Array.isArray(whatsIncluded)) {
        return whatsIncluded;
      }
    } catch (error) {
      console.error('Error parsing whats_included:', error);
    }
    
    return null;
  };

  const formatPrice = (price: number, currency: string) => {
    if (!price) return 'Contact for pricing';
    return `${currency || 'USD'} $${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFilteredStats = () => {
    const totalCourses = courses.length;
    const regulationCourses = courses.filter(course => course.type === 'Regulation').length;
    const applicationCourses = courses.filter(course => course.type === 'Application').length;
    
    return {
      total: totalCourses,
      regulation: regulationCourses,
      application: applicationCourses,
      graduates: totalGraduates
    };
  };

  const stats = getFilteredStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Training Courses</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advance your career with our comprehensive training programs designed for professionals in various industries.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setSelectedFilter('Regulation')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedFilter === 'regulation'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Regulation
              </button>
              <button
                onClick={() => setSelectedFilter('application')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedFilter === 'application'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Application
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Filter className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.regulation}</div>
            <div className="text-sm text-gray-600">Regulation</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.application}</div>
            <div className="text-sm text-gray-600">Application</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <GraduationCap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.graduates}</div>
            <div className="text-sm text-gray-600">Graduates</div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const isFlipped = flippedCards.has(course.id);
            const details = courseDetails[course.id];
            const isLoadingDetails = loadingDetails.has(course.id);
            const isRegistering = registering.has(course.id);
            const enrolled = isEnrolled(course.id);

            return (
              <div key={course.id} className="relative h-96 perspective-1000">
                <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}>
                  {/* Front of Card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 h-full flex flex-col">
                      {/* Course Type Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.type === 'Regulation' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {course.type === 'Regulation' ? 'Regulation' : 'Application'}
                        </span>
                        {enrolled && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Award className="w-3 h-3 mr-1" />
                            Enrolled
                          </span>
                        )}
                      </div>

                      {/* Course Title */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {course.title}
                      </h3>

                      {/* Course Info */}
                      <div className="space-y-2 mb-6">
                        {course.duration && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            {course.duration}
                          </div>
                        )}
                        {course.max_students && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="w-4 h-4 mr-2" />
                            Max {course.max_students} students
                          </div>
                        )}
                        {course.start_date && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(course.start_date)}
                          </div>
                        )}
                        {course.price && (
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {formatPrice(course.price, course.currency)}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleLearnMore(course.id)}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                          aria-label={`Learn more about ${course.title}`}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Learn More
                        </button>
                        <button
                          onClick={() => handleRegisterNow(course.id)}
                          disabled={enrolled || isRegistering}
                          className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center ${
                            enrolled
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          aria-label={enrolled ? 'Already registered' : `Register for ${course.title}`}
                        >
                          {isRegistering ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : enrolled ? (
                            'Enrolled'
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Register Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 h-full overflow-y-auto">
                      {isLoadingDetails ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                      ) : details ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">{details.title}</h3>
                          
                          {details.description && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                              <p className="text-sm text-gray-600">{details.description}</p>
                            </div>
                          )}

                          {details.level && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Level</h4>
                              <p className="text-sm text-gray-600">{details.level}</p>
                            </div>
                          )}

                          {details.age_requirement && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Age Requirement</h4>
                              <p className="text-sm text-gray-600">{details.age_requirement}</p>
                            </div>
                          )}

                          {details.experience_requirement && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Experience Required</h4>
                              <p className="text-sm text-gray-600">{details.experience_requirement}</p>
                            </div>
                          )}

                          {details.equipment_requirement && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Equipment Required</h4>
                              <p className="text-sm text-gray-600">{details.equipment_requirement}</p>
                            </div>
                          )}

                          {details.document_requirement && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Documents Required</h4>
                              <p className="text-sm text-gray-600">{details.document_requirement}</p>
                            </div>
                          )}

                          {details.suggested_preparation && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Suggested Preparation</h4>
                              <p className="text-sm text-gray-600">{details.suggested_preparation}</p>
                            </div>
                          )}

                          {details.price && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Price</h4>
                              <p className="text-sm text-gray-600">{formatPrice(details.price, details.currency)}</p>
                            </div>
                          )}

                          {details.duration && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Duration</h4>
                              <p className="text-sm text-gray-600">{details.duration}</p>
                            </div>
                          )}

                          {details.start_date && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Start Date</h4>
                              <p className="text-sm text-gray-600">{formatDate(details.start_date)}</p>
                            </div>
                          )}

                          {details.whats_included && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">What's Included</h4>
                              {(() => {
                                const included = formatWhatsIncluded(details.whats_included);
                                return included ? (
                                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                    {included.map((item: string, index: number) => (
                                      <li key={index}>{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-600">Information not available</p>
                                );
                              })()}
                            </div>
                          )}

                          <button
                            onClick={() => handleLearnMore(course.id)}
                            className="w-full mt-6 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            aria-label="Back to course summary"
                          >
                            Back to Summary
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Failed to load course details</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedFilter === 'all' ? 'No courses available' : `No ${selectedFilter} courses available`}
            </h3>
            <p className="text-gray-500">
              {selectedFilter === 'all' 
                ? 'Check back later for new training opportunities.' 
                : `Try selecting a different filter or check back later for new ${selectedFilter} courses.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Training;