'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Settings, Loader2, Volume2 } from 'lucide-react';

// Import Ultravox client (dynamic import for SSR compatibility)
let UltravoxSession: any = null;

export default function VoiceAgentPage() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [baseUrl, setBaseUrl] = useState('http://localhost:8080');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import of ultravox-client
    import('ultravox-client').then((module) => {
      UltravoxSession = module.UltravoxSession;
    }).catch(() => {
      console.warn('Ultravox client not available');
    });
  }, []);

  useEffect(() => {
    // Auto-scroll transcript
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const startCall = async () => {
    if (!UltravoxSession) {
      setError('Ultravox client not loaded. Please refresh the page.');
      return;
    }
    
    setStatus('connecting');
    setError(null);
    
    try {
      // Get join URL from backend
      const res = await fetch(`${baseUrl}/api/voice/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: window.location.origin }),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to start call: ${res.statusText}`);
      }
      
      const { joinUrl } = await res.json();

      // Create Ultravox session
      const session = new UltravoxSession();
      sessionRef.current = session;

      // Listen for status changes
      session.addEventListener('status', (event: any) => {
        const newStatus = event.status;
        if (newStatus === 'listening') setStatus('listening');
        else if (newStatus === 'speaking') setStatus('speaking');
        else if (newStatus === 'idle') setStatus('connected');
      });

      // Listen for transcripts
      session.addEventListener('transcripts', (event: any) => {
        setTranscript(event.transcripts.map((t: any) => ({
          role: t.speaker,
          text: t.text
        })));
      });

      // Join the call
      await session.joinCall(joinUrl);
      setStatus('connected');
      
    } catch (err: any) {
      console.error('Failed to start call:', err);
      setError(err.message || 'Failed to connect. Please check the base URL and try again.');
      setStatus('idle');
    }
  };

  const endCall = () => {
    if (sessionRef.current) {
      sessionRef.current.leaveCall();
      sessionRef.current = null;
    }
    setStatus('idle');
    setTranscript([]);
  };

  const toggleMute = () => {
    if (sessionRef.current) {
      if (isMuted) {
        sessionRef.current.unmuteMic();
      } else {
        sessionRef.current.muteMic();
      }
      setIsMuted(!isMuted);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return { bg: 'bg-gray-100', text: 'Start a voice call with AI', icon: null };
      case 'connecting':
        return { bg: 'bg-amber-100', text: 'Connecting...', icon: <Loader2 className="w-5 h-5 animate-spin text-amber-600" /> };
      case 'connected':
        return { bg: 'bg-green-100', text: 'Connected - Start speaking!', icon: <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /> };
      case 'listening':
        return { bg: 'bg-emerald-100', text: '🎤 Listening...', icon: <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" /> };
      case 'speaking':
        return { bg: 'bg-indigo-100', text: '🔊 AI is speaking...', icon: <Volume2 className="w-5 h-5 text-indigo-600 animate-pulse" /> };
      default:
        return { bg: 'bg-gray-100', text: '', icon: null };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200 mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Voice Agent</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Real-time voice conversation with AI using Ultravox WebRTC
          </p>
        </div>

        {/* Settings Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Configuration</span>
            </div>
            <span className="text-sm text-gray-500">{showSettings ? '▲' : '▼'}</span>
          </button>
          
          {showSettings && (
            <div className="p-4 pt-0 border-t border-gray-100">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">Backend Base URL</span>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-mono text-sm"
                  placeholder="http://localhost:8080"
                  disabled={status !== 'idle'}
                />
                <p className="text-xs text-gray-500 mt-2">
                  The base URL of the backend API server (e.g., http://localhost:8080)
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Status Indicator */}
        <div className={`text-center p-5 rounded-2xl transition-all duration-300 ${statusConfig.bg}`}>
          <div className="flex items-center justify-center gap-3">
            {statusConfig.icon}
            <span className="font-medium text-gray-800">{statusConfig.text}</span>
          </div>
        </div>

        {/* Main Call Interface */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-full blur-3xl -ml-24 -mb-24 opacity-50" />
          
          <div className="relative z-10">
            {/* Voice Visualizer */}
            <div className="flex justify-center mb-8">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                status === 'idle' ? 'bg-gray-100' :
                status === 'connecting' ? 'bg-amber-100 animate-pulse' :
                status === 'listening' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200 scale-110' :
                status === 'speaking' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 scale-110' :
                'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200'
              }`}>
                <Mic className={`w-12 h-12 transition-all duration-300 ${
                  status === 'idle' ? 'text-gray-400' :
                  status === 'connecting' ? 'text-amber-600' :
                  'text-white'
                } ${status === 'speaking' ? 'animate-bounce' : ''}`} />
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex justify-center gap-4 mb-8">
              {status === 'idle' ? (
                <button
                  onClick={startCall}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Phone className="w-6 h-6" />
                  Start Call
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-2xl transition-all duration-300 ${
                      isMuted 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={endCall}
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-lg shadow-lg shadow-red-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <PhoneOff className="w-6 h-6" />
                    End Call
                  </button>
                </>
              )}
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div 
                ref={transcriptRef}
                className="border border-gray-200 rounded-2xl p-6 max-h-80 overflow-y-auto bg-gray-50/50"
              >
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Transcript
                </h2>
                <div className="space-y-4">
                  {transcript.map((t, i) => (
                    <div 
                      key={i} 
                      className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        t.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-md' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                      }`}>
                        <p className="text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">
                          {t.role === 'user' ? 'You' : 'AI'}
                        </p>
                        <p className="text-sm leading-relaxed">{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Make sure your backend server is running at the configured base URL.</p>
          <p className="mt-1">The backend should have the <code className="bg-gray-100 px-2 py-1 rounded">/api/voice/call</code> endpoint available.</p>
        </div>
      </div>
    </div>
  );
}
