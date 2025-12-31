# Next.js Frontend Implementation Plan (Voice Calls)

## Overview

Build a Next.js frontend with **voice conversation** using Ultravox WebRTC:
1. **Document Upload** - Upload PDFs to the vector database
2. **Voice Call Interface** - Real-time voice conversation with AI tutor
3. **Summaries Dashboard** - List all conversation summaries

---

## Backend API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/textbooks/upload` | POST | Upload PDF |
| `/api/voice/call` | POST | Create voice call, returns `joinUrl` |
| `/api/summaries` | GET | List all summaries |

**Base URL**: `http://localhost:8080`

---

## Project Setup

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend
npm install ultravox-client lucide-react
```

---

## Page Implementations

### 1. Document Upload Page (`/upload`)

**File**: `src/app/upload/page.tsx`

```tsx
'use client';
import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/textbooks/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setStatus(data.status === 'success' ? 'success' : 'error');
      setMessage(data.message || data.documentId);
    } catch {
      setStatus('error');
      setMessage('Upload failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Textbook</h1>
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4" />
        <button onClick={handleUpload} disabled={!file || status === 'uploading'}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50">
          {status === 'uploading' ? <Loader2 className="animate-spin" /> : 'Upload PDF'}
        </button>
      </div>
      {status !== 'idle' && (
        <div className={`mt-4 p-4 rounded ${status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>{message}</div>
      )}
    </div>
  );
}
```

---

### 2. Voice Call Interface (`/call`)

**File**: `src/app/call/page.tsx`

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

// Import Ultravox client (dynamic import for SSR compatibility)
let UltravoxSession: any = null;

export default function VoiceCallPage() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    // Dynamic import of ultravox-client
    import('ultravox-client').then((module) => {
      UltravoxSession = module.UltravoxSession;
    });
  }, []);

  const startCall = async () => {
    if (!UltravoxSession) return;
    
    setStatus('connecting');
    
    try {
      // Get join URL from backend
      const res = await fetch('http://localhost:8080/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: window.location.origin }),
      });
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
      
    } catch (err) {
      console.error('Failed to start call:', err);
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

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Voice AI Tutor</h1>

      {/* Status Indicator */}
      <div className={`text-center p-4 rounded-lg mb-6 ${
        status === 'idle' ? 'bg-gray-100' :
        status === 'connecting' ? 'bg-yellow-100' :
        status === 'listening' ? 'bg-green-100' :
        status === 'speaking' ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        {status === 'idle' && 'Click Start Call to begin'}
        {status === 'connecting' && 'Connecting...'}
        {status === 'connected' && 'Connected - Start speaking!'}
        {status === 'listening' && '🎤 Listening...'}
        {status === 'speaking' && '🔊 AI is speaking...'}
      </div>

      {/* Call Controls */}
      <div className="flex justify-center gap-4 mb-8">
        {status === 'idle' ? (
          <button onClick={startCall} className="bg-green-600 text-white px-8 py-4 rounded-full flex items-center gap-2">
            <Phone /> Start Call
          </button>
        ) : (
          <>
            <button onClick={toggleMute} className={`px-6 py-4 rounded-full ${isMuted ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
              {isMuted ? <MicOff /> : <Mic />}
            </button>
            <button onClick={endCall} className="bg-red-600 text-white px-8 py-4 rounded-full flex items-center gap-2">
              <PhoneOff /> End Call
            </button>
          </>
        )}
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
          <h2 className="font-bold mb-2">Conversation</h2>
          {transcript.map((t, i) => (
            <div key={i} className={`mb-2 ${t.role === 'user' ? 'text-blue-600' : 'text-gray-800'}`}>
              <strong>{t.role === 'user' ? 'You' : 'AI'}:</strong> {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 3. Summaries Dashboard (`/summaries`)

**File**: `src/app/summaries/page.tsx`

```tsx
'use client';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface Summary {
  id: number;
  callerNumber: string;
  summary: string;
  topicsDiscussed: string;
  createdAt: string;
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummaries = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:8080/api/summaries');
    setSummaries(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchSummaries(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Conversation Summaries</h1>
        <button onClick={fetchSummaries} className="p-2 hover:bg-gray-100 rounded">
          <RefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {summaries.length === 0 ? (
        <p className="text-gray-500">No summaries yet</p>
      ) : (
        <div className="space-y-4">
          {summaries.map((s) => (
            <div key={s.id} className="border rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{s.callerNumber || 'Web Call'}</span>
                <span>{new Date(s.createdAt).toLocaleString()}</span>
              </div>
              {s.topicsDiscussed && <p className="text-sm text-blue-600 mb-2">Topics: {s.topicsDiscussed}</p>}
              <p>{s.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 4. Navigation Layout

**File**: `src/app/layout.tsx`

```tsx
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 text-white p-4">
          <div className="max-w-4xl mx-auto flex gap-6">
            <Link href="/upload" className="hover:text-blue-300">Upload</Link>
            <Link href="/call" className="hover:text-blue-300">Voice Call</Link>
            <Link href="/summaries" className="hover:text-blue-300">Summaries</Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

---

## Running the Application

```bash
# Terminal 1: Start backend
cd ultravox_twilio && ./gradlew bootRun

# Terminal 2: Start frontend  
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
