import React, { useState, useEffect } from 'react';
import { supabase, verifySession, logout } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Award,
  Lock,
  Circle
} from 'lucide-react';
import PDFSlideViewer from '../components/PDFSlideViewer';

// Course title to PDF filename mapping based on Supabase Storage structure
const COURSE_PDF_MAPPING: { [key: string]: { folder: string; filename: string } } = {
  // Basic Operations Online Course
  'Drone Pilot Certificate – Basic Operations (Online)': {
    folder: 'basic-operations-online',
    filename: 'basic-operations-online-section-0.pdf'
  },
  'Basic Operations Online': {
    folder: 'basic-operations-online', 
    filename: 'basic-operations-online-section-0.pdf'
  },
  'RPAS Basic Operations': {
    folder: 'basic-operations-online',
    filename: 'basic-operations-online-section-0.pdf'
  },
  
  // Advanced Operations Online Course
  'Drone Pilot Certificate – Advanced Operations (Online)': {
    folder: 'advanced-operations-online',
    filename: 'rpas-advanced-operations-slides-0.pdf'
  },
  'Advanced Operations Online': {
    folder: 'advanced-operations-online',
    filename: 'rpas-advanced-operations-slides-0.pdf'
  },
  'RPAS Advanced Operations': {
    folder: 'advanced-operations-online',
    filename: 'rpas-advanced-operations-slides-0.pdf'
  },
  
  // Recency Requirements Online Course
  'Recency Requirements Online': {
    folder: 'recency-requirements-online',
    filename: 'recency-course-online-slide-set.pdf'
  },
  'Flight Review': {
    folder: 'recency-requirements-online',
    filename: 'recency-course-online-slide-set.pdf'
  },
  'RPAS Recency Requirements': {
    folder: 'recency-requirements-online',
    filename: 'recency-course-online-slide-set.pdf'
  },
  
  // Reference Material Online Course (multiple PDFs available)
  'Reference Material Online': {
    folder: 'reference-material-online',
    filename: '06-knowledge-requirements-for-pilots-of-remotely-piloted-aircraft-systems.pdf'
  },
  'RPAS Reference Materials': {
    folder: 'reference-material-online',
    filename: '06-knowledge-requirements-for-pilots-of-remotely-piloted-aircraft-systems.pdf'
  }
};

// Additional reference materials for the Reference Material Online course
const REFERENCE_MATERIAL_PDFS = [
  '01-T_D_OPS018_(ADVANCED_PRE_READING_GUIDE).pdf',
  '02-T&D_OPS017_(FLIGHT_REVIEW_PRE_READING_GUIDE).pdf',
  '04-from-the-ground-up.pdf',
  '05-study-guide-for-the-restricted-operator-certificate-with-aeronautical-qualification-roc-a.pdf',
  '06-knowledge-requirements-for-pilots-of-remotely-piloted-aircraft-systems.pdf',
  '07-privacy-guidelines-for-drone-operators.pdf',
  '08-find-your-drone-category.pdf',
  '09-where-can-you-fly-your-drone.pdf',
  '10-rpas-101.pdf'
];

interface Course {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  duration: string;
  max_students: number;
  price: number;
  currency: string;
  whats_included: string[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
  order: number;
  resources: Resource[];
}

interface Resource {
  id: string;
  title: string;
  resource_type: string;
  url: string;
  file_path: string;
}

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  completed_at: string;
}

interface StudentProfile {
  id: string;
  full_name: string;
  phone_number: string;
  created_at: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    pdfUrl: string | null;
    lessonTitle: string | null;
    lessonId: string | null;
    moduleId: string | null;
  }>({
    isOpen: false,
    pdfUrl: null,
    lessonTitle: null,
    lessonId: null,
    moduleId: null,
  });

