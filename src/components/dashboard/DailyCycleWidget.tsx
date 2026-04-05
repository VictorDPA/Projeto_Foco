import { useMemo, useState } from 'react';
import { Play, Target, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudyData } from '@/hooks/useStudyData';
import { StudyBlock, Subject } from '@/types/study';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SuggestedBlock {
  block: StudyBlock;
  subject: Subject;
  priority: number;
  accuracy: number;
}

export const DailyCycleWidget = () => {
  const { subjects, calculateBlockAccuracy, setCurrentBlock } = useStudyData();
  const navigate = useNavigate();
  const [isStartingCycle, setIsStartingCycle] = useState(false);

  const suggestedBlocks = useMemo<SuggestedBlock[]>(() => {
    const allBlocks: SuggestedBlock[] = [];

    subjects.forEach(subject => {
      subject.blocks.forEach(block => {
        if (block.status !== 'completed') {
          const accuracy = calculateBlockAccuracy(block);
          // Priority: High weight (3) + Low accuracy (<80%) = Top Priority
          // Score = (4 - weight) gives inverse (weight 3 → score 1, weight 1 → score 3)
          // Lower accuracy = higher priority
          const weight = subject.weight || 2;
          const accuracyPenalty = accuracy < 80 ? (80 - accuracy) / 10 : 0;
          const priority = weight * 10 + accuracyPenalty * weight;
          
          allBlocks.push({
            block,
            subject,
            priority,
            accuracy,
          });
        }
      });
    });

    // Sort by priority (higher = more urgent) and take top 3
    return allBlocks
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }, [subjects, calculateBlockAccuracy]);

  const handleStartCycle = () => {
    if (suggestedBlocks.length === 0) {
      toast.info('Adicione blocos de estudo primeiro.');
      return;
    }

    setIsStartingCycle(true);
    const firstBlock = suggestedBlocks[0];
    setCurrentBlock(firstBlock.subject.id, firstBlock.block.id);
    
    toast.success(`Ciclo iniciado! Foco em: ${firstBlock.block.name}`, {
      description: 'Siga o plano e mantenha a disciplina!',
    });

    setTimeout(() => {
      setIsStartingCycle(false);
      navigate('/study-blocks');
    }, 500);
  };

  const getPriorityLabel = (index: number) => {
    if (index === 0) return { label: 'Prioridade 1', color: 'bg-destructive text-destructive-foreground' };
    if (index === 1) return { label: 'Prioridade 2', color: 'bg-warning text-warning-foreground' };
    return { label: 'Prioridade 3', color: 'bg-muted text-muted-foreground' };
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Meta do Dia
          </CardTitle>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            Sugestão IA
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedBlocks.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione matérias e blocos para receber sugestões.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Siga o plano, Elite!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {suggestedBlocks.map((item, index) => {
                const { label, color } = getPriorityLabel(index);
                return (
                  <div
                    key={item.block.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div
                      className="w-1.5 h-10 rounded-full"
                      style={{ backgroundColor: item.subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${color} text-[10px] px-1.5 py-0`}>
                          {label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Peso {item.subject.weight}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.block.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.subject.name} • {item.accuracy > 0 ? `${item.accuracy}% acerto` : 'Sem questões'}
                      </p>
                    </div>
                    {index === 0 && (
                      <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              className="w-full bg-gradient-gold hover:bg-gradient-gold/90 text-primary-foreground gap-2"
              onClick={handleStartCycle}
              disabled={isStartingCycle}
            >
              <Play className="h-4 w-4" />
              Iniciar Ciclo do Dia
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Lógica: Peso Alto + Acerto &lt;80% = Prioridade Máxima
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
