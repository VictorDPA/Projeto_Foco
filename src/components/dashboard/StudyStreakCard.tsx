import { Flame, Trophy } from 'lucide-react';
import { useStudyStreak } from '@/hooks/useStudyStreak';

export const StudyStreakCard = () => {
  const { streak, hasStudiedToday } = useStudyStreak();

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground">
          Sequência de Estudos
        </h3>
        <div className={`p-2 rounded-lg ${hasStudiedToday ? 'bg-primary/20' : 'bg-muted'}`}>
          <Flame className={`h-5 w-5 ${hasStudiedToday ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 rounded-xl bg-muted/50">
          <p className="text-3xl font-bold text-primary mb-1">
            {streak.currentStreak}
          </p>
          <p className="text-xs text-muted-foreground">Dias seguidos</p>
        </div>

        <div className="text-center p-4 rounded-xl bg-muted/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="h-4 w-4 text-warning" />
            <p className="text-3xl font-bold text-foreground">
              {streak.longestStreak}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Recorde</p>
        </div>
      </div>

      {!hasStudiedToday && (
        <p className="text-xs text-center text-muted-foreground mt-4">
          Estude hoje para manter sua sequência!
        </p>
      )}

      {hasStudiedToday && (
        <p className="text-xs text-center text-success mt-4">
          ✓ Você já estudou hoje!
        </p>
      )}
    </div>
  );
};
