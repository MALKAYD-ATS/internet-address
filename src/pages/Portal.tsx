import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase, verifySession, logout } from '../lib/supabase';

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
  UserPlus,
  Eye
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

interface StudentCertificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_url: string | null;
  issued_at: string;
  course?: {
    title: string;
    type: string;
  };
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

  // Certificates state
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [errorCertificates, setErrorCertificates] = useState<string | null>(null);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: '',
    password: '',
    phone_number: '',
    profile_image: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Verify session before making authenticated requests
        const session = await verifySession();
        if (!session) {
          console.log('No valid session, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        setLoading(true);
        setError(null);

        console.log('Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          if (error.code === 'PGRST116') {
            // No rows returned - profile doesn't exist
            setError('Profile data not found.');
          } else if (error.message.includes('JWT')) {
            // JWT/Auth related error
            console.log('JWT error, redirecting to login');
            await logout();
            return;
          } else {
            setError('Failed to load profile data.');
          }
        } else {
          console.log('Profile fetched successfully');
          setProfile(data);
          // Initialize profile form with current data
          setProfileForm({
            email: user.email || '',
            password: '',
            phone_number: data.phone_number || '',
            profile_image: ''
          });
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        
        // If it's an auth-related error, redirect to login
        if (err instanceof Error && err.message.includes('JWT')) {
          await logout();
        }
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
      if (!user) return;
      
      try {
        // Verify session before making requests
        const session = await verifySession();
        if (!session) {
          console.log('No valid session for courses fetch, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        setLoadingCourses(true);
        setErrorCourses(null);

        // Query only active courses that are available online
        console.log('Fetching courses...');
        const { data, error } = await supabase
          .from('courses_ats')
          .select('*')
          .eq('is_active', true)
          .eq('is_online', true)  // Only show online courses in Student Portal
          .order('title', { ascending: true });

        if (error) {
          console.error('Error fetching courses:', error);
          
          if (error.message.includes('JWT')) {
            await logout();
            return;
          }
          
          setErrorCourses('Failed to load courses.');
        } else {
          setCourses(data || []);
          console.log('Courses fetched successfully:', data?.length || 0);
        }
      } catch (err) {
        setErrorCourses('An unexpected error occurred while loading courses.');
        console.error('Courses fetch error:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user, navigate]);

  // Fetch user enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;

      try {
        const session = await verifySession();
        if (!session) {
          navigate('/login', { replace: true });
          return;
        }
        
        console.log('Fetching enrollments...');
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id);

        if (error) {
          console.error('Error fetching enrollments:', error);
          
          if (error.message.includes('JWT')) {
            await logout();
            return;
          }
        } else {
          setEnrollments(data || []);
        }
      } catch (err) {
        console.error('Enrollments fetch error:', err);
      }
    };

    fetchEnrollments();
  }, [user, navigate]);

  // Fetch user certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return;

      try {
        const session = await verifySession();
        if (!session) {
          navigate('/login', { replace: true });
          return;
        }
        
        console.log('Fetching certificates...');
        setLoadingCertificates(true);
        setErrorCertificates(null);

        const { data, error } = await supabase
          .from('student_certificates')
          .select(`
            *,
            course:courses_ats(title, type)
          `)
          .eq('student_id', user.id)
          .order('issued_at', { ascending: false });

        if (error) {
          console.error('Error fetching certificates:', error);
          
          if (error.message.includes('JWT')) {
            await logout();
            return;
          }
          setErrorCertificates('Failed to load certificates');
        } else {
          setCertificates(data || []);
        }
      } catch (err) {
        console.error('Certificates fetch error:', err);
        setErrorCertificates('An unexpected error occurred');
      } finally {
        setLoadingCertificates(false);
      }
    };

    fetchCertificates();
  }, [user, navigate]);

  // Check if user is enrolled in a course
  const isEnrolledInCourse = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId.toString());
  };

  // Handle course enrollment
  const handleEnrollment = async (course: Course) => {
    // Check if user is authenticated
    const session = await verifySession();
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    
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
      console.log('Enrolling in course:', course.id);
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
        if (error.message.includes('JWT')) {
          await logout();
          return;
        }
        
        console.error('Enrollment error:', error);
        setEnrollmentMessage({
          type: 'error',
          text: 'Failed to enroll. Please try again.'
        });
      } else {
        // Add the new enrollment to local state
        console.log('Enrollment successful');
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

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileMessage(null);
    // Reset form to current profile data
    if (profile && user) {
      setProfileForm({
        email: user.email || '',
        password: '',
        phone_number: profile.phone_number || '',
        profile_image: ''
      });
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    const session = await verifySession();
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    
    console.log('Saving profile changes...');
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      // Update auth user email and password if changed
      const authUpdates: any = {};
      if (profileForm.email !== user.email) {
        authUpdates.email = profileForm.email;
      }
      if (profileForm.password.trim()) {
        authUpdates.password = profileForm.password;
      }

      if (Object.keys(authUpdates).length > 0) {
        console.log('Updating auth user...');
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) {
          if (authError.message.includes('JWT')) {
            await logout();
            return;
          }
          
          if (authError.message.includes('New password should be different from the old password')) {
            setProfileMessage({
              type: 'error',
              text: 'New password must be different from your current password.'
            });
            return;
          }
          throw authError;
        }
      }

      // Update students table - only update fields that have changed
      const studentUpdates: any = {};
      
      // Only update phone_number if it has changed
      if (profileForm.phone_number !== (profile.phone_number || '')) {
        studentUpdates.phone_number = profileForm.phone_number;
      }

      let updatedProfile = profile;
      
      // Only make database call if there are changes to student fields
      if (Object.keys(studentUpdates).length > 0) {
        // Use targeted update to avoid RLS policy violations
        console.log('Updating student profile...');
        const { data, error: profileError } = await supabase
          .from('students')
          .update(studentUpdates)
          .eq('id', user.id)
          .select()
          .single();

        if (profileError) {
          if (profileError.message.includes('JWT')) {
            await logout();
            return;
          }
          throw profileError;
        }
        
        // Update successful, use returned data
        updatedProfile = data;
      } else {
        // No student fields changed, keep current profile
        updatedProfile = profile;
      }

      // Update local state
      setProfile(updatedProfile);
      console.log('Profile updated successfully');
      setIsEditingProfile(false);
      setProfileMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });

      // Clear password field
      setProfileForm(prev => ({
        ...prev,
        password: ''
      }));

    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      if (error.message?.includes('JWT')) {
        await logout();
        return;
      }
      
      // Handle specific RLS error
      if (error.message?.includes('row-level security policy')) {
        setProfileMessage({
          type: 'error',
          text: 'Permission denied. Please contact support if this persists.'
        });
        return;
      }
      
      setProfileMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Clear profile message after 5 seconds
  useEffect(() => {
    if (profileMessage) {
      const timer = setTimeout(() => {
        setProfileMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [profileMessage]);

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      await logout();
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

  // Add session check on component mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await verifySession();
      if (!session && !loading) {
        navigate('/login', { replace: true });
      }
    };

    checkSession();
  }, [navigate, loading]);
      year: 'numeric',
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

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
      case 'regulation': return 'bg-blue-100 text-blue-800';
      case 'application': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatCertificateDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadCertificate = (certificateUrl: string, courseTitle: string) => {
    if (!certificateUrl) {
      alert('Certificate file not available');
      return;
    }

    // Open certificate in new tab for download
    window.open(certificateUrl, '_blank');
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
                <p className="text-gray-600 text-sm sm:text-base">Welcome back!</p>
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

      {/* Profile Update Message */}
      {profileMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg border ${
            profileMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {profileMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span className="font-medium">{profileMessage.text}</span>
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
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
                    <p className="text-gray-600 text-sm">Student ID: {profile.id.slice(0, 8)}</p>
                  </div>

                  {isEditingProfile ? (
                    /* Edit Profile Form */
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h4>
                      
                      {/* Student ID (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student ID (Read-only)
                        </label>
                        <input
                          type="text"
                          value={profile.id.slice(0, 8)}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Enter your email"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password (leave blank to keep current)
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={profileForm.password}
                          onChange={handleProfileInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Enter new password"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={profileForm.phone_number}
                          onChange={handleProfileInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                          onClick={handleSaveProfile}
                          disabled={profileLoading}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm ${
                            profileLoading
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {profileLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={profileLoading}
                          className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Profile */
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{profile.phone_number || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">Member Since</p>
                          <p className="text-sm text-gray-600">{formatDate(profile.created_at)}</p>
                        </div>
                      </div>

                      <button 
                        onClick={handleEditProfile}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    </div>
                  )}
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
              <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{certificates.length}</h3>
                <p className="text-gray-600">Certificates</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
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
              
              {loadingCertificates ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading certificates...</p>
                </div>
              ) : errorCertificates ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Certificates</h3>
                  <p className="text-gray-600">{errorCertificates}</p>
                </div>
              ) : certificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Complete courses to earn your professional drone certifications.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-center">
                      <Award className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">Certificates will appear here once earned</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">
                      Complete all course modules and pass the final exam to receive your certificate.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {certificate.course?.title || 'Course Certificate'}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </span>
                            {certificate.course?.type && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {certificate.course.type}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Issued: {formatCertificateDate(certificate.issued_at)}
                          </p>
                        </div>
                        <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Certificate ID</p>
                          <p className="text-sm font-mono text-gray-900">{certificate.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        
                        <button
                          onClick={() => handleDownloadCertificate(
                            certificate.certificate_url || '', 
                            certificate.course?.title || 'Certificate'
                          )}
                          disabled={!certificate.certificate_url}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                            certificate.certificate_url
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {certificate.certificate_url ? 'Download Certificate' : 'Certificate Unavailable'}
                        </button>
                        
                        {certificate.certificate_url && (
                          <button
                            onClick={() => window.open(certificate.certificate_url!, '_blank')}
                            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

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