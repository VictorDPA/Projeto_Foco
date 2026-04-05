import { useState, useEffect, useCallback } from 'react';
import { LawArticle, HeatMapStatus } from '@/types/study';

const LAW_STORAGE_KEY = 'elite_fiscal_laws';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getInitialData = (): LawArticle[] => {
  const stored = localStorage.getItem(LAW_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const useLawData = () => {
  const [articles, setArticles] = useState<LawArticle[]>(getInitialData);

  useEffect(() => {
    localStorage.setItem(LAW_STORAGE_KEY, JSON.stringify(articles));
  }, [articles]);

  const addArticle = useCallback((article: Omit<LawArticle, 'id' | 'createdAt' | 'isRead' | 'isMastered'>) => {
    const newArticle: LawArticle = {
      ...article,
      id: generateId(),
      isRead: false,
      isMastered: false,
      createdAt: new Date().toISOString(),
    };
    setArticles(prev => [...prev, newArticle]);
    return newArticle;
  }, []);

  const updateArticle = useCallback((id: string, updates: Partial<LawArticle>) => {
    setArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleRead = useCallback((id: string) => {
    setArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, isRead: !a.isRead } : a))
    );
  }, []);

  const toggleMastered = useCallback((id: string) => {
    setArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, isMastered: !a.isMastered } : a))
    );
  }, []);

  const getArticlesBySubject = useCallback((subjectId: string) => {
    return articles.filter(a => a.subjectId === subjectId);
  }, [articles]);

  const getArticlesByLaw = useCallback((lawName: string) => {
    return articles.filter(a => a.lawName === lawName);
  }, [articles]);

  const getUniqueLaws = useCallback(() => {
    const laws = new Set(articles.map(a => a.lawName));
    return Array.from(laws);
  }, [articles]);

  const getProgressBySubject = useCallback((subjectId: string) => {
    const subjectArticles = articles.filter(a => a.subjectId === subjectId);
    if (subjectArticles.length === 0) return { read: 0, mastered: 0, total: 0 };
    return {
      read: subjectArticles.filter(a => a.isRead).length,
      mastered: subjectArticles.filter(a => a.isMastered).length,
      total: subjectArticles.length,
    };
  }, [articles]);

  const getProgressByLaw = useCallback((lawName: string) => {
    const lawArticles = articles.filter(a => a.lawName === lawName);
    if (lawArticles.length === 0) return { read: 0, mastered: 0, total: 0 };
    return {
      read: lawArticles.filter(a => a.isRead).length,
      mastered: lawArticles.filter(a => a.isMastered).length,
      total: lawArticles.length,
    };
  }, [articles]);

  return {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    toggleRead,
    toggleMastered,
    getArticlesBySubject,
    getArticlesByLaw,
    getUniqueLaws,
    getProgressBySubject,
    getProgressByLaw,
  };
};
