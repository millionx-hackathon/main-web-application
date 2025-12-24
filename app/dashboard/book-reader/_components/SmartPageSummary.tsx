"use client";

import React, { useState } from 'react';
import { FileText, Loader2, X, Check } from 'lucide-react';
import { useAppDispatch } from '@/lib/store/hooks';
import { addPageSummary } from '@/lib/store/slices/bookReaderSlice';

interface SmartPageSummaryProps {
  bookId: string;
  chapterId: string;
  currentPage: number;
  chapterTitle: string;
  onClose: () => void;
}

export default function SmartPageSummary({
  bookId,
  chapterId,
  currentPage,
  chapterTitle,
  onClose,
}: SmartPageSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    // Generate summary based on page and chapter
    const generateSummary = () => {
      setIsGenerating(true);

      // Simulate AI generation
      setTimeout(() => {
        // Mock summary based on chapter
        let mockSummary = '';
        let mockKeyPoints: string[] = [];

        if (chapterId === 'ch2' || chapterId === 'chapter-2') {
          mockSummary = `পৃষ্ঠা ${currentPage} এ গতি সম্পর্কিত গুরুত্বপূর্ণ বিষয় নিয়ে আলোচনা করা হয়েছে।\n\nএই পৃষ্ঠায় আলোচিত মূল বিষয়:\n\n• গতির ধারণা এবং এর প্রকারভেদ\n• স্থিতি ও গতির পার্থক্য\n• পরসঙ্গ কাঠামোর গুরুত্ব\n• বিভিন্ন প্রকার গতি: রৈখিক, ঘূর্ণন, চলন, পর্যায়বৃত্ত\n\nএই বিষয়গুলো পদার্থবিজ্ঞানের ভিত্তি হিসেবে কাজ করে এবং পরবর্তী অধ্যায়গুলো বুঝতে সহায়তা করে।`;
          mockKeyPoints = [
            'গতি হলো পরসঙ্গ কাঠামোর সাপেক্ষে বস্তুর অবস্থানের পরিবর্তন',
            'স্থিতি এবং গতির পার্থক্য পরসঙ্গ কাঠামোর উপর নির্ভর করে',
            'রৈখিক, ঘূর্ণন, চলন এবং পর্যায়বৃত্ত - এই চার প্রকার গতি',
            'পরসঙ্গ কাঠামো ছাড়া গতি নির্ধারণ করা সম্ভব নয়',
          ];
        } else {
          mockSummary = `পৃষ্ঠা ${currentPage} এ ভৌত রাশি এবং পরিমাপ সম্পর্কিত বিষয় নিয়ে আলোচনা করা হয়েছে।\n\nএই পৃষ্ঠায় আলোচিত মূল বিষয়:\n\n• ভৌত রাশির ধারণা এবং গুরুত্ব\n• পরিমাপের পদ্ধতি এবং একক\n• পরিমাপের যন্ত্রপাতি\n• নির্ভুলতা এবং যথার্থতা\n\nএই বিষয়গুলো পদার্থবিজ্ঞানের ভিত্তি হিসেবে কাজ করে।`;
          mockKeyPoints = [
            'ভৌত রাশি হলো পরিমাপযোগ্য রাশি',
            'পরিমাপের জন্য সঠিক একক ব্যবহার করা প্রয়োজন',
            'নির্ভুলতা এবং যথার্থতা পরিমাপের গুরুত্বপূর্ণ বৈশিষ্ট্য',
            'পরিমাপের যন্ত্রপাতি সঠিকভাবে ব্যবহার করতে হবে',
          ];
        }

        setSummary(mockSummary);
        setKeyPoints(mockKeyPoints);
        setIsGenerating(false);

        // Save to Redux
        dispatch(addPageSummary({
          bookId,
          chapterId,
          summary: {
            page: currentPage,
            summary: mockSummary,
            keyPoints: mockKeyPoints,
            createdAt: Date.now(),
          },
        }));
      }, 2000);
    };

    generateSummary();
  }, [bookId, chapterId, currentPage, dispatch]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="font-bold text-lg">পৃষ্ঠা {currentPage} এর সারাংশ</h2>
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
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600 bengali-text">সারাংশ তৈরি হচ্ছে...</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 bengali-text">সারাংশ</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap bengali-text leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>

              {/* Key Points */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 bengali-text">মূল বিষয়সমূহ</h3>
                <ul className="space-y-2">
                  {keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 bengali-text">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
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


