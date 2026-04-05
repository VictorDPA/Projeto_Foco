import { useState, useEffect, useCallback } from 'react';
import { UserSettings, StudyPhase } from '@/types/study';

const STORAGE_KEY = 'elite_fiscal_settings';

const defaultSettings: UserSettings = {
  studyPhase: 'iniciante',
  darkMode: true,
  animations: true,
  studyReminders: true,
  goalAlerts: true,
};

const getInitialSettings = (): UserSettings => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return { ...defaultSettings, ...JSON.parse(stored) };
  }
  return defaultSettings;
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(getInitialSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateStudyPhase = useCallback((phase: StudyPhase) => {
    setSettings(prev => ({ ...prev, studyPhase: phase }));
  }, []);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    settings,
    updateStudyPhase,
    updateSetting,
  };
};
