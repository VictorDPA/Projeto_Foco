import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyError, ERROR_TYPE_LABELS, Subject } from '@/types/study';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ErrorCardProps {
  error: StudyError;
  subject: Subject | undefined;
  onDelete: (id: string) => void;
}

const getErrorTypeColor = (type: StudyError['errorType']) => {
  switch (type) {
    case 'lack_attention':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'didnt_know_law':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'tricky_question':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'confused_concepts':
      return 'bg-info/20 text-info border-info/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const ErrorCard = ({ error, subject, onDelete }: ErrorCardProps) => {
  return (
    <div className="group rounded-xl bg-error-card border border-border/50 p-4 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {subject && (
            <Badge
              variant="outline"
              className="border-border"
              style={{ borderColor: subject.color, color: subject.color }}
            >
              {subject.name}
            </Badge>
          )}
          <Badge variant="outline" className={getErrorTypeColor(error.errorType)}>
            {ERROR_TYPE_LABELS[error.errorType]}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
          onClick={() => onDelete(error.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <h4 className="font-medium text-foreground mb-2">{error.topic}</h4>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{error.trap}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(error.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
        <div className="flex items-center gap-1">
          <RotateCcw className="h-3 w-3" />
          <span>{error.reviewCount}x revisado</span>
        </div>
      </div>
    </div>
  );
};
