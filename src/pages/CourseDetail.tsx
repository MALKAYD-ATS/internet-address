import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Clock, 
  Users, 
  Award, 
  DollarSign, 
  Calendar,
  FileText,
  Video,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Play,
  Lock,
  Star,
  Target,
  Lightbulb,
  FileIcon,
  ExternalLink,
  Folder,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order: number;
  created_at: string;
  lessons: ModuleLesson[];
}

interface ModuleLesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  order: number;
  type: string;
  created_at: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses_ats')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) {
          setError('Course not found.');
          console.error('Error fetching course:', courseError);
          return;
        }

        setCourse(courseData);

        // Check if user is enrolled in this course
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          console.error('Error fetching enrollment:', enrollmentError);
        } else if (enrollmentData) {
          setEnrollment(enrollmentData);
        }

        // If user is enrolled, fetch course materials
        if (enrollmentData) {
          await fetchCourseModules();
        }

      } catch (err) {
        setError('An unexpected error occurred.');
        console.error('Course detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCourseModules = async () => {
      try {
        setLoadingModules(true);

        // Fetch modules for this course
        const { data: modulesData, error: modulesError } = await supabase
          .from('ats_course_modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order', { ascending: true });

        if (modulesError) {
          console.error('Error fetching modules:', modulesError);
          return;
        }

        if (!modulesData || modulesData.length === 0) {
          setModules([]);
          return;
        }

        // Fetch lessons for each module
        const modulesWithLessons: CourseModule[] = [];
        
        for (const module of modulesData) {
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('ats_module_lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order', { ascending: true });

          if (lessonsError) {
            console.error('Error fetching lessons for module:', module.id, lessonsError);
            continue;
          }

          modulesWithLessons.push({
            ...module,
            lessons: lessonsData || []
          });
        }

        setModules(modulesWithLessons);
        
        // Auto-expand first module if it has lessons
        if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
          setExpandedModules(new Set([modulesWithLessons[0].id]));
        }

      } catch (err) {
        console.error('Error fetching course modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchCourseData();
  }, [courseId, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
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

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'pptx':
      case 'powerpoint':
        return <FileIcon className="h-5 w-5 text-orange-600" />;
      case 'video':
      case 'mp4':
        return <Video className="h-5 w-5 text-blue-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'PDF Document';
      case 'pptx':
      case 'powerpoint':
        return 'PowerPoint';
      case 'video':
      case 'mp4':
        return 'Video';
      default:
        return type.toUpperCase();
    }
  };

  const handleDownloadLesson = (lesson: ModuleLesson) => {
    if (lesson.content) {
      // Open in new tab for viewing/downloading
      window.open(lesson.content, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <img
                  src="/ATS.png"
                  alt="Aboriginal Training Services"
                  className="h-12 w-auto mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                  <p className="text-gray-600">Course Details</p>
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-8">{error || 'The requested course could not be found.'}</p>
            <Link
              to="/portal"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img
                src="/ATS.png"
                alt="Aboriginal Training Services"
                className="h-12 w-auto mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-gray-600">Course Details</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to="/portal"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(course.type)}`}>
                  {course.type || 'General'}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                  {course.level || 'All Levels'}
                </span>
                {course.age_requirement && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Age {course.age_requirement}+
                  </span>
                )}
                {enrollment && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Enrolled
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title || 'Untitled Course'}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {course.description || 'No description available for this course.'}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {course.duration && (
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">{course.duration}</p>
                  </div>
                )}
                {course.max_students && (
                  <div className="text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Capacity</p>
                    <p className="text-sm text-gray-600">{course.max_students} students</p>
                  </div>
                )}
                {course.price && (
                  <div className="text-center">
                    <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Price</p>
                    <p className="text-sm text-gray-600">{course.currency || 'USD'} ${course.price.toLocaleString()}</p>
                  </div>
                )}
                {course.experience_requirement && (
                  <div className="text-center">
                    <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Experience</p>
                    <p className="text-sm text-gray-600">{course.experience_requirement}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Content Placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                Course Content
              </h2>

              {enrollment ? (
                <div className="space-y-6">
                  {loadingModules ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading course materials...</p>
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Course Materials Coming Soon</h3>
                      <p className="text-gray-600 mb-6">
                        Course materials are being prepared and will be available here once ready.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
                        <span className="text-sm text-gray-600">{modules.length} modules available</span>
                      </div>
                      
                      {modules.map((module) => (
                        <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Module Header */}
                          <button
                            onClick={() => toggleModuleExpansion(module.id)}
                            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Folder className="h-5 w-5 text-blue-600 mr-3" />
                              <div className="text-left">
                                <h4 className="font-semibold text-gray-900">{module.title}</h4>
                                {module.description && (
                                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {expandedModules.has(module.id) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>

                          {/* Module Content */}
                          {expandedModules.has(module.id) && (
                            <div className="bg-white">
                              {module.lessons.length === 0 ? (
                                <div className="px-6 py-8 text-center">
                                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-600">Materials coming soon for this module.</p>
                                </div>
                              ) : (
                                <div className="divide-y divide-gray-100">
                                  {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                          <div className="flex-shrink-0 mr-4">
                                            {getFileIcon(lesson.type)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-gray-900 truncate">{lesson.title}</h5>
                                            <div className="flex items-center mt-1">
                                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                {getFileTypeLabel(lesson.type)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {lesson.content ? (
                                          <button
                                            onClick={() => handleDownloadLesson(lesson)}
                                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 ml-4"
                                          >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">View</span>
                                          </button>
                                        ) : (
                                          <span className="text-sm text-gray-400 ml-4">Coming Soon</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Enrollment Required</h3>
                  <p className="text-gray-600 mb-6">
                    You need to be enrolled in this course to access the content.
                  </p>
                  <Link
                    to="/portal"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Information</h3>
              
              <div className="space-y-4">
                {enrollment && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Enrolled</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Enrolled on {formatDate(enrollment.enrolled_at)}
                    </p>
                  </div>
                )}

                {course.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-green-600">{course.currency || 'USD'} ${course.price.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Course ID:</span>
                  <span className="font-mono text-sm text-gray-900">{course.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-sm text-gray-900">{formatDate(course.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {(course.experience_requirement || course.equipment_requirement || course.document_requirement || course.suggested_preparation) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Course Requirements
                </h3>
                <div className="space-y-3 text-sm">
                  {course.experience_requirement && (
                    <div>
                      <span className="font-medium text-gray-700">Experience: </span>
                      <span className="text-gray-600">{course.experience_requirement}</span>
                    </div>
                  )}
                  {course.equipment_requirement && (
                    <div>
                      <span className="font-medium text-gray-700">Equipment: </span>
                      <span className="text-gray-600">{course.equipment_requirement}</span>
                    </div>
                  )}
                  {course.document_requirement && (
                    <div>
                      <span className="font-medium text-gray-700">Documents: </span>
                      <span className="text-gray-600">{course.document_requirement}</span>
                    </div>
                  )}
                  {course.suggested_preparation && (
                    <div>
                      <span className="font-medium text-gray-700">Preparation: </span>
                      <span className="text-gray-600">{course.suggested_preparation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {enrollment ? (
                  <>
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                      <Play className="h-5 w-5 mr-2" />
                      Continue Learning
                      <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">Soon</span>
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                      <Download className="h-5 w-5 mr-2" />
                      Download Materials
                      <span className="ml-2 text-xs bg-gray-300 px-2 py-1 rounded">Soon</span>
                    </button>
                    <Link
                      to={`/portal/practice-questions/${courseId}`}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <Target className="h-5 w-5 mr-2" />
                      Practice Questions
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/portal"
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Courses
                  </Link>
                )}
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Our support team is here to help with any questions about your course.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enhanced Learning Features Coming Soon</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            Additional features like progress tracking, interactive quizzes, and completion certificates 
            will be added to enhance your learning experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">Track your completion status</p>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Interactive Quizzes</h3>
              <p className="text-gray-600 text-sm">Test your knowledge as you learn</p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Certificates</h3>
              <p className="text-gray-600 text-sm">Earn completion certificates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;