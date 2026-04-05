import { useState } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  onLogTime?: (minutes: number) => void;
  currentBlockName?: string;
}

export const PomodoroTimer = ({ onLogTime, currentBlockName }: PomodoroTimerProps) => {
  const { isRunning, isPaused, formattedTime, start, pause, resume, stop, getMinutes } = usePomodoroTimer();
  const { recordStudySession } = useStudyStreak();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [stoppedMinutes, setStoppedMinutes] = useState(0);

  const handleStop = () => {
    const minutes = getMinutes();
    const elapsed = stop();
    if (elapsed > 60) { // Only prompt if more than 1 minute
      setStoppedMinutes(minutes);
      setShowLogDialog(true);
    }
  };

  const handleLogTime = () => {
    if (onLogTime && stoppedMinutes > 0) {
      onLogTime(stoppedMinutes);
      recordStudySession();
    }
    setShowLogDialog(false);
    setStoppedMinutes(0);
  };

  const handleDismiss = () => {
    setShowLogDialog(false);
    setStoppedMinutes(0);
  };

  return (
    <>
      <div
        className={cn(
          'fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full px-4 py-3 shadow-elevated transition-all duration-300',
          isRunning
            ? 'bg-primary/10 border-2 border-primary'
            : 'bg-card border border-border hover:border-primary/50'
        )}
      >
        <Clock className={cn('h-5 w-5', isRunning ? 'text-primary' : 'text-muted-foreground')} />
        
        <span
          className={cn(
            'font-mono text-lg font-semibold min-w-[80px] text-center',
            isRunning ? 'text-primary' : 'text-foreground'
          )}
        >
          {formattedTime}
        </span>

        <div className="flex items-center gap-1">
          {!isRunning ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-primary/20"
              onClick={start}
            >
              <Play className="h-4 w-4 text-primary" />
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-primary/20"
                  onClick={resume}
                >
                  <Play className="h-4 w-4 text-primary" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-warning/20"
                  onClick={pause}
                >
                  <Pause className="h-4 w-4 text-warning" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-destructive/20"
                onClick={handleStop}
              >
                <Square className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Registrar Tempo de Estudo</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Você estudou por <span className="text-primary font-semibold">{stoppedMinutes.toFixed(1)} minutos</span>.
              {currentBlockName && (
                <> Deseja adicionar ao bloco <span className="text-foreground font-medium">"{currentBlockName}"</span>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDismiss} className="border-border">
              Descartar
            </Button>
            <Button onClick={handleLogTime} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
