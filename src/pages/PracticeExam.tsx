import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  Trophy,
  Timer,
  Target,
  Home,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface Course {
  id: number;
  title: string | null;
  description: string | null;
  practice_exam_time_limit: number | null;
  practice_exam_question_count: number | null;
}

interface PracticeQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  image_url: string | null;
  course_id: number;
}

interface QuestionState {
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
}

interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  answers: { questionId: number; selectedAnswer: string; correct: boolean }[];
}

const PracticeExam: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [headerLogo, setHeaderLogo] = useState<HeaderLogo | null>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

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
    const fetchData = async () => {
      if (!courseId || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses_ats')
          .select('id, title, description, practice_exam_time_limit, practice_exam_question_count')
          .eq('id', courseId)
          .single();

        if (courseError) {
          setError('Course not found.');
          console.error('Error fetching course:', courseError);
          return;
        }

        setCourse(courseData);

        // Fetch practice questions for this course
        const { data: questionsData, error: questionsError } = await supabase
          .from('practice_questions')
          .select('*')
          .eq('course_id', courseId);

        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          setError('Failed to load practice questions.');
          return;
        }

        if (!questionsData || questionsData.length === 0) {
          setQuestions([]);
          setQuestionStates([]);
          return;
        }

        // Randomize and limit questions based on course settings
        const questionCount = courseData.practice_exam_question_count || 20;
        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffledQuestions.slice(0, Math.min(questionCount, shuffledQuestions.length));
        
        setQuestions(selectedQuestions);
        setQuestionStates(selectedQuestions.map(() => ({
          selectedAnswer: null
        })));

        // Set initial time
        const timeLimit = courseData.practice_exam_time_limit || 60;
        setTimeRemaining(timeLimit * 60); // Convert minutes to seconds

      } catch (err) {
        setError('An unexpected error occurred.');
        console.error('Practice exam fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (examStarted && !examCompleted && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [examStarted, examCompleted, isPaused, timeRemaining]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setStartTime(new Date());
  };

  const handlePauseExam = () => {
    setIsPaused(!isPaused);
  };

  const handleAnswerSelect = (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => {
    const newStates = [...questionStates];
    newStates[questionIndex].selectedAnswer = answer;
    setQuestionStates(newStates);
  };

  const handleSubmitExam = async () => {
    if (!startTime) return;

    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // in seconds

    // Calculate results
    const answers = questions.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: questionStates[index].selectedAnswer || '',
      correct: questionStates[index].selectedAnswer === question.correct_answer
    }));

    const correctAnswers = answers.filter(answer => answer.correct).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    const result: ExamResult = {
      totalQuestions: questions.length,
      correctAnswers,
      score,
      timeSpent,
      answers
    };

    setExamResult(result);
    setExamCompleted(true);

    // TODO: Save exam result to database if needed
    try {
      // You can implement exam result saving here
      console.log('Exam completed:', result);
    } catch (err) {
      console.error('Error saving exam result:', err);
    }
  };

  const handleRetakeExam = () => {
    // Reset exam state
    setExamStarted(false);
    setExamCompleted(false);
    setExamResult(null);
    setIsPaused(false);
    setStartTime(null);
    
    // Reset time
    const timeLimit = course?.practice_exam_time_limit || 60;
    setTimeRemaining(timeLimit * 60);
    
    // Reset answers
    setQuestionStates(questions.map(() => ({ selectedAnswer: null })));
    
    // Reshuffle questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading practice exam...</p>
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
                  <p className="text-gray-600">Practice Exam</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Practice Exam</h2>
            <p className="text-gray-600 mb-8">{error || 'The requested course could not be found.'}</p>
            <Link
              to="/portal"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Portal
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
                <p className="text-gray-600">Practice Exam</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors duration-200">
              <Home className="h-4 w-4" />
            </Link>
            <span>/</span>
            <Link to="/portal" className="hover:text-blue-600 transition-colors duration-200">
              Portal
            </Link>
            <span>/</span>
            <Link to={`/student/courses/${courseId}`} className="hover:text-blue-600 transition-colors duration-200">
              {course.title || 'Course'}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Practice Exam</span>
          </nav>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title || 'Course Practice Exam'}
              </h1>
              <p className="text-gray-600">Comprehensive practice examination</p>
            </div>
            <Link
              to={`/student/courses/${courseId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Practice Exam Available</h2>
            <p className="text-gray-600 mb-8">
              Practice exam questions for this course are currently being updated. Please check back later.
            </p>
            <Link
              to={`/student/courses/${courseId}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course
            </Link>
          </div>
        ) : !examStarted ? (
          /* Exam Start Screen */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Practice Exam</h2>
            <p className="text-gray-600 mb-8">
              Test your knowledge with this comprehensive practice examination.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Time Limit</p>
                <p className="text-gray-600">{course.practice_exam_time_limit || 60} minutes</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Questions</p>
                <p className="text-gray-600">{questions.length} questions</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Format</p>
                <p className="text-gray-600">Multiple Choice</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-2">Important Instructions:</h3>
              <ul className="text-yellow-800 text-sm space-y-1 text-left">
                <li>• You have {course.practice_exam_time_limit || 60} minutes to complete the exam</li>
                <li>• You can pause the exam if needed</li>
                <li>• All questions must be answered before submission</li>
                <li>• You will see your results immediately after submission</li>
                <li>• You can retake the exam as many times as you want</li>
              </ul>
            </div>

            <button
              onClick={handleStartExam}
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
            >
              <Play className="h-6 w-6 mr-3" />
              Start Practice Exam
            </button>
          </div>
        ) : examCompleted && examResult ? (
          /* Exam Results Screen */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Completed!</h2>
            
            <div className={`inline-block p-6 rounded-lg border-2 mb-8 ${getScoreBgColor(examResult.score)}`}>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(examResult.score)}`}>
                {examResult.score}%
              </div>
              <p className="text-gray-700">
                {examResult.correctAnswers} out of {examResult.totalQuestions} correct
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Time Spent</p>
                <p className="text-gray-600">{formatTime(examResult.timeSpent)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Correct</p>
                <p className="text-gray-600">{examResult.correctAnswers}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Incorrect</p>
                <p className="text-gray-600">{examResult.totalQuestions - examResult.correctAnswers}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetakeExam}
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Retake Exam
              </button>
              <Link
                to={`/student/courses/${courseId}`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Back to Course
              </Link>
            </div>
          </div>
        ) : (
          /* Exam In Progress */
          <div className="space-y-6">
            {/* Timer and Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center px-4 py-2 rounded-lg ${
                    timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Timer className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{formatTime(timeRemaining)}</span>
                  </div>
                  <button
                    onClick={handlePauseExam}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    )}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  Question {questions.findIndex(q => !questionStates[questions.indexOf(q)]?.selectedAnswer) + 1 || questions.length} of {questions.length}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-xl shadow-lg p-8">
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Question {index + 1}
                      </h3>
                      {questionStates[index]?.selectedAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {question.question}
                    </p>
                    
                    {question.image_url && (
                      <div className="mt-4">
                        <img
                          src={question.image_url}
                          alt="Question illustration"
                          className="max-w-full h-auto rounded-lg shadow-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((optionKey) => {
                      const optionLetter = optionKey.split('_')[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
                      const optionText = question[optionKey];
                      const isSelected = questionStates[index]?.selectedAnswer === optionLetter;
                      
                      return (
                        <button
                          key={optionKey}
                          onClick={() => handleAnswerSelect(index, optionLetter)}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 flex items-center ${
                            isSelected
                              ? 'bg-blue-100 border-blue-500 text-blue-900'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-bold mr-3 text-lg">{optionLetter}.</span>
                          <span>{optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Answered: {questionStates.filter(state => state.selectedAnswer).length} of {questions.length} questions
                </p>
                <button
                  onClick={handleSubmitExam}
                  disabled={questionStates.some(state => !state.selectedAnswer)}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                    questionStates.some(state => !state.selectedAnswer)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Submit Exam
                </button>
                {questionStates.some(state => !state.selectedAnswer) && (
                  <p className="text-red-600 text-sm mt-2">
                    Please answer all questions before submitting
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeExam;