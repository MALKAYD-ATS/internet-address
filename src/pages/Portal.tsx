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
  url: string | null;
  issued_at: string;
  course?: {
    title: string;
    type: string;
  };
}

const Portal: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [headerLogos, setHeaderLogos] = useState<HeaderLogo[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    full_name: '',
    phone_number: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setProfileLoading(true);
        setError(null);

        // Fetch student profile
        const { data: profileData, error: profileError } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch enrollments
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id);

        if (enrollmentError) throw enrollmentError;
        setEnrollments(enrollmentData || []);

        // Fetch courses
        const { data: courseData, error: courseError } = await supabase
          .from('courses_ats')
          .select('*')
          .eq('is_active', true);

        if (courseError) throw courseError;
        setCourses(courseData || []);

        // Fetch certificates
        const { data: certificateData, error: certificateError } = await supabase
          .from('certificates')
          .select(`
            *,
            course:courses_ats(title, type)
          `)
          .eq('student_id', user.id);

        if (certificateError) throw certificateError;
        setCertificates(certificateData || []);

        // Fetch header logos
        const { data: logoData, error: logoError } = await supabase
          .from('header_logo')
          .select('*')
          .eq('is_active', true)
          .order('order_index');

        if (logoError) throw logoError;
        setHeaderLogos(logoData || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Initialize editing profile when profile data is loaded
  useEffect(() => {
    if (profile) {
      setEditingProfile({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || ''
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    // Reset to original values
    if (profile) {
      setEditingProfile({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    // Verify session before updating
    const session = await verifySession();
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);

      console.log('Updating profile for user ID:', user.id);
      console.log('Current profile data:', profile);
      console.log('New profile data:', editingProfile);

      // Update student profile
      const { error: profileError } = await supabase
        .from('students')
        .update({
          full_name: editingProfile.full_name.trim(),
          phone_number: editingProfile.phone_number.trim() || null
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        if (profileError.message.includes('JWT')) {
          await logout();
          return;
        }
        throw profileError;
      }

      console.log('Profile updated successfully in database');

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: editingProfile.full_name.trim(),
        phone_number: editingProfile.phone_number.trim() || ''
      } : null);

      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(course => 
    enrollments.some(enrollment => enrollment.course_id === course.id.toString())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              {headerLogos.length > 0 && (
                <img
                  src={headerLogos[0].logo_url}
                  alt={headerLogos[0].alt_text || 'Logo'}
                  className="h-8 w-auto"
                />
              )}

              <a
  href="/"
  className="hidden sm:inline-flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
>
  <ChevronLeft className="w-4 h-4" />
  <span>Back to Website</span>
</a>

            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {profile.full_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: User },
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'profile', label: 'Profile', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {profile.full_name}!
              </h1>
              <p className="text-gray-600">
                Member since {formatDate(profile.created_at)}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.slice(0, 3).map((enrollment) => {
                      const course = courses.find(c => c.id.toString() === enrollment.course_id);
                      return (
                        <div key={enrollment.id} className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Enrolled in {course?.title || 'Unknown Course'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(enrollment.enrolled_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              </div>
              <div className="p-6">
                {enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            course.type === 'regulation' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {course.type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Duration: {course.duration}
                          </span>
                          <button
                            onClick={() => navigate(`/student/courses/${course.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No courses enrolled yet</p>
                    <button
                      onClick={() => navigate('/training')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Certificates</h2>
              </div>
              <div className="p-6">
                {certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {certificate.course?.title || 'Certificate'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {certificate.course?.type}
                            </p>
                          </div>
                          <Award className="w-6 h-6 text-yellow-500" />
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          Issued: {formatDate(certificate.issued_at)}
                        </p>
                        {certificate.url && (
                          <a
                            href={certificate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Certificate</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No certificates earned yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Complete courses to earn certificates
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        disabled={updateLoading}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={updateLoading || !editingProfile.full_name.trim()}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updateLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>{updateLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {/* Success Message */}
                {updateSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Profile updated successfully!</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {updateError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-800">{updateError}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Student ID - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">
                        {profile.id}
                      </span>
                      <span className="text-xs text-gray-500">(Read-only)</span>
                    </div>
                  </div>

                  {/* Full Name - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="full_name"
                          value={editingProfile.full_name}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{profile.full_name}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Email - Read Only (managed by Supabase Auth) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user?.email}</span>
                      <span className="text-xs text-gray-500">(Managed by account settings)</span>
                    </div>
                  </div>

                  {/* Phone Number - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone_number"
                          value={editingProfile.phone_number}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your phone number (optional)"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {profile.phone_number || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Member Since - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portal;