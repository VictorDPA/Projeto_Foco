import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Subject, StudyBlock, QuestionSession, StudyStats, SubjectWeight, ExternalLink, MonthlyGiroConfig, StudyPhase, StudyTimeSession } from '@/types/study';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

// Transform database row to frontend type
const transformSubject = (dbSubject: any): Subject => ({
  id: dbSubject.id,
  name: dbSubject.name,
  color: dbSubject.color,
  weight: dbSubject.weight as SubjectWeight,
  blocks: [],
  createdAt: dbSubject.created_at,
  monthlyGiro: dbSubject.monthly_giro as MonthlyGiroConfig | undefined,
  studyPhase: dbSubject.study_phase as StudyPhase | undefined,
  tecCadernoLink: dbSubject.tec_caderno_link || undefined,
  favoritosUrl: dbSubject.favoritos_url || undefined,
});

const transformBlock = (dbBlock: any): StudyBlock => ({
  id: dbBlock.id,
  name: dbBlock.name,
  description: dbBlock.description || '',
  status: dbBlock.status,
  questionSessions: [],
  timeSessions: [],
  hoursStudied: Number(dbBlock.hours_studied) || 0,
  isCurrent: dbBlock.is_current || false,
  createdAt: dbBlock.created_at,
  externalLinks: (dbBlock.external_links as ExternalLink[]) || [],
  redoFavorites: dbBlock.redo_favorites || false,
  questoesUrl: dbBlock.questoes_url || undefined,
  favoritosUrl: dbBlock.favoritos_url || undefined,
  currentPage: dbBlock.current_page || 0,
  totalPages: dbBlock.total_pages || 0,
  pdfQuestionsDone: dbBlock.pdf_questions_done || 0,
  pdfQuestionsTotal: dbBlock.pdf_questions_total || 0,
});

const transformSession = (dbSession: any): QuestionSession => ({
  id: dbSession.id,
  date: dbSession.session_date,
  totalQuestions: dbSession.total_questions,
  hits: dbSession.hits,
  examBoard: dbSession.exam_board,
});

const transformTimeSession = (dbSession: any): StudyTimeSession => ({
  id: dbSession.id,
  blockId: dbSession.block_id,
  sessionDate: dbSession.session_date,
  durationSeconds: dbSession.duration_seconds,
  createdAt: dbSession.created_at,
});

export const useSupabaseStudyData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all subjects with their blocks and sessions
  const { data: subjects = [], isLoading, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: true });

      if (subjectsError) throw subjectsError;

      // Fetch blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('study_blocks')
        .select('*')
        .order('created_at', { ascending: true });

      if (blocksError) throw blocksError;

      // Fetch question sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('question_sessions')
        .select('*')
        .order('session_date', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch time sessions
      const { data: timeSessionsData, error: timeSessionsError } = await supabase
        .from('study_time_sessions')
        .select('*')
        .order('session_date', { ascending: false });

      if (timeSessionsError) throw timeSessionsError;

      // Transform and combine data
      const subjects: Subject[] = (subjectsData || []).map(transformSubject);
      const blocks: StudyBlock[] = (blocksData || []).map(transformBlock);
      const sessions: QuestionSession[] = (sessionsData || []).map(transformSession);
      const timeSessions: StudyTimeSession[] = (timeSessionsData || []).map(transformTimeSession);

      // Attach sessions to blocks
      blocks.forEach(block => {
        block.questionSessions = (sessionsData || [])
          .filter(s => s.block_id === block.id)
          .map(transformSession);
        block.timeSessions = (timeSessionsData || [])
          .filter(s => s.block_id === block.id)
          .map(transformTimeSession);
      });

      // Attach blocks to subjects
      subjects.forEach(subject => {
        subject.blocks = blocks.filter(b => {
          const dbBlock = blocksData?.find(db => db.id === b.id);
          return dbBlock?.subject_id === subject.id;
        });
      });

      return subjects;
    },
  });

  // Calculate stats
  const getStats = (): StudyStats => {
    let totalHours = 0;
    let totalQuestions = 0;
    let totalHits = 0;
    let activeBlocks = 0;
    let completedBlocks = 0;

    subjects.forEach(subject => {
      subject.blocks.forEach(block => {
        // Use time sessions as source of truth if available
        if (block.timeSessions && block.timeSessions.length > 0) {
          const totalSeconds = block.timeSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
          totalHours += totalSeconds / 3600;
        } else {
          totalHours += block.hoursStudied;
        }
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
  };

  // NOTE: must be stable across renders; other hooks depend on this function reference.
  const calculateBlockAccuracy = useCallback((block: StudyBlock): number => {
    if (block.questionSessions.length === 0) return 0;
    const totalQuestions = block.questionSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalHits = block.questionSessions.reduce((sum, s) => sum + s.hits, 0);
    return totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : 0;
  }, []);

  const getCurrentBlock = (): { block: StudyBlock; subject: Subject } | null => {
    for (const subject of subjects) {
      const currentBlock = subject.blocks.find(b => b.isCurrent);
      if (currentBlock) {
        return { block: currentBlock, subject };
      }
    }
    return null;
  };

  // Add Subject
  const addSubjectMutation = useMutation({
    mutationFn: async ({ name, color, weight }: { name: string; color: string; weight: SubjectWeight }) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ name, color, weight, user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Matéria criada!', description: 'A matéria foi adicionada com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Não foi possível criar a matéria.', variant: 'destructive' });
    },
  });

  // Add Block
  const addBlockMutation = useMutation({
    mutationFn: async ({ subjectId, name, description }: { subjectId: string; name: string; description: string }) => {
      const { data, error } = await supabase
        .from('study_blocks')
        .insert({ subject_id: subjectId, name, description, status: 'not_started', user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Block Status
  const updateBlockStatusMutation = useMutation({
    mutationFn: async ({ blockId, status }: { blockId: string; status: string }) => {
      const { error } = await supabase
        .from('study_blocks')
        .update({ status })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Set Current Block (Toggle - if already current, remove focus)
  const setCurrentBlockMutation = useMutation({
    mutationFn: async ({ blockId, isCurrentlyFocused }: { blockId: string; isCurrentlyFocused: boolean }) => {
      if (isCurrentlyFocused) {
        // Remove focus from this block
        const { error } = await supabase
          .from('study_blocks')
          .update({ is_current: false })
          .eq('id', blockId);
        if (error) throw error;
      } else {
        // First, unset all current blocks
        await supabase.from('study_blocks').update({ is_current: false }).neq('id', '');
        // Set the new current block
        const { error } = await supabase
          .from('study_blocks')
          .update({ is_current: true })
          .eq('id', blockId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Block Hours
  const updateHoursStudiedMutation = useMutation({
    mutationFn: async ({ blockId, hours }: { blockId: string; hours: number }) => {
      const { error } = await supabase
        .from('study_blocks')
        .update({ hours_studied: hours })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Block URLs
  const updateBlockUrlsMutation = useMutation({
    mutationFn: async ({ blockId, questoesUrl, favoritosUrl }: { blockId: string; questoesUrl: string | null; favoritosUrl: string | null }) => {
      const { error } = await supabase
        .from('study_blocks')
        .update({ 
          questoes_url: questoesUrl || null, 
          favoritos_url: favoritosUrl || null 
        })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Subject Phase
  const updateSubjectPhaseMutation = useMutation({
    mutationFn: async ({ subjectId, phase }: { subjectId: string; phase: StudyPhase }) => {
      const { error } = await supabase
        .from('subjects')
        .update({ study_phase: phase })
        .eq('id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Subject Weight
  const updateSubjectWeightMutation = useMutation({
    mutationFn: async ({ subjectId, weight }: { subjectId: string; weight: SubjectWeight }) => {
      const { error } = await supabase
        .from('subjects')
        .update({ weight })
        .eq('id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Subject TEC Link
  const updateSubjectTecLinkMutation = useMutation({
    mutationFn: async ({ subjectId, link }: { subjectId: string; link: string | null }) => {
      const { error } = await supabase
        .from('subjects')
        .update({ tec_caderno_link: link || null })
        .eq('id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Subject Favoritos URL
  const updateSubjectFavoritosUrlMutation = useMutation({
    mutationFn: async ({ subjectId, url }: { subjectId: string; url: string | null }) => {
      const { error } = await supabase
        .from('subjects')
        .update({ favoritos_url: url || null })
        .eq('id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Delete Subject
  const deleteSubjectMutation = useMutation({
    mutationFn: async ({ subjectId }: { subjectId: string }) => {
      // Delete related blocks first
      await supabase.from('study_blocks').delete().eq('subject_id', subjectId);
      const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Matéria excluída!', description: 'A matéria foi removida com sucesso.' });
    },
  });

  // Delete Block
  const deleteBlockMutation = useMutation({
    mutationFn: async ({ blockId }: { blockId: string }) => {
      // Delete related sessions first
      await supabase.from('question_sessions').delete().eq('block_id', blockId);
      await supabase.from('study_time_sessions').delete().eq('block_id', blockId);
      const { error } = await supabase.from('study_blocks').delete().eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Add Question Session
  const addQuestionSessionMutation = useMutation({
    mutationFn: async ({ blockId, session }: { blockId: string; session: Omit<QuestionSession, 'id'> }) => {
      const { error } = await supabase
        .from('question_sessions')
        .insert({
          block_id: blockId,
          session_date: session.date,
          total_questions: session.totalQuestions,
          hits: session.hits,
          exam_board: session.examBoard || null,
          user_id: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Delete Question Session
  const deleteQuestionSessionMutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const { error } = await supabase
        .from('question_sessions')
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Sessão excluída!', description: 'A acurácia foi recalculada.' });
    },
  });

  // Add Time Session
  const addTimeSessionMutation = useMutation({
    mutationFn: async ({ blockId, durationSeconds, sessionDate }: { blockId: string; durationSeconds: number; sessionDate?: string }) => {
      const { error } = await supabase
        .from('study_time_sessions')
        .insert({
          block_id: blockId,
          duration_seconds: durationSeconds,
          session_date: sessionDate || new Date().toISOString().split('T')[0],
          user_id: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Delete Time Session
  const deleteTimeSessionMutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const { error } = await supabase
        .from('study_time_sessions')
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Sessão de tempo excluída!', description: 'O tempo total foi atualizado.' });
    },
  });

  // Update Block Links (JSON)
  const updateBlockLinksMutation = useMutation({
    mutationFn: async ({ blockId, links }: { blockId: string; links: ExternalLink[] }) => {
      const { error } = await supabase
        .from('study_blocks')
        .update({ external_links: links as unknown as Json })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Block Redo Favorites
  const updateBlockRedoFavoritesMutation = useMutation({
    mutationFn: async ({ blockId, value }: { blockId: string; value: boolean }) => {
      const { error } = await supabase
        .from('study_blocks')
        .update({ redo_favorites: value })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Configure Monthly Giro
  const configureMonthlyGiroMutation = useMutation({
    mutationFn: async ({ subjectId, config }: { subjectId: string; config: MonthlyGiroConfig }) => {
      const { error } = await supabase
        .from('subjects')
        .update({ monthly_giro: config as unknown as Json })
        .eq('id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Block Current Page
  const updateBlockCurrentPageMutation = useMutation({
    mutationFn: async ({ blockId, currentPage }: { blockId: string; currentPage: number }) => {
      const { error } = await supabase
        .from('study_blocks')
        .update({ current_page: currentPage })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Block Name and Description
  const updateBlockDetailsMutation = useMutation({
    mutationFn: async ({ blockId, name, description }: { blockId: string; name: string; description: string }) => {
      const { error } = await supabase
        .from('study_blocks')
        .update({ name, description })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Reset Block Hours to Zero
  const resetBlockHoursMutation = useMutation({
    mutationFn: async ({ blockId }: { blockId: string }) => {
      // Delete all time sessions for this block
      await supabase.from('study_time_sessions').delete().eq('block_id', blockId);
      // Reset hours_studied to 0
      const { error } = await supabase
        .from('study_blocks')
        .update({ hours_studied: 0 })
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Update Block PDF Progress (pages and questions)
  const updateBlockPdfProgressMutation = useMutation({
    mutationFn: async ({ 
      blockId, 
      currentPage,
      totalPages,
      pdfQuestionsDone,
      pdfQuestionsTotal 
    }: { 
      blockId: string; 
      currentPage?: number;
      totalPages?: number;
      pdfQuestionsDone?: number;
      pdfQuestionsTotal?: number;
    }) => {
      const updateData: any = {};
      if (currentPage !== undefined) updateData.current_page = currentPage;
      if (totalPages !== undefined) updateData.total_pages = totalPages;
      if (pdfQuestionsDone !== undefined) updateData.pdf_questions_done = pdfQuestionsDone;
      if (pdfQuestionsTotal !== undefined) updateData.pdf_questions_total = pdfQuestionsTotal;
      
      const { error } = await supabase
        .from('study_blocks')
        .update(updateData)
        .eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const addHoursToBlock = async (subjectId: string, blockId: string, minutes: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return null;
    
    const block = subject.blocks.find(b => b.id === blockId);
    if (!block) return null;

    const seconds = Math.round(minutes * 60);
    
    // Add time session instead of just updating hours
    await addTimeSessionMutation.mutateAsync({ blockId, durationSeconds: seconds });
    
    // Also update hours_studied for backwards compatibility
    const hoursToAdd = minutes / 60;
    const newHours = block.hoursStudied + hoursToAdd;
    await updateHoursStudiedMutation.mutateAsync({ blockId, hours: newHours });
    
    return { block, subject, newHours };
  };

  // Wrapper functions for compatibility
  const addSubject = (name: string, color: string, weight: SubjectWeight = 2) => {
    addSubjectMutation.mutate({ name, color, weight });
  };

  const addBlock = (subjectId: string, name: string, description: string) => {
    addBlockMutation.mutate({ subjectId, name, description });
  };

  const updateBlockStatus = (subjectId: string, blockId: string, status: StudyBlock['status']) => {
    updateBlockStatusMutation.mutate({ blockId, status });
  };

  const setCurrentBlock = (subjectId: string, blockId: string, isCurrentlyFocused: boolean = false) => {
    setCurrentBlockMutation.mutate({ blockId, isCurrentlyFocused });
  };

  const updateHoursStudied = (subjectId: string, blockId: string, hours: number) => {
    updateHoursStudiedMutation.mutate({ blockId, hours });
  };

  const updateBlockUrls = (subjectId: string, blockId: string, questoesUrl: string, favoritosUrl: string) => {
    updateBlockUrlsMutation.mutate({ 
      blockId, 
      questoesUrl: questoesUrl || null, 
      favoritosUrl: favoritosUrl || null 
    });
  };

  const updateSubjectPhase = (subjectId: string, phase: StudyPhase) => {
    updateSubjectPhaseMutation.mutate({ subjectId, phase });
  };

  const updateSubjectWeight = (subjectId: string, weight: SubjectWeight) => {
    updateSubjectWeightMutation.mutate({ subjectId, weight });
  };

  const updateSubjectTecLink = (subjectId: string, link: string) => {
    updateSubjectTecLinkMutation.mutate({ subjectId, link: link || null });
  };

  const updateSubjectFavoritosUrl = (subjectId: string, url: string) => {
    updateSubjectFavoritosUrlMutation.mutate({ subjectId, url: url || null });
  };

  const deleteSubject = (subjectId: string) => {
    deleteSubjectMutation.mutate({ subjectId });
  };

  const deleteBlock = (subjectId: string, blockId: string) => {
    deleteBlockMutation.mutate({ blockId });
  };

  const addQuestionSession = (subjectId: string, blockId: string, session: Omit<QuestionSession, 'id'>) => {
    addQuestionSessionMutation.mutate({ blockId, session });
  };

  const deleteQuestionSession = (sessionId: string) => {
    deleteQuestionSessionMutation.mutate({ sessionId });
  };

  const addTimeSession = (blockId: string, durationSeconds: number, sessionDate?: string) => {
    addTimeSessionMutation.mutate({ blockId, durationSeconds, sessionDate });
  };

  const deleteTimeSession = (sessionId: string) => {
    deleteTimeSessionMutation.mutate({ sessionId });
  };

  const updateBlockLinks = (subjectId: string, blockId: string, links: ExternalLink[]) => {
    updateBlockLinksMutation.mutate({ blockId, links });
  };

  const updateBlockRedoFavorites = (subjectId: string, blockId: string, value: boolean) => {
    updateBlockRedoFavoritesMutation.mutate({ blockId, value });
  };

  const configureMonthlyGiro = (subjectId: string, config: MonthlyGiroConfig) => {
    configureMonthlyGiroMutation.mutate({ subjectId, config });
  };

  const updateBlockCurrentPage = (subjectId: string, blockId: string, currentPage: number) => {
    updateBlockCurrentPageMutation.mutate({ blockId, currentPage });
  };

  const updateBlockDetails = (subjectId: string, blockId: string, name: string, description: string) => {
    updateBlockDetailsMutation.mutate({ blockId, name, description });
  };

  const resetBlockHours = (subjectId: string, blockId: string) => {
    resetBlockHoursMutation.mutate({ blockId });
  };

  const updateBlockPdfProgress = (
    subjectId: string, 
    blockId: string, 
    data: { 
      currentPage?: number; 
      totalPages?: number; 
      pdfQuestionsDone?: number; 
      pdfQuestionsTotal?: number; 
    }
  ) => {
    updateBlockPdfProgressMutation.mutate({ blockId, ...data });
  };

  return {
    subjects,
    isLoading,
    refetch,
    getStats,
    getCurrentBlock,
    calculateBlockAccuracy,
    addSubject,
    addBlock,
    updateBlockStatus,
    setCurrentBlock,
    addQuestionSession,
    deleteQuestionSession,
    addTimeSession,
    deleteTimeSession,
    updateHoursStudied,
    updateBlockLinks,
    updateBlockRedoFavorites,
    configureMonthlyGiro,
    updateSubjectPhase,
    updateSubjectWeight,
    updateSubjectTecLink,
    updateSubjectFavoritosUrl,
    updateBlockUrls,
    deleteSubject,
    deleteBlock,
    addHoursToBlock,
    updateBlockCurrentPage,
    updateBlockDetails,
    resetBlockHours,
    updateBlockPdfProgress,
  };
};
