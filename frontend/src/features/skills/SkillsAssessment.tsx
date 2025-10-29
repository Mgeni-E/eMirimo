import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../lib/store';
import { api } from '../../lib/api';
import { 
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  StarIcon,
  PlayIcon,
  ArrowRightIcon
} from '../../components/icons';

interface Question {
  _id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'coding' | 'practical';
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_limit: number;
  points: number;
}

interface Assessment {
  _id: string;
  skill_name: string;
  category: string;
  description: string;
  questions: Question[];
  total_questions: number;
  time_limit: number;
  passing_score: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface TestResult {
  _id: string;
  skill_name: string;
  score: number;
  passed: boolean;
  time_taken: number;
  completed_at: string;
  certificate_url?: string;
}

export function SkillsAssessment() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userResults, setUserResults] = useState<TestResult[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
    loadUserResults();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && testStarted) {
      submitTest();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, testStarted]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/skills/assessments');
      if (response.data.success) {
        setAssessments(response.data.assessments);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserResults = async () => {
    try {
      const response = await api.get('/skills/results');
      if (response.data.success) {
        setUserResults(response.data.results);
      }
    } catch (error) {
      console.error('Failed to load user results:', error);
    }
  };

  const startTest = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setTimeLeft(assessment.time_limit * 60); // Convert minutes to seconds
    setTestStarted(true);
    setTestCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const submitTest = async () => {
    if (!selectedAssessment) return;

    try {
      const response = await api.post('/skills/assessments/submit', {
        assessment_id: selectedAssessment._id,
        answers: answers,
        time_taken: selectedAssessment.time_limit * 60 - timeLeft
      });

      if (response.data.success) {
        setTestResult(response.data.result);
        setTestCompleted(true);
        setTestStarted(false);
        loadUserResults(); // Refresh results
      }
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUserResult = (skillName: string) => {
    return userResults.find(result => result.skill_name === skillName);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (testStarted && selectedAssessment) {
    const question = selectedAssessment.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedAssessment.total_questions) * 100;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Test Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedAssessment.skill_name} Assessment
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span className={timeLeft < 300 ? 'text-red-600 dark:text-red-400' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentQuestion + 1} of {selectedAssessment.total_questions}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {question.points} point{question.points !== 1 ? 's' : ''}
              </span>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              {question.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    answers[question._id] === option
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question_${question._id}`}
                    value={option}
                    checked={answers[question._id] === option}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [question._id]: e.target.value }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {currentQuestion === selectedAssessment.total_questions - 1 ? (
                <button
                  onClick={submitTest}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(Math.min(selectedAssessment.total_questions - 1, currentQuestion + 1))}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (testCompleted && testResult) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="w-16 h-16 mx-auto mb-4">
              {testResult.passed ? (
                <CheckCircleIcon className="w-16 h-16 text-green-500" />
              ) : (
                <XCircleIcon className="w-16 h-16 text-red-500" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {testResult.passed ? 'Congratulations!' : 'Test Completed'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {testResult.passed 
                ? `You passed the ${selectedAssessment?.skill_name} assessment with a score of ${testResult.score}%`
                : `You scored ${testResult.score}% on the ${selectedAssessment?.skill_name} assessment. The passing score is ${selectedAssessment?.passing_score}%`
              }
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{testResult.score}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{testResult.time_taken}m</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
              </div>
            </div>

            {testResult.passed && testResult.certificate_url && (
              <div className="mb-6">
                <a
                  href={testResult.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <TrophyIcon className="w-5 h-5 mr-2" />
                  Download Certificate
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setTestCompleted(false);
                setTestResult(null);
                setSelectedAssessment(null);
              }}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Take Another Test
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Skills Assessment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your skills and earn certificates to boost your profile
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => {
          const userResult = getUserResult(assessment.skill_name);
          return (
            <div
              key={assessment._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assessment.skill_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {assessment.category}
                    </p>
                  </div>
                </div>
                {userResult && (
                  <div className="flex items-center space-x-1">
                    {userResult.passed ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                {assessment.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                  {assessment.difficulty}
                </span>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{assessment.time_limit}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span>{assessment.total_questions} questions</span>
                  </div>
                </div>
              </div>

              {userResult && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Your Score:</span>
                    <span className={`font-medium ${userResult.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {userResult.score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(userResult.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => startTest(assessment)}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                {userResult ? 'Retake Test' : 'Start Test'}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
