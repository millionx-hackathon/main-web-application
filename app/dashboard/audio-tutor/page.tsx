"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Volume2,
  MessageSquare,
  Wand2,
  ChevronLeft,
  VolumeX,
  FastForward,
  Rewind,
  Info
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AudioMetadata {
  Type: string;
  Data: {
    Offset: number;
    Duration: number;
    text?: {
      Text: string;
    };
  };
}

function AudioTutorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [script, setScript] = useState<string | null>(null);
  const [scriptMetadata, setScriptMetadata] = useState<AudioMetadata[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [showExamples, setShowExamples] = useState(true);

  const examples = [
    {
      title: "সরণ ও ভেক্টর",
      text: "পদাথর্িবজ্ঞান – অধ,ায় ২ – গিত\nেভক্টর রািশ\nধেরা, তুিম 4m ব,াসােধর্র একিট বৃত্ত াকার পেথ 4 বার ঘুরেল এবং েযখান েথেকশ‌ুরু কের িছেল েসখােনই থামেল এরপর েতামােক যিদ িজেজ্ঞস করা হয় েতামার সরণ কতটুকু হেয়েছ? তুিম বলেব আিম 100 m অিতকৰ্ম কের েফেলিছ। িকন্তু মজার ব,াপার হেচ্ছ , েতামার অিতকৰ্ান্ত দুরতব্ 100 m হেলও সরণ 0। কারণ, েকােনা বস্তুর আিদ অবস্থান ও েশষ অবস্থােনর মধ,বতর্ী নূন,তম দূরতব্ অথর্াৎ সরলৈরিখক দুরতব্ ই হেচ্ছ সরেণর মান এবং সরেণর িদক হেচ্ছ বস্তুর আিদ অবস্থান েথেক েশষ অবস্থােনর িদেক। বৃত্ত াকার পেথ ঘুের আবার একই অবস্থােন আসেল েতামার আিদ ও অন্ত অবস্থান একই। তাই নয় িক বন্ধু রা? সরেণর মা'া হেলা *দেঘ-র মা'া। .যেহতু সরণ একিট িনিদর্ষ্ট িদক বরাবর সংঘিটত হয় তাই সরণ েভক্টর রািশ।"
    },
    {
      title: "নিউটনের ৩য় সূত্র",
      text: "নিউটনের গতির তৃতীয় সূত্রটি হলো: 'প্রত্যেক ক্রিয়ারই একটি সমান ও বিপরীত প্রতিক্রিয়া আছে।' এর মানে হলো, যখন একটি বস্তু অন্য একটি বস্তুর ওপর বল প্রয়োগ করে, তখন দ্বিতীয় বস্তুটিও প্রথম বস্তুর ওপর ঠিক একই পরিমাণ বল বিপরীত দিকে প্রয়োগ করে। যেমন- তুমি যখন মেঝের ওপর হাঁটো, তুমি তোমার পা দিয়ে মেঝেতে পেছন দিকে ধাক্কা দাও (ক্রিয়া), আর মেঝে তোমাকে সমান বলে সামনের দিকে এগিয়ে দেয় (প্রতিক্রিয়া)।"
    },
    {
      title: "পরমাণুর গঠন",
      text: "পরমাণু হলো পদার্থের ক্ষুদ্রতম কণা। একটি পরমাণুর কেন্দ্রে থাকে নিউক্লিয়াস, যেখানে প্রোটন এবং নিউট্রন অবস্থান করে। প্রোটন ধনাত্মক আধানযুক্ত এবং নিউট্রন আধানহীন। নিউক্লিয়াসের চারদিকে নির্দিষ্ট কক্ষপথে ইলেকট্রনগুলো ঘুরতে থাকে। ইলেকট্রন ঋণাত্মক আধানযুক্ত। প্রোটন এবং ইলেকট্রনের সংখ্যা সমান থাকে বলেই পরমাণু সামগ্রিকভাবে আধানহীন বা নিরপেক্ষ হয়।"
    }
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Try localStorage first (for long texts from reader)
    const savedContext = localStorage.getItem('audio_tutor_context');
    if (savedContext) {
      setText(savedContext);
      localStorage.removeItem('audio_tutor_context'); // Clean up
      return;
    }

    // Fallback to URL search params
    const context = searchParams.get('context');
    if (context) {
      setText(context);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setScript(null);
    setScriptMetadata([]);
    setCurrentWordIndex(-1);

    try {
      const response = await fetch('/api/audio-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          chapterTitle: 'Custom Request',
        }),
      });

      if (!response.ok) {
        throw new Error('অডিও তৈরি করতে সমস্যা হয়েছে।');
      }

      const data = await response.json();
      setScript(data.script);
      setScriptMetadata(data.metadata || []);

      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    } catch (err) {
      console.error('Audio Tutor Error:', err);
      setError(err instanceof Error ? err.message : 'অডিও তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const timeInTicks = audioRef.current.currentTime * 10000000;
      setCurrentTime(audioRef.current.currentTime);

      if (scriptMetadata.length > 0) {
        const currentWord = scriptMetadata.findIndex(meta =>
          meta.Type === 'WordBoundary' &&
          timeInTicks >= meta.Data.Offset &&
          timeInTicks <= (meta.Data.Offset + meta.Data.Duration + 2000000)
        );
        if (currentWord !== -1 && currentWord !== currentWordIndex) {
          setCurrentWordIndex(currentWord);
          wordRefs.current[currentWord]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderScript = () => {
    if (!script) return null;
    if (scriptMetadata.length === 0) return script;

    const words = scriptMetadata.filter(m => m.Type === 'WordBoundary');
    wordRefs.current = wordRefs.current.slice(0, words.length);

    return (
      <div className="flex flex-wrap gap-x-1.5 gap-y-1">
        {words.map((meta, idx) => (
          <span
            key={idx}
            ref={el => { wordRefs.current[idx] = el; }}
            className={`transition-all duration-300 rounded px-1 py-0.5 text-sm ${
              idx === currentWordIndex
                ? 'bg-indigo-600 text-white shadow-md scale-110 font-bold z-10'
                : idx < currentWordIndex
                ? 'text-slate-900 font-medium'
                : 'text-slate-400 opacity-60'
            }`}
          >
            {meta.Data.text?.Text || ''}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">ফিরে যান</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Headphones className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-slate-900 hidden sm:block">শিক্ষা ভাই - Audio Tutor</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-bold">টেক্সট লিখুন</span>
                </div>
                <span className="text-xs text-slate-400">{text.length} ক্যারেক্টার</span>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="এখানে বইয়ের অংশ বা আপনার প্রশ্ন লিখুন যা শিক্ষা ভাই বুঝিয়ে বলবে..."
                className="w-full h-80 p-5 focus:outline-none text-slate-700 bg-transparent resize-none leading-relaxed"
                disabled={isGenerating}
              />

              {showExamples && !text && (
                <div className="px-5 pb-5 flex flex-wrap gap-2">
                  <p className="w-full text-xs text-slate-400 mb-1 font-medium">নিচের উদাহরণগুলো ট্রাই করুন:</p>
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setText(ex.text)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-xs text-indigo-600 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium"
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setText('')}
                  className="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors"
                >
                  Clear Text
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!text.trim() || isGenerating}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-200"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      স্ক্রিপ্ট তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      বুঝিয়ে বলো
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
                <VolumeX className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className={`bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 transition-all ${!audioUrl && 'opacity-50 grayscale pointer-events-none'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md relative group cursor-help">
                  <Info className="w-5 h-5" />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900/90 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm border border-white/10 shadow-xl z-50">
                    The audio is played using no external services! It uses the Edge-TTS (Neural Engine) protocol in real-time.
                  </div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                  Neural HQ Audio
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 relative">
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                  )}
                  <Headphones className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-1">শিক্ষা ভাই ব্যাখ্যা করছে</h3>
                <p className="text-indigo-100 text-xs opacity-80">Storytelling Explanation</p>
              </div>

              <div className="space-y-2 mb-8">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[10px] font-mono opacity-80">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => {if(audioRef.current) audioRef.current.currentTime -= 10}}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Rewind className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>

                <button
                  onClick={() => {if(audioRef.current) audioRef.current.currentTime += 10}}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <FastForward className="w-6 h-6 fill-current" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={handleRateChange}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
                >
                  {playbackRate}x Speed
                </button>

                {audioUrl && (
                  <a
                    href={audioUrl}
                    download="shikkha-bhai-explanation.mp3"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default function AudioTutorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Audio Tutor...</div>}>
      <AudioTutorContent />
    </Suspense>
  );
}
