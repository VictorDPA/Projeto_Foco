import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStudyData } from '@/hooks/useStudyData';

export const SubjectStrengthChart = () => {
  const { subjects, calculateBlockAccuracy } = useStudyData();

  const chartData = useMemo(() => {
    return subjects
      .map(subject => {
        let totalHits = 0;
        let totalQuestions = 0;

        subject.blocks.forEach(block => {
          block.questionSessions.forEach(session => {
            totalHits += session.hits;
            totalQuestions += session.totalQuestions;
          });
        });

        const accuracy = totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : 0;

        return {
          name: subject.name.length > 15 ? subject.name.substring(0, 12) + '...' : subject.name,
          fullName: subject.name,
          accuracy,
          color: subject.color,
          questions: totalQuestions,
        };
      })
      .filter(d => d.questions > 0)
      .sort((a, b) => b.accuracy - a.accuracy);
  }, [subjects]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-card border border-border p-6">
        <h3 className="font-display font-semibold text-lg text-foreground mb-4">
          Força por Matéria
        </h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          Faça questões para comparar matérias
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-6">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Força por Matéria
      </h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string, props: any) => [
                `${value}%`,
                props.payload.fullName,
              ]}
              labelFormatter={() => 'Aproveitamento'}
            />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
