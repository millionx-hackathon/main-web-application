import { useState, useEffect, useRef } from 'react';

interface UseStreamingTextOptions {
  text: string;
  speed?: number; // milliseconds per word
  enabled?: boolean;
}

export function useStreamingText({ text, speed = 30, enabled = true }: UseStreamingTextOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);

    // Split text into words, preserving spaces and newlines
    const words = text.split(/(\s+|\n)/);
    let currentIndex = 0;

    const streamNextWord = () => {
      if (currentIndex < words.length) {
        setDisplayedText(prev => prev + words[currentIndex]);
        currentIndex++;

        // Variable speed - slightly faster for spaces/newlines, slower for punctuation
        const currentWord = words[currentIndex - 1];
        let delay = speed;

        if (currentWord.match(/[.!?।]/)) {
          delay = speed * 1.8;  // Pause longer after sentences
        } else if (currentWord.match(/[\s\n]/)) {
          delay = speed * 0.2;  // Faster for whitespace
        } else if (currentWord.match(/[,;:]/)) {
          delay = speed * 0.8;  // Slight pause for commas/semicolons
        }

        timeoutRef.current = setTimeout(streamNextWord, delay);
      } else {
        setIsComplete(true);
      }
    };

    // Start streaming after a 1 second delay
    timeoutRef.current = setTimeout(streamNextWord, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, enabled, speed]);

  return { displayedText, isComplete };
}

