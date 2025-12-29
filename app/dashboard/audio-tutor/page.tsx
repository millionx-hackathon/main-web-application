"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  Rewind
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AudioTutorPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [script, setScript] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setScript(null);

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

      // Extract generated script from header if available
      const generatedScript = response.headers.get('X-Generated-Script');
      if (generatedScript) {
        setScript(decodeURIComponent(generatedScript));
      }

      const blob = await response.blob();
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
      setCurrentTime(audioRef.current.currentTime);
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
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

          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Input */}
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

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
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

          {/* Right Column: Player & Script */}
          <div className="lg:col-span-5 space-y-6">
            {/* Player Card */}
            <div className={`bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 transition-all ${!audioUrl && 'opacity-50 grayscale pointer-events-none'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Sparkles className="w-5 h-5" />
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

              {/* Progress Slider */}
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

              {/* Controls */}
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

            {/* Script Display */}
            {script && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                  শিক্ষা ভাই-এর স্ক্রিপ্ট
                </h4>
                <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {script}
                </div>
              </div>
            )}
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
