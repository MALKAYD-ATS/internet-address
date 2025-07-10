import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, BookOpen, CheckCircle, Lock, Unlock, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PDFSlideViewer from '../components/PDFSlideViewer';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  max_students: number;
  practice_exam_time_limit: number;
  practice_exam_question_count: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  type: string;
  order: number;
}

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  completed_at: string;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && user) {
      loadCourseData();
      checkEnrollment();
    }
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setLoadingModules(true);

      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses_ats')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('ats_course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('ats_module_lessons')
        .select('*')
        .in('module_id', modulesData?.map(m => m.id) || [])
        .order('order');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Load student progress
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('student_module_progress')
          .select('*')
          .eq('student_id', user.id)
          .eq('course_id', courseId);

        if (progressError) throw progressError;
        setModuleProgress(progressData || []);
      }

    } catch (err) {
      console.error('Error loading course data:', err);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
      setLoadingModules(false);
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
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const isModuleUnlocked = (moduleOrder: number): boolean => {
    if (moduleOrder === 1) return true; // First module is always unlocked
    
    // Check if previous module is completed
    const previousModule = modules.find(m => m.order === moduleOrder - 1);
    if (!previousModule) return false;
    
    return moduleProgress.some(p => p.module_id === previousModule.id && p.completed);
  };

  const isModuleCompleted = (moduleId: string): boolean => {
    return moduleProgress.some(p => p.module_id === moduleId && p.completed);
  };

  const markModuleComplete = async (moduleId: string) => {
    if (!user || !courseId) return;

    try {
      setMarkingComplete(moduleId);

      const { error } = await supabase
        .from('student_module_progress')
        .upsert({
          student_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh progress data
      const { data: progressData, error: progressError } = await supabase
        .from('student_module_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId);

      if (progressError) throw progressError;
      setModuleProgress(progressData || []);

    } catch (err) {
      console.error('Error marking module complete:', err);
      setError('Failed to mark module as complete');
    } finally {
      setMarkingComplete(null);
    }
  };

  const getCompletedModulesCount = (): number => {
    return moduleProgress.filter(p => p.completed).length;
  };

  const areAllModulesCompleted = (): boolean => {
    return modules.length > 0 && getCompletedModulesCount() === modules.length;
  };

  const getProgressPercentage = (): number => {
    if (modules.length === 0) return 0;
    return Math.round((getCompletedModulesCount() / modules.length) * 100);
  };

  const handleLessonClick = (lesson: Lesson) => {
    const module = modules.find(m => m.id === lesson.module_id);
    if (module && isModuleUnlocked(module.order)) {
      setSelectedLesson(lesson);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
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
            onClick={() => navigate('/portal')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You are not enrolled in this course.</p>
          <button
            onClick={() => navigate('/portal')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => setSelectedLesson(null)}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h1>
          </div>
        </div>

        <div className="flex-1">
          {selectedLesson.type === 'pdf' && selectedLesson.content ? (
            <PDFSlideViewer pdfUrl={selectedLesson.content} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="prose max-w-none">
                  {selectedLesson.content ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                  ) : (
                    <p className="text-gray-500">No content available for this lesson.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Courses
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="mt-2 text-gray-600">{course.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info and Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-700">Duration: {course.duration}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-700">Max Students: {course.max_students}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-700">Modules: {modules.length}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-500">
                {getCompletedModulesCount()} of {modules.length} modules completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{getProgressPercentage()}% complete</p>
          </div>
        </div>

        {/* Course Modules */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Modules</h2>
          
          {loadingModules ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No modules available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => {
                const isUnlocked = isModuleUnlocked(module.order);
                const isCompleted = isModuleCompleted(module.id);
                const moduleLessons = lessons.filter(l => l.module_id === module.id);

                return (
                  <div
                    key={module.id}
                    className={`border rounded-lg p-4 ${
                      isUnlocked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        ) : isUnlocked ? (
                          <Unlock className="w-5 h-5 text-blue-600 mr-3" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <h3 className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                            Module {module.order}: {module.title}
                          </h3>
                          {module.description && (
                            <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {isUnlocked && !isCompleted && (
                        <button
                          onClick={() => markModuleComplete(module.id)}
                          disabled={markingComplete === module.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {markingComplete === module.id ? 'Marking...' : 'Mark Complete'}
                        </button>
                      )}
                    </div>

                    {isUnlocked && moduleLessons.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {moduleLessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson)}
                            className="flex items-center w-full text-left p-2 rounded hover:bg-white transition-colors"
                          >
                            <Play className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-blue-600 hover:text-blue-700">{lesson.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {!isUnlocked && (
                      <p className="ml-8 text-sm text-gray-500">
                        Complete the previous module to unlock this content.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Practice Exams Section */}
        {areAllModulesCompleted() && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Exams</h2>
            <p className="text-gray-600 mb-4">
              Congratulations! You've completed all modules. You can now take practice exams to test your knowledge.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Practice Questions</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Practice with individual questions at your own pace.
                </p>
                <button
                  onClick={() => navigate(`/practice-questions/${courseId}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start Practice Questions
                </button>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Timed Practice Exam</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {course.practice_exam_question_count} questions
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {course.practice_exam_time_limit} minutes time limit
                </p>
                <button
                  onClick={() => navigate(`/practice-exam/${courseId}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Start Practice Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}