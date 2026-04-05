import { useState, useEffect, useCallback } from 'react';
import { StudyMaterial } from '@/types/study';

const MATERIALS_STORAGE_KEY = 'elite_fiscal_materials';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getInitialData = (): StudyMaterial[] => {
  const stored = localStorage.getItem(MATERIALS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const useMaterialsData = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>(getInitialData);

  useEffect(() => {
    localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materials));
  }, [materials]);

  const addMaterial = useCallback((material: Omit<StudyMaterial, 'id' | 'createdAt' | 'readingProgress'>) => {
    const newMaterial: StudyMaterial = {
      ...material,
      id: generateId(),
      readingProgress: 0,
      createdAt: new Date().toISOString(),
    };
    setMaterials(prev => [...prev, newMaterial]);
    return newMaterial;
  }, []);

  const updateReadingProgress = useCallback((id: string, progress: number) => {
    setMaterials(prev =>
      prev.map(m => (m.id === id ? { ...m, readingProgress: Math.min(100, Math.max(0, progress)) } : m))
    );
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  }, []);

  const getMaterialsBySubject = useCallback((subjectId: string) => {
    return materials.filter(m => m.subjectId === subjectId);
  }, [materials]);

  const getEditais = useCallback(() => {
    return materials.filter(m => m.type === 'edital');
  }, [materials]);

  return {
    materials,
    addMaterial,
    updateReadingProgress,
    deleteMaterial,
    getMaterialsBySubject,
    getEditais,
  };
};
