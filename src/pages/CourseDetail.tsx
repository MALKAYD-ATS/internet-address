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
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
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

    try {
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

      if (error) throw error;

      // Refresh progress data
      await fetchModuleProgress();
      
      alert('Lesson marked as complete!');
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      alert('Failed to mark lesson as complete');
    } finally {
      setCompletingLesson(null);
    }
  };

  const openPdfViewer = (resource: Resource, lessonTitle: string, lessonId: string, moduleId: string) => {
    console.log('Opening PDF viewer with resource:', resource);
    
    let pdfUrl = resource.url || resource.file_path;
    
    if (!pdfUrl) {
      console.error('No PDF URL found for resource:', resource);
      alert('PDF file not found');
      return;
    }

    // Handle relative paths
    if (pdfUrl.startsWith('/') || !pdfUrl.startsWith('http')) {
      pdfUrl = `${window.location.origin}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
    }

    console.log('Final PDF URL:', pdfUrl);

    setPdfViewer({
      isOpen: true,
      pdfUrl,
      lessonTitle,
      lessonId,
      moduleId,
    });
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
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {course.currency} ${course.price}
                </div>
                <div className="text-sm text-gray-500">{course.level}</div>
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
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                                      {lesson.type}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* PDF Resources */}
                                  {lesson.resources
                                    .filter(resource => resource.resource_type === 'file' && 
                                           (resource.url?.includes('.pdf') || resource.file_path?.includes('.pdf')))
                                    .map((resource) => (
                                      <button
                                        key={resource.id}
                                        onClick={() => isAccessible && openPdfViewer(resource, lesson.title, lesson.id, module.id)}
                                        disabled={!isAccessible}
                                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                          isAccessible
                                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                      >
                                        <FileText className="w-3 h-3" />
                                        View PDF
                                      </button>
                                    ))}

                                  {/* Mark Complete Button */}
                                  {isAccessible && !isCompleted && (
                                    <button
                                      onClick={() => handleMarkLessonComplete(lesson.id, module.id)}
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
                    onClick={() => navigate('/portal/training')}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Back to Training
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
              {course.whats_included && course.whats_included.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                  <ul className="space-y-2">
                    {course.whats_included.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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