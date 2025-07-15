import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Award, 
  Calendar, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Video,
  Lock
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Mock student data
  const studentData = {
    name: "John Smith",
    email: "john.smith@email.com",
    studentId: "ATS-2024-001",
    enrollmentDate: "January 15, 2024",
    totalCourses: 3,
    completedCourses: 1,
    certificates: 1
  };

  const enrolledCourses = [
    {
      id: 1,
      title: "RPAS Basic Certification",
      status: "completed",
      progress: 100,
      enrollDate: "January 15, 2024",
      completionDate: "January 17, 2024",
      instructor: "Mike Johnson",
      grade: "A+",
      certificateAvailable: true
    },
    {
      id: 2,
      title: "RPAS Advanced Certification",
      status: "in-progress",
      progress: 65,
      enrollDate: "February 1, 2024",
      nextSession: "March 20, 2024",
      instructor: "Sarah Wilson",
      grade: null,
      certificateAvailable: false
    },
    {
      id: 3,
      title: "Commercial Drone Operations",
      status: "enrolled",
      progress: 0,
      enrollDate: "February 15, 2024",
      nextSession: "April 5, 2024",
      instructor: "David Chen",
      grade: null,
      certificateAvailable: false
    }
  ];

  const certificates = [
    {
      id: 1,
      title: "RPAS Basic Certification",
      issueDate: "January 17, 2024",
      expiryDate: "January 17, 2026",
      certificateNumber: "ATS-BASIC-2024-001",
      status: "active"
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      course: "RPAS Advanced Certification",
      date: "March 20, 2024",
      time: "9:00 AM - 5:00 PM",
      location: "Edmonton Training Center",
      type: "Practical Training"
    },
    {
      id: 2,
      course: "Commercial RPAS Operations",
      date: "April 5, 2024",
      time: "9:00 AM - 12:00 PM",
      location: "Edmonton Training Center",
      type: "Theory Session"
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real implementation, this would authenticate with backend
    if (loginData.email && loginData.password) {
      setIsLoggedIn(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'enrolled': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5" />;
      case 'in-progress': return <Clock className="h-4 sm:h-5 w-4 sm:w-5" />;
      case 'enrolled': return <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5" />;
      default: return <BookOpen className="h-4 sm:h-5 w-4 sm:w-5" />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <Lock className="h-12 sm:h-16 w-12 sm:w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Student Portal Login</h1>
              <p className="text-gray-600 text-sm sm:text-base">Access your courses, certificates, and learning progress</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={loginData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={loginData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 sm:py-3 px-4 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base"
              >
                Sign In
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/contact" className="text-blue-700 hover:text-blue-800 font-medium">
                  Contact us to enroll
                </a>
              </p>
            </div>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Demo Access</h3>
              <p className="text-blue-800 text-xs sm:text-sm mb-2 sm:mb-3">
                For demonstration purposes, enter any email and password to access the student dashboard.
              </p>
              <p className="text-blue-700 text-xs">
                In production, this will integrate with secure authentication and user management systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {studentData.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">Student ID: {studentData.studentId}</p>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <BookOpen className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{studentData.totalCourses}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Total Courses</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 sm:h-8 w-6 sm:w-8 text-green-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{studentData.completedCourses}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <Award className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{studentData.certificates}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Certificates</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Member Since</p>
                <p className="text-gray-600 text-xs sm:text-sm">{studentData.enrollmentDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Enrolled Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Courses</h2>
              
              <div className="space-y-4 sm:space-y-6">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-gray-600 text-sm">Instructor: {course.instructor}</p>
                      </div>
                      <div className={`flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(course.status)}`}>
                        {getStatusIcon(course.status)}
                        <span className="ml-1 sm:ml-2 capitalize">{course.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3 sm:mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <div>
                        <span className="font-medium">Enrolled:</span> {course.enrollDate}
                      </div>
                      {course.completionDate && (
                        <div>
                          <span className="font-medium">Completed:</span> {course.completionDate}
                        </div>
                      )}
                      {course.nextSession && (
                        <div>
                          <span className="font-medium">Next Session:</span> {course.nextSession}
                        </div>
                      )}
                      {course.grade && (
                        <div>
                          <span className="font-medium">Grade:</span> {course.grade}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {course.certificateAvailable && (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                          <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                          Download Certificate
                        </button>
                      )}
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                        <Video className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                        Course Materials
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Certificates</h2>
              
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{cert.title}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">Certificate #{cert.certificateNumber}</p>
                        <div className="mt-2 text-xs sm:text-sm text-gray-600">
                          <p>Issued: {cert.issueDate}</p>
                          <p>Expires: {cert.expiryDate}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-center">
                          Active
                        </span>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                          <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Upcoming Sessions</h3>
              
              <div className="space-y-3 sm:space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{session.course}</h4>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <Calendar className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                        {session.date}
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                        {session.time}
                      </p>
                      <p className="text-blue-600 font-medium text-xs sm:text-sm">{session.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
              
              <div className="space-y-2 sm:space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center text-sm sm:text-base">
                  <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 mr-2 sm:mr-3" />
                  Browse New Courses
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center text-sm sm:text-base">
                  <FileText className="h-4 sm:h-5 w-4 sm:w-5 mr-2 sm:mr-3" />
                  View Transcripts
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center text-sm sm:text-base">
                  <User className="h-4 sm:h-5 w-4 sm:w-5 mr-2 sm:mr-3" />
                  Update Profile
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">Need Help?</h3>
              <p className="text-blue-800 text-xs sm:text-sm mb-3 sm:mb-4">
                Our support team is here to help with any questions about your courses or certificates.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Future Development Note */}
        <div className="mt-8 sm:mt-12 bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Enhanced Features Coming Soon</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            This student dashboard will be fully integrated with our learning management system, 
            providing real-time progress tracking, interactive course materials, and seamless certificate management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <Video className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Interactive Learning</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Video lessons, quizzes, and hands-on simulations</p>
            </div>
            <div className="text-center">
              <Award className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Digital Badges</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Earn and display skill-based digital credentials</p>
            </div>
            <div className="text-center">
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Community Features</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Connect with fellow students and instructors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;