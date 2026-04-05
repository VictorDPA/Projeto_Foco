import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStudyData } from '@/hooks/useStudyData';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AccuracyChart = () => {
  const { subjects } = useStudyData();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'dd/MM', { locale: ptBR }),
      };
    });

    // Collect all sessions
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

    // Calculate accuracy per day
    return last7Days.map(day => {
      const daySessions = allSessions.filter(s => s.date === day.date);
      const totalHits = daySessions.reduce((sum, s) => sum + s.hits, 0);
      const totalQuestions = daySessions.reduce((sum, s) => sum + s.total, 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : null;

      return {
        date: day.displayDate,
        accuracy,
        questions: totalQuestions,
      };
    });
  }, [subjects]);

  const hasData = chartData.some(d => d.accuracy !== null);

  if (!hasData) {
    return (
      <div className="rounded-2xl bg-gradient-card border border-border p-6">
        <h3 className="font-display font-semibold text-lg text-foreground mb-4">
          Evolução do Aproveitamento
        </h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          Faça questões para ver sua evolução
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-6">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Evolução do Aproveitamento (7 dias)
      </h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value}%`, 'Aproveitamento']}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
