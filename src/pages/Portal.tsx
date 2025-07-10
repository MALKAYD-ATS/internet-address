import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, User, Award, Settings, LogOut, Menu, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import EditProfile from '../components/EditProfile';

interface Course {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  duration: string;
  price: number;
  currency: string;
  is_active: boolean;
}

interface Certificate {
  id: string;
  course_id: string;
  certificate_url: string;
  issued_at: string;
  course_title?: string;
}

interface HeaderLogo {
  logo_url: string;
  alt_text: string;
}

const Portal: React.FC = () => {
  const { user, signOut } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [headerLogo, setHeaderLogo] = useState<HeaderLogo | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchCertificates();
    fetchHeaderLogo();
  }, []);

  const fetchHeaderLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('header_logo')
        .select('logo_url, alt_text')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching header logo:', error);
        return;
      }

      setHeaderLogo(data);
    } catch (error) {
      console.error('Error fetching header logo:', error);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_certificates')
        .select(`
          *,
          courses_ats!inner(title)
        `)
        .eq('student_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      
      const certificatesWithTitles = data?.map(cert => ({
        ...cert,
        course_title: cert.courses_ats?.title || 'Unknown Course'
      })) || [];
      
      setCertificates(certificatesWithTitles);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Welcome back, {user?.user_metadata?.full_name || 'Student'}!
        </h1>
        <p className="text-xs sm:text-sm md:text-base opacity-90">
          Continue your learning journey with our comprehensive training programs.
        </p>
      </div>

      {/* Available Courses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Courses</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : courses.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
            }}
            className="pb-12"
          >
            {courses.map((course) => (
              <SwiperSlide key={course.id}>
                <div className="bg-white rounded-lg shadow-md p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.type === 'Regulatory' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {course.type}
                    </span>
                    {course.level && (
                      <span className="text-sm text-gray-500">{course.level}</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {course.title}
                  </h3>
                  
                  {course.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    {course.duration && (
                      <span>Duration: {course.duration}</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => window.location.href = `/portal/course/${course.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Start Course
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {user?.user_metadata?.full_name || 'Student'}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <p className="text-gray-900">{user?.user_metadata?.full_name || 'Not provided'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <p className="text-gray-900">{user?.user_metadata?.phone_number || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => setShowEditProfile(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Certificates</h2>
      
      {certificates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-8 w-8 text-yellow-500" />
                <span className="text-sm text-gray-500">
                  {new Date(certificate.issued_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Certificate of Completion
              </h3>
              
              <p className="text-gray-600 mb-4">
                {certificate.course_title}
              </p>
              
              {certificate.certificate_url && (
                <a
                  href={certificate.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Download Certificate
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No certificates earned yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Complete courses to earn your certificates!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              {headerLogo?.logo_url ? (
                <img 
                  src={headerLogo.logo_url} 
                  alt={headerLogo.alt_text || 'ATS Logo'} 
                  className="h-8 w-auto"
                />
              ) : (
                <img 
                  src="/ATS.png" 
                  alt="ATS Logo" 
                  className="h-8 w-auto"
                />
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'certificates'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Certificates
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-gray-600">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:block">Sign Out</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab('certificates');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'certificates'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Certificates
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'certificates' && renderCertificates()}
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onUpdate={() => {
            // Refresh user data or handle update
            setShowEditProfile(false);
          }}
        />
      )}
    </div>
  );
};

export default Portal;