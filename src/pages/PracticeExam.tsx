import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, verifySession, logout } from '../lib/supabase';
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
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Home,
  Send
} from 'lucide-react';

interface HeaderLogo {
  id: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
  is_active: boolean;
}

interface Course {
  id: number;
  title: string | null;
  description: string | null;
  exam_number_of_questions: number | null;
  exam_duration_minutes: number | null;
}

interface ExamQuestion {
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

const PracticeExam: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [headerLogo, setHeaderLogo] = useState<HeaderLogo | null>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResults, setExamResults] = useState<{
    score: number;
    percentage: number;
    passed: boolean;
    passingScore: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);

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
      if (!courseId || !user) {
        navigate('/login', { replace: true });
        return;
      }

      const session = await verifySession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        console.log('Fetching practice exam data...');
        setLoading(true);
        setError(null);

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses_ats')
          .select('id, title, description, exam_number_of_questions, exam_duration_minutes')
          .eq('id', courseId)
          .single();

        if (courseError) {
          if (courseError.message.includes('JWT')) {
            await logout();
            return;
          }
          setError('Course not found.');
          console.error('Error fetching course:', courseError);
          return;
        }

        setCourse(courseData);

        // Fetch practice questions for this course (using same questions as practice)
        const { data: questionsData, error: questionsError } = await supabase
          .from('practice_questions')
          .select('*')
          .eq('course_id', courseId);

        if (questionsError) {
          if (questionsError.message.includes('JWT')) {
            await logout();
            return;
          }
          console.error('Error fetching questions:', questionsError);
          setError('Failed to load exam questions.');
          return;
        }

        if (!questionsData || questionsData.length === 0) {
          setQuestions([]);
          setQuestionStates([]);
          return;
        }

        // Use course settings or defaults
        const questionCount = courseData.exam_number_of_questions || 50;
        const examDuration = courseData.exam_duration_minutes || 60;

        // Randomize and limit questions
        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffledQuestions.slice(0, Math.min(questionCount, shuffledQuestions.length));
        
        setQuestions(selectedQuestions);
        setQuestionStates(selectedQuestions.map(() => ({
          selectedAnswer: null
        })));

        // Set timer
        setTimeRemaining(examDuration * 60); // Convert to seconds
        setExamStartTime(new Date());

      } catch (err) {
        setError('An unexpected error occurred.');
        console.error('Practice exam fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleSubmitExam(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;

    const newStates = [...questionStates];
    newStates[currentQuestionIndex].selectedAnswer = answer;
    setQuestionStates(newStates);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!user || !course) return;

    const session = await verifySession();
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      console.log('Submitting exam...');
      // Calculate score
      let correctAnswers = 0;
      questions.forEach((question, index) => {
        if (questionStates[index].selectedAnswer === question.correct_answer) {
          correctAnswers++;
        }
      });

      const percentage = Math.round((correctAnswers / questions.length) * 100);
      const passingScore = 70; // Default passing score
      const passed = percentage >= passingScore;

      setExamResults({
        score: correctAnswers,
        percentage,
        passed,
        passingScore
      });

      // Save exam attempt to database
      const { error } = await supabase
        .from('student_exam_attempts')
        .insert([
          {
            student_id: user.id,
            course_id: courseId,
            started_at: examStartTime?.toISOString(),
            completed_at: new Date().toISOString(),
            answers: questionStates.map((state, index) => ({
              question_id: questions[index].id,
              selected_answer: state.selectedAnswer,
              correct_answer: questions[index].correct_answer,
              is_correct: state.selectedAnswer === questions[index].correct_answer
            })),
            score: percentage,
            duration_minutes: course.exam_duration_minutes || 60,
            is_submitted: true
          }
        ]);

      if (error) {
        if (error.message.includes('JWT')) {
          await logout();
          return;
        }
        console.error('Error saving exam attempt:', error);
      }

      console.log('Exam submitted successfully');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      
      if (error instanceof Error && error.message.includes('JWT')) {
        await logout();
      }
    }
  };

  const getOptionClass = (optionLetter: 'A' | 'B' | 'C' | 'D') => {
    const currentState = questionStates[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!isSubmitted) {
      return currentState.selectedAnswer === optionLetter
        ? 'bg-blue-100 border-blue-500 text-blue-900'
        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
    }

    // After submission - show correct/incorrect
    if (optionLetter === currentQuestion.correct_answer) {
      return 'bg-green-100 border-green-500 text-green-900';
    }
    
    if (currentState.selectedAnswer === optionLetter && optionLetter !== currentQuestion.correct_answer) {
      return 'bg-red-100 border-red-500 text-red-900';
    }

    return 'bg-gray-50 border-gray-300 text-gray-500';
  };

  const getOptionIcon = (optionLetter: 'A' | 'B' | 'C' | 'D') => {
    const currentState = questionStates[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!isSubmitted) return null;

    if (optionLetter === currentQuestion.correct_answer) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    if (currentState.selectedAnswer === optionLetter && optionLetter !== currentQuestion.correct_answer) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }

    return null;
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
              <p className="text-gray-600">Final assessment for course completion</p>
            </div>
            <Link
              to={`/student/courses/${courseId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course
            </Link>
          </div>
          
          {/* Timer */}
          {timeRemaining !== null && !isSubmitted && (
            <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">
                Time Remaining: {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Exam Questions Available</h2>
            <p className="text-gray-600 mb-8">
              Exam questions for this course are currently being updated. Please check back later.
            </p>
            <Link
              to={`/student/courses/${courseId}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course
            </Link>
          </div>
        ) : examResults ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Award className={`h-16 w-16 mx-auto mb-6 ${examResults.passed ? 'text-green-600' : 'text-red-600'}`} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Completed!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{examResults.score}</div>
                <div className="text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${examResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {examResults.percentage}%
                </div>
                <div className="text-gray-600">Final Score</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${examResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {examResults.passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="text-gray-600">Passing: {examResults.passingScore}%</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {questions[currentQuestionIndex].question}
                </h2>
                
                {questions[currentQuestionIndex].image_url && (
                  <div className="mb-6">
                    <img
                      src={questions[currentQuestionIndex].image_url}
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
              <div className="space-y-3 mb-6">
                {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((optionKey) => {
                  const optionLetter = optionKey.split('_')[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
                  const optionText = questions[currentQuestionIndex][optionKey];
                  
                  return (
                    <button
                      key={optionKey}
                      onClick={() => handleAnswerSelect(optionLetter)}
                      disabled={isSubmitted}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${getOptionClass(optionLetter)} ${
                        isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-bold mr-3 text-lg">{optionLetter}.</span>
                        <span>{optionText}</span>
                      </div>
                      {getOptionIcon(optionLetter)}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex gap-4">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>

              {/* Show explanation after submission */}
              {isSubmitted && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Explanation
                  </h4>
                  <p className="text-blue-800 leading-relaxed">
                    {questions[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeExam;