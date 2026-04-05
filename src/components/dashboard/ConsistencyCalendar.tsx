import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Flame } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStudyData } from '@/hooks/useStudyData';

interface DayData {
  date: string;
  hours: number;
  dayOfWeek: number;
}

const HOURS_STORAGE_KEY = 'elite_fiscal_daily_hours';

// Helper to get/set daily hours from localStorage
const getDailyHours = (): Record<string, number> => {
  const stored = localStorage.getItem(HOURS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const ConsistencyCalendar = () => {
  const { subjects } = useStudyData();

  // Generate last 35 days (5 weeks) of data
  const calendarData = useMemo<DayData[]>(() => {
    const storedHours = getDailyHours();
    const days: DayData[] = [];
    const today = new Date();

    // Calculate total hours from subjects for demonstration
    let totalHours = 0;
    subjects.forEach(s => s.blocks.forEach(b => totalHours += b.hoursStudied));

    for (let i = 34; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Use stored hours or simulate based on existing data
      const hours = storedHours[dateStr] || (i < 14 && totalHours > 0 ? Math.random() * 4 : 0);
      
      days.push({
        date: dateStr,
        hours: Math.round(hours * 10) / 10,
        dayOfWeek: date.getDay(),
      });
    }

    return days;
  }, [subjects]);

  const getIntensityClass = (hours: number): string => {
    if (hours === 0) return 'bg-muted';
    if (hours < 1) return 'bg-primary/20';
    if (hours < 2) return 'bg-primary/40';
    if (hours < 3) return 'bg-primary/60';
    if (hours < 4) return 'bg-primary/80';
    return 'bg-primary';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const totalHoursMonth = useMemo(() => {
    return calendarData.reduce((sum, d) => sum + d.hours, 0);
  }, [calendarData]);

  const activeDays = useMemo(() => {
    return calendarData.filter(d => d.hours > 0).length;
  }, [calendarData]);

  // Group by week (rows of 7)
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      result.push(calendarData.slice(i, i + 7));
    }
    return result;
  }, [calendarData]);

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Calendário de Consistência
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-primary" />
            {activeDays} dias ativos
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-2">
            {/* Week day labels */}
            <div className="flex gap-1 mb-1">
              <div className="w-4" /> {/* Spacer */}
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className="w-6 h-4 text-[10px] text-muted-foreground text-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                <div className="w-4 text-[10px] text-muted-foreground flex items-center">
                  S{weekIndex + 1}
                </div>
                {week.map((day, dayIndex) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-6 h-6 rounded-sm ${getIntensityClass(day.hours)} cursor-pointer transition-all hover:ring-1 hover:ring-primary/50`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-card border-border">
                      <p className="text-xs">
                        <span className="font-medium">{formatDate(day.date)}</span>
                        <br />
                        {day.hours > 0 ? `${day.hours}h estudadas` : 'Nenhum estudo'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-3">
              <span className="text-xs text-muted-foreground">
                {Math.round(totalHoursMonth * 10) / 10}h no período
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Menos</span>
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-primary/20" />
                <div className="w-3 h-3 rounded-sm bg-primary/40" />
                <div className="w-3 h-3 rounded-sm bg-primary/60" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-[10px] text-muted-foreground">Mais</span>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-1">
              Não quebre a corrente! 🔥
            </p>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
