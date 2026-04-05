import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, X, Eye, EyeOff, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyError, ERROR_TYPE_LABELS, Subject } from '@/types/study';
import { toast } from 'sonner';

interface FlashcardReviewProps {
  errors: StudyError[];
  subjects: Subject[];
  onClose: () => void;
  onReviewed: (errorId: string, difficulty?: 'easy' | 'medium' | 'hard') => void;
}

export const FlashcardReview = ({
  errors,
  subjects,
  onClose,
  onReviewed,
}: FlashcardReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  if (errors.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nenhum erro para revisar.</p>
          <Button onClick={onClose} variant="outline" className="border-border">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const currentError = errors[currentIndex];
  const subject = subjects.find((s) => s.id === currentError.subjectId);

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    onReviewed(currentError.id, difficulty);
    setReviewedCount(prev => prev + 1);

    const messages = {
      easy: 'Ótimo! Revisão em 7 dias.',
      medium: 'Ok! Revisão em 3 dias.',
      hard: 'Atenção! Revisão amanhã.',
    };

    toast.info(messages[difficulty], { duration: 1500 });

    if (currentIndex < errors.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setTimeout(() => {
        toast.success(`Revisão concluída! ${reviewedCount + 1} cards revisados.`);
        onClose();
      }, 500);
    }
  };

  const goNext = () => {
    if (currentIndex < errors.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleFinish = () => {
    onReviewed(currentError.id);
    toast.success(`Revisão concluída! ${reviewedCount + 1} cards revisados.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/98 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <span className="font-display font-semibold text-foreground">
            Modo Flashcard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary text-primary">
            {currentIndex + 1} / {errors.length}
          </Badge>
          <Badge variant="outline" className="border-success text-success">
            {reviewedCount} revisados
          </Badge>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div
            className="relative min-h-[400px] rounded-2xl bg-gradient-card border border-border p-8 flex flex-col cursor-pointer transition-all duration-300 hover:border-primary/30"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {/* Subject Badge */}
            {subject && (
              <Badge
                variant="outline"
                className="self-start mb-4"
                style={{ borderColor: subject.color, color: subject.color }}
              >
                {subject.name}
              </Badge>
            )}

            {/* Front: Question/Topic */}
            <div className="flex-1 flex flex-col justify-center">
              {!showAnswer ? (
                <div className="text-center animate-fade-in">
                  <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
                    Pegadinha da Banca
                  </p>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    {currentError.topic}
                  </h2>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {ERROR_TYPE_LABELS[currentError.errorType]}
                  </Badge>
                  <div className="mt-8 text-muted-foreground flex items-center justify-center gap-2">
                    <Eye className="h-5 w-5" />
                    <span className="text-sm">Toque para revelar a resposta</span>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider text-center">
                    Resposta / Artigo Correto
                  </p>
                  <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
                    <p className="text-foreground leading-relaxed text-center">
                      {currentError.trap}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle hint */}
            <div className="absolute bottom-4 right-4 text-muted-foreground">
              {showAnswer ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </div>
          </div>

          {/* Difficulty Buttons - Only show when answer is revealed */}
          {showAnswer && (
            <div className="mt-6 animate-fade-in">
              <p className="text-sm text-center text-muted-foreground mb-3">
                Quão difícil foi lembrar?
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="border-success text-success hover:bg-success/10 gap-2 h-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDifficultySelect('easy');
                  }}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Fácil
                </Button>
                <Button
                  variant="outline"
                  className="border-warning text-warning hover:bg-warning/10 gap-2 h-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDifficultySelect('medium');
                  }}
                >
                  <Minus className="h-4 w-4" />
                  Médio
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 gap-2 h-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDifficultySelect('hard');
                  }}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Difícil
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Revisão baseada em desempenho
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 p-4 border-t border-border">
        <Button
          variant="outline"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="border-border"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Anterior
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAnswer(!showAnswer)}
          className="h-12 w-12"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {currentIndex < errors.length - 1 ? (
          <Button
            size="lg"
            onClick={goNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Pular
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleFinish}
            className="bg-success hover:bg-success/90 text-success-foreground"
          >
            Finalizar
          </Button>
        )}
      </div>
    </div>
  );
};
