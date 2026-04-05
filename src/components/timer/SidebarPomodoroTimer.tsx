import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';
import { toast } from 'sonner';

const STORAGE_KEY = 'elite_fiscal_sidebar_pomodoro';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  mode: 'focus' | 'break';
  customBreakMinutes: number;
  soundEnabled: boolean;
  selectedSubjectId: string;
  selectedBlockId: string;
}

export const SidebarPomodoroTimer = () => {
  const { subjects, addTimeSession, updateHoursStudied } = useSupabaseStudyData();
  
  const [state, setState] = useState<TimerState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { 
        ...parsed, 
        isRunning: false, 
        isPaused: parsed.isRunning ? true : false,
        customBreakMinutes: parsed.customBreakMinutes || 5,
        selectedSubjectId: parsed.selectedSubjectId || '',
        selectedBlockId: parsed.selectedBlockId || '',
      };
    }
    return {
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      mode: 'focus' as const,
      customBreakMinutes: 5,
      soundEnabled: true,
      selectedSubjectId: '',
      selectedBlockId: '',
    };
  });

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get selected subject and block info
  const selectedSubject = subjects.find(s => s.id === state.selectedSubjectId);
  const selectedBlock = selectedSubject?.blocks.find(b => b.id === state.selectedBlockId);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleymLv9TJfS0ZXqnS2J1REzKe0+O4ayUIfLrX2YhJEEmr3eiocxsAcLTb3ptXES2k3+i5fSQFdrPd4qBaECal4ei+giUCcLPf46heESWn4em+giUBcbTg5KhfECWn4um/gyYAcbXh5apgDySo4+rAgyUAcrbh5qphDiKo5OvBhCUAc7fj56xjDSCp5evBhSUAdLjk6K5lDByq5u3ChiQAdbrl6rFnCxis5+7DhyMAdrzn7LNpCRSt6O/EiCIAd73o7rVrBxCv6fHGiSEAeL7p8LdtBQyx6vLHiiAAeb/q8bltAwmy6/PIiyAAesHr87pvAQe07PPJjB8AesLs9LxwAAO17fTKjR4Ae8Pt9b5yAAC27vXLjh0AfMTu9sBzAAC47/bMjxwAfcXv98FzAAC58PfNkBsAfsbw+MJ0AAC68fjOkRoAf8fx+cN0AAC78vnPkhkAgMjy+sR0AAC88/rQkxgAgMnz+8V0AAC99PvRlBcAgcrz/MZ0AAC+9fzSlBYAgsvz/cd0AAC/9v3TlRUAg8zz/sh0AAC/9/7UlhQAhM3z/8l0AADA+P/VlxMAhc70/8p0AADB+f/WlxIAhs/0/8t0AADC+v/XmBEAh9D0/8x0AADD+//YmRABiNH0/810AADF/P/ZmQ8BiNL0/850AADG/f/amg4BidP0/890AADH/v/bmw0BidT0/9B0AADI///cnAwBitX0/9F0AADI//7dngsAi9b0/9J0AADI//zengoBjNf0/9N0AADH//vfnwkAjdj0/9R0AADF//rgngkAjdn0/9V0AADC//nhnQkBjtr0/9Z0AAC///jhngkAj9v0/9d0AAC8//finwkAkNz0/9h0AAC5//njnwgAkd30/9l0AAC2//nkngcAkt70/9p0AAC0/v/lngYBk9/0/9t0AACy/P7mnwUAk+D0/9x0AACv+/3pogQAlOH0/910AACt+fzpoAMAlOL0/990AACq9/vpogIAlOP0/+B0AAConvro');
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Play sound
  const playSound = useCallback(() => {
    if (state.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [state.soundEnabled]);

  // Timer logic - counts UP indefinitely in focus mode
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newElapsed = prev.elapsedSeconds + 1;
          
          // In break mode, check if break is complete
          if (prev.mode === 'break') {
            const breakTarget = prev.customBreakMinutes * 60;
            if (newElapsed >= breakTarget) {
              playSound();
              toast.success("Pausa finalizada! Hora de voltar ao foco.");
              return {
                ...prev,
                elapsedSeconds: 0,
                mode: 'focus' as const,
              };
            }
          }
          
          return { ...prev, elapsedSeconds: newElapsed };
        });
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
  }, [state.isRunning, state.isPaused, playSound]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!state.selectedSubjectId || !state.selectedBlockId) {
      toast.error("Selecione Matéria e Bloco antes de iniciar!", {
        description: "O timer requer seleção para registro de tempo."
      });
      return;
    }
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, isPaused: true }));
  };

  const handleResume = () => {
    setState(prev => ({ ...prev, isPaused: false }));
  };

  const handleStop = () => {
    if (state.elapsedSeconds > 60) { // Only prompt if more than 1 minute
      playSound();
      setCompletedSeconds(state.elapsedSeconds);
      setShowLogDialog(true);
      setState(prev => ({ ...prev, isRunning: false, isPaused: false }));
    } else {
      setState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
        elapsedSeconds: 0,
      }));
      toast.info("Menos de 1 minuto - tempo não registrado");
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
    }));
  };

  const handleSubjectChange = (subjectId: string) => {
    setState(prev => ({ ...prev, selectedSubjectId: subjectId, selectedBlockId: '' }));
  };

  const handleBlockChange = (blockId: string) => {
    setState(prev => ({ ...prev, selectedBlockId: blockId }));
  };

  const toggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleLogTime = async () => {
    if (completedSeconds > 0 && state.selectedSubjectId && state.selectedBlockId) {
      const subject = subjects.find(s => s.id === state.selectedSubjectId);
      const block = subject?.blocks.find(b => b.id === state.selectedBlockId);
      
      if (subject && block) {
        try {
          // Register time session in database (source of truth for Dashboard)
          await addTimeSession(state.selectedBlockId, completedSeconds);
          
          // Also update hours_studied for backwards compatibility
          const hoursToAdd = completedSeconds / 3600;
          const newHours = block.hoursStudied + hoursToAdd;
          await updateHoursStudied(subject.id, block.id, newHours);
          
          const minutes = Math.round(completedSeconds / 60);
          toast.success(`${formatTime(completedSeconds)} registrado!`, {
            description: `${subject.name} - ${block.name}`,
          });
        } catch (error) {
          toast.error("Erro ao registrar tempo");
        }
      }
    }
    
    setShowLogDialog(false);
    setCompletedSeconds(0);
    setState(prev => ({ ...prev, elapsedSeconds: 0 }));
  };

  const handleDismissLog = () => {
    setShowLogDialog(false);
    setCompletedSeconds(0);
    setState(prev => ({ ...prev, elapsedSeconds: 0 }));
  };

  const canStart = state.selectedSubjectId && state.selectedBlockId;

  return (
    <>
      <div className="px-3 py-3 rounded-lg bg-gradient-card border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Timer de Foco</span>
          </div>
          <button
            onClick={toggleSound}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
          >
            {state.soundEnabled ? (
              <Volume2 className="h-3 w-3 text-muted-foreground" />
            ) : (
              <VolumeX className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Subject Selector - Required */}
        <div className="mb-2">
          <label className="text-[10px] text-muted-foreground mb-1 block">
            Matéria <span className="text-destructive">*</span>
          </label>
          <Select
            value={state.selectedSubjectId}
            onValueChange={handleSubjectChange}
            disabled={state.isRunning}
          >
            <SelectTrigger className="h-8 text-xs bg-muted/50 border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="truncate">{subject.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Block Selector - Required */}
        {selectedSubject && selectedSubject.blocks.length > 0 && (
          <div className="mb-3">
            <label className="text-[10px] text-muted-foreground mb-1 block">
              Bloco <span className="text-destructive">*</span>
            </label>
            <Select
              value={state.selectedBlockId}
              onValueChange={handleBlockChange}
              disabled={state.isRunning}
            >
              <SelectTrigger className="h-8 text-xs bg-muted/50 border-border">
                <SelectValue placeholder="Selecione o bloco..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {selectedSubject.blocks.map((block) => (
                  <SelectItem key={block.id} value={block.id} className="text-xs">
                    <span className="truncate">{block.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Timer Display - Counts UP */}
        <div className="relative mb-3">
          <div 
            className={cn(
              "text-center py-4 rounded-lg transition-all",
              state.mode === 'focus' 
                ? state.isRunning ? 'bg-primary/20 border-2 border-primary/50' : 'bg-primary/10' 
                : 'bg-success/10'
            )}
          >
            <div className="text-xs text-muted-foreground mb-1">
              {state.mode === 'focus' ? '⏱️ Foco' : '☕ Pausa'}
            </div>
            <div 
              className={cn(
                "font-mono text-2xl font-bold tracking-wider",
                state.mode === 'focus' ? 'text-primary' : 'text-success',
                state.isRunning && !state.isPaused && 'animate-pulse'
              )}
            >
              {formatTime(state.elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {!state.isRunning ? (
            <Button
              size="sm"
              variant="default"
              className={cn(
                "h-8 px-4 text-primary-foreground",
                canStart ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              onClick={handleStart}
              disabled={!canStart}
            >
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </Button>
          ) : (
            <>
              {state.isPaused ? (
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleResume}
                >
                  <Play className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 border-warning/50 hover:bg-warning/20"
                  onClick={handlePause}
                >
                  <Pause className="h-3 w-3 text-warning" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 border-success/50 hover:bg-success/20"
                onClick={handleStop}
              >
                <StopCircle className="h-3 w-3 text-success" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 border-destructive/50 hover:bg-destructive/20"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3 text-destructive" />
              </Button>
            </>
          )}
        </div>

        {/* Selected block indicator */}
        {selectedSubject && selectedBlock && (
          <div className="mt-2 text-center">
            <span className="text-[10px] text-muted-foreground">
              Registrando em: <span className="text-foreground font-medium">{selectedSubject.name}</span>
              <br />
              <span className="text-primary">{selectedBlock.name}</span>
            </span>
          </div>
        )}

        {/* Requirement warning */}
        {!canStart && !state.isRunning && (
          <div className="mt-2 text-center">
            <span className="text-[10px] text-destructive">
              ⚠️ Selecione Matéria e Bloco para iniciar
            </span>
          </div>
        )}
      </div>

      {/* Log Time Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Sessão Finalizada!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Você estudou por <span className="text-primary font-bold">{formatTime(completedSeconds)}</span>.
              {selectedSubject && selectedBlock ? (
                <> Registrar em <span className="text-foreground font-medium">"{selectedSubject.name} - {selectedBlock.name}"</span>?</>
              ) : (
                <> Selecione uma matéria e bloco no timer para registrar.</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDismissLog} className="border-border">
              Descartar
            </Button>
            <Button 
              onClick={handleLogTime} 
              disabled={!selectedSubject || !selectedBlock}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Registrar Tempo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
