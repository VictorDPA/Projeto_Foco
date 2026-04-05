import { Trophy, TrendingUp, Target } from 'lucide-react';
import { useStudyData } from '@/hooks/useStudyData';
import { useMemo } from 'react';

// Typical fiscal exam has ~120 questions weighted by subject
const TYPICAL_FISCAL_EXAM_POINTS = 120;

export const FiscalPerformanceCard = () => {
  const { subjects, calculateBlockAccuracy } = useStudyData();

  const fiscalStats = useMemo(() => {
    let weightedHits = 0;
    let weightedTotal = 0;
    let totalWeight = 0;

    subjects.forEach(subject => {
      const weight = subject.weight || 1;
      let subjectHits = 0;
      let subjectTotal = 0;

      subject.blocks.forEach(block => {
        block.questionSessions.forEach(session => {
          subjectHits += session.hits;
          subjectTotal += session.totalQuestions;
        });
      });

      if (subjectTotal > 0) {
        const subjectAccuracy = subjectHits / subjectTotal;
        weightedHits += subjectAccuracy * weight;
        totalWeight += weight;
      }
    });

    const weightedAccuracy = totalWeight > 0 ? (weightedHits / totalWeight) * 100 : 0;
    const estimatedPoints = Math.round((weightedAccuracy / 100) * TYPICAL_FISCAL_EXAM_POINTS);

    return {
      weightedAccuracy: Math.round(weightedAccuracy),
      estimatedPoints,
      totalPossible: TYPICAL_FISCAL_EXAM_POINTS,
    };
  }, [subjects]);

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground">
          Resumo de Desempenho Fiscal
        </h3>
        <div className="p-2 rounded-lg bg-primary/20">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 rounded-xl bg-muted/50">
          <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary">{fiscalStats.weightedAccuracy}%</p>
          <p className="text-xs text-muted-foreground">Média Ponderada</p>
        </div>

        <div className="text-center p-4 rounded-xl bg-muted/50">
          <Target className="h-5 w-5 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {fiscalStats.estimatedPoints}
            <span className="text-sm text-muted-foreground">/{fiscalStats.totalPossible}</span>
          </p>
          <p className="text-xs text-muted-foreground">Pontos Estimados</p>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Baseado em prova fiscal típica de {TYPICAL_FISCAL_EXAM_POINTS} questões ponderadas
        </p>
      </div>
    </div>
  );
};
