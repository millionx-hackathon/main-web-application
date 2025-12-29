"use client";
import React from 'react';
import { StepContainer } from './StepContainer';
import { PlayCircle, Download, ArrowRight, AlertTriangle, BookOpen, Clock, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { studyPlan, recommendedVideos } from '../_data/recommendations';

interface UserData {
  studentClass: string;
  group: string;
  quizScore: number;
  quizAnswers: Record<string, unknown>;
}

interface RecommendationsStepProps {
  score: number;
  userData: UserData;
}

export const RecommendationsStep: React.FC<RecommendationsStepProps> = ({ score, userData }) => {
  const router = useRouter();

  // Mock Analysis based on prompt
  const analysis = {
    weakness: "পদার্থবিজ্ঞান (Physics)",
    strength: "জীববিজ্ঞান (Biology)",
    scorePercent: (score / 10) * 100
  };

  const handleDashboard = () => {
    // Redirect to dashboard (mock path)
    router.push('/dashboard');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
      {/* Header Result Card */}
      <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border border-white/20 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">বিশ্লেষণ সম্পন্ন হয়েছে!</h2>
              <p className="text-indigo-200 text-lg max-w-2xl">
                আপনার কুইজ পারফরম্যান্সের ওপর ভিত্তি করে আমরা আপনার জন্য একটি বিশেষায়িত অধ্যয়ন পরিকল্পনা (Study Plan) তৈরি করেছি।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 col-span-2 md:col-span-1 text-center md:text-left">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">{score}/10</div>
              <div className="text-sm font-medium text-emerald-100 uppercase tracking-wider">সর্বমোট স্কোর</div>
            </div>
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 col-span-2 md:col-span-1">
              <div className="text-sm font-medium text-purple-200 uppercase tracking-wider mb-2">পজিশন</div>
              <div className="text-2xl font-bold text-white mb-1">Top 15%</div>
              <div className="w-full h-1.5 bg-white/20 rounded-full mt-2">
                <div className="w-[85%] h-full bg-purple-400 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="text-sm font-medium text-yellow-200 uppercase tracking-wider mb-2">উন্নতি প্রয়োজন</div>
              <div className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {analysis.weakness}
              </div>
            </div>
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="text-sm font-medium text-blue-200 uppercase tracking-wider mb-2">শক্তিশালী দিক</div>
              <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <Target className="w-5 h-5 flex-shrink-0" />
                {analysis.strength}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Detailed Priority Outline - Spans 2 columns */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 text-white h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center text-indigo-300">
              <span className="bg-indigo-500/20 p-2 rounded-xl mr-3">📚</span>
              সাজেশন্স ও চ্যাপ্টার আউটলাইন
            </h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold border border-indigo-500/30">
              Day 1 - 7
            </span>
          </div>

          <div className="space-y-4">
            {studyPlan.map((plan, idx) => (
              <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="min-w-[120px]">
                    <span className={`
                      inline-block px-3 py-1 rounded-lg text-xs font-bold mb-2
                      ${plan.color === 'red' ? 'bg-red-500/20 text-red-300' :
                        plan.color === 'yellow' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}
                    `}>
                      {plan.priority}
                    </span>
                    <h4 className="font-bold text-lg text-white/90">{plan.subject}</h4>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
                      <p className="font-medium text-indigo-100">{plan.chapter}</p>
                    </div>
                    <p className="text-sm text-gray-400 pl-6 border-l-2 border-white/10 ml-2">
                      <span className="text-gray-300 font-medium">Topics: </span>
                      {plan.topics}
                    </p>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-black/20 rounded-lg">
                      <Clock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-emerald-100">
                        <span className="font-bold">Action Plan: </span>
                        {plan.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 py-4 rounded-xl transition-all text-sm font-bold border border-white/10 hover:border-white/30 group">
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>সম্পূর্ণ রুটিন ও স্টাডি ম্যাটেরিয়াল ডাউনলোড করুন (PDF)</span>
          </button>
        </div>

        {/* Recommended Sources - Spans 1 column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-indigo-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-indigo-900/50">
             <h3 className="text-lg font-bold mb-2">আজকের লক্ষ্য</h3>
             <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="text-3xl font-bold mb-1">২.৫ ঘণ্টা</div>
                <div className="text-xs text-indigo-200">আজকের নির্ধারিত সময়</div>
             </div>
             <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                স্টাডি শুরু করুন
             </button>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white h-fit">
            <h3 className="text-xl font-bold mb-6 flex items-center text-pink-300">
              <span className="bg-pink-500/20 p-2 rounded-xl mr-3">▶️</span>
              সাজেশন্সের ক্লাসসমূহ
            </h3>
            <div className="space-y-4">
              {recommendedVideos.map(rec => (
                <a href={rec.url} key={rec.id} className="flex gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all group cursor-pointer border border-transparent hover:border-white/10">
                  <div className={`w-16 h-16 rounded-xl ${rec.thumbnail} flex items-center justify-center text-white/70 group-hover:text-white shadow-lg`}>
                     <PlayCircle className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-pink-200 transition-colors">
                      {rec.title}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {rec.platform}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{rec.duration}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-center md:justify-end pt-8">
        <button
          onClick={handleDashboard}
          className="w-full md:w-auto bg-white text-indigo-950 px-10 py-4 rounded-full font-bold text-xl hover:bg-indigo-50 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          ড্যাশবোর্ডে যান
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
