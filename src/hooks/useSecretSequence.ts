import { useEffect, useRef } from 'react';

/**
 * Detects a specific key sequence and triggers callback once matched
 */
export const useSecretSequence = (sequence: string[], onActivate: () => void) => {
  const bufferRef = useRef<string[]>([]);
  const seqRef = useRef(sequence.map((k) => k.toLowerCase()));
  const onActivateRef = useRef(onActivate);

  // Keep latest callback without re-subscribing the listener
  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);

  // Keep sequence ref in sync if sequence changes
  useEffect(() => {
    seqRef.current = sequence.map((k) => k.toLowerCase());
    // Reset buffer when target sequence changes to avoid stale partial matches
    bufferRef.current = [];
  }, [sequence]);

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
        onActivateRef.current?.();
        bufferRef.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
