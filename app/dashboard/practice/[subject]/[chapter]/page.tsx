"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ArrowRight,
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import { PHYSICS_CHAPTER_3_QUESTIONS, Question } from '../../_data/physics-questions';
import {
  calculatePerformanceScore,
  generateRecommendations,
  selectNextQuestion,
} from '../../_utils/adaptiveLogic';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  startSession,
  answerQuestion,
  setRecommendation,
  completeSession,
  restoreSession,
  clearCurrentSession,
} from '@/lib/store/slices/practiceSlice';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'সহজ',
  medium: 'মধ্যম',
  hard: 'কঠিন'
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200'
};

export default function PracticeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const subject = params.subject as string;
  const chapter = params.chapter as string;

  const currentSession = useAppSelector((state) => state.practice.currentSession);
  const overallStats = useAppSelector((state) => state.practice.overallStats);

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Restore session on mount
  useEffect(() => {
    if (currentSession && currentSession.subject === subject && currentSession.chapter === chapter) {
      // Session exists, restore it
      const answeredIds = currentSession.questions.map(q => q.questionId);
      const nextQ = selectNextQuestion(
        PHYSICS_CHAPTER_3_QUESTIONS,
        currentSession.metrics,
        currentSession.difficulty,
        answeredIds
      );

      if (nextQ && currentSession.questions.length < 10) {
        setTimeout(() => {
          setCurrentQuestion(nextQ);
          setQuestionStartTime(Date.now());
          setTimeElapsed(Math.floor((Date.now() - currentSession.startTime!) / 1000));
        }, 0);
      } else if (currentSession.questions.length >= 10) {
        // Session was completed but not finalized
        const rec = generateRecommendations(currentSession.metrics, currentSession.difficulty);
        dispatch(setRecommendation(rec));
        dispatch(completeSession());
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (currentSession && !currentSession.completed && currentSession.startTime) {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - currentSession.startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const handleStartSession = () => {
    dispatch(startSession({ subject, chapter, difficulty: selectedDifficulty }));

    const firstQuestion = PHYSICS_CHAPTER_3_QUESTIONS.find(
      q => q.difficulty === selectedDifficulty
    );
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      setQuestionStartTime(Date.now());
    }
  };

  const handleAnswerSelect = (answer: number | string | boolean) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion || !currentSession) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    const timeSpent = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;

    // Dispatch answer to Redux
    dispatch(
      answerQuestion({
        questionId: currentQuestion.id,
        question: currentQuestion,
        answer: selectedAnswer,
        isCorrect: correct,
        timeSpent,
      })
    );
  };

  const handleNextQuestion = () => {
    if (!currentSession) return;

    const answeredIds = currentSession.questions.map(q => q.questionId);

    if (answeredIds.length >= 10) {
      // Session complete
      const rec = generateRecommendations(currentSession.metrics, currentSession.difficulty);
      dispatch(setRecommendation(rec));
      dispatch(completeSession());
      return;
    }

    // Select next question using adaptive logic
    const nextQ = selectNextQuestion(
      PHYSICS_CHAPTER_3_QUESTIONS,
      currentSession.metrics,
      currentSession.difficulty,
      answeredIds
    );

    if (nextQ) {
      setCurrentQuestion(nextQ);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
    } else {
      // No more questions
      const rec = generateRecommendations(currentSession.metrics, currentSession.difficulty);
      dispatch(setRecommendation(rec));
      dispatch(completeSession());
    }
  };

  const handleResumeSession = () => {
    if (!currentSession) return;

    const answeredIds = currentSession.questions.map(q => q.questionId);
    const nextQ = selectNextQuestion(
      PHYSICS_CHAPTER_3_QUESTIONS,
      currentSession.metrics,
      currentSession.difficulty,
      answeredIds
    );

    if (nextQ) {
      setCurrentQuestion(nextQ);
      setQuestionStartTime(Date.now());
    }
  };

  const handleClearSession = () => {
    dispatch(clearCurrentSession());
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if session exists but not started
  const hasIncompleteSession = currentSession &&
    currentSession.subject === subject &&
    currentSession.chapter === chapter &&
    !currentSession.completed &&
    currentSession.questions.length < 10;

  // Session not started
  if (!currentSession || (currentSession.subject !== subject || currentSession.chapter !== chapter)) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            অধ্যায় ৩: চাপ ও পদার্থের অবস্থা
          </h1>
          <p className="text-gray-600 mb-8">
            অনুশীলন শুরু করার জন্য কঠিনতার স্তর নির্বাচন করুন
          </p>

          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">কঠিনতার স্তর</h2>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  selectedDifficulty === diff
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{DIFFICULTY_LABELS[diff]}</h3>
                    <p className="text-sm text-gray-600">
                      {diff === 'easy' && 'মৌলিক ধারণা এবং সহজ প্রশ্ন'}
                      {diff === 'medium' && 'মধ্যম স্তরের সমস্যা সমাধান'}
                      {diff === 'hard' && 'জটিল সমস্যা এবং গভীর বিশ্লেষণ'}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${DIFFICULTY_COLORS[diff]}`}>
                    {PHYSICS_CHAPTER_3_QUESTIONS.filter(q => q.difficulty === diff).length} প্রশ্ন
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            অনুশীলন শুরু করুন
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Session complete
  if (currentSession.completed && currentSession.recommendation) {
    const sessionScore = calculatePerformanceScore(currentSession.metrics);

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">অনুশীলন সম্পন্ন!</h1>
            <p className="text-gray-600">আপনার পারফরম্যান্স বিশ্লেষণ করা হয়েছে</p>
          </div>

          {/* Performance Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold mb-2">মোট প্রশ্ন</p>
              <p className="text-3xl font-bold text-blue-900">{currentSession.metrics.totalQuestions}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-600 font-semibold mb-2">সঠিক উত্তর</p>
              <p className="text-3xl font-bold text-green-900">{currentSession.metrics.correctAnswers}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <p className="text-sm text-purple-600 font-semibold mb-2">স্কোর</p>
              <p className="text-3xl font-bold text-purple-900">{sessionScore}%</p>
            </div>
          </div>

          {/* Recommendation */}
          {currentSession.recommendation && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">AI সুপারিশ</h3>
                  <p className="text-gray-700 mb-4">{currentSession.recommendation.recommendation}</p>
                  {currentSession.recommendation.focusTopics.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">ফোকাস করুন:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentSession.recommendation.focusTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white border border-indigo-200 rounded-lg text-sm text-indigo-700"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                dispatch(clearCurrentSession());
                router.push('/dashboard/practice');
              }}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              ড্যাশবোর্ডে ফিরুন
            </button>
            <button
              onClick={() => {
                dispatch(clearCurrentSession());
                setSelectedDifficulty(currentSession.recommendation?.nextDifficulty || 'medium');
                handleStartSession();
              }}
              className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              পরবর্তী সেট শুরু করুন
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resume session prompt
  if (hasIncompleteSession && !currentQuestion) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">অসম্পূর্ণ সেশন পাওয়া গেছে</h1>
            <p className="text-gray-600 mb-6">
              আপনি {currentSession.questions.length}টি প্রশ্ন সম্পন্ন করেছেন। আপনি চালিয়ে যেতে পারেন।
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">সম্পন্ন প্রশ্ন</p>
                <p className="text-2xl font-bold text-gray-900">{currentSession.questions.length} / 10</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">স্কোর</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {calculatePerformanceScore(currentSession.metrics)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleClearSession}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              নতুন সেশন শুরু করুন
            </button>
            <button
              onClick={handleResumeSession}
              className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              সেশন চালিয়ে যান
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="p-8 text-center">লোড হচ্ছে...</div>;
  }

  const questionNumber = currentSession.questions.length + 1;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg border ${DIFFICULTY_COLORS[currentSession.difficulty]}`}>
              {DIFFICULTY_LABELS[currentSession.difficulty]}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{formatTime(timeElapsed)}</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-700">
            প্রশ্ন {questionNumber} / 10
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(questionNumber / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-lg mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-indigo-600">{currentQuestion.topic}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer Options */}
        {currentQuestion.type === 'mcq' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedAnswer === idx
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                } ${showFeedback ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === idx
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-gray-900 font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                onClick={() => handleAnswerSelect(value)}
                disabled={showFeedback}
                className={`p-6 rounded-xl border-2 text-center font-semibold transition-all ${
                  selectedAnswer === value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300'
                } ${showFeedback ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                {value ? 'সঠিক' : 'ভুল'}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'fill-blank' && (
          <div className="space-y-4">
            <input
              type="text"
              value={selectedAnswer as string || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              disabled={showFeedback}
              placeholder="উত্তর লিখুন..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-6 p-6 rounded-xl border-2 animate-in slide-in-from-bottom-4 ${
            isCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'সঠিক উত্তর!' : 'ভুল উত্তর'}
                </h3>
                <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              উত্তর জমা দিন
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {questionNumber >= 10 ? 'সম্পন্ন করুন' : 'পরবর্তী প্রশ্ন'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Session Stats */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">সঠিক</p>
            <p className="text-2xl font-bold text-green-600">{currentSession.metrics.correctAnswers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">ভুল</p>
            <p className="text-2xl font-bold text-red-600">{currentSession.metrics.incorrectAnswers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">স্কোর</p>
            <p className="text-2xl font-bold text-indigo-600">
              {calculatePerformanceScore(currentSession.metrics)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
