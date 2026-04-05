import { useState, useEffect, useCallback, useRef } from 'react';

interface PomodoroState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  mode: 'focus' | 'break';
}

const POMODORO_STORAGE_KEY = 'elite_fiscal_pomodoro';

export const usePomodoroTimer = () => {
  const [state, setState] = useState<PomodoroState>(() => {
    const stored = localStorage.getItem(POMODORO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Don't restore running state
      return { ...parsed, isRunning: false, isPaused: false };
    }
    return {
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      mode: 'focus' as const,
    };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused]);

  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  const stop = useCallback(() => {
    const elapsed = state.elapsedSeconds;
    setState({
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      mode: 'focus',
    });
    return elapsed;
  }, [state.elapsedSeconds]);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      mode: 'focus',
    });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getMinutes = useCallback(() => {
    return Math.round(state.elapsedSeconds / 60 * 10) / 10;
  }, [state.elapsedSeconds]);

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime,
    getMinutes,
    formattedTime: formatTime(state.elapsedSeconds),
  };
};
