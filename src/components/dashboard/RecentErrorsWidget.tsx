import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudyError, ERROR_TYPE_LABELS, Subject } from '@/types/study';

interface RecentErrorsWidgetProps {
  errors: StudyError[];
  subjects: Subject[];
}

export const RecentErrorsWidget = ({ errors, subjects }: RecentErrorsWidgetProps) => {
  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  if (errors.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg text-foreground">
            Erros Recentes
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Nenhum erro registrado ainda.
          </p>
          <Link to="/errors">
            <Button variant="link" className="text-primary mt-2">
              Registrar primeiro erro
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg text-foreground">
            Erros Recentes
          </h3>
        </div>
        <Link to="/errors">
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {errors.map((error) => {
          const subject = getSubject(error.subjectId);
          return (
            <div
              key={error.id}
              className="p-3 rounded-lg bg-error-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-2 mb-1">
                {subject && (
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                )}
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {error.topic}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  {ERROR_TYPE_LABELS[error.errorType]}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
