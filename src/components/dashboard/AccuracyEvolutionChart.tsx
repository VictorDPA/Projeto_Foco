import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AccuracyEvolutionChart = () => {
  const { subjects } = useSupabaseStudyData();

  const { chartData, trend, averageAccuracy } = useMemo(() => {
    // Get last 14 days for better trend visibility
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'dd/MM', { locale: ptBR }),
      };
    });

    // Collect all sessions with dates
    const allSessions: { date: string; hits: number; total: number }[] = [];
    subjects.forEach(subject => {
      subject.blocks.forEach(block => {
        block.questionSessions.forEach(session => {
          allSessions.push({
            date: session.date,
            hits: session.hits,
            total: session.totalQuestions,
          });
        });
      });
    });

    // Calculate cumulative average accuracy up to each day
    const data = last14Days.map((day, index) => {
      // Get all sessions up to and including this day
      const sessionsUpToDay = allSessions.filter(s => s.date <= day.date);
      const totalHits = sessionsUpToDay.reduce((sum, s) => sum + s.hits, 0);
      const totalQuestions = sessionsUpToDay.reduce((sum, s) => sum + s.total, 0);
      const cumulativeAccuracy = totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : null;

      // Daily accuracy
      const daySessions = allSessions.filter(s => s.date === day.date);
      const dayHits = daySessions.reduce((sum, s) => sum + s.hits, 0);
      const dayTotal = daySessions.reduce((sum, s) => sum + s.total, 0);
      const dailyAccuracy = dayTotal > 0 ? Math.round((dayHits / dayTotal) * 100) : null;

      return {
        date: day.displayDate,
        fullDate: day.date,
        mediaGlobal: cumulativeAccuracy,
        diario: dailyAccuracy,
        questions: dayTotal,
      };
    });

    // Calculate trend
    const validData = data.filter(d => d.mediaGlobal !== null);
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    let avgAccuracy = 0;

    if (validData.length >= 2) {
      const firstHalf = validData.slice(0, Math.floor(validData.length / 2));
      const secondHalf = validData.slice(Math.floor(validData.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, d) => sum + (d.mediaGlobal || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + (d.mediaGlobal || 0), 0) / secondHalf.length;
      
      avgAccuracy = validData[validData.length - 1]?.mediaGlobal || 0;
      
      if (secondAvg - firstAvg > 2) trendDirection = 'up';
      else if (firstAvg - secondAvg > 2) trendDirection = 'down';
    }

    return { chartData: data, trend: trendDirection, averageAccuracy: avgAccuracy };
  }, [subjects]);

  const hasData = chartData.some(d => d.mediaGlobal !== null);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  const trendLabel = trend === 'up' ? 'Subindo' : trend === 'down' ? 'Caindo' : 'Estável';

  if (!hasData) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução da Competitividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Faça questões para ver sua evolução global
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução da Competitividade
          </CardTitle>
          <div className={`flex items-center gap-1.5 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            {trendLabel} • {averageAccuracy}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                interval={1}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ReferenceLine y={80} stroke="hsl(var(--success))" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={60} stroke="hsl(var(--warning))" strokeDasharray="5 5" strokeOpacity={0.5} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === 'mediaGlobal' ? 'Média Global' : 'Diário'
                ]}
              />
              <Line
                type="monotone"
                dataKey="mediaGlobal"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                connectNulls
                name="mediaGlobal"
              />
              <Line
                type="monotone"
                dataKey="diario"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                connectNulls
                name="diario"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Linha sólida: média global • Tracejada: diário • Verde: meta 80%
        </p>
      </CardContent>
    </Card>
  );
};
