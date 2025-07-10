import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
  User
} from 'lucide-react';
import PDFSlideViewer from '../components/PDFSlideViewer';

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
  exam_time_limit_minutes: number;
  exam_number_of_questions: number;
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

interface StudentModuleProgress {
  id: string;
  student_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [moduleProgress, setModuleProgress] = useState<StudentModuleProgress[]>([]);
  const [totalModules, setTotalModules] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
  
  // Helper function to check if a module should be accessible
  const isModuleAccessible = (moduleOrder: number) => {
    if (moduleOrder === 1) return true; // First module is always accessible
    
    // Check if all previous modules are completed
    for (let i = 1; i < moduleOrder; i++) {
      const previousModule = modules.find(m => m.order === i);
      if (previousModule && !isModuleCompleted(previousModule.id)) {
        return false;
      }
    }
    return true;
  };

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
    moduleId: null
  });

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
      checkEnrollment();
    }
  }, [courseId, user]);

  useEffect(() => {
    if (isEnrolled && user && courseId) {
      fetchModuleProgress();
    }
  }, [isEnrolled, user, courseId]);

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

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

      if (modulesError) throw modulesError;

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
      setTotalModules(formattedModules.length);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user || !courseId) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsEnrolled(!!data);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const fetchModuleProgress = async () => {
    if (!user || !courseId) return;

    try {
      const { data, error } = await supabase
        .from('student_module_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;

      setModuleProgress(data || []);
      setCompletedModules(data?.filter(p => p.completed).length || 0);
    } catch (error) {
      console.error('Error fetching module progress:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user || !courseId) return;

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert([
          {
            student_id: user.id,
            course_id: courseId
          }
        ]);

      if (error) throw error;

      setIsEnrolled(true);
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in the course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkLessonComplete = async (lessonId: string, moduleId: string) => {
    if (!user || !courseId) return;

    setCompletingLesson(lessonId);
    try {
      const { error } = await supabase
        .from('student_module_progress')
        .upsert([
          {
            student_id: user.id,
            course_id: courseId,
            module_id: moduleId,
            completed: true,
            completed_at: new Date().toISOString()
          }
        ], { 
          onConflict: 'student_id,course_id,module_id'
        });

      if (error) throw error;

      // Refresh progress data
      await fetchModuleProgress();
      alert('Lesson marked as complete!');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      alert('Failed to mark lesson as complete. Please try again.');
    } finally {
      setCompletingLesson(null);
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return moduleProgress.some(p => p.module_id === moduleId && p.completed);
  };

  const areAllModulesCompleted = () => {
    return completedModules === totalModules && totalModules > 0;
  };

  const openPdfViewer = (pdfUrl: string, lessonTitle: string, lessonId: string, moduleId: string) => {
    console.log('Opening PDF viewer with URL:', pdfUrl); // Debug log
    setPdfViewer({
      isOpen: true,
      pdfUrl,
      lessonTitle,
      lessonId,
      moduleId
    });
  };

  const closePdfViewer = () => {
    setPdfViewer({
      isOpen: false,
      pdfUrl: null,
      lessonTitle: null,
      lessonId: null,
      moduleId: null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/training')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Course Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {course.type}
                  </span>
                  {course.level && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {course.level}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Max {course.max_students} students</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Certificate upon completion</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 lg:mt-0 lg:ml-8">
                <div className="bg-gray-50 rounded-lg p-6 min-w-[280px]">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {course.currency} {course.price}
                  </div>
                  {!isEnrolled ? (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-semibold">Enrolled</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Progress: {completedModules}/{totalModules} modules completed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isEnrolled ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enroll to Access Course Content</h3>
                <p className="text-gray-600 mb-6">
                  Get full access to all course modules, lessons, and practice exams by enrolling today.
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        const firstIncompleteModule = modules.find(module => !isModuleCompleted(module.id));
                        if (firstIncompleteModule) {
                          setExpandedModule(firstIncompleteModule.id);
                        }
                      }}
                      className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>Resume Learning</span>
                    </button>
                    <button
                      onClick={() => {
                        const element = document.getElementById('course-modules');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>View Modules</span>
                    </button>
                  </div>
                </div>

                {/* Practice Questions Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Questions</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">Course Practice Questions</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Test your knowledge with practice questions to reinforce your learning. 
                          These questions are available anytime to help you prepare.
                        </p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>• Multiple choice questions</p>
                          <p>• Instant feedback and explanations</p>
                          <p>• Available anytime during the course</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => navigate(`/portal/practice-questions/${courseId}`)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Start Practice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Practice Exams Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Exams</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">Final Practice Exam</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {course.exam_number_of_questions && (
                            <p>• {course.exam_number_of_questions} questions</p>
                          )}
                          {course.exam_time_limit_minutes && (
                            <p>• {course.exam_time_limit_minutes} minutes time limit</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Module Progress: {completedModules}/{totalModules} completed
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        {areAllModulesCompleted() ? (
                          <button
                            onClick={() => navigate(`/practice-questions/${courseId}`)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            Start Exam
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Complete all modules to unlock the exam"
                            className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
                          >
                            <Lock className="w-4 h-4 inline mr-2" />
                            Locked
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Modules */}
                <div id="course-modules" className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Modules</h3>
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <div key={module.id} className="border rounded-lg">
                        <button
                          onClick={() => {
                            if (isModuleAccessible(module.order)) {
                              setExpandedModule(expandedModule === module.id ? null : module.id);
                            }
                          }}
                          disabled={!isModuleAccessible(module.order)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                            isModuleAccessible(module.order) 
                              ? 'hover:bg-gray-50 cursor-pointer' 
                              : 'bg-gray-100 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {!isModuleAccessible(module.order) ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : isModuleCompleted(module.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{module.title}</h4>
                              {module.description && (
                                <p className="text-sm text-gray-600">{module.description}</p>
                              )}
                              {!isModuleAccessible(module.order) && (
                                <p className="text-xs text-red-600 mt-1">
                                  Complete previous modules to unlock
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isModuleAccessible(module.order) && !isModuleCompleted(module.id) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkLessonComplete(module.lessons[0]?.id, module.id);
                                }}
                                disabled={completingLesson === module.lessons[0]?.id}
                                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {completingLesson === module.lessons[0]?.id ? 'Completing...' : 'Mark as Complete'}
                              </button>
                            )}
                            <span className="text-gray-400">
                              {expandedModule === module.id ? '−' : '+'}
                            </span>
                          </div>
                        </button>
                        
                        {expandedModule === module.id && (
                          <div className="border-t bg-gray-50 p-4">
                            <div className="space-y-3">
                              {module.lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                                      <p className="text-sm text-gray-600 capitalize">{lesson.type}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {lesson.resources.map((resource) => (
                                      <button
                                        key={resource.id}
                                        onClick={() => {
                                          console.log('Resource clicked:', resource); // Debug log
                                          if (resource.resource_type === 'file') {
                                            // Try both URL and file_path, ensure we have a valid URL
                                            let pdfUrl = resource.url || resource.file_path;
                                            
                                            // If it's a relative path, make it absolute
                                            if (pdfUrl && !pdfUrl.startsWith('http') && !pdfUrl.startsWith('/')) {
                                              pdfUrl = '/' + pdfUrl;
                                            }
                                            
                                            console.log('Final PDF URL:', pdfUrl); // Debug log
                                            
                                            if (pdfUrl) {
                                              openPdfViewer(pdfUrl, lesson.title, lesson.id, module.id);
                                            } else {
                                              console.error('No valid PDF URL found for resource:', resource);
                                              alert('PDF file not found. Please contact support.');
                                            }
                                          } else if (resource.resource_type === 'link' && resource.url) {
                                            window.open(resource.url, '_blank');
                                          }
                                        }}
                                        disabled={!isModuleAccessible(module.order)}
                                        className={`text-sm px-3 py-1 rounded transition-colors ${
                                          isModuleAccessible(module.order)
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                      >
                                        {resource.resource_type === 'file' ? 'View PDF' : 'Open Link'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Course Completion</span>
                        <span>{Math.round((completedModules / totalModules) * 100) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(completedModules / totalModules) * 100 || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{completedModules}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-gray-600">{totalModules - completedModules}</div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{course.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Students:</span>
                      <span className="font-medium">{course.max_students}</span>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Course Instructor</div>
                      <div className="text-sm text-gray-600">Aboriginal Training Services</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                                            openPdfViewer(pdfUrl, lesson.title, lesson.id, module.id);
                                          } else if (resource.resource_type === 'link' && resource.url) {
                                            window.open(resource.url, '_blank');
                                          }
                                        }}
                                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                      >
                                        {resource.resource_type === 'file' ? 'View PDF' : 'Open Link'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Course Completion</span>
                        <span>{Math.round((completedModules / totalModules) * 100) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(completedModules / totalModules) * 100 || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{completedModules}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-gray-600">{totalModules - completedModules}</div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{course.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Students:</span>
                      <span className="font-medium">{course.max_students}</span>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Course Instructor</div>
                      <div className="text-sm text-gray-600">Aboriginal Training Services</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PDF Viewer Modal */}
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
      </div>
    </>
  );
};

export default CourseDetail;