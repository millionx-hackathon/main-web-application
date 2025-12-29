"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Zap,
  CheckCircle2,
  Flame,
  Bookmark,
  FileText,
  Star,
  Calendar,
  Activity,
  Trophy,
  Brain,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { getBookById } from '@/app/dashboard/book-reader/_data/books';
import {
  setLastReadPage,
  updateReadingTime,
  toggleBookmark,
  addFlashcard,
  addPageSummary,
} from '@/lib/store/slices/bookReaderSlice';
import Link from 'next/link';

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// Helper function to format date
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'আজ';
  if (days === 1) return 'গতকাল';
  if (days < 7) return `${days} দিন আগে`;
  if (days < 30) return `${Math.floor(days / 7)} সপ্তাহ আগে`;
  return `${Math.floor(days / 30)} মাস আগে`;
};

export default function ProgressPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const bookReaderState = useAppSelector((state) => state.bookReader);
  const practiceState = useAppSelector((state) => state.practice);

  // Initialize demo data on first load
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);

    // Check if demo data has been initialized
    const demoInitialized = localStorage.getItem('progress_demo_initialized');

    if (!demoInitialized) {
      // Initialize demo reading data
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      // Demo reading sessions
      dispatch(
        setLastReadPage({
          bookId: 'physics-9-10',
          chapterId: 'ch1',
          page: 15,
        })
      );
      dispatch(
        updateReadingTime({
          bookId: 'physics-9-10',
          chapterId: 'ch1',
          timeSpent: 1800, // 30 minutes
        })
      );
      dispatch(
        toggleBookmark({
          bookId: 'physics-9-10',
          chapterId: 'ch1',
          page: 10,
        })
      );
      dispatch(
        toggleBookmark({
          bookId: 'physics-9-10',
          chapterId: 'ch1',
          page: 15,
        })
      );

      dispatch(
        setLastReadPage({
          bookId: 'physics-9-10',
          chapterId: 'ch2',
          page: 8,
        })
      );
      dispatch(
        updateReadingTime({
          bookId: 'physics-9-10',
          chapterId: 'ch2',
          timeSpent: 1200, // 20 minutes
        })
      );

      // Demo flashcards
      dispatch(
        addFlashcard({
          bookId: 'physics-9-10',
          chapterId: 'ch1',
          flashcard: {
            id: 'demo-flashcard-1',
            front: 'ভৌত রাশি কী?',
            back: 'যে রাশি পরিমাপ করা যায় তাকে ভৌত রাশি বলে।',
            page: 5,
            createdAt: oneDayAgo,
          },
        })
      );

      // Demo page summary
      dispatch(
        addPageSummary({
          bookId: 'physics-9-10',
          chapterId: 'ch1',
          summary: {
            page: 10,
            summary: 'এই পৃষ্ঠায় ভৌত রাশির প্রকারভেদ নিয়ে আলোচনা করা হয়েছে।',
            keyPoints: ['স্কেলার রাশি', 'ভেক্টর রাশি', 'পরিমাপের একক'],
            createdAt: oneDayAgo,
          },
        })
      );

      // Mark demo data as initialized
      // Practice sessions will be created naturally as users practice
      localStorage.setItem('progress_demo_initialized', 'true');
    }
  }, [dispatch]);

  // Calculate reading statistics
  const readingStats = useMemo(() => {
    const sessions = bookReaderState?.readingSessions || {};
    const sessionKeys = Object.keys(sessions);

    let totalPagesRead = 0;
    let totalReadingTime = 0;
    let totalBookmarks = 0;
    let totalHighlights = 0;
    let totalFlashcards = 0;
    let totalSummaries = 0;
    let booksInProgress = 0;
    let chaptersCompleted = 0;

    sessionKeys.forEach((key) => {
      const session = sessions[key];
      if (session) {
        totalPagesRead += session.totalPagesRead || 0;
        totalReadingTime += session.readingTime || 0;
        totalBookmarks += (session.bookmarks || []).length;
        totalHighlights += (session.highlightedPages || []).length;
      }
    });

    // Count flashcards
    const flashcards = bookReaderState?.flashcards || {};
    Object.values(flashcards).forEach((flashcardArray) => {
      totalFlashcards += flashcardArray?.length || 0;
    });

    // Count summaries
    const summaries = bookReaderState?.pageSummaries || {};
    Object.values(summaries).forEach((summaryArray) => {
      totalSummaries += summaryArray?.length || 0;
    });

    // Count books in progress
    booksInProgress = sessionKeys.length;

    // Calculate chapters completed (simplified - if last page is >= 90% of total)
    // For demo, we'll assume some chapters are completed
    chaptersCompleted = Math.floor(booksInProgress * 0.3);

    return {
      totalPagesRead,
      totalReadingTime,
      totalBookmarks,
      totalHighlights,
      totalFlashcards,
      totalSummaries,
      booksInProgress,
      chaptersCompleted,
    };
  }, [bookReaderState]);

  // Calculate practice statistics
  const practiceStats = useMemo(() => {
    const stats = practiceState?.overallStats || {
      totalSessions: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalTimeSpent: 0,
      topicMastery: {},
      difficultyStats: {
        easy: { sessions: 0, averageScore: 0 },
        medium: { sessions: 0, averageScore: 0 },
        hard: { sessions: 0, averageScore: 0 },
      },
    };

    return {
      totalSessions: stats.totalSessions || 0,
      totalQuestions: stats.totalQuestions || 0,
      totalCorrect: stats.totalCorrect || 0,
      averageScore: stats.averageScore || 0,
      currentStreak: stats.currentStreak || 0,
      longestStreak: stats.longestStreak || 0,
      totalTimeSpent: stats.totalTimeSpent || 0,
      topicMastery: stats.topicMastery || {},
      difficultyStats: stats.difficultyStats || {
        easy: { sessions: 0, averageScore: 0 },
        medium: { sessions: 0, averageScore: 0 },
        hard: { sessions: 0, averageScore: 0 },
      },
    };
  }, [practiceState]);

  // Get recent reading sessions
  const recentReadingSessions = useMemo(() => {
    const sessions = bookReaderState?.readingSessions || {};
    return Object.entries(sessions)
      .map(([key, session]) => {
        const [bookId, chapterId] = key.split('/');
        const book = getBookById(bookId);
        const chapter = book?.chapters.find((ch) => ch.id === chapterId);
        return {
          key,
          bookId,
          chapterId,
          bookTitle: book?.title || 'Unknown Book',
          chapterTitle: chapter?.title || 'Unknown Chapter',
          lastReadAt: session.lastReadAt || 0,
          totalPagesRead: session.totalPagesRead || 0,
          readingTime: session.readingTime || 0,
          bookmarks: (session.bookmarks || []).length,
          highlights: (session.highlightedPages || []).length,
        };
      })
      .sort((a, b) => b.lastReadAt - a.lastReadAt)
      .slice(0, 5);
  }, [bookReaderState]);

  // Get recent practice sessions
  const recentPracticeSessions = useMemo(() => {
    const history = practiceState?.sessionHistory || [];
    return history.slice(0, 5).map((session) => {
      const score =
        session.metrics.totalQuestions > 0
          ? Math.round(
              (session.metrics.correctAnswers /
                session.metrics.totalQuestions) *
                100
            )
          : 0;
      const duration =
        session.endTime && session.startTime
          ? Math.round((session.endTime - session.startTime) / 60000)
          : 0;

      return {
        id: session.id,
        subject: session.subject,
        chapter: session.chapter,
        difficulty: session.difficulty,
        score,
        duration,
        questions: session.metrics.totalQuestions,
        correct: session.metrics.correctAnswers,
        completedAt: session.endTime || 0,
      };
    });
  }, [practiceState]);

  // Calculate topic mastery percentages
  const topicMasteryData = useMemo(() => {
    const mastery = practiceStats.topicMastery;
    return Object.entries(mastery)
      .map(([topic, data]) => {
        const percentage =
          data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        return {
          topic,
          percentage,
          correct: data.correct,
          total: data.total,
          lastPracticed: data.lastPracticed,
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);
  }, [practiceStats.topicMastery]);

  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    const readingWeight = 0.4;
    const practiceWeight = 0.6;

    // Reading progress (simplified: based on pages read and time spent)
    const readingProgress = Math.min(
      100,
      (readingStats.totalPagesRead / 100) * 50 +
        Math.min(50, (readingStats.totalReadingTime / 3600) * 10)
    );

    // Practice progress (based on sessions and accuracy)
    const practiceProgress = Math.min(
      100,
      (practiceStats.totalSessions / 20) * 40 +
        (practiceStats.averageScore / 100) * 60
    );

    return Math.round(
      readingProgress * readingWeight + practiceProgress * practiceWeight
    );
  }, [readingStats, practiceStats]);

  if (!isMounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Progress Tracking
          </h1>
          <p className="text-gray-600">
            Track your learning journey and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            সপ্তাহ
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            মাস
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            সব
          </button>
        </div>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Overall Progress</h2>
            <p className="text-blue-100">
              Keep learning to unlock new achievements!
            </p>
          </div>
          <Trophy className="w-12 h-12 opacity-80" />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{overallProgress}%</span>
            <span className="text-sm text-blue-100">Complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reading Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">পৃষ্ঠা পড়া হয়েছে</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {readingStats.totalPagesRead}
          </div>
          <div className="text-sm text-gray-600">
            {readingStats.booksInProgress} বই পড়া হচ্ছে
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">পড়ার সময়</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatTime(readingStats.totalReadingTime)}
          </div>
          <div className="text-sm text-gray-600">
            {formatTime(practiceStats.totalTimeSpent)} অনুশীলন
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">অনুশীলন করা হয়েছে</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {practiceStats.totalQuestions}
          </div>
          <div className="text-sm text-gray-600">
            {practiceStats.totalSessions} সেশন
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">গড় স্কোর</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {practiceStats.averageScore}%
          </div>
          <div className="text-sm text-gray-600">
            {practiceStats.totalCorrect}/{practiceStats.totalQuestions} সঠিক
          </div>
        </div>
      </div>

      {/* Streaks and Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Current Streak</h3>
              <p className="text-sm text-gray-600">Consecutive days</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-orange-600">
            {practiceStats.currentStreak}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Best: {practiceStats.longestStreak} days
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Bookmarks</h3>
              <p className="text-sm text-gray-600">Saved pages</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-blue-600">
            {readingStats.totalBookmarks}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {readingStats.totalHighlights} highlights
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Flashcards</h3>
              <p className="text-sm text-gray-600">Created</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-purple-600">
            {readingStats.totalFlashcards}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {readingStats.totalSummaries} summaries
          </div>
        </div>
      </div>

      {/* Reading Progress and Practice Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Progress */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Reading Progress
            </h3>
            <Link
              href="/dashboard/book-reader"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {recentReadingSessions.length > 0 ? (
            <div className="space-y-4">
              {recentReadingSessions.map((session) => (
                <div
                  key={session.key}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {session.chapterTitle}
                      </h4>
                      <p className="text-sm text-gray-600">{session.bookTitle}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(session.lastReadAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{session.totalPagesRead} pages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(session.readingTime)}</span>
                    </div>
                    {session.bookmarks > 0 && (
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        <span>{session.bookmarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No reading sessions yet</p>
              <Link
                href="/dashboard/book-reader"
                className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Start reading →
              </Link>
            </div>
          )}
        </div>

        {/* Practice Progress */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Practice Sessions
            </h3>
            <Link
              href="/dashboard/practice"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {recentPracticeSessions.length > 0 ? (
            <div className="space-y-4">
              {recentPracticeSessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {session.chapter}
                      </h4>
                      <p className="text-sm text-gray-600">{session.subject}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          session.score >= 70
                            ? 'text-green-600'
                            : session.score >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {session.score}%
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(session.completedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {session.correct}/{session.questions} correct
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration}m</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        session.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : session.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {session.difficulty === 'easy'
                        ? 'সহজ'
                        : session.difficulty === 'medium'
                        ? 'মধ্যম'
                        : 'কঠিন'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No practice sessions yet</p>
              <Link
                href="/dashboard/practice"
                className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Start practicing →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Topic Mastery */}
      {topicMasteryData.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Topic Mastery
          </h3>
          <div className="space-y-4">
            {topicMasteryData.map((topic) => (
              <div key={topic.topic}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {topic.topic}
                  </span>
                  <span className="text-sm text-gray-600">
                    {topic.percentage}% ({topic.correct}/{topic.total})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      topic.percentage >= 80
                        ? 'bg-green-500'
                        : topic.percentage >= 60
                        ? 'bg-yellow-500'
                        : topic.percentage >= 40
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Last practiced: {formatDate(topic.lastPracticed)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Performance */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Performance by Difficulty
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
            const stats = practiceStats.difficultyStats[difficulty];
            const label =
              difficulty === 'easy'
                ? 'সহজ'
                : difficulty === 'medium'
                ? 'মধ্যম'
                : 'কঠিন';

            const getDifficultyClasses = (diff: string) => {
              if (diff === 'easy') {
                return 'border-2 border-green-200 rounded-lg p-4 bg-green-50';
              } else if (diff === 'medium') {
                return 'border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50';
              } else {
                return 'border-2 border-red-200 rounded-lg p-4 bg-red-50';
              }
            };

            return (
              <div
                key={difficulty}
                className={getDifficultyClasses(difficulty)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{label}</span>
                  <span className="text-sm text-gray-600">
                    {stats.sessions} sessions
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.averageScore}%
                </div>
                <div className="text-xs text-gray-600 mt-1">Average score</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
