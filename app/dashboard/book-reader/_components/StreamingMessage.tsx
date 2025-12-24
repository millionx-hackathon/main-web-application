"use client";

import React, { useEffect } from 'react';
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
    <span className="bengali-text" lang="bn">
      {displayedText}
      {isStreaming && !isComplete && (
        <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse" />
      )}
    </span>
  );
}


