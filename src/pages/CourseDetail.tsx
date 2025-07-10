import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PDFSlideViewer from '../components/PDFSlideViewer';

interface HeaderLogo {
  id: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
  is_active: boolean;
}

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

interface StudentModuleProgress {
  id: string;
  student_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
}

interface ExamMetadata {
  exam_time_limit_minutes: number | null;
  exam_number_of_questions: number | null;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [headerLogo, setHeaderLogo] = useState<HeaderLogo | null>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [moduleProgress, setModuleProgress] = useState<StudentModuleProgress[]>([]);

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [totalModules, setTotalModules] = useState<number>(0);
  const [completedModules, setCompletedModules] = useState<number>(0);
  const [examMetadata, setExamMetadata] = useState<ExamMetadata | null>(null);
  const [loadingModules, setLoadingModules] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    pdfUrl: string;
    lessonTitle: string;
    lessonId: string;
    moduleId: string;
  }>({
    isOpen: false,
    pdfUrl: '',
    lessonTitle: '',
    lessonId: '',
    moduleId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
          await fetchModuleCompletionData();
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

    const fetchModuleCompletionData = async () => {
      if (!user || !courseId) return;

      try {
        // Get total number of modules for this course
        const { count: totalCount, error: totalError } = await supabase
          .from('ats_course_modules')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId);

        if (totalError) {
          console.error('Error fetching total modules:', totalError);
          return;
        }

        setTotalModules(totalCount || 0);

        // Get number of completed modules for this student and course
        const { count: completedCount, error: completedError } = await supabase
          .from('student_module_progress')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('course_id', courseId)
          .eq('completed', true);

        if (completedError) {
          console.error('Error fetching completed modules:', completedError);
          return;
        }

        setCompletedModules(completedCount || 0);

   // Get full progress records for this student/course
const { data: progressData, error: progressError } = await supabase
  .from('student_module_progress')
  .select('*')
  .eq('student_id', user.id)
  .eq('course_id', courseId);

if (progressError) {
  console.error('Error fetching module progress records:', progressError);
} else {
  setModuleProgress(progressData || []);
}
     

        // Get exam metadata from courses_ats table
        const { data: examData, error: examError } = await supabase
          .from('courses_ats')
          .select('exam_time_limit_minutes, exam_number_of_questions')
          .eq('id', courseId)
          .single();

        if (examError) {
          console.error('Error fetching exam metadata:', examError);
        } else {
          setExamMetadata(examData);
        }

      } catch (err) {
        console.error('Error fetching module completion data:', err);
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

  // Check if all modules are completed
  const areAllModulesCompleted = (): boolean => {
    return totalModules > 0 && completedModules === totalModules;
  };

  const handleViewLesson = (lesson: ModuleLesson) => {
    if (lesson.content) {
      // Check if it's a PDF file
      const isPDF = lesson.type.toLowerCase() === 'pdf' || 
                   lesson.content.toLowerCase().includes('.pdf');
      
      if (isPDF) {
        // Open in PDF slide viewer
        setPdfViewer({
          isOpen: true,
          pdfUrl: lesson.content,
          lessonTitle: lesson.title,
          lessonId: lesson.id,
          moduleId: lesson.module_id
        });
      } else {
        // Open in new tab for non-PDF files
        window.open(lesson.content, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Show user-friendly message for missing content
      setError('This lesson content is not yet available. Please contact support if you believe this is an error.');
    }
  };

  const closePdfViewer = () => {
    setPdfViewer({
      isOpen: false,
      pdfUrl: '',
      lessonTitle: '',
      lessonId: '',
      moduleId: ''
    });
  };

  // Handle marking lesson as complete
  const handleMarkLessonComplete = async (lessonId: string, moduleId: string) => {
    if (!user || !courseId) return;

    setCompletingLesson(lessonId);
    setCompletionMessage(null);

    try {
      const { error } = await supabase
        .from('student_module_progress')
        .upsert([
          {
            student_id: user.id,
            course_id: courseId,
            module_id: moduleId,
            completed: true,
            completed_at: new Date().toISOString(),
          }
        ], { 
          onConflict: 'student_id,course_id,module_id'
        });

      if (error) {
        console.error('Error marking lesson complete:', error);
        setCompletionMessage({
          type: 'error',
          text: 'Failed to mark lesson as complete. Please try again.'
        });
      } else {
        setCompletionMessage({
          type: 'success',
          text: 'Lesson marked as complete!'
        });
        
        // Refresh module completion data
        await fetchModuleCompletionData();
      }
    } catch (err) {
      console.error('Completion error:', err);
      setCompletionMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setCompletingLesson(null);
    }
  };

  // Clear completion message after 5 seconds
  useEffect(() => {
    if (completionMessage) {
      const timer = setTimeout(() => {
        setCompletionMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [completionMessage]);

  // Check if a module is completed
  const isModuleCompleted = (moduleId: string): boolean => {
    return moduleProgress.some(progress => 
      progress.module_id === moduleId && progress.completed
    );
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
    <>
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

      {/* Completion Message */}
      {completionMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg border ${
            completionMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {completionMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span className="font-medium">{completionMessage.text}</span>
            </div>
          </div>
        </div>
      )}

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
                            className={`w-full px-6 py-4 transition-colors duration-200 flex items-center justify-between ${
                              isModuleCompleted(module.id) 
                                ? 'bg-green-50 hover:bg-green-100' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="flex items-center mr-3">
                                <Folder className="h-5 w-5 text-blue-600 mr-2" />
                                {isModuleCompleted(module.id) && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <div className="text-left">
                                <h4 className="font-semibold text-gray-900">{module.title}</h4>
                                {module.description && (
                                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                                </p>
                                {isModuleCompleted(module.id) && (
                                  <p className="text-xs text-green-600 font-medium mt-1">
                                    ✓ Module Completed
                                  </p>
                                )}
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
                                            onClick={() => handleViewLesson(lesson)}
                                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 ml-4"
                                          >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">View</span>
                                          </button>
                                        ) : (
                                          <span className="text-sm text-gray-400 ml-4">Coming Soon</span>
                                        )}
                                        
                                        {/* Mark as Complete Button */}
                                        {lesson.content && !isModuleCompleted(module.id) && (
                                          <button
                                            onClick={() => handleMarkLessonComplete(lesson.id, module.id)}
                                            disabled={completingLesson === lesson.id}
                                            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ml-2 ${
                                              completingLesson === lesson.id
                                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                          >
                                            {completingLesson === lesson.id ? (
                                              <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                <span className="hidden sm:inline">Completing...</span>
                                              </>
                                            ) : (
                                              <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Complete</span>
                                              </>
                                            )}
                                          </button>
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

            {/* Practice Exams Section - Always visible for enrolled students */}
            {enrollment && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-purple-600" />
                  Practice Exams
                </h3>
                
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Test your knowledge with comprehensive practice exams designed to prepare you for certification.
                  </p>
                  
                  {/* Exam Metadata */}
                  {examMetadata && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Exam Details:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        {examMetadata.exam_number_of_questions && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>{examMetadata.exam_number_of_questions} Questions</span>
                          </div>
                        )}
                        {examMetadata.exam_time_limit_minutes && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{examMetadata.exam_time_limit_minutes} Minutes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Progress and Button */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Module Progress: </span>
                      <span className={`${areAllModulesCompleted() ? 'text-green-600' : 'text-orange-600'}`}>
                        {completedModules}/{totalModules} completed
                      </span>
                    </div>
                    
                    {areAllModulesCompleted() ? (
                      <Link
                        to={`/portal/practice-exams/${courseId}`}
                        className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        <Award className="h-5 w-5 mr-2" />
                        Start Practice Exam
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                        title="Complete all modules to unlock the exam"
                      >
                        <Lock className="h-5 w-5 mr-2" />
                        Complete All Modules to Unlock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

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
      </div>

        return (
  <>
    {/* All other JSX content above remains unchanged */}

    {pdfViewer.isOpen && pdfViewer.pdfUrl && (
      <PDFSlideViewer
        pdfUrl={pdfViewer.pdfUrl}
        lessonTitle={pdfViewer.lessonTitle || "Untitled"}
        onClose={closePdfViewer}
        onComplete={
          pdfViewer.lessonId && pdfViewer.moduleId
            ? () => handleMarkLessonComplete(pdfViewer.lessonId, pdfViewer.moduleId)
            : undefined
        }
        showCompleteButton={
          pdfViewer.moduleId ? !isModuleCompleted(pdfViewer.moduleId) : false
        }
      />
    )}
  </>
);