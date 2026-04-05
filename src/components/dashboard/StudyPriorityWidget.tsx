import { AlertTriangle, ArrowUp } from 'lucide-react';
import { useStudyData } from '@/hooks/useStudyData';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { WEIGHT_LABELS, SubjectWeight } from '@/types/study';

export const StudyPriorityWidget = () => {
  const { subjects, calculateBlockAccuracy } = useStudyData();

  const prioritySubjects = useMemo(() => {
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

        const accuracy = totalQuestions > 0 ? (totalHits / totalQuestions) * 100 : 0;
        const weight = subject.weight || 1;
        
        // Priority score: higher weight + lower accuracy = higher priority
        const priorityScore = weight * (100 - accuracy);

        return {
          ...subject,
          accuracy: Math.round(accuracy),
          priorityScore,
          hasQuestions: totalQuestions > 0,
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 4);
  }, [subjects]);

  if (prioritySubjects.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-card border border-border p-6">
        <h3 className="font-display font-semibold text-lg text-foreground mb-4">
          Prioridade de Estudo
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          Adicione matérias para ver prioridades
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground">
          Prioridade de Estudo
        </h3>
        <div className="p-2 rounded-lg bg-warning/20">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
      </div>

      <div className="space-y-3">
        {prioritySubjects.map((subject, index) => (
          <div
            key={subject.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-foreground truncate">
                  {subject.name}
                </p>
                {index === 0 && (
                  <ArrowUp className="h-4 w-4 text-destructive shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-border">
                  Peso {subject.weight || 1}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {subject.hasQuestions ? `${subject.accuracy}%` : 'Sem questões'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Alto peso + Baixo aproveitamento = Maior prioridade
      </p>
    </div>
  );
};
