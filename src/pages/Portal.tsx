import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EditProfile from '../components/EditProfile';

interface HeaderLogo {
  id: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
  is_active: boolean;
}

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  BookOpen, 
  Award, 
  FileText, 
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
  Clock,
  GraduationCap,
  Bell,
  Users,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  UserPlus
} from 'lucide-react';

interface StudentProfile {
  id: string;
  full_name: string;
  phone_number: string;
  created_at: string;
}

interface Course {
  id: number;
  created_at: string;
  title: string | null;
  type: string | null;
  description: string | null;
  level: string | null;
  age_requirement: number | null;
  duration: string | null;
  price: number | null;
  max_students: number | null;
  experience_requirement: string | null;
  equipment_requirement: string | null;
  document_requirement: string | null;
  suggested_preparation: string | null;
  currency: string | null;
  whats_included: any;
  is_active: boolean | null;
  is_online: boolean | null;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
}

const Portal: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerLogo, setHeaderLogo] = useState<HeaderLogo | null>(null);

  // Course state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState<string | null>(null);

  // Enrollment state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Fetch header logo
  useEffect(() => {
    const fetchHeaderLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('header_logo')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        if (!error && data) {
          setHeaderLogo(data);
        }
      } catch (err) {
        console.error('Header logo fetch error:', err);
      }
    };

    fetchHeaderLogo();
  }, []);

  // Fetch student profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned - profile doesn't exist
            setError('Profile data not found.');
          } else {
            setError('Failed to load profile data.');
          }
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch courses from Supabase
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setErrorCourses(null);

        // Query only active courses that are available online
        const { data, error } = await supabase
          .from('courses_ats')
          .select('*')
          .eq('is_active', true)
          .eq('is_online', true)  // Only show online courses in Student Portal
          .order('title', { ascending: true });

        if (error) {
          setErrorCourses('Failed to load courses.');
          console.error('Error fetching courses:', error);
        } else {
          setCourses(data || []);
        }
      } catch (err) {
        setErrorCourses('An unexpected error occurred while loading courses.');
        console.error('Courses fetch error:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch user enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id);

        if (error) {
          console.error('Error fetching enrollments:', error);
        } else {
          setEnrollments(data || []);
        }
      } catch (err) {
        console.error('Enrollments fetch error:', err);
      }
    };

    fetchEnrollments();
  }, [user]);

  // Fetch user certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('student_certificates')
          .select('*')
          .eq('student_id', user.id)
          .order('issued_at', { ascending: false });

        if (error) {
          console.error('Error fetching certificates:', error);
        } else {
          setCertificates(data || []);
        }
      } catch (err) {
        console.error('Certificates fetch error:', err);
      }
    };

    fetchCertificates();
  }, [user]);

  // Check if user is enrolled in a course
  const isEnrolledInCourse = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId.toString());
  };

  // Handle course enrollment
  const handleEnrollment = async (course: Course) => {
    // Check if user is authenticated
    if (!user) {
      setEnrollmentMessage({
        type: 'error',
        text: 'You must be logged in to enroll.'
      });
      return;
    }

    // Check if already enrolled
    if (isEnrolledInCourse(course.id)) {
      setEnrollmentMessage({
        type: 'error',
        text: 'You are already enrolled in this course.'
      });
      return;
    }

    setEnrollingCourseId(course.id);
    setEnrollmentMessage(null);

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([
          {
            student_id: user.id,
            course_id: course.id.toString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Enrollment error:', error);
        setEnrollmentMessage({
          type: 'error',
          text: 'Failed to enroll. Please try again.'
        });
      } else {
        // Add the new enrollment to local state
        setEnrollments(prev => [...prev, data]);
        setEnrollmentMessage({
          type: 'success',
          text: 'You have successfully enrolled in this course!'
        });
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setEnrollmentMessage({
        type: 'error',
        text: 'Failed to enroll. Please try again.'
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Handle course access
  const handleAccessCourse = (courseId: number) => {
    navigate(`/student/courses/${courseId}`);
  };

  // Clear enrollment message after 5 seconds
  useEffect(() => {
    if (enrollmentMessage) {
      const timer = setTimeout(() => {
        setEnrollmentMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [enrollmentMessage]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: string | null) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string | null) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    switch (type.toLowerCase()) {
      case 'regulatory': return 'bg-blue-100 text-blue-800';
      case 'application': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img
                src={headerLogo?.logo_url || "/ATS.png"}
                alt={headerLogo?.alt_text || "Aboriginal Training Services"}
                className="h-12 w-auto mr-4"
                onError={(e) => {
                  e.currentTarget.src = '/ATS.png';
                  e.currentTarget.alt = 'Aboriginal Training Services';
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Welcome back!</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Enrollment Message */}
      {enrollmentMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg border ${
            enrollmentMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {enrollmentMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span className="font-medium">{enrollmentMessage.text}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-2 text-blue-600" />
                My Profile
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium mb-2">Profile Error</p>
                  <p className="text-gray-600 text-sm">{error}</p>
                </div>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
                    <p className="text-gray-600 text-sm">Student ID: {profile.id.slice(0, 8)}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{profile.phone_number || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">{formatDate(profile.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center">
                    <Settings className="h-4 w-4 mr-2" />
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">{enrollments.length}</h3>
                <p className="text-gray-600">Enrolled Courses</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                <p className="text-gray-600">Certificates</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                <p className="text-gray-600">Hours Completed</p>
              </div>
            </div>

            {/* Available Courses Section with Carousel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
                Available Courses
              </h2>

              {loadingCourses ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading courses...</p>
                </div>
              ) : errorCourses ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium mb-2">Error Loading Courses</p>
                  <p className="text-gray-600 text-sm">{errorCourses}</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Available</h3>
                  <p className="text-gray-600">No courses found in the database.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Custom Navigation Buttons */}
                  <div className="swiper-button-prev-custom absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="swiper-button-next-custom absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </div>

                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1}
                    navigation={{
                      prevEl: '.swiper-button-prev-custom',
                      nextEl: '.swiper-button-next-custom',
                    }}
                    pagination={{
                      clickable: true,
                      bulletClass: 'swiper-pagination-bullet !bg-blue-600',
                      bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-700',
                    }}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    breakpoints={{
                      768: {
                        slidesPerView: 2,
                      },
                    }}
                    className="course-carousel px-12"
                  >
                    {courses.map((course) => {
                      const isEnrolled = isEnrolledInCourse(course.id);
                      const isEnrolling = enrollingCourseId === course.id;

                      return (
                        <SwiperSlide key={course.id}>
                          <div className="course-card min-h-[600px] min-w-[350px] border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 bg-white flex flex-col">
                            {/* Course Header */}
                            <div className="mb-4 flex-shrink-0">
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(course.type)}`}>
                                  {course.type || 'General'}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                                  {course.level || 'All Levels'}
                                </span>
                                {course.age_requirement && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Age {course.age_requirement}+
                                  </span>
                                )}
                                {isEnrolled && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Enrolled
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 min-h-[3rem] line-clamp-2">
                                {course.title || 'Untitled Course'}
                              </h3>
                            </div>

                            {/* Course Description */}
                            <div className="mb-4 flex-grow">
                              <p className="text-gray-600 text-sm leading-relaxed min-h-[4.5rem]">
                                {course.description 
                                  ? truncateText(course.description, 150)
                                  : 'No description available.'
                                }
                              </p>
                            </div>

                            {/* Course Details */}
                            <div className="space-y-2 mb-4 flex-shrink-0">
                              {course.duration && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span>Duration: {course.duration}</span>
                                </div>
                              )}
                              {course.max_students && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span>Capacity: {course.max_students} students</span>
                                </div>
                              )}
                              {course.price && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="font-medium text-green-600">
                                    {course.currency || 'USD'} ${course.price.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {course.experience_requirement && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span>Experience: {truncateText(course.experience_requirement, 25)}</span>
                                </div>
                              )}
                            </div>

                            {/* Prerequisites */}
                            {course.suggested_preparation && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex-shrink-0">
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Suggested Preparation:</h4>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {truncateText(course.suggested_preparation, 100)}
                                </p>
                              </div>
                            )}

                            {/* Enroll Button */}
                            <div className="mt-auto flex-shrink-0">
                              <button 
                                onClick={() => handleEnrollment(course)}
                                disabled={isEnrolled || isEnrolling}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                                  isEnrolled 
                                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                    : isEnrolling
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                                }`}
                              >
                                {isEnrolling ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Enrolling...
                                  </>
                                ) : isEnrolled ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Enrolled
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Enroll Now
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              )}
            </div>

            {/* Enrolled Courses Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
                My Enrolled Courses
              </h2>
              
              {enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Enrolled</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't enrolled in any courses yet. Browse the available courses above to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.map((enrollment) => {
                    const course = courses.find(c => c.id.toString() === enrollment.course_id);
                    if (!course) return null;

                    return (
                      <div key={enrollment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex-1">
                            {course.title || 'Untitled Course'}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enrolled
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">
                          {course.description 
                            ? truncateText(course.description, 120)
                            : 'No description available.'
                          }
                        </p>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Enrolled: {formatDate(enrollment.enrolled_at)}</span>
                          </div>
                          {course.duration && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Duration: {course.duration}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button 
                            onClick={() => handleAccessCourse(course.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Access Course
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Certificates Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-2 text-blue-600" />
                My Certificates
              </h2>
              
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Complete courses to earn your professional drone certifications.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.course_title}</h3>
                          <p className="text-gray-600 text-sm mb-2">Issued to: {cert.student_name}</p>
                          <p className="text-gray-600 text-sm">
                            Date: {new Date(cert.issued_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Active
                          </span>
                          <a
                            href={cert.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Certificate
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Bell className="h-6 w-6 mr-2 text-blue-600" />
                Notifications
              </h2>
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No New Notifications</h3>
                <p className="text-gray-600">
                  Course updates and important announcements will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          onUpdate={() => {
            // Refresh profile data
            const fetchProfile = async () => {
              if (!user) return;
              try {
                const { data, error } = await supabase
                  .from('students')
                  .select('*')
                  .eq('id', user.id)
                  .single();
                if (!error && data) {
                  setProfile(data);
                }
              } catch (err) {
                console.error('Profile refresh error:', err);
              }
            };
            fetchProfile();
          }}
        />
      )}

      {/* Custom Styles for Swiper */}
      <style jsx>{`
        .course-carousel .swiper-pagination {
          position: relative !important;
          margin-top: 2rem !important;
        }
        
        .course-carousel .swiper-pagination-bullet {
          width: 12px !important;
          height: 12px !important;
          margin: 0 6px !important;
        }
        
        .course-card {
          height: 600px;
          display: flex;
          flex-direction: column;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .course-card {
            min-width: 300px;
            height: 550px;
          }
        }
      `}</style>
    </div>
  );
};

export default Portal;