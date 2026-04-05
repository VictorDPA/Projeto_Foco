import { useState, useEffect, useCallback } from 'react';
import { StudyStreak } from '@/types/study';
import { format, differenceInDays, isYesterday, isToday, parseISO } from 'date-fns';

const STREAK_STORAGE_KEY = 'elite_fiscal_streak';

const getInitialStreak = (): StudyStreak => {
  const stored = localStorage.getItem(STREAK_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  };
};

export const useStudyStreak = () => {
  const [streak, setStreak] = useState<StudyStreak>(getInitialStreak);

  useEffect(() => {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  }, [streak]);

  // Check and update streak on mount
  useEffect(() => {
    if (streak.lastStudyDate) {
      const lastDate = parseISO(streak.lastStudyDate);
      const daysDiff = differenceInDays(new Date(), lastDate);
      
      // If more than 1 day has passed, reset streak
      if (daysDiff > 1) {
        setStreak(prev => ({
          ...prev,
          currentStreak: 0,
        }));
      }
    }
  }, []);

  const recordStudySession = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setStreak(prev => {
      // If already studied today, don't increment
      if (prev.lastStudyDate === today) {
        return prev;
      }

      let newStreak = 1;
      
      if (prev.lastStudyDate) {
        const lastDate = parseISO(prev.lastStudyDate);
        
        if (isYesterday(lastDate)) {
          // Continue streak
          newStreak = prev.currentStreak + 1;
        } else if (isToday(lastDate)) {
          // Same day, keep current
          newStreak = prev.currentStreak;
        }
        // Otherwise reset to 1
      }

      const newLongest = Math.max(newStreak, prev.longestStreak);

      return {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastStudyDate: today,
      };
    });
  }, []);

  const hasStudiedToday = streak.lastStudyDate === format(new Date(), 'yyyy-MM-dd');

  return {
    streak,
    recordStudySession,
    hasStudiedToday,
  };
};
