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
          .from('student_certificates')
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
                            onClick={() => navigate(`/course/${course.id}`)}
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
                        {certificate.certificate_url && (
                          <a
                            href={certificate.certificate_url}
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
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{profile.full_name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                  </div>

                  {profile.phone_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{profile.phone_number}</span>
                      </div>
                    </div>
                  )}

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