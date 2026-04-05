import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LawProgressProps {
  lawName: string;
  progress: {
    read: number;
    mastered: number;
    total: number;
  };
}

export const LawProgress = ({ lawName, progress }: LawProgressProps) => {
  const readPercent = progress.total > 0 ? (progress.read / progress.total) * 100 : 0;
  const masteredPercent = progress.total > 0 ? (progress.mastered / progress.total) * 100 : 0;

  return (
    <div className="rounded-xl bg-gradient-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground text-sm">{lawName}</h4>
        <span className="text-xs text-muted-foreground">
          {progress.mastered}/{progress.total} dominados
        </span>
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Lidos</span>
            <span className="text-success">{Math.round(readPercent)}%</span>
          </div>
          <Progress
            value={readPercent}
            className="h-2 bg-muted"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Dominados</span>
            <span className="text-primary">{Math.round(masteredPercent)}%</span>
          </div>
          <Progress
            value={masteredPercent}
            className="h-2 bg-muted [&>div]:bg-primary"
          />
        </div>
      </div>
    </div>
  );
};
