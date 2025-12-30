"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, Loader2, Sparkles, FileQuestion, Trash2, Copy, Check, Headphones, Play, Pause, RotateCcw, Volume2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import StreamingMessage from './StreamingMessage';
import QuizGenerator from './QuizGenerator';
import { getPageQuestions, getRandomSuggestion, PageQuestion } from '@/app/dashboard/book-reader/_data/pageQuestions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  quotes?: Array<{ text: string; page: number }>;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  contextItems: Array<{ text: string; page: number }>;
  currentPage: number;
  chapterTitle: string;
  chapterId?: string;
  bookId?: string;
  pdfScale?: number;
  pageText?: string; // Extracted text from current PDF page
  onClearContext: () => void;
  onAddContext?: (text: string, page: number) => void;
}

export default function ChatSidebar({
  isOpen,
  onClose,
  contextItems,
  currentPage,
  chapterTitle,
  chapterId = 'ch1',
  bookId,
  pdfScale = 1.2,
  pageText,
  onClearContext,
  onAddContext,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [pageContextLoading, setPageContextLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastLoadedPage, setLastLoadedPage] = useState<number | null>(null);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioScript, setAudioScript] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Listen for askAI events
  useEffect(() => {
    const handleAskAI = (e: CustomEvent) => {
      if (e.detail?.text) {
        handleAskAIQuestion(e.detail.text);
      }
    };

    window.addEventListener('askAI' as keyof WindowEventMap, handleAskAI as EventListener);
    return () => {
      window.removeEventListener('askAI' as keyof WindowEventMap, handleAskAI as EventListener);
    };
  }, [currentPage, chapterTitle]);

  const handleAskAIQuestion = async (text: string) => {
    const questionMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `এই অংশ সম্পর্কে ব্যাখ্যা করুন: "${text}"`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, questionMessage]);
    setIsLoading(true);
    setSuggestedQuestions([]);

    // Build context with the selected text
    const selectedContext = [{ text, page: currentPage }];

    try {
      const response = await fetch('/api/reader-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `এই অংশটি ব্যাখ্যা করুন: "${text}"`,
          contextItems: selectedContext,
          currentPage,
          chapterTitle,
          chapterId,
          bookId,
          pageText, // Include extracted PDF page text
          chatHistory: [],
        }),
      });

      const data = await response.json();

      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: data.success ? data.response : (data.error || 'দুঃখিত, উত্তর দিতে সমস্যা হয়েছে।'),
        quotes: [{ text, page: currentPage }],
        timestamp: new Date(),
        isStreaming: data.success,
      };
      setMessages(prev => [...prev, aiMessage]);

      if (data.success) {
        setTimeout(() => {
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, isStreaming: false }
              : msg
          ));
          setIsLoading(false);
        }, Math.min(data.response.length * 20, 3000));
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Ask AI Error:', error);
      // Fallback response
      const responseText = `আপনার নির্বাচিত অংশটি ${chapterTitle} অধ্যায়ের একটি গুরুত্বপূর্ণ বিষয় নির্দেশ করে।\n\nএই অংশে আলোচিত বিষয়টি পদার্থবিজ্ঞানের ইতিহাস এবং এর বিকাশের সাথে সম্পর্কিত। আপনি যদি এই বিষয়ের কোনো নির্দিষ্ট দিক সম্পর্কে জানতে চান, তাহলে আমাকে জিজ্ঞাসা করুন।`;

      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: responseText,
        quotes: [{ text, page: currentPage }],
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages(prev => [...prev, aiMessage]);

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, isStreaming: false }
            : msg
        ));
        setIsLoading(false);
      }, 1000 + responseText.length * 30 + 500);
    }
  };

  // Load page context when chat opens or page changes (only if no messages exist)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Only load if page changed or not loaded yet
      if (lastLoadedPage !== currentPage) {
        setPageContextLoading(true);
        setSuggestedQuestions([]);

        // Simulate loading context for the page
        setTimeout(() => {
          const pageData = getPageQuestions(chapterId, currentPage);
          if (pageData.suggestions.length > 0) {
            setSuggestedQuestions(pageData.suggestions);
          } else {
            // Fallback suggestions
            setSuggestedQuestions([
              `এই অধ্যায়ে ${chapterTitle} সম্পর্কে মূল ধারণাগুলো কী?`,
              'এই পৃষ্ঠায় কী আলোচনা করা হয়েছে?',
              'এই বিষয়টি আরো বিস্তারিতভাবে ব্যাখ্যা করুন',
            ]);
          }
          setPageContextLoading(false);
          setLastLoadedPage(currentPage);
        }, 1500); // 1.5 second loading
      }
    } else if (messages.length > 0) {
      // If messages exist, don't reload questions when page changes
      // Just update the last loaded page to prevent reloading
      if (lastLoadedPage !== currentPage) {
        setLastLoadedPage(currentPage);
      }
    }
  }, [isOpen, currentPage, messages.length, chapterId, chapterTitle, lastLoadedPage]);

  // Simulate context loading for selected items
  useEffect(() => {
    if (isOpen && contextItems.length > 0 && !contextLoaded) {
      setContextLoading(true);
      setTimeout(() => {
        setContextLoading(false);
        setContextLoaded(true);
      }, 2000);
    }
  }, [isOpen, contextItems, contextLoaded]);

  // Scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll during streaming
  useEffect(() => {
    const hasStreaming = messages.some(m => m.isStreaming);
    if (hasStreaming) {
      const interval = setInterval(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const question = input;
    setInput('');
    setIsLoading(true);
    setSuggestedQuestions([]);

    // Prepare chat history for context (last 10 messages)
    const chatHistory = messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // Call the real AI API
      const response = await fetch('/api/reader-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          contextItems,
          currentPage,
          chapterTitle,
          chapterId,
          bookId,
          pageText, // Include extracted PDF page text
          chatHistory,
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          quotes: contextItems.length > 0 ? contextItems.slice(0, 2) : undefined,
          timestamp: new Date(),
          isStreaming: true,
        };
        setMessages(prev => [...prev, aiMessage]);

        // Simulate streaming effect then mark complete
        setTimeout(() => {
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessage.id
              ? { ...msg, isStreaming: false }
              : msg
          ));
          setIsLoading(false);
        }, Math.min(data.response.length * 20, 3000));
      } else {
        // Handle error - show fallback response
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || 'দুঃখিত, উত্তর দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      // Fallback to mock response on error
      const responseText = generateMockResponse(question, contextItems, currentPage, chapterId);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        quotes: contextItems.length > 0 ? contextItems.slice(0, 2) : undefined,
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages(prev => [...prev, aiMessage]);

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessage.id
            ? { ...msg, isStreaming: false }
            : msg
        ));
        setIsLoading(false);
      }, 1000 + responseText.length * 30 + 500);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    // Add context from current page when clicking suggested questions
    if (onAddContext) {
      onAddContext(
        `পৃষ্ঠা ${currentPage} থেকে নির্বাচিত কনটেক্সট: ${chapterTitle} অধ্যায়ের গুরুত্বপূর্ণ বিষয়বস্তু`,
        currentPage
      );
    }
    setInput(question);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateAudio = async () => {
    if (isAudioLoading || !pageText) return;

    setIsAudioLoading(true);
    setAudioError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/audio-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: pageText,
          chapterTitle: chapterTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      setAudioScript(data.script);

      // Convert base64 to blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      // No immediate play() call here, we'll handle it in useEffect
    } catch (err) {
      console.error('Audio Tutor Error:', err);
      setAudioError('দুঃখিত, অডিও তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setIsAudioLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setAudioProgress(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatAudioTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Autoplay failed:", e));
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Calculate font size based on PDF scale (base 14px, scales with PDF zoom)
  // Scale factor: 1.2 (default) = 14px, 2.0 = ~18px, 3.0 = ~20px
  const baseFontSize = 14;
  const minFontSize = 14;
  const maxFontSize = 22;
  // More responsive scaling: directly proportional to PDF zoom
  // When PDF is at 1.2x (default), chat is 14px
  // When PDF is at 2.0x, chat is ~18px
  // When PDF is at 3.0x, chat is ~22px
  const scaleRatio = pdfScale / 1.2; // Normalize to default scale
  const chatFontSize = Math.max(minFontSize, Math.min(baseFontSize * scaleRatio, maxFontSize));

  return (
    <div className="h-full w-full bg-white flex flex-col" lang="bn">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-gray-900">AI সহায়ক</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Context Loading Status */}
      {contextLoading && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>কনটেক্সট লোড হচ্ছে...</span>
          </div>
        </div>
      )}

      {contextLoaded && contextItems.length > 0 && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Check className="w-4 h-4" />
              <span>কনটেক্সট লোড হয়েছে ({contextItems.length}টি আইটেম)</span>
            </div>
            <button
              onClick={onClearContext}
              className="text-xs text-green-600 hover:text-green-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Context Items */}
      {contextItems.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 max-h-32 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 mb-2">কনটেক্সট:</p>
          <div className="space-y-1">
            {contextItems.map((item, idx) => (
              <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                <span className="font-medium bengali-text" lang="bn">পৃষ্ঠা {item.page}:</span> <span className="bengali-text" lang="bn">{item.text.replace(/undefined/g, '').trim().substring(0, 50)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Context Loading */}
      {pageContextLoading && messages.length === 0 && (
        <div className="px-4 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-700">পৃষ্ঠা {currentPage} এর কনটেক্সট লোড হচ্ছে...</p>
              <p className="text-xs text-blue-600 mt-0.5">প্রাসঙ্গিক প্রশ্ন প্রস্তুত করা হচ্ছে</p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Tutor Section */}
      <div className="px-4 py-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-b border-indigo-100/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">শিক্ষা ভাই-এর ব্যাখ্যা</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-wider">Audio Tutor</p>
                  <div className="relative group cursor-help">
                    <Info className="w-3 h-3 text-indigo-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-900/90 text-[9px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm border border-white/10 shadow-xl z-50 normal-case font-normal leading-tight">
                      The audio is played using no external services! It uses the Edge-TTS protocol.
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {!audioUrl && !isAudioLoading && (
            <button
              onClick={handleGenerateAudio}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              শুনুন
            </button>
          )}
        </div>

        {isAudioLoading && (
          <div className="flex items-center gap-3 py-2">
            <div className="flex gap-1">
              {[0, 150, 300, 450].map((delay) => (
                <div
                  key={delay}
                  className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <p className="text-xs text-indigo-600 font-medium animate-pulse">শিক্ষা ভাই স্ক্রিপ্ট লিখছেন...</p>
          </div>
        )}

        {audioUrl && (
          <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayback}
                className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 tracking-tighter">NOW PLAYING</span>
                  <span className="text-[10px] text-gray-400 font-mono">{formatAudioTime(audioProgress)} / {formatAudioTime(audioDuration)}</span>
                </div>

                {/* Progress bar */}
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  value={audioProgress}
                  onChange={handleAudioSeek}
                  className="w-full h-1 bg-indigo-50 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (pageText) {
                  localStorage.setItem('audio_tutor_context', pageText);
                }
                router.push('/dashboard/audio-tutor');
              }}
              className="w-full mt-3 py-1.5 border border-indigo-100 text-[10px] font-bold text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              ফুল টিউটর পেজ খুলুন →
            </button>
          </div>
        )}

        <audio
          ref={audioRef}
          className="hidden"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />

        {audioError && (
          <div className="mt-2 text-center">
            <p className="text-xs text-red-500 font-medium">{audioError}</p>
            <button
              onClick={handleGenerateAudio}
              className="text-[10px] text-indigo-600 underline mt-1"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {!pageContextLoading && suggestedQuestions.length > 0 && messages.length === 0 && (
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <FileQuestion className="w-4 h-4 text-indigo-600" />
            <p className="text-xs font-semibold text-indigo-700">প্রস্তাবিত প্রশ্ন:</p>
          </div>
          <div className="space-y-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left text-indigo-700 bg-white p-2 rounded border border-indigo-200 hover:bg-indigo-50 transition-colors bengali-text"
                style={{ fontSize: `${chatFontSize}px`, lineHeight: '1.5' }}
              >
                {question}
              </button>
            ))}
            <button
              onClick={() => {
                if (bookId && chapterId) {
                  setShowQuizGenerator(true);
                }
              }}
              className="w-full text-left font-semibold text-indigo-700 bg-indigo-100 p-2 rounded border border-indigo-300 hover:bg-indigo-200 transition-colors flex items-center gap-2 bengali-text"
              style={{ fontSize: `${chatFontSize}px`, lineHeight: '1.5' }}
            >
              <FileQuestion className="w-4 h-4" />
              এই পৃষ্ঠার জন্য কুইজ তৈরি করুন
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.isStreaming ? (
                <div className="bengali-text prose prose-sm max-w-none" lang="bn" style={{ fontSize: `${chatFontSize}px`, lineHeight: '1.6' }}>
                  <StreamingMessage
                    content={message.content}
                    isStreaming={true}
                  />
                </div>
              ) : (
                <div
                  className={`bengali-text prose prose-sm max-w-none ${
                    message.role === 'user'
                      ? 'prose-invert'
                      : 'prose-gray'
                  }`}
                  lang="bn"
                  style={{ fontSize: `${chatFontSize}px`, lineHeight: '1.6' }}
                >
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="ml-2">{children}</li>,
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                      code: ({ children }) => <code className="bg-black/10 px-1 py-0.5 rounded text-sm">{children}</code>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Quotes */}
              {message.quotes && message.quotes.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.quotes.map((quote, idx) => (
                    <div
                      key={idx}
                      className="bg-white/20 p-2 rounded border-l-2 border-white/40 bengali-text"
                      style={{ fontSize: `${chatFontSize * 0.85}px`, lineHeight: '1.5' }}
                    >
                      <span className="font-medium" lang="bn">পৃষ্ঠা {quote.page}:</span> <span lang="bn">{quote.text.replace(/undefined/g, '').trim()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleCopy(message.content, message.id)}
                  className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                >
                  {copiedId === message.id ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && !messages.some(m => m.isStreaming) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quiz Generator Modal */}
      {showQuizGenerator && (
        <QuizGenerator
          onComplete={() => {
            setShowQuizGenerator(false);
            if (bookId && chapterId) {
              router.push(`/dashboard/book-reader/${bookId}/${chapterId}/quiz?page=${currentPage}`);
            }
          }}
        />
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="কোনো প্রশ্ন করুন..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bengali-text"
            style={{ fontSize: `${chatFontSize}px`, lineHeight: '1.6' }}
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock response generator
function generateMockResponse(
  question: string,
  contextItems: Array<{ text: string; page: number }>,
  currentPage: number,
  chapterId: string = 'ch1'
): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('কুইজ') || lowerQuestion.includes('quiz')) {
    return generateMockQuiz(currentPage);
  }

  // Check if there's a page-specific answer - search all pages 1-10
  let matchingQuestion: PageQuestion | undefined;

  // First, check if question matches any suggestion exactly (for suggested questions)
  for (let page = 1; page <= 10; page++) {
    const pageData = getPageQuestions(chapterId, page);
    const matchingSuggestion = pageData.suggestions.find(s => {
      const sLower = s.trim().toLowerCase();
      const questionLower = question.trim().toLowerCase();
      // Exact match or very close match
      return sLower === questionLower ||
             (sLower.length > 10 && questionLower.includes(sLower.substring(0, Math.min(20, sLower.length)))) ||
             (questionLower.length > 10 && sLower.includes(questionLower.substring(0, Math.min(20, questionLower.length))));
    });

    if (matchingSuggestion) {
      // Try to find corresponding question - check if any question matches key concepts
      const suggestionKeywords = matchingSuggestion.toLowerCase()
        .split(/[\s,।?]/)
        .filter(w => w.length > 2);

      matchingQuestion = pageData.questions.find(q => {
        const qLower = q.question.toLowerCase();
        // Check if question contains significant keywords from suggestion
        const matchingKeywords = suggestionKeywords.filter(keyword => qLower.includes(keyword));
        return matchingKeywords.length >= Math.min(2, suggestionKeywords.length / 2);
      });

      // If no match found, use first question from that page
      if (!matchingQuestion && pageData.questions.length > 0) {
        matchingQuestion = pageData.questions[0];
      }

      if (matchingQuestion) break;
    }
  }

  // If not found via suggestions, check current page questions
  if (!matchingQuestion) {
    const currentPageData = getPageQuestions(chapterId, currentPage);
    matchingQuestion = currentPageData.questions.find(q => {
      const qLower = q.question.trim().toLowerCase();
      const questionLower = question.trim().toLowerCase();
      // Check if question matches exactly or contains key phrases
      return qLower === questionLower ||
             (qLower.length > 10 && questionLower.includes(qLower.substring(0, Math.min(15, qLower.length)))) ||
             (questionLower.length > 10 && qLower.includes(questionLower.substring(0, Math.min(15, questionLower.length))));
    });
  }

  // If not found, check all pages 1-10
  if (!matchingQuestion) {
    for (let page = 1; page <= 10; page++) {
      const pageData = getPageQuestions(chapterId, page);
      matchingQuestion = pageData.questions.find(q => {
        const qLower = q.question.trim().toLowerCase();
        const questionLower = question.trim().toLowerCase();
        return qLower === questionLower ||
               (qLower.length > 10 && questionLower.includes(qLower.substring(0, Math.min(15, qLower.length)))) ||
               (questionLower.length > 10 && qLower.includes(questionLower.substring(0, Math.min(15, questionLower.length))));
      });
      if (matchingQuestion) break;
    }
  }

  if (matchingQuestion) {
    // Clean any undefined values from the answer
    return matchingQuestion.answer.replace(/undefined/g, '').trim();
  }

  // Generate independent explanations based on question type and chapter
  if (chapterId === 'ch2' || chapterId === 'chapter-2') {
    // Chapter 2 specific responses
    if (lowerQuestion.includes('মূল ধারণা') || lowerQuestion.includes('ধারণা')) {
      return `এই অধ্যায়ের (গতি) মূল ধারণাগুলো হলো:\n\n১. স্থিতি ও গতি: বস্তুর অবস্থানের পরিবর্তন এবং পরসঙ্গ কাঠামোর ধারণা\n\n২. বিভিন্ন প্রকার গতি: রৈখিক, ঘূর্ণন, চলন, পর্যায়বৃত্ত গতি\n\n৩. স্কেলার ও ভেক্টর রাশি: দূরত্ব, সরণ, দ্রুতি, বেগ\n\n৪. ত্বরণ ও মন্দন: বেগের পরিবর্তনের হার\n\n৫. পড়ন্ত বস্তুর গতি: অভিকর্ষজ ত্বরণ এবং গ্যালিলিওর সূত্রাবলি\n\nএই বিষয়গুলো পদার্থবিজ্ঞানের ভিত্তি হিসেবে কাজ করে এবং পরবর্তী অধ্যায়গুলো বুঝতে সহায়তা করে।`;
    }

    if (lowerQuestion.includes('পৃষ্ঠা') || lowerQuestion.includes('আলোচনা')) {
      const pageData = getPageQuestions(chapterId, currentPage);
      if (pageData.questions.length > 0) {
        // Return first question's answer as page summary
        return pageData.questions[0].answer;
      }
      return `এই পৃষ্ঠায় গতি সম্পর্কিত বিষয় নিয়ে আলোচনা করা হয়েছে। গতি পদার্থবিজ্ঞানের একটি গুরুত্বপূর্ণ শাখা যা বলবিদ্যার অংশ।\n\nএই অধ্যায়ে আলোচিত বিষয়:\n- স্থিতি ও গতির ধারণা\n- বিভিন্ন প্রকার গতি\n- গতি সম্পর্কিত রাশিসমূহ\n- পড়ন্ত বস্তুর গতি\n\nআপনি যদি কোনো নির্দিষ্ট বিষয় সম্পর্কে জানতে চান, তাহলে আমাকে জিজ্ঞাসা করুন।`;
    }

    if (lowerQuestion.includes('ব্যাখ্যা') || lowerQuestion.includes('বিস্তারিত')) {
      return `গতি হলো পদার্থবিজ্ঞানের একটি গুরুত্বপূর্ণ শাখা যা বলবিদ্যার অংশ।\n\nমূল বিষয়সমূহ:\n\n১. স্থিতি ও গতি: পরসঙ্গ কাঠামোর সাপেক্ষে বস্তুর অবস্থানের পরিবর্তন\n\n২. গতির প্রকারভেদ: রৈখিক, ঘূর্ণন, চলন, পর্যায়বৃত্ত গতি\n\n৩. রাশিসমূহ: দূরত্ব, সরণ, দ্রুতি, বেগ, ত্বরণ\n\n৪. পড়ন্ত বস্তু: অভিকর্ষজ ত্বরণ এবং গ্যালিলিওর সূত্রাবলি\n\nএই অধ্যায়ে এই বিষয়গুলো নিয়ে বিস্তারিত আলোচনা করা হয়েছে।`;
    }

    // Default response for chapter 2
    return `আমি এই অধ্যায় (গতি) সম্পর্কে আপনাকে সাহায্য করতে পারি।\n\nএই অধ্যায়ে আলোচিত মূল বিষয়গুলো:\n\n• স্থিতি ও গতির ধারণা\n• পরসঙ্গ কাঠামো\n• বিভিন্ন প্রকার গতি (রৈখিক, ঘূর্ণন, চলন, পর্যায়বৃত্ত)\n• স্কেলার ও ভেক্টর রাশি\n• দূরত্ব, সরণ, দ্রুতি, বেগ\n• ত্বরণ ও মন্দন\n• পড়ন্ত বস্তুর গতি\n• অভিকর্ষজ ত্বরণ\n\nআপনি যদি কোনো নির্দিষ্ট বিষয় সম্পর্কে জানতে চান, তাহলে আমাকে জিজ্ঞাসা করুন। আমি বিস্তারিত ব্যাখ্যা দিতে পারব।`;
  }

  // Chapter 1 specific responses (fallback)
  if (lowerQuestion.includes('মূল ধারণা') || lowerQuestion.includes('ধারণা')) {
    return `এই অধ্যায়ের মূল ধারণাগুলো হলো:\n\n১. ভৌত রাশি: পদার্থবিজ্ঞানে ব্যবহৃত পরিমাপযোগ্য রাশি, যেমন দৈর্ঘ্য, ভর, সময় ইত্যাদি।\n\n২. পরিমাপ: বিভিন্ন ভৌত রাশির সঠিক পরিমাপের পদ্ধতি এবং একক।\n\n৩. পরিমাপের যন্ত্রপাতি: বিভিন্ন রাশি পরিমাপের জন্য ব্যবহৃত যন্ত্র, যেমন স্কেল, থার্মোমিটার, স্টপওয়াচ ইত্যাদি।\n\n৪. নির্ভুলতা ও যথার্থতা: পরিমাপের সঠিকতা বজায় রাখার কৌশল এবং ত্রুটির কারণ।\n\nএই বিষয়গুলো পদার্থবিজ্ঞানের ভিত্তি হিসেবে কাজ করে এবং পরবর্তী অধ্যায়গুলো বুঝতে সহায়তা করে।`;
  }

  if (lowerQuestion.includes('পৃষ্ঠা') || lowerQuestion.includes('আলোচনা')) {
    return `এই পৃষ্ঠায় পদার্থবিজ্ঞানের পরিসর এবং এর ক্রমবিকাশ সম্পর্কে আলোচনা করা হয়েছে। পদার্থবিজ্ঞান একটি প্রাচীন বিজ্ঞান যা পদার্থ, শক্তি এবং তাদের মধ্যকার মিথস্ক্রিয়া নিয়ে আলোচনা করে।\n\nপদার্থবিজ্ঞানের গুরুত্ব:\n- দৈনন্দিন জীবনে ব্যবহৃত প্রযুক্তির ভিত্তি\n- অন্যান্য বিজ্ঞানের সাথে আন্তঃসম্পর্ক\n- সভ্যতার বিকাশে অবদান\n\nএই অধ্যায়ে পরিমাপের গুরুত্ব এবং বিভিন্ন ভৌত রাশির পরিমাপ পদ্ধতি সম্পর্কে বিস্তারিত জানতে পারবেন।`;
  }

  if (lowerQuestion.includes('ব্যাখ্যা') || lowerQuestion.includes('বিস্তারিত')) {
    return `পদার্থবিজ্ঞান হলো প্রকৃতির মৌলিক নিয়মগুলো নিয়ে অধ্যয়ন। এটি আমাদের চারপাশের বিশ্বকে বুঝতে সাহায্য করে।\n\nমূল বিষয়সমূহ:\n\n১. পরিসর: পদার্থবিজ্ঞানের পরিসর অত্যন্ত বিস্তৃত - ক্ষুদ্রতম কণা থেকে বৃহত্তম মহাবিশ্ব পর্যন্ত।\n\n২. উদ্দেশ্য: প্রকৃতির নিয়ম আবিষ্কার এবং ব্যাখ্যা করা, যা প্রযুক্তির উন্নয়নে সাহায্য করে।\n\n৩. পরিমাপ: সঠিক পরিমাপ ছাড়া বিজ্ঞান সম্ভব নয়। তাই পরিমাপের পদ্ধতি এবং যন্ত্রপাতি জানা অত্যন্ত গুরুত্বপূর্ণ।\n\n৪. প্রয়োগ: পদার্থবিজ্ঞানের জ্ঞান দৈনন্দিন জীবনে, প্রযুক্তিতে এবং অন্যান্য বিজ্ঞানে ব্যবহৃত হয়।\n\nএই অধ্যায়ে এই বিষয়গুলো নিয়ে বিস্তারিত আলোচনা করা হবে।`;
  }

  // Default independent response
  return `আমি এই অধ্যায় সম্পর্কে আপনাকে সাহায্য করতে পারি।\n\nএই অধ্যায়ে আলোচিত মূল বিষয়গুলো:\n\n• পদার্থবিজ্ঞানের পরিসর এবং ক্রমবিকাশ\n• ভৌত রাশি এবং তাদের পরিমাপ\n• পরিমাপের যন্ত্রপাতি\n• পরিমাপের নির্ভুলতা এবং যথার্থতা\n\nআপনি যদি কোনো নির্দিষ্ট বিষয় সম্পর্কে জানতে চান, তাহলে আমাকে জিজ্ঞাসা করুন। আমি বিস্তারিত ব্যাখ্যা দিতে পারব।`;
}

function generateMockQuiz(page: number): string {
  return `এই পৃষ্ঠার জন্য কুইজ:\n\n1. এই পৃষ্ঠায় আলোচিত মূল ধারণাটি কী?\n2. উদাহরণ দিয়ে ব্যাখ্যা করুন।\n3. এর প্রয়োগ কোথায় দেখা যায়?\n\nউত্তর জানতে প্রতিটি প্রশ্নের উপর ক্লিক করুন।`;
}

