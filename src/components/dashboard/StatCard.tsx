import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  variant?: 'default' | 'gold' | 'success';
}

export const StatCard = ({ icon: Icon, label, value, suffix, variant = 'default' }: StatCardProps) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-4 lg:p-5 transition-all duration-300',
        'hover:shadow-elevated hover:-translate-y-0.5',
        'bg-card border border-border',
        variant === 'gold' && 'border-primary/30 glow-gold',
        variant === 'success' && 'border-success/30'
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          'absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10',
          variant === 'gold' && 'bg-primary',
          variant === 'success' && 'bg-success',
          variant === 'default' && 'bg-muted-foreground'
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs lg:text-sm text-muted-foreground mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'text-2xl lg:text-3xl font-display font-bold',
                variant === 'gold' && 'text-gradient-gold',
                variant === 'success' && 'text-success',
                variant === 'default' && 'text-foreground'
              )}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-sm text-muted-foreground">{suffix}</span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'p-2 rounded-lg',
            variant === 'gold' && 'bg-primary/10',
            variant === 'success' && 'bg-success/10',
            variant === 'default' && 'bg-muted'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              variant === 'gold' && 'text-primary',
              variant === 'success' && 'text-success',
              variant === 'default' && 'text-muted-foreground'
            )}
          />
        </div>
      </div>
    </div>
  );
};