useEffect(() => {
  if (courseId) {
    // Verify session before fetching data
    const initializeData = async () => {
      const session = await verifySession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      fetchCourseData();
      fetchModuleProgress();
      fetchProfile(); // 👉 Add this line
    };

    initializeData();
  }
}, [courseId, user]);

  // Calculate course progress
  useEffect(() => {
    if (modules.length === 0) {
      setCourseProgress(0);
      return;
    }

    const completedModules = modules.filter(module => isModuleCompleted(module.id)).length;
    const progress = Math.round((completedModules / modules.length) * 100);
    setCourseProgress(progress);
  }, [modules, moduleProgress]);

// Check for certificate eligibility when progress reaches 100%
useEffect(() => {
  if (courseProgress === 100 && user && course && profile) {
    generateCertificate();
  }
}, [courseProgress, user, course, profile]);

const generateCertificate = async () => {
  try {
    console.log('Checking if certificate already exists...');
    // Check if certificate already exists
    const { data: existing, error: existingError } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) {
      console.log('Certificate already exists, skipping creation.');
      return;
    }

    if (existingError && existingError.details && !existingError.message.includes('No rows')) {
      throw existingError;
    }

    console.log('Generating certificate with Edge Function...');
    const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-certificate', {
      body: {
        studentId: user.id,
        studentName: profile?.full_name || 'Student',
        courseId: courseId
      }
    });

    if (functionError) {
      console.error('Error invoking function:', functionError);
      throw functionError;
    }

    console.log('Certificate generated!', functionData);
  } catch (error) {
    console.error('Error generating certificate:', error);
  }
};

  const fetchCourseData = async () => {
    try {
      console.log('Fetching course data for:', courseId);
      setLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        if (courseError.message.includes('JWT')) {
          await logout();
          return;
        }
        throw courseError;
      }
      setCourse(courseData);

      // Fetch modules with lessons and resources
      const { data: modulesData, error: modulesError } = await supabase
        .from('ats_course_modules')
        .select(`
          *,
          ats_module_lessons (
            *,
            ats_lesson_resources (*)
          )
        `)
        .eq('course_id', courseId)
        .order('order');

      if (modulesError) {
        if (modulesError.message.includes('JWT')) {
          await logout();
          return;
        }
        throw modulesError;
      }

      const formattedModules = modulesData.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: module.ats_module_lessons
          .sort((a: any, b: any) => a.order - b.order)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            content: lesson.content,
            type: lesson.type,
            order: lesson.order,
            resources: lesson.ats_lesson_resources || []
          }))
      }));

      setModules(formattedModules);
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleProgress = async () => {
    if (!user) return;

    const session = await verifySession();
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      console.log('Fetching module progress...');
      const { data, error } = await supabase
        .from('student_module_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId);

      if (error) {
        if (error.message.includes('JWT')) {
          await logout();
          return;
        }
        throw error;
      }
      setModuleProgress(data || []);
    } catch (err) {
      console.error('Error fetching module progress:', err);
    }
  };

