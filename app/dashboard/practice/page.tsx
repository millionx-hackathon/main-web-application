"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const overallStats = useAppSelector((state) => state.practice?.overallStats || {
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
  });

  const sessionHistory = useAppSelector((state) => state.practice?.sessionHistory || []);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const subjects = [
    {
      id: 'physics',
      name: 'পদার্থবিজ্ঞান',
      icon: Zap,
      color: 'bg-blue-500',
      chapters: [
        { id: 'ch3', name: 'অধ্যায় ৩: চাপ ও পদার্থের অবস্থা', available: true },
        { id: 'ch4', name: 'অধ্যায় ৪: বল ও গতি', available: false },
        { id: 'ch5', name: 'অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা', available: false }
      ]
    },
    {
      id: 'chemistry',
      name: 'রসায়ন',
      icon: BookOpen,
      color: 'bg-green-500',
      chapters: [
        { id: 'ch1', name: 'অধ্যায় ১: পদার্থের গঠন', available: false },
        { id: 'ch2', name: 'অধ্যায় ২: পরমাণুর গঠন', available: false }
      ]
    },
    {
      id: 'biology',
      name: 'জীববিজ্ঞান',
      icon: Target,
      color: 'bg-purple-500',
      chapters: [
        { id: 'ch1', name: 'অধ্যায় ১: কোষ', available: false },
        { id: 'ch2', name: 'অধ্যায় ২: টিস্যু', available: false }
      ]
    }
  ];

  // Format recent sessions from Redux
  const recentSessions = (sessionHistory || []).slice(0, 5).map((session) => {
    const score = session.metrics.totalQuestions > 0
      ? Math.round((session.metrics.correctAnswers / session.metrics.totalQuestions) * 100)
      : 0;
    const duration = session.endTime && session.startTime
      ? Math.round((session.endTime - session.startTime) / 60000)
      : 0;

    const difficultyLabels: Record<string, string> = {
      easy: 'সহজ',
      medium: 'মধ্যম',
      hard: 'কঠিন'
    };

    const getTimeAgo = (timestamp: number) => {
      const diff = Date.now() - timestamp;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return 'আজ';
      if (days === 1) return 'গতকাল';
      return `${days} দিন আগে`;
    };

    return {
      id: session.id,
      subject: session.subject === 'physics' ? 'পদার্থবিজ্ঞান' : session.subject,
      chapter: session.chapter === 'ch3' ? 'অধ্যায় ৩: চাপ ও পদার্থের অবস্থা' : session.chapter,
      difficulty: difficultyLabels[session.difficulty] || session.difficulty,
      score,
      date: session.endTime ? getTimeAgo(session.endTime) : 'সম্পন্ন',
      time: `${duration} মিনিট`
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white">
              <Target className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            অভিযোজিত অনুশীলন
          </h1>
          <p className="text-gray-600 text-lg">
            AI-চালিত ব্যক্তিগতকৃত প্রশ্ন সেটের মাধ্যমে দক্ষতা উন্নয়ন করুন
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{overallStats.totalQuestions || 0}</h3>
          <p className="text-xs md:text-sm text-gray-500 font-medium">মোট অনুশীলন</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            {overallStats.averageScore > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {overallStats.averageScore >= 80 ? '✓ ভালো' : overallStats.averageScore >= 60 ? '→ উন্নতি' : ''}
              </span>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{overallStats.averageScore || 0}%</h3>
          <p className="text-xs md:text-sm text-gray-500 font-medium">গড় স্কোর</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{overallStats.totalSessions || 0}</h3>
          <p className="text-xs md:text-sm text-gray-500 font-medium">সম্পন্ন সেশন</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Award className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{overallStats.currentStreak || 0}</h3>
          <p className="text-xs md:text-sm text-gray-500 font-medium">বর্তমান স্ট্রিক</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Selection */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              বিষয় নির্বাচন করুন
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {subjects.map((subject) => {
                const Icon = subject.icon;
                const isSelected = selectedSubject === subject.id;
                return (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubject(subject.id);
                      setSelectedChapter(null);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{subject.name}</h3>
                    <p className="text-sm text-gray-500">
                      {subject.chapters.filter(c => c.available).length} অধ্যায় উপলব্ধ
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selection */}
          {selectedSubject && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-in slide-in-from-top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                অধ্যায় নির্বাচন করুন
              </h2>
              <div className="space-y-3">
                {subjects
                  .find(s => s.id === selectedSubject)
                  ?.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={chapter.available ? `/dashboard/practice/${selectedSubject}/${chapter.id}` : '#'}
                      className={`block p-4 rounded-xl border-2 transition-all ${
                        chapter.available
                          ? 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{chapter.name}</h3>
                          {!chapter.available && (
                            <p className="text-sm text-gray-500 mt-1">শীঘ্রই আসছে</p>
                          )}
                        </div>
                        {chapter.available && (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              সাম্প্রতিক সেশন
            </h2>
            <div className="space-y-4">
              {recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{session.chapter}</p>
                        <p className="text-xs text-gray-500 mt-1">{session.difficulty} • {session.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-indigo-600">{session.score}%</span>
                        <p className="text-xs text-gray-500">{session.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">কোনো সেশন নেই</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              আজকের সারাংশ
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-indigo-100">অনুশীলন সময়</span>
                <span className="font-bold">{Math.floor(overallStats.totalTimeSpent / 60)} মিনিট</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-100">সম্পন্ন প্রশ্ন</span>
                <span className="font-bold">{overallStats.totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-100">গড় স্কোর</span>
                <span className="font-bold">{overallStats.averageScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
