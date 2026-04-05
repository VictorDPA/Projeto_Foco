import { Trash2, BookOpen, Award, Flame, ThermometerSun, ThermometerSnowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LawArticle, HEAT_MAP_LABELS, Subject } from '@/types/study';
import { cn } from '@/lib/utils';

interface LawArticleCardProps {
  article: LawArticle;
  subject: Subject | undefined;
  onToggleRead: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onDelete: (id: string) => void;
}

const getHeatMapStyles = (status: LawArticle['heatMapStatus']) => {
  switch (status) {
    case 'low':
      return {
        badge: 'bg-muted text-muted-foreground border-border',
        border: 'border-border hover:border-muted-foreground/50',
        icon: ThermometerSnowflake,
        glow: '',
      };
    case 'medium':
      return {
        badge: 'bg-warning/20 text-warning border-warning/30',
        border: 'border-warning/30 hover:border-warning/50',
        icon: ThermometerSun,
        glow: '',
      };
    case 'high':
      return {
        badge: 'bg-gradient-gold text-primary-foreground border-primary/50',
        border: 'border-primary/50 hover:border-primary ring-1 ring-primary/20',
        icon: Flame,
        glow: 'shadow-gold',
      };
    default:
      return {
        badge: 'bg-muted text-muted-foreground',
        border: 'border-border',
        icon: ThermometerSnowflake,
        glow: '',
      };
  }
};

export const LawArticleCard = ({
  article,
  subject,
  onToggleRead,
  onToggleMastered,
  onDelete,
}: LawArticleCardProps) => {
  const styles = getHeatMapStyles(article.heatMapStatus);
  const HeatIcon = styles.icon;

  return (
    <div
      className={cn(
        'group rounded-xl bg-gradient-card border p-4 transition-all duration-200',
        styles.border,
        styles.glow
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn('gap-1', styles.badge)}>
            <HeatIcon className="h-3 w-3" />
            {HEAT_MAP_LABELS[article.heatMapStatus]}
          </Badge>
          {subject && (
            <Badge
              variant="outline"
              className="border-border"
              style={{ borderColor: subject.color, color: subject.color }}
            >
              {subject.name}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
          onClick={() => onDelete(article.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-2">
        <p className="text-xs text-muted-foreground mb-1">{article.lawName}</p>
        <h4 className="font-medium text-foreground">{article.articleNumber}</h4>
      </div>

      {article.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {article.description}
        </p>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-border/50">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={article.isRead}
            onCheckedChange={() => onToggleRead(article.id)}
            className="border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
          />
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Lido
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={article.isMastered}
            onCheckedChange={() => onToggleMastered(article.id)}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Award className="h-3 w-3" />
            Dominado
          </span>
        </label>
      </div>
    </div>
  );
};
