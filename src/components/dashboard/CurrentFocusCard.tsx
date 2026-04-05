import { Target, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { StudyBlock, Subject } from '@/types/study';
import { cn } from '@/lib/utils';

interface CurrentFocusCardProps {
  block: StudyBlock | null;
  subject: Subject | null;
  accuracy: number;
}

export const CurrentFocusCard = ({ block, subject, accuracy }: CurrentFocusCardProps) => {
  if (!block || !subject) {
    return (
      <div className="rounded-2xl bg-gradient-card border border-border p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-lg text-foreground">Foco Atual</h2>
        </div>
        <p className="text-muted-foreground text-center py-8">
          Nenhum bloco selecionado como foco atual.
          <br />
          <span className="text-sm">Vá para "Meus Blocos" para selecionar um.</span>
        </p>
      </div>
    );
  }

  const isReadyToAdvance = accuracy >= 80;

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-6 lg:p-8 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground">Foco Atual</h2>
              <p className="text-xs text-muted-foreground">Sua sessão de estudos</p>
            </div>
          </div>
          {isReadyToAdvance && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 animate-glow-pulse">
              ✓ Pronto para Avançar
            </span>
          )}
        </div>

        {/* Subject Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4"
          style={{ backgroundColor: `${subject.color}15` }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <span className="text-sm font-medium" style={{ color: subject.color }}>
            {subject.name}
          </span>
        </div>

        {/* Block Info */}
        <h3 className="text-xl lg:text-2xl font-display font-bold text-foreground mb-2">
          {block.name}
        </h3>
        <p className="text-muted-foreground mb-6">{block.description}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Horas Estudadas</p>
              <p className="text-lg font-semibold text-foreground">{block.hoursStudied}h</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <TrendingUp className={cn('h-5 w-5', accuracy >= 80 ? 'text-success' : 'text-warning')} />
            <div>
              <p className="text-xs text-muted-foreground">Aproveitamento</p>
              <p className={cn('text-lg font-semibold', accuracy >= 80 ? 'text-success' : 'text-warning')}>
                {accuracy}%
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progresso para meta (80%)</span>
            <span>{Math.min(accuracy, 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                accuracy >= 80 ? 'bg-success' : 'bg-gradient-gold'
              )}
              style={{ width: `${Math.min(accuracy, 100)}%` }}
            />
          </div>
        </div>

        {/* Action hint */}
        <div className="mt-6 flex items-center justify-end">
          <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group">
            Ver detalhes
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
