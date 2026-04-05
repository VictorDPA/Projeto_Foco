import { useState, useEffect, useCallback } from 'react';
import { StudyError, ErrorType } from '@/types/study';

const ERRORS_STORAGE_KEY = 'elite_fiscal_errors';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getInitialErrors = (): StudyError[] => {
  const stored = localStorage.getItem(ERRORS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const useErrorData = () => {
  const [errors, setErrors] = useState<StudyError[]>(getInitialErrors);

  useEffect(() => {
    localStorage.setItem(ERRORS_STORAGE_KEY, JSON.stringify(errors));
  }, [errors]);

  const addError = useCallback((error: Omit<StudyError, 'id' | 'createdAt' | 'reviewCount'>) => {
    const newError: StudyError = {
      ...error,
      id: generateId(),
      createdAt: new Date().toISOString(),
      reviewCount: 0,
    };
    setErrors(prev => [newError, ...prev]);
    return newError;
  }, []);

  const deleteError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  const incrementReviewCount = useCallback((errorId: string) => {
    setErrors(prev =>
      prev.map(e =>
        e.id === errorId ? { ...e, reviewCount: e.reviewCount + 1 } : e
      )
    );
  }, []);

  const getErrorsBySubject = useCallback((subjectId: string) => {
    return errors.filter(e => e.subjectId === subjectId);
  }, [errors]);

  const getRecentErrors = useCallback((limit: number = 5) => {
    return errors.slice(0, limit);
  }, [errors]);

  const getTopicCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    errors.forEach(e => {
      counts[e.topic] = (counts[e.topic] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }, [errors]);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    deleteError,
    incrementReviewCount,
    getErrorsBySubject,
    getRecentErrors,
    getTopicCounts,
    clearAllErrors,
  };
};
