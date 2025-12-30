"use client";

import React from 'react';
import { TrendingUp, Clock, BookOpen, Target, Award, BarChart3, X } from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';

interface ProgressInsightsProps {
  bookId: string;
  chapterId: string;
  totalPages: number;
  chapterTitle: string;
  onClose: () => void;
}

export default function ProgressInsights({
  bookId,
  chapterId,
  totalPages,
  chapterTitle,
  onClose,
}: ProgressInsightsProps) {
  const session = useAppSelector(
    (state) => state.bookReader?.readingSessions?.[`${bookId}/${chapterId}`]
  );
  const lastReadPage = useAppSelector(
    (state) => state.bookReader?.lastReadPages?.[`${bookId}/${chapterId}`] || 0
  );
  const flashcards = useAppSelector(
    (state) => state.bookReader?.flashcards?.[`${bookId}/${chapterId}`] || []
  );
  const summaries = useAppSelector(
    (state) => state.bookReader?.pageSummaries?.[`${bookId}/${chapterId}`] || []
  );

  const [now] = React.useState(() => Date.now());

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 bengali-text">এখনও কোনো ডেটা নেই</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = totalPages > 0 ? Math.round((lastReadPage / totalPages) * 100) : 0;
  const readingTime = session.readingTime || 0;
  const readingTimeHours = Math.floor(readingTime / 3600);
  const readingTimeMinutes = Math.floor((readingTime % 3600) / 60);
  const estimatedTimeRemaining = totalPages > 0 && lastReadPage > 0
    ? Math.round((readingTime / lastReadPage) * (totalPages - lastReadPage))
    : 0;
  const estimatedHours = Math.floor(estimatedTimeRemaining / 3600);
  const estimatedMinutes = Math.floor((estimatedTimeRemaining % 3600) / 60);

  const lastReadAt = session.lastReadAt || now;
  const lastReadDate = new Date(lastReadAt);
  const daysSinceLastRead = Math.floor((now - lastReadAt) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <div>
              <h2 className="font-bold text-lg">পঠন বিশ্লেষণ</h2>
              <p className="text-sm text-indigo-100">{chapterTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 bengali-text">অগ্রগতি</h3>
              <span className="text-2xl font-bold text-indigo-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="bengali-text">পৃষ্ঠা {lastReadPage} / {totalPages}</span>
              <span className="bengali-text">{totalPages - lastReadPage} পৃষ্ঠা বাকি</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Reading Time */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 bengali-text">পঠন সময়</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {readingTimeHours > 0 ? `${readingTimeHours}ঘ ` : ''}
                {readingTimeMinutes}মি
              </p>
              <p className="text-xs text-gray-600 mt-1 bengali-text">
                গড়: {lastReadPage > 0 ? Math.round(readingTime / lastReadPage / 60) : 0} মিনিট/পৃষ্ঠা
              </p>
            </div>

            {/* Estimated Time */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900 bengali-text">আনুমানিক সময়</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {estimatedHours > 0 ? `${estimatedHours}ঘ ` : ''}
                {estimatedMinutes}মি
              </p>
              <p className="text-xs text-gray-600 mt-1 bengali-text">
                সম্পূর্ণ করতে
              </p>
            </div>

            {/* Flashcards */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900 bengali-text">ফ্ল্যাশকার্ড</h4>
              </div>
              <p className="text-2xl font-bold text-purple-600">{flashcards.length}</p>
              <p className="text-xs text-gray-600 mt-1 bengali-text">
                তৈরি করা হয়েছে
              </p>
            </div>

            {/* Summaries */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900 bengali-text">সারাংশ</h4>
              </div>
              <p className="text-2xl font-bold text-orange-600">{summaries.length}</p>
              <p className="text-xs text-gray-600 mt-1 bengali-text">
                পৃষ্ঠা সারাংশ
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 bengali-text">অতিরিক্ত তথ্য</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 bengali-text">শেষ পড়া:</span>
                  <span className="font-medium text-gray-900">
                    {daysSinceLastRead === 0
                      ? 'আজ'
                      : daysSinceLastRead === 1
                      ? 'গতকাল'
                      : `${daysSinceLastRead} দিন আগে`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 bengali-text">বুকমার্ক:</span>
                  <span className="font-medium text-gray-900">{session.bookmarks?.length || 0}টি</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 bengali-text">হাইলাইট:</span>
                  <span className="font-medium text-gray-900">{session.highlightedPages?.length || 0}টি পৃষ্ঠা</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {progressPercentage < 50 && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 bengali-text">সুপারিশ</h4>
                    <p className="text-sm text-gray-700 bengali-text">
                      আপনি এখনও অধ্যায়ের অর্ধেক পড়েননি। নিয়মিত পড়ার অভ্যাস গড়ে তুলুন!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {progressPercentage >= 50 && progressPercentage < 100 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 bengali-text">চমৎকার!</h4>
                    <p className="text-sm text-gray-700 bengali-text">
                      আপনি অর্ধেকের বেশি পড়েছেন। শেষ পর্যন্ত চালিয়ে যান!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {progressPercentage === 100 && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 bengali-text">অভিনন্দন!</h4>
                    <p className="text-sm text-gray-700 bengali-text">
                      আপনি এই অধ্যায় সম্পূর্ণ করেছেন! পরবর্তী অধ্যায়ে এগিয়ে যান।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

