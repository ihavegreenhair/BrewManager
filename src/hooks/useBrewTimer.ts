import { useState, useEffect, useRef, useCallback } from 'react';

export const useBrewTimer = (initialMinutes: number | undefined) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timeLeft]);

  const startTimer = useCallback((minutes: number) => {
    setTimeLeft(minutes * 60);
    setTimerRunning(true);
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    if (initialMinutes !== undefined) {
      setTimeLeft(initialMinutes * 60);
    }
  }, [initialMinutes]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    timerRunning,
    startTimer,
    toggleTimer,
    resetTimer,
    formatTime
  };
};
