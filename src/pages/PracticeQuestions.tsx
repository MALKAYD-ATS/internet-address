import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  Home
} from 'lucide-react';

interface Course {
  id: number;
  title: string | null;
  description: string | null;
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
  submitted: boolean;
  showExplanation: boolean;
}

const PracticeQuestions: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const DEFAULT_QUESTION_COUNT = 8;

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses_ats')
          .select('id, title, description')
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

        // Randomize and limit questions
        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffledQuestions.slice(0, Math.min(DEFAULT_QUESTION_COUNT, shuffledQuestions.length));
        
        setQuestions(selectedQuestions);
        setQuestionStates(selectedQuestions.map(() => ({
          selectedAnswer: null,
          submitted: false,
          showExplanation: false
        })));

      } catch (err) {
        setError('An unexpected error occurred.');
        console.error('Practice questions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (questionStates[currentQuestionIndex].submitted) return;

    const newStates = [...questionStates];
    newStates[currentQuestionIndex].selectedAnswer = answer;
    setQuestionStates(newStates);
  };

  const handleSubmitAnswer = () => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex].submitted = true;
    newStates[currentQuestionIndex].showExplanation = true;
    setQuestionStates(newStates);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRetry = () => {
    // Reshuffle questions and reset states
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
    setQuestionStates(shuffledQuestions.map(() => ({
      selectedAnswer: null,
      submitted: false,
      showExplanation: false
    })));
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  };

  const toggleExplanation = () => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex].showExplanation = !newStates[currentQuestionIndex].showExplanation;
    setQuestionStates(newStates);
  };

  const getOptionLetter = (option: string): 'A' | 'B' | 'C' | 'D' => {
    switch (option) {
      case 'option_a': return 'A';
      case 'option_b': return 'B';
      case 'option_c': return 'C';
      case 'option_d': return 'D';
      default: return 'A';
    }
  };

  const getOptionClass = (optionLetter: 'A' | 'B' | 'C' | 'D') => {
    const currentState = questionStates[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentState.submitted) {
      return currentState.selectedAnswer === optionLetter
        ? 'bg-blue-100 border-blue-500 text-blue-900'
        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
    }

    // After submission
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
    
    if (!currentState.submitted) return null;

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
          <p className="text-gray-600">Loading practice questions...</p>
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
                  <p className="text-gray-600">Practice Questions</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Practice Questions</h2>
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
                src="/ATS.png"
                alt="Aboriginal Training Services"
                className="h-12 w-auto mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-gray-600">Practice Questions</p>
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
            <span className="text-gray-900 font-medium">Practice Questions</span>
          </nav>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title || 'Course Practice Questions'}
              </h1>
              <p className="text-gray-600">Test your knowledge with practice questions</p>
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
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Practice Questions Available</h2>
            <p className="text-gray-600 mb-8">
              Practice questions for this course are currently being updated. Please check back later.
            </p>
            <Link
              to={`/student/courses/${courseId}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course
            </Link>
          </div>
        ) : isCompleted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Award className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Practice Completed!</h2>
            <p className="text-gray-600 mb-8">
              Great job! You've completed all {questions.length} practice questions. 
              Keep practicing to reinforce your learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try New Questions
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
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                  const optionLetter = getOptionLetter(optionKey);
                  const optionText = questions[currentQuestionIndex][optionKey];
                  
                  return (
                    <button
                      key={optionKey}
                      onClick={() => handleAnswerSelect(optionLetter)}
                      disabled={questionStates[currentQuestionIndex].submitted}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${getOptionClass(optionLetter)} ${
                        questionStates[currentQuestionIndex].submitted ? 'cursor-not-allowed' : 'cursor-pointer'
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!questionStates[currentQuestionIndex].submitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!questionStates[currentQuestionIndex].selectedAnswer}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      questionStates[currentQuestionIndex].selectedAnswer
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}
                    </button>
                    <button
                      onClick={toggleExplanation}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors duration-200 flex items-center"
                    >
                      {questionStates[currentQuestionIndex].showExplanation ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Explanation
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show Explanation
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Explanation */}
              {questionStates[currentQuestionIndex].submitted && questionStates[currentQuestionIndex].showExplanation && (
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

export default PracticeQuestions;