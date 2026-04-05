import { useMemo } from 'react';
import { AlertTriangle, Target, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SubjectPriority {
  id: string;
  name: string;
  color: string;
  weight: number;
  accuracy: number;
  totalQuestions: number;
}

export const ReinforcementPriorityWidget = () => {
  const { subjects, calculateBlockAccuracy } = useSupabaseStudyData();

  const prioritySubjects = useMemo(() => {
    const subjectStats: SubjectPriority[] = [];

    subjects.forEach(subject => {
      // Only Weight 3 subjects
      if (subject.weight !== 3) return;

      let totalHits = 0;
      let totalQuestions = 0;

      subject.blocks.forEach(block => {
        block.questionSessions.forEach(session => {
          totalHits += session.hits;
          totalQuestions += session.totalQuestions;
        });
      });

      const accuracy = totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : 0;

      // Only include if accuracy < 75%
      if (accuracy < 75 && totalQuestions > 0) {
        subjectStats.push({
          id: subject.id,
          name: subject.name,
          color: subject.color,
          weight: subject.weight,
          accuracy,
          totalQuestions,
        });
      }
    });

    // Sort by lowest accuracy first (most critical)
    return subjectStats.sort((a, b) => a.accuracy - b.accuracy);
  }, [subjects]);

  if (prioritySubjects.length === 0) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-primary" />
            Prioridade de Reforço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4 text-sm text-success">
            ✓ Todas as matérias Peso 3 estão com boa acurácia!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Prioridade de Reforço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Matérias Peso 3 com acurácia abaixo de 75%
        </p>
        <div className="space-y-2">
          {prioritySubjects.map((subject, index) => (
            <TooltipProvider key={subject.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg border transition-all',
                      'bg-destructive/5 border-destructive/20 hover:bg-destructive/10'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-6 rounded-full shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subject.totalQuestions} questões
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-bold text-destructive">
                        {subject.accuracy}%
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Peso 3 • Precisa de reforço urgente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          ⚠️ Alto impacto na nota final
        </p>
      </CardContent>
    </Card>
  );
};
