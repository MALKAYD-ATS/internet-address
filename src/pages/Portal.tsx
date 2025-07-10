import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, BookOpen, Award, Clock, Edit2, Save, X, CheckCircle, ArrowRight } from 'lucide-react';

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

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  courses_ats: Course;
}

interface StudentProfile {
  id: string;
  full_name: string;
  phone_number: string | null;
}

export default function Portal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    full_name: '',
    phone_number: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    if (!user) return;

    try {
      // Fetch student profile
      const { data: profileData, error: profileError } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
        setEditProfileData({
          full_name: profileData.full_name,
          phone_number: profileData.phone_number || ''
        });
      }

      // Fetch enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses_ats (*)
        `)
        .eq('student_id', user.id);

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
      } else {
        setEnrollments(enrollmentData || []);
      }

      // Fetch available courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('is_active', true);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      } else {
        setAvailableCourses(coursesData || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (courseId: string) => {
    if (!user) return;

    try {
      // Check if already enrolled
      const isAlreadyEnrolled = enrollments.some(
        enrollment => enrollment.course_id === courseId
      );

      if (isAlreadyEnrolled) {
        setEnrollmentMessage('You are already enrolled in this course.');
        return;
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId
        });

      if (error) {
        console.error('Error enrolling in course:', error);
        setEnrollmentMessage('Failed to enroll in course. Please try again.');
      } else {
        setEnrollmentMessage('Successfully enrolled in course!');
        // Refresh enrollments
        fetchStudentData();
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setEnrollmentMessage('An error occurred. Please try again.');
    }
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
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (profile) {
      setEditProfileData({
        full_name: profile.full_name,
        phone_number: profile.phone_number || ''
      });
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setIsUpdatingProfile(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          full_name: editProfileData.full_name,
          phone_number: editProfileData.phone_number
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        // Show error message but don't prevent UI update
      } else {
        setProfile(data);
      }
      
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setIsEditingProfile(false);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAccessCourse = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Enrollment Message */}
        {enrollmentMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            enrollmentMessage.includes('Successfully') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {enrollmentMessage.includes('Successfully') ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <X className="h-5 w-5 mr-2" />
              )}
              {enrollmentMessage}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={editProfileData.full_name}
                      onChange={handleProfileInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={editProfileData.phone_number}
                      onChange={handleProfileInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isUpdatingProfile}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdatingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdatingProfile}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 flex items-center justify-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  {profile && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium">{profile.full_name}</p>
                      </div>
                      {profile.phone_number && (
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{profile.phone_number}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                My Courses
              </h2>
              
              {enrollments.length === 0 ? (
                <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {enrollment.courses_ats.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {enrollment.courses_ats.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {enrollment.courses_ats.type}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {enrollment.courses_ats.duration}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">Enrolled</p>
                            <p className="text-xs text-gray-400">
                              {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAccessCourse(enrollment.course_id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                          >
                            Access Course
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Available Courses
              </h2>
              
              <div className="space-y-4">
                {availableCourses
                  .filter(course => !enrollments.some(enrollment => enrollment.course_id === course.id))
                  .map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {course.type}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {course.duration}
                            </span>
                            {course.level && (
                              <span className="text-sm text-gray-500">
                                Level: {course.level}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${course.price} {course.currency}
                          </p>
                          <button
                            onClick={() => handleEnrollment(course.id)}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {availableCourses.filter(course => !enrollments.some(enrollment => enrollment.course_id === course.id)).length === 0 && (
                <p className="text-gray-600">No new courses available at this time.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}