import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle, 
  Lock,
  FileText,
  Play,
  Download,
  ExternalLink,
  Circle
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

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingModule, setCompletingModule] = useState<string | null>(null);
  
  // PDF Viewer state
  const [pdfViewer, setPdfViewer] = useState({
    isOpen: false,
    pdfUrl: '',
    lessonTitle: '',
    lessonId: '',
    moduleId: ''
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchModuleProgress();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
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

      if (modulesError) throw modulesError;

      // Transform the data structure
      const transformedModules = modulesData.map(module => ({
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

      setModules(transformedModules);
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_module_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;
      setModuleProgress(data || []);
    } catch (err) {
      console.error('Error fetching module progress:', err);
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

  const handleMarkModuleComplete = async (moduleId: string) => {
    if (!user || !courseId) return;

    try {
      setCompletingModule(moduleId);
      
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

      if (error) throw error;

      // Refresh progress data
      await fetchModuleProgress();
      
      // Show success message
      alert('Module marked as complete!');
    } catch (err) {
      console.error('Error marking module complete:', err);
      alert('Failed to mark module as complete. Please try again.');
    } finally {
      setCompletingModule(null);
    }
  };

  const openPdfViewer = (resource: Resource, lessonTitle: string, lessonId: string, moduleId: string) => {
    console.log('Opening PDF viewer with resource:', resource);
    
    let pdfUrl = '';
    
    // Handle different URL formats
    if (resource.url) {
      pdfUrl = resource.url.startsWith('http') ? resource.url : `https://${resource.url}`;
    } else if (resource.file_path) {
      pdfUrl = resource.file_path.startsWith('http') ? resource.file_path : `https://${resource.file_path}`;
    }
    
    console.log('Final PDF URL:', pdfUrl);
    
    if (!pdfUrl) {
      alert('PDF file not found');
      return;
    }

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
      pdfUrl: '',
      lessonTitle: '',
      lessonId: '',
      moduleId: ''
    });
  };

  const allModulesCompleted = modules.length > 0 && modules.every(module => isModuleCompleted(module.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
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
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {course.currency} ${course.price}
                </div>
                <div className="text-sm text-gray-500">Course Fee</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate(`/portal/student-dashboard`)}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Dashboard</div>
                  <div className="text-sm text-gray-500">View your progress</div>
                </div>
              </button>
              
              <button
                onClick={() => navigate(`/portal/training`)}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">All Courses</div>
                  <div className="text-sm text-gray-500">Browse other courses</div>
                </div>
              </button>
              
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-600">Certificate</div>
                  <div className="text-sm text-gray-500">Complete all modules</div>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Questions Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Questions</h2>
            <p className="text-gray-600 mb-4">
              Test your knowledge with practice questions. Available anytime during your course.
            </p>
            <button
              onClick={() => navigate(`/portal/practice-questions/${courseId}`)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Start Practice Questions
            </button>
          </div>

          {/* Course Modules */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Modules</h2>
            
            <div className="space-y-6">
              {modules.map((module, index) => {
                const isCompleted = isModuleCompleted(module.id);
                const isAccessible = isModuleAccessible(module.order);
                const isCurrentlyCompleting = completingModule === module.id;
                
                return (
                  <div 
                    key={module.id} 
                    className={`border rounded-lg p-6 ${
                      !isAccessible ? 'bg-gray-50 border-gray-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {!isAccessible ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className={!isAccessible ? 'text-gray-500' : ''}>
                          <h3 className="text-lg font-semibold mb-2">
                            Module {module.order}: {module.title}
                          </h3>
                          <p className="text-gray-600 mb-4">{module.description}</p>
                        </div>
                      </div>
                      
                      {isAccessible && !isCompleted && (
                        <button
                          onClick={() => handleMarkModuleComplete(module.id)}
                          disabled={isCurrentlyCompleting}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isCurrentlyCompleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Mark as Complete
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {!isAccessible && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-yellow-800 text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Complete previous modules to unlock this content
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {module.lessons.map((lesson) => (
                        <div 
                          key={lesson.id} 
                          className={`border rounded-lg p-4 ${
                            !isAccessible ? 'bg-gray-100 border-gray-200' : 'border-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className={!isAccessible ? 'text-gray-500' : ''}>
                              <h4 className="font-medium mb-2">{lesson.title}</h4>
                              {lesson.content && (
                                <p className="text-sm text-gray-600 mb-3">{lesson.content}</p>
                              )}
                            </div>
                          </div>
                          
                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="mt-3">
                              <h5 className={`text-sm font-medium mb-2 ${!isAccessible ? 'text-gray-500' : 'text-gray-700'}`}>
                                Resources:
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {lesson.resources.map((resource) => (
                                  <button
                                    key={resource.id}
                                    onClick={() => isAccessible && openPdfViewer(resource, lesson.title, lesson.id, module.id)}
                                    disabled={!isAccessible}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                      !isAccessible 
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    }`}
                                  >
                                    {resource.resource_type === 'file' ? (
                                      <FileText className="w-4 h-4" />
                                    ) : (
                                      <ExternalLink className="w-4 h-4" />
                                    )}
                                    {resource.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Practice Exams */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Exams</h2>
            
            {!allModulesCompleted ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Practice Exams Locked</span>
                </div>
                <p className="text-yellow-700 mt-1">
                  Complete all course modules to unlock practice exams.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Practice Exams Available</span>
                </div>
                <p className="text-green-700 mt-1">
                  Great job! You've completed all modules and can now take practice exams.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded-lg p-4 ${!allModulesCompleted ? 'bg-gray-50 border-gray-200' : 'border-gray-200'}`}>
                <h3 className={`font-medium mb-2 ${!allModulesCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                  Practice Exam
                </h3>
                <p className={`text-sm mb-4 ${!allModulesCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  Take a full practice exam to test your knowledge
                </p>
                <button
                  disabled={!allModulesCompleted}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    allModulesCompleted
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {allModulesCompleted ? 'Start Practice Exam' : 'Complete All Modules First'}
                </button>
              </div>
              
              <div className={`border rounded-lg p-4 ${!allModulesCompleted ? 'bg-gray-50 border-gray-200' : 'border-gray-200'}`}>
                <h3 className={`font-medium mb-2 ${!allModulesCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                  Final Exam
                </h3>
                <p className={`text-sm mb-4 ${!allModulesCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  Take the official exam for certification
                </p>
                <button
                  disabled={!allModulesCompleted}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    allModulesCompleted
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {allModulesCompleted ? 'Start Final Exam' : 'Complete All Modules First'}
                </button>
              </div>
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
              ? () => handleMarkModuleComplete(pdfViewer.moduleId)
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