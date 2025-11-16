import { useEffect, useRef } from 'react';

/**
 * Detects a specific key sequence and triggers callback once matched
 */
export const useSecretSequence = (sequence: string[], onActivate: () => void) => {
  const bufferRef = useRef<string[]>([]);
  const seqRef = useRef(sequence.map((k) => k.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = (event.key || '').toLowerCase();
      bufferRef.current.push(key);
      // Trim buffer length
      if (bufferRef.current.length > seqRef.current.length) {
        bufferRef.current.shift();
      }
      // Compare
      const isMatch = seqRef.current.every((v, i) => bufferRef.current[i] === v);
      if (isMatch) {
        onActivate();
        bufferRef.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onActivate]);
};
