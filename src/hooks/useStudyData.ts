import { useState, useEffect, useCallback } from 'react';
import { Subject, StudyBlock, QuestionSession, StudyStats, SubjectWeight, ExternalLink, MonthlyGiroConfig, ExamBoard, StudyPhase } from '@/types/study';

const STORAGE_KEY = 'elite_fiscal_data';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getInitialData = (): Subject[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Sample data for demonstration
  return [
    {
      id: generateId(),
      name: 'Direito Administrativo',
      color: '#FFD700',
      weight: 3 as SubjectWeight,
      blocks: [
        {
          id: generateId(),
          name: 'Bloco 01: Aulas 0-3',
          description: 'Introdução e Princípios Fundamentais',
          status: 'reading_pdf',
          questionSessions: [
            { id: generateId(), date: '2024-01-05', totalQuestions: 20, hits: 18, examBoard: 'FGV' as ExamBoard },
            { id: generateId(), date: '2024-01-07', totalQuestions: 15, hits: 13, examBoard: 'FCC' as ExamBoard },
          ],
          hoursStudied: 4.5,
          isCurrent: true,
          createdAt: new Date().toISOString(),
          externalLinks: [],
          redoFavorites: false,
        },
        {
          id: generateId(),
          name: 'Bloco 02: Aulas 4-7',
          description: 'Atos Administrativos',
          status: 'not_started',
          questionSessions: [],
          hoursStudied: 0,
          isCurrent: false,
          createdAt: new Date().toISOString(),
          externalLinks: [],
          redoFavorites: false,
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Direito Constitucional',
      color: '#4ECDC4',
      weight: 3 as SubjectWeight,
      blocks: [
        {
          id: generateId(),
          name: 'Bloco 01: Fundamentos',
          description: 'Teoria da Constituição',
          status: 'completed',
          questionSessions: [
            { id: generateId(), date: '2024-01-01', totalQuestions: 25, hits: 22, examBoard: 'CESPE' as ExamBoard },
            { id: generateId(), date: '2024-01-03', totalQuestions: 30, hits: 27, examBoard: 'CESPE' as ExamBoard },
          ],
          hoursStudied: 8,
          isCurrent: false,
          createdAt: new Date().toISOString(),
          externalLinks: [],
          redoFavorites: false,
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
};

export const useStudyData = () => {
  const [subjects, setSubjects] = useState<Subject[]>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  const calculateBlockAccuracy = useCallback((block: StudyBlock): number => {
    if (block.questionSessions.length === 0) return 0;
    const totalQuestions = block.questionSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalHits = block.questionSessions.reduce((sum, s) => sum + s.hits, 0);
    return totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : 0;
  }, []);

  const getStats = useCallback((): StudyStats => {
    let totalHours = 0;
    let totalQuestions = 0;
    let totalHits = 0;
    let activeBlocks = 0;
    let completedBlocks = 0;

    subjects.forEach(subject => {
      subject.blocks.forEach(block => {
        totalHours += block.hoursStudied;
        if (block.status === 'reading_pdf') activeBlocks++;
        if (block.status === 'completed') completedBlocks++;
        block.questionSessions.forEach(session => {
          totalQuestions += session.totalQuestions;
          totalHits += session.hits;
        });
      });
    });

    return {
      totalHoursStudied: Math.round(totalHours * 10) / 10,
      overallAccuracy: totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : 0,
      activeBlocks,
      completedBlocks,
    };
  }, [subjects]);

  const getCurrentBlock = useCallback((): { block: StudyBlock; subject: Subject } | null => {
    for (const subject of subjects) {
      const currentBlock = subject.blocks.find(b => b.isCurrent);
      if (currentBlock) {
        return { block: currentBlock, subject };
      }
    }
    return null;
  }, [subjects]);

  const addSubject = useCallback((name: string, color: string, weight: SubjectWeight = 2) => {
    const newSubject: Subject = {
      id: generateId(),
      name,
      color,
      weight,
      blocks: [],
      createdAt: new Date().toISOString(),
    };
    setSubjects(prev => [...prev, newSubject]);
  }, []);

  const addBlock = useCallback((subjectId: string, name: string, description: string) => {
    const newBlock: StudyBlock = {
      id: generateId(),
      name,
      description,
      status: 'not_started',
      questionSessions: [],
      hoursStudied: 0,
      isCurrent: false,
      createdAt: new Date().toISOString(),
      externalLinks: [],
      redoFavorites: false,
    };
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? { ...subject, blocks: [...subject.blocks, newBlock] }
          : subject
      )
    );
  }, []);

  const updateBlockStatus = useCallback((subjectId: string, blockId: string, status: StudyBlock['status']) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              blocks: subject.blocks.map(block =>
                block.id === blockId ? { ...block, status } : block
              ),
            }
          : subject
      )
    );
  }, []);

  const setCurrentBlock = useCallback((subjectId: string, blockId: string) => {
    setSubjects(prev =>
      prev.map(subject => ({
        ...subject,
        blocks: subject.blocks.map(block => ({
          ...block,
          isCurrent: subject.id === subjectId && block.id === blockId,
        })),
      }))
    );
  }, []);

  const addQuestionSession = useCallback(
    (subjectId: string, blockId: string, session: Omit<QuestionSession, 'id'>) => {
      const newSession: QuestionSession = {
        ...session,
        id: generateId(),
      };
      setSubjects(prev =>
        prev.map(subject =>
          subject.id === subjectId
            ? {
                ...subject,
                blocks: subject.blocks.map(block =>
                  block.id === blockId
                    ? { ...block, questionSessions: [...block.questionSessions, newSession] }
                    : block
                ),
              }
            : subject
        )
      );
    },
    []
  );

  const updateHoursStudied = useCallback((subjectId: string, blockId: string, hours: number) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              blocks: subject.blocks.map(block =>
                block.id === blockId ? { ...block, hoursStudied: hours } : block
              ),
            }
          : subject
      )
    );
  }, []);

  const updateBlockLinks = useCallback((subjectId: string, blockId: string, links: ExternalLink[]) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              blocks: subject.blocks.map(block =>
                block.id === blockId ? { ...block, externalLinks: links } : block
              ),
            }
          : subject
      )
    );
  }, []);

  const updateBlockRedoFavorites = useCallback((subjectId: string, blockId: string, value: boolean) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              blocks: subject.blocks.map(block =>
                block.id === blockId ? { ...block, redoFavorites: value } : block
              ),
            }
          : subject
      )
    );
  }, []);

  const configureMonthlyGiro = useCallback((subjectId: string, config: MonthlyGiroConfig) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? { ...subject, monthlyGiro: config }
          : subject
      )
    );
  }, []);

  const updateSubjectPhase = useCallback((subjectId: string, phase: StudyPhase) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? { ...subject, studyPhase: phase }
          : subject
      )
    );
  }, []);

  const updateSubjectTecLink = useCallback((subjectId: string, link: string) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? { ...subject, tecCadernoLink: link }
          : subject
      )
    );
  }, []);

  const updateSubjectFavoritosUrl = useCallback((subjectId: string, url: string) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? { ...subject, favoritosUrl: url }
          : subject
      )
    );
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  }, []);

  const deleteBlock = useCallback((subjectId: string, blockId: string) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? { ...subject, blocks: subject.blocks.filter(b => b.id !== blockId) }
          : subject
      )
    );
  }, []);

  const updateBlockUrls = useCallback((subjectId: string, blockId: string, questoesUrl: string, favoritosUrl: string) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              blocks: subject.blocks.map(block =>
                block.id === blockId 
                  ? { ...block, questoesUrl, favoritosUrl } 
                  : block
              ),
            }
          : subject
      )
    );
  }, []);
  const addHoursToCurrentBlock = useCallback((minutes: number) => {
    const current = getCurrentBlock();
    if (current) {
      const hoursToAdd = minutes / 60;
      const newHours = current.block.hoursStudied + hoursToAdd;
      setSubjects(prev =>
        prev.map(subject =>
          subject.id === current.subject.id
            ? {
                ...subject,
                blocks: subject.blocks.map(block =>
                  block.id === current.block.id 
                    ? { ...block, hoursStudied: newHours } 
                    : block
                ),
              }
            : subject
        )
      );
      return { block: current.block, subject: current.subject, newHours };
    }
    return null;
  }, [getCurrentBlock]);

  return {
    subjects,
    getStats,
    getCurrentBlock,
    calculateBlockAccuracy,
    addSubject,
    addBlock,
    updateBlockStatus,
    setCurrentBlock,
    addQuestionSession,
    updateHoursStudied,
    updateBlockLinks,
    updateBlockRedoFavorites,
    configureMonthlyGiro,
    updateSubjectPhase,
    updateSubjectTecLink,
    updateSubjectFavoritosUrl,
    updateBlockUrls,
    deleteSubject,
    deleteBlock,
    addHoursToCurrentBlock,
  };
};
