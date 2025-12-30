"use client";
import React, { useState } from 'react';
import { IntroStep } from './_components/IntroStep';
import { GroupSelectionStep } from './_components/GroupSelectionStep';
import { QuizStep } from './_components/QuizStep';
import { RecommendationsStep } from './_components/RecommendationsStep';

interface UserData {
  studentClass: string;
  group: string;
  quizScore: number;
  quizAnswers: Record<string, unknown>;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    studentClass: '',
    group: '',
    quizScore: 0,
    quizAnswers: {}
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleClassSelect = (cls: string) => {
    setUserData(prev => ({ ...prev, studentClass: cls }));
    const classNum = parseInt(cls);
    if (classNum >= 9) {
      setStep(2); // Go to Group selection
    } else {
      setStep(3); // Skip to Quiz (or skip quiz entirely logic here)
    }
  };

  const handleGroupSelect = (grp: string) => {
    setUserData(prev => ({ ...prev, group: grp }));
    setStep(3); // Go to Quiz
  };

  const handleQuizFinish = (score: number, answers: Record<string, unknown>) => {
    setUserData(prev => ({ ...prev, quizScore: score, quizAnswers: answers }));
    setStep(4); // Go to Recommendations
  };

  return (
    <main className="min-h-screen w-full bg-[#0f172a] text-white overflow-x-hidden relative flex flex-col items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Progress Dots */}
        <div className="flex space-x-3 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${
                s === step ? 'w-8 bg-indigo-500' :
                s < step ? 'w-2 bg-indigo-500/50' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Dynamic Step Rendering */}
        <div className="w-full transition-all duration-500 ease-in-out">
          {step === 1 && (
            <IntroStep onNext={handleClassSelect} />
          )}

          {step === 2 && (
            <GroupSelectionStep
              onNext={handleGroupSelect}
              onBack={prevStep}
            />
          )}

          {step === 3 && (
            <QuizStep onFinish={handleQuizFinish} />
          )}

          {step === 4 && (
            <RecommendationsStep score={userData.quizScore} userData={userData} />
          )}
        </div>
      </div>
    </main>
  );
}
