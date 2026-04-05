import { BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Subject, ExamBoard, EXAM_BOARD_LABELS } from '@/types/study';
import { cn } from '@/lib/utils';

interface BoardAccuracyWidgetProps {
  subjects: Subject[];
}

interface BoardStats {
  board: ExamBoard;
  totalQuestions: number;
  totalHits: number;
  accuracy: number;
}

export const BoardAccuracyWidget = ({ subjects }: BoardAccuracyWidgetProps) => {
  // Calculate accuracy by board
  const boardStats: BoardStats[] = [];
  const boardMap = new Map<ExamBoard, { questions: number; hits: number }>();

  subjects.forEach(subject => {
    subject.blocks.forEach(block => {
      block.questionSessions.forEach(session => {
        const board = session.examBoard || 'OTHER';
        const current = boardMap.get(board) || { questions: 0, hits: 0 };
        boardMap.set(board, {
          questions: current.questions + session.totalQuestions,
          hits: current.hits + session.hits,
        });
      });
    });
  });

  boardMap.forEach((stats, board) => {
    if (stats.questions > 0) {
      boardStats.push({
        board,
        totalQuestions: stats.questions,
        totalHits: stats.hits,
        accuracy: Math.round((stats.hits / stats.questions) * 100),
      });
    }
  });

  // Sort by number of questions (most practiced first)
  boardStats.sort((a, b) => b.totalQuestions - a.totalQuestions);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (boardStats.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Desempenho por Banca</h3>
            <p className="text-sm text-muted-foreground">Análise de acertos por organizadora</p>
          </div>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma sessão com banca registrada.</p>
          <p className="text-sm">Adicione a banca nas sessões de questões.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Desempenho por Banca</h3>
          <p className="text-sm text-muted-foreground">Análise de acertos por organizadora</p>
        </div>
      </div>

      <div className="space-y-4">
        {boardStats.map(stat => (
          <div key={stat.board} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{EXAM_BOARD_LABELS[stat.board]}</span>
                <span className="text-xs text-muted-foreground">
                  ({stat.totalQuestions} questões)
                </span>
              </div>
              <span className={cn('font-bold text-lg', getAccuracyColor(stat.accuracy))}>
                {stat.accuracy}%
              </span>
            </div>
            <div className="relative">
              <Progress value={stat.accuracy} className="h-2" />
              <div 
                className={cn('absolute top-0 left-0 h-2 rounded-full transition-all', getProgressColor(stat.accuracy))}
                style={{ width: `${stat.accuracy}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total de questões por banca:</span>
          <span className="font-medium text-foreground">
            {boardStats.reduce((sum, s) => sum + s.totalQuestions, 0)}
          </span>
        </div>
      </div>
    </Card>
  );
};
