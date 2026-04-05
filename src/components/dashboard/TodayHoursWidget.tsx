import { useMemo } from 'react';
import { Clock, Timer, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';
import { formatHoursToHHMMSS } from '@/lib/timeFormat';
import { cn } from '@/lib/utils';

export const TodayHoursWidget = () => {
  const { subjects } = useSupabaseStudyData();

  // Calculate today's hours from study_time_sessions (fed by Timer)
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let todaySeconds = 0;
    let weekSeconds = 0;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    subjects.forEach(subject => {
      subject.blocks.forEach(block => {
        if (block.timeSessions) {
          block.timeSessions.forEach(session => {
            if (session.sessionDate === today) {
              todaySeconds += session.durationSeconds;
            }
            if (session.sessionDate >= weekStartStr) {
              weekSeconds += session.durationSeconds;
            }
          });
        }
      });
    });

    return {
      todaySeconds,
      todayHours: todaySeconds / 3600,
      weekHours: weekSeconds / 3600,
    };
  }, [subjects]);

  const dailyGoalHours = 4; // Could be configurable
  const progressPercent = Math.min(100, (todayStats.todayHours / dailyGoalHours) * 100);
  const isGoalMet = todayStats.todayHours >= dailyGoalHours;

  return (
    <Card className="p-5 border-primary/20 bg-gradient-card overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          isGoalMet ? "bg-success/20" : "bg-primary/10"
        )}>
          <Timer className={cn("h-6 w-6", isGoalMet ? "text-success" : "text-primary")} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Horas Líquidas</h3>
          <p className="text-xs text-muted-foreground">Via Timer de Foco</p>
        </div>
      </div>

      {/* Main Counter */}
      <div className="text-center py-4 mb-4 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground mb-1">Hoje</p>
        <p className={cn(
          "font-mono text-3xl font-bold tracking-wider",
          isGoalMet ? "text-success" : "text-primary"
        )}>
          {formatHoursToHHMMSS(todayStats.todayHours)}
        </p>
      </div>

      {/* Progress to daily goal */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Meta Diária</span>
          <span className={cn("font-medium", isGoalMet ? "text-success" : "text-foreground")}>
            {progressPercent.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isGoalMet ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-center">
          Meta: {dailyGoalHours}h por dia
        </p>
      </div>

      {/* Week stats */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
        </div>
        <span className="font-mono text-sm font-semibold text-foreground">
          {formatHoursToHHMMSS(todayStats.weekHours)}
        </span>
      </div>
    </Card>
  );
};
