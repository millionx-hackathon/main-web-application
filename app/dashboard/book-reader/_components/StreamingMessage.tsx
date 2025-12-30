"use client";

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStreamingText } from './useStreamingText';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  onComplete?: () => void;
}

export default function StreamingMessage({
  content,
  isStreaming,
  onComplete
}: StreamingMessageProps) {
  const { displayedText, isComplete } = useStreamingText({
    text: content,
    speed: 30, // milliseconds per word/chunk
    enabled: isStreaming,
  });

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="bengali-text" lang="bn">
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
        {displayedText}
      </ReactMarkdown>
      {isStreaming && !isComplete && (
        <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse" />
      )}
    </div>
  );
}