const fetchProfile = async () => {
  if (!user) return;

  try {
    console.log('Fetching profile...');
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
    console.log('Profile loaded:', data);
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
};

  
  const isModuleCompleted = (moduleId: string): boolean => {
    return moduleProgress.some(progress => 
      progress.module_id === moduleId && progress.completed
    );
  };

  const isModuleAccessible = (moduleOrder: number): boolean => {
    // First module is always accessible
    if (moduleOrder === 1) return true;
    
    // Check if all previous modules are completed
    const sortedModules = modules.sort((a, b) => a.order - b.order);
    const previousModules = sortedModules.filter(m => m.order < moduleOrder);
    
    return previousModules.every(module => isModuleCompleted(module.id));
  };

  const getModuleIcon = (module: Module) => {
    if (isModuleCompleted(module.id)) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (isModuleAccessible(module.order)) {
      return <Circle className="w-5 h-5 text-gray-400" />;
    } else {
      return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleMarkLessonComplete = async (lessonId: string, moduleId: string) => {
    if (!user) return;

    const session = await verifySession();
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      console.log('Marking lesson complete:', lessonId);
      setCompletingLesson(lessonId);

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
        if (error.message.includes('JWT')) {
          await logout();
          return;
        }
        throw error;
      }

      // Refresh progress data
      console.log('Lesson marked complete, refreshing progress...');
      await fetchModuleProgress();
      
      alert('Lesson marked as complete!');
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      
      if (err instanceof Error && err.message.includes('JWT')) {
        await logout();
        return;
      }
      
      alert('Failed to mark lesson as complete');
    } finally {
      setCompletingLesson(null);
    }
  };

  const openPdfViewer = (resource: Resource, lessonTitle: string, lessonId: string, moduleId: string) => {
    console.log('Opening PDF viewer with resource:', resource);
    
    // Get PDF URL from resource - prioritize Supabase Storage URLs
    let pdfUrl = '';
    
    if (resource.url) {
      pdfUrl = resource.url;
    } else if (resource.file_path) {
      // If file_path is provided, construct Supabase Storage URL
      if (resource.file_path.startsWith('http')) {
        pdfUrl = resource.file_path;
      } else {
        // Construct Supabase Storage URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const bucketName = 'media-assets';
        pdfUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${resource.file_path}`;
      }
    }
    
    if (!pdfUrl) {
      console.error('No PDF URL found for resource:', resource);
      alert('PDF file not found');
      return;
    }

    console.log('Final PDF URL:', pdfUrl);

    // Validate URL before opening viewer
    try {
      new URL(pdfUrl);
    } catch (error) {
      console.error('Invalid PDF URL:', pdfUrl);
      alert('Invalid PDF file path');
      return;
    }

    setPdfViewer({
      isOpen: true,
      pdfUrl,
      lessonTitle,
      lessonId,
      moduleId,
    });
  };

  // Enhanced helper function to get PDF URL for lesson resources
  const getPdfUrlForLesson = (lesson: Lesson): string | null => {
    // First, check if the lesson content contains a PDF URL
    if (lesson.content && lesson.content.trim()) {
      const content = lesson.content.trim();
      
      // Check if content is already a valid URL
      if (content.startsWith('http')) {
        return content;
      }
      
      // If content looks like a file path, construct Supabase Storage URL
      if (content.includes('.pdf')) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const bucketName = 'media-assets';
        return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${content}`;
      }
    }
    
    return null;
  };

  const closePdfViewer = () => {
    setPdfViewer({
      isOpen: false,
      pdfUrl: null,
      lessonTitle: null,
      lessonId: null,
      moduleId: null,
    });
  };

  // Add session verification on component mount
  useEffect(() => {
    const checkSession = async () => {
      if (!user) return;
      
      const session = await verifySession();
      if (!session) {
        navigate('/login', { replace: true });
      }
    };

    checkSession();
  }, [user, navigate]);

  const allModulesCompleted = modules.length > 0 && modules.every(module => isModuleCompleted(module.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/portal/training')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Training
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Progress Bar */}
          {course && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Course Progress</h2>
                <span className="text-sm font-medium text-gray-600">{courseProgress}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${courseProgress}%` }}
                ></div>
              </div>
              {courseProgress === 100 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Course completed! Certificate available in your profile.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Max {course.max_students} students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Modules */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Modules</h2>
                <div className="space-y-4">
                  {modules.map((module) => {
                    const isAccessible = isModuleAccessible(module.order);
                    const isCompleted = isModuleCompleted(module.id);
                    
                    return (
                      <div 
                        key={module.id} 
                        className={`border rounded-lg p-4 ${
                          isAccessible 
                            ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm' 
                            : 'border-gray-100 bg-gray-50'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getModuleIcon(module)}
                            <div>
                              <h3 className={`font-medium ${
                                isAccessible ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                                {module.title}
                              </h3>
                              <p className={`text-sm ${
                                isAccessible ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {module.description}
                              </p>
                            </div>
                          </div>
                          
                          {!isAccessible && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              Complete previous modules to unlock
                            </span>
                          )}
                          
                          {isCompleted && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Lessons */}
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="ml-8">
                              <div 
                                className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-200 ${
                                  isAccessible ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed'
                                }`}
                                onClick={() => {
                                  if (isAccessible) {
                                    const pdfUrl = getPdfUrlForLesson(lesson);
                                    
                                    if (pdfUrl) {
                                      console.log('Opening PDF from lesson click:', {
                                        lessonTitle: lesson.title,
                                        courseTitle: course?.title,
                                        pdfUrl: pdfUrl
                                      });
                                      
                                      // Create a mock resource object for the PDF viewer
                                      const mockResource: Resource = {
                                        id: 'lesson-pdf',
                                        title: lesson.title,
                                        resource_type: 'file',
                                        url: pdfUrl,
                                        file_path: ''
                                      };
                                      openPdfViewer(mockResource, lesson.title, lesson.id, module.id);
                                    } else {
                                      console.log('No PDF resource found for lesson:', {
                                        lessonTitle: lesson.title,
                                        courseTitle: course?.title,
                                        availableResources: lesson.resources
                                      });
                                      alert('No PDF material available for this lesson');
                                    }
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <PlayCircle className={`w-4 h-4 ${
                                    isAccessible ? 'text-blue-500' : 'text-gray-300'
                                  }`} />
                                  <div>
                                    <h4 className={`font-medium text-sm ${
                                      isAccessible ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                      {lesson.title}
                                    </h4>
                                    <p className={`text-xs ${
                                      isAccessible ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                      {lesson.type} • Click to view slides
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* PDF Indicator */}
                                  {(lesson.content && lesson.content.includes('.pdf')) && (
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                      isAccessible
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      <FileText className="w-3 h-3" />
                                      PDF
                                    </div>
                                  )}

                                  {/* Mark Complete Button */}
                                  {isAccessible && !isCompleted && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent lesson click when clicking complete button
                                        handleMarkLessonComplete(lesson.id, module.id);
                                      }}
                                      disabled={completingLesson === lesson.id}
                                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                                    >
                                      {completingLesson === lesson.id ? (
                                        <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <CheckCircle className="w-3 h-3" />
                                      )}
                                      Mark Complete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/portal')}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                </div>
              </div>

              {/* Practice Questions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Questions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Test your knowledge with practice questions for this course.
                </p>
                <button
                  onClick={() => navigate(`/portal/practice-questions/${courseId}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Practice Questions
                </button>
              </div>

              {/* Practice Exam */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Exam</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Take the practice exam once you've completed all modules.
                </p>
                <button
                  onClick={() => navigate(`/portal/practice-exam/${courseId}`)}
                  disabled={!allModulesCompleted}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    allModulesCompleted
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {allModulesCompleted ? 'Take Practice Exam' : 'Complete All Modules First'}
                </button>
                {!allModulesCompleted && (
                  <p className="text-xs text-gray-500 mt-2">
                    Complete all course modules to unlock the practice exam.
                  </p>
                )}
              </div>

              {/* What's Included */}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewer.isOpen && pdfViewer.pdfUrl && (
        <PDFSlideViewer
          pdfUrl={pdfViewer.pdfUrl}
          lessonTitle={pdfViewer.lessonTitle || "Untitled"}
          onClose={closePdfViewer}
          onComplete={
            pdfViewer.lessonId && pdfViewer.moduleId
              ? () => handleMarkLessonComplete(pdfViewer.lessonId!, pdfViewer.moduleId!)
              : undefined
          }
          showCompleteButton={
            pdfViewer.moduleId ? !isModuleCompleted(pdfViewer.moduleId) : false
          }
        />
      )}
    </>
  );
};

export default CourseDetail;