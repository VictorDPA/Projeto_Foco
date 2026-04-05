import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseStudyData } from './useSupabaseStudyData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DayConfig {
  id?: string;
  dayOfWeek: number;
  dayName: string;
  shortName: string;
  availableHours: number;
}

export interface AgendaSlot {
  id: string;
  dayOfWeek: number;
  blockId: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  blockName: string;
  slotOrder: number;
  durationMinutes: number;
  slotType: 'theory' | 'practice' | 'reinforcement';
  isCompleted: boolean;
  completedAt?: string;
  actualDurationMinutes?: number;
  // Computed fields from block
  weight: number;
  studyPhase: string;
  accuracy: number;
  status: string;
  currentPage?: number;
  totalPages?: number;
}

const DAYS_OF_WEEK = [
  { dayOfWeek: 0, dayName: 'Segunda-feira', shortName: 'Seg' },
  { dayOfWeek: 1, dayName: 'Terça-feira', shortName: 'Ter' },
  { dayOfWeek: 2, dayName: 'Quarta-feira', shortName: 'Qua' },
  { dayOfWeek: 3, dayName: 'Quinta-feira', shortName: 'Qui' },
  { dayOfWeek: 4, dayName: 'Sexta-feira', shortName: 'Sex' },
  { dayOfWeek: 5, dayName: 'Sábado', shortName: 'Sáb' },
  { dayOfWeek: 6, dayName: 'Domingo', shortName: 'Dom' },
];

export const useAgendaData = () => {
  const { user } = useAuth();
  const { subjects, calculateBlockAccuracy, isLoading: isStudyLoading } = useSupabaseStudyData();
  
  const [daysConfig, setDaysConfig] = useState<DayConfig[]>([]);
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get today's day of week (Monday = 0, Sunday = 6)
  const todayDayOfWeek = useMemo(() => {
    const jsDay = new Date().getDay(); // Sunday = 0, Monday = 1, etc.
    return jsDay === 0 ? 6 : jsDay - 1; // Convert to Monday = 0
  }, []);

  // Fetch days configuration
  const fetchDaysConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('daily_agenda')
      .select('*')
      .order('day_of_week');

    if (error) {
      console.error('Error fetching days config:', error);
      return;
    }

    const config = DAYS_OF_WEEK.map(day => {
      const dbDay = data?.find(d => d.day_of_week === day.dayOfWeek);
      return {
        id: dbDay?.id,
        dayOfWeek: day.dayOfWeek,
        dayName: day.dayName,
        shortName: day.shortName,
        availableHours: dbDay?.available_hours || 4,
      };
    });

    setDaysConfig(config);
  }, []);

  // Fetch slots and enrich with block data
  const fetchSlots = useCallback(async () => {
    const { data, error } = await supabase
      .from('agenda_slots')
      .select(`
        *,
        study_blocks (
          id,
          name,
          status,
          current_page,
          total_pages,
          subject_id,
          subjects (
            id,
            name,
            color,
            weight,
            study_phase
          )
        )
      `)
      .order('day_of_week')
      .order('slot_order');

    if (error) {
      console.error('Error fetching slots:', error);
      return;
    }

    const enrichedSlots: AgendaSlot[] = (data || []).map(slot => {
      const block = slot.study_blocks;
      const subject = block?.subjects;
      const blockFromContext = subjects
        .flatMap(s => s.blocks)
        .find(b => b.id === slot.block_id);
      const accuracy = blockFromContext ? calculateBlockAccuracy(blockFromContext) : 0;

      return {
        id: slot.id,
        dayOfWeek: slot.day_of_week,
        blockId: slot.block_id,
        subjectId: subject?.id || '',
        subjectName: subject?.name || '',
        subjectColor: subject?.color || '#FFD700',
        blockName: block?.name || '',
        slotOrder: slot.slot_order,
        durationMinutes: slot.duration_minutes,
        slotType: slot.slot_type as 'theory' | 'practice' | 'reinforcement',
        isCompleted: slot.is_completed,
        completedAt: slot.completed_at,
        actualDurationMinutes: slot.actual_duration_minutes,
        weight: subject?.weight || 2,
        studyPhase: subject?.study_phase || 'iniciante',
        accuracy,
        status: block?.status || 'not_started',
        currentPage: block?.current_page,
        totalPages: block?.total_pages,
      };
    });

    setSlots(enrichedSlots);
  }, [subjects, calculateBlockAccuracy]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDaysConfig(), fetchSlots()]);
      setIsLoading(false);
    };
    
    if (!isStudyLoading) {
      loadData();
    }
  }, [fetchDaysConfig, fetchSlots, isStudyLoading]);

  // Update day available hours
  const updateDayHours = useCallback(async (dayOfWeek: number, hours: number) => {
    const { error } = await supabase
      .from('daily_agenda')
      .update({ available_hours: hours })
      .eq('day_of_week', dayOfWeek);

    if (error) {
      console.error('Error updating day hours:', error);
      toast.error('Erro ao atualizar horas');
      return;
    }

    setDaysConfig(prev => prev.map(d => 
      d.dayOfWeek === dayOfWeek ? { ...d, availableHours: hours } : d
    ));
  }, []);

  // Mark slot as completed
  const markSlotCompleted = useCallback(async (slotId: string, actualMinutes?: number) => {
    const { error } = await supabase
      .from('agenda_slots')
      .update({ 
        is_completed: true, 
        completed_at: new Date().toISOString(),
        actual_duration_minutes: actualMinutes
      })
      .eq('id', slotId);

    if (error) {
      console.error('Error marking slot completed:', error);
      toast.error('Erro ao marcar slot');
      return;
    }

    setSlots(prev => prev.map(s => 
      s.id === slotId ? { 
        ...s, 
        isCompleted: true, 
        completedAt: new Date().toISOString(),
        actualDurationMinutes: actualMinutes 
      } : s
    ));
  }, []);

  // Toggle slot completion
  const toggleSlotCompleted = useCallback(async (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const newCompleted = !slot.isCompleted;
    
    const { error } = await supabase
      .from('agenda_slots')
      .update({ 
        is_completed: newCompleted, 
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq('id', slotId);

    if (error) {
      console.error('Error toggling slot:', error);
      toast.error('Erro ao atualizar slot');
      return;
    }

    setSlots(prev => prev.map(s => 
      s.id === slotId ? { 
        ...s, 
        isCompleted: newCompleted, 
        completedAt: newCompleted ? new Date().toISOString() : undefined 
      } : s
    ));
  }, [slots]);

  // Clear all slots
  const clearSlots = useCallback(async () => {
    const { error } = await supabase
      .from('agenda_slots')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error clearing slots:', error);
      return;
    }

    setSlots([]);
  }, []);

  // Generate weekly schedule
  const generateWeekSchedule = useCallback(async () => {
    // Clear existing slots first
    await clearSlots();

    const newSlots: Array<{
      day_of_week: number;
      block_id: string;
      slot_order: number;
      duration_minutes: number;
      slot_type: string;
      user_id: string | undefined;
    }> = [];

    // Get all blocks with priority info
    const prioritizedBlocks = subjects.flatMap(subject => 
      subject.blocks
        .filter(block => block.status !== 'completed')
        .map(block => {
          const accuracy = calculateBlockAccuracy(block);
          const isLowAccuracy = accuracy > 0 && accuracy < 70;
          
          let priority = subject.weight * 100;
          if (isLowAccuracy) priority += 50;
          if (block.status === 'reading_pdf') priority += 25;
          
          return {
            subject,
            block,
            accuracy,
            priority,
            isLowAccuracy,
            studyPhase: subject.studyPhase || 'iniciante',
          };
        })
    ).sort((a, b) => b.priority - a.priority);

    const weight3Blocks = prioritizedBlocks.filter(b => b.subject.weight === 3);
    const lowAccuracyBlocks = prioritizedBlocks.filter(b => b.isLowAccuracy);
    const otherBlocks = prioritizedBlocks.filter(b => b.subject.weight < 3 && !b.isLowAccuracy);

    const usedBlocksThisWeek = new Map<string, number>();

    daysConfig.forEach(day => {
      const availableMinutes = day.availableHours * 60;
      let usedMinutes = 0;
      let slotOrder = 0;
      const usedBlocksToday = new Set<string>();

      const addSlot = (item: typeof prioritizedBlocks[0], type: 'theory' | 'practice' | 'reinforcement') => {
        const isTheory = item.studyPhase === 'iniciante' || item.studyPhase === 'intermediario';
        const baseDuration = isTheory && type !== 'practice' ? 90 : 45;
        const duration = Math.min(baseDuration, availableMinutes - usedMinutes);

        if (duration >= 30 && !usedBlocksToday.has(item.block.id)) {
          newSlots.push({
            day_of_week: day.dayOfWeek,
            block_id: item.block.id,
            slot_order: slotOrder++,
            duration_minutes: duration,
            slot_type: type,
            user_id: user?.id,
          });
          usedMinutes += duration;
          usedBlocksToday.add(item.block.id);
          usedBlocksThisWeek.set(item.block.id, (usedBlocksThisWeek.get(item.block.id) || 0) + 1);
          return true;
        }
        return false;
      };

      // Priority 1: Weight 3 subjects
      weight3Blocks.forEach(item => {
        const timesThisWeek = usedBlocksThisWeek.get(item.block.id) || 0;
        if (timesThisWeek < 4 && usedMinutes < availableMinutes) {
          const type = item.studyPhase === 'avancado' ? 'practice' : 'theory';
          addSlot(item, type);
        }
      });

      // Priority 2: Low accuracy blocks
      lowAccuracyBlocks.forEach(item => {
        if (usedMinutes < availableMinutes && !usedBlocksToday.has(item.block.id)) {
          addSlot(item, 'reinforcement');
        }
      });

      // Priority 3: Other blocks
      const shuffled = [...otherBlocks].sort(() => Math.random() - 0.5);
      shuffled.forEach(item => {
        if (usedMinutes < availableMinutes && !usedBlocksToday.has(item.block.id)) {
          const timesThisWeek = usedBlocksThisWeek.get(item.block.id) || 0;
          if (timesThisWeek < 2) {
            const type = item.studyPhase === 'avancado' ? 'practice' : 'theory';
            addSlot(item, type);
          }
        }
      });
    });

    // Insert all new slots
    if (newSlots.length > 0) {
      const { error } = await supabase
        .from('agenda_slots')
        .insert(newSlots);

      if (error) {
        console.error('Error inserting slots:', error);
        toast.error('Erro ao gerar agenda');
        return;
      }
    }

    await fetchSlots();
    toast.success('Agenda semanal gerada com sucesso!');
  }, [subjects, calculateBlockAccuracy, daysConfig, clearSlots, fetchSlots]);

  // Reorder slot
  const reorderSlot = useCallback(async (slotId: string, newOrder: number, newDayOfWeek?: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const updates: { slot_order: number; day_of_week?: number } = { slot_order: newOrder };
    if (newDayOfWeek !== undefined) {
      updates.day_of_week = newDayOfWeek;
    }

    const { error } = await supabase
      .from('agenda_slots')
      .update(updates)
      .eq('id', slotId);

    if (error) {
      console.error('Error reordering slot:', error);
      toast.error('Erro ao reordenar slot');
      return;
    }

    setSlots(prev => prev.map(s => 
      s.id === slotId ? { 
        ...s, 
        slotOrder: newOrder,
        dayOfWeek: newDayOfWeek ?? s.dayOfWeek 
      } : s
    ).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.slotOrder - b.slotOrder));
  }, [slots]);

  // Get slots for a specific day
  const getSlotsForDay = useCallback((dayOfWeek: number) => {
    return slots
      .filter(s => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.slotOrder - b.slotOrder);
  }, [slots]);

  // Get today's slots
  const todaySlots = useMemo(() => getSlotsForDay(todayDayOfWeek), [getSlotsForDay, todayDayOfWeek]);

  // Get today's config
  const todayConfig = useMemo(() => 
    daysConfig.find(d => d.dayOfWeek === todayDayOfWeek),
    [daysConfig, todayDayOfWeek]
  );

  // Calculate metrics
  const todayMetrics = useMemo(() => {
    const todaySlotsData = todaySlots;
    const completed = todaySlotsData.filter(s => s.isCompleted);
    const plannedMinutes = todaySlotsData.reduce((sum, s) => sum + s.durationMinutes, 0);
    const completedMinutes = completed.reduce((sum, s) => sum + (s.actualDurationMinutes || s.durationMinutes), 0);
    const overrunMinutes = completed.reduce((sum, s) => {
      const actual = s.actualDurationMinutes || 0;
      const planned = s.durationMinutes;
      return sum + Math.max(0, actual - planned);
    }, 0);

    return {
      totalSlots: todaySlotsData.length,
      completedSlots: completed.length,
      plannedHours: plannedMinutes / 60,
      completedHours: completedMinutes / 60,
      overrunMinutes,
      isOverrun: overrunMinutes > 0,
    };
  }, [todaySlots]);

  const weekMetrics = useMemo(() => {
    const totalSlots = slots.length;
    const completedSlots = slots.filter(s => s.isCompleted).length;
    const totalPlannedHours = daysConfig.reduce((sum, d) => sum + d.availableHours, 0);
    
    return {
      totalSlots,
      completedSlots,
      totalPlannedHours,
    };
  }, [slots, daysConfig]);

  return {
    daysConfig,
    slots,
    isLoading: isLoading || isStudyLoading,
    todayDayOfWeek,
    todaySlots,
    todayConfig,
    todayMetrics,
    weekMetrics,
    updateDayHours,
    markSlotCompleted,
    toggleSlotCompleted,
    generateWeekSchedule,
    reorderSlot,
    getSlotsForDay,
    refreshSlots: fetchSlots,
  };
};
