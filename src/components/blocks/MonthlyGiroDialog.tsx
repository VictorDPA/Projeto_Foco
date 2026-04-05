import { useState, useMemo } from 'react';
import { Calendar, RefreshCw, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Subject, StudyBlock, MonthlyGiroConfig } from '@/types/study';
import { cn } from '@/lib/utils';

interface MonthlyGiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
  onConfigureGiro: (config: MonthlyGiroConfig) => void;
}

export const MonthlyGiroDialog = ({
  open,
  onOpenChange,
  subject,
  onConfigureGiro,
}: MonthlyGiroDialogProps) => {
  const blocks = subject.blocks;
  
  const weeklyDistribution = useMemo(() => {
    if (blocks.length === 0) return [[], [], [], []];
    
    const distribution: string[][] = [[], [], [], []];
    blocks.forEach((block, index) => {
      const weekIndex = index % 4;
      distribution[weekIndex].push(block.id);
    });
    
    return distribution;
  }, [blocks]);

  const handleConfirm = () => {
    const config: MonthlyGiroConfig = {
      enabled: true,
      startDate: new Date().toISOString(),
      weeklyDistribution,
    };
    onConfigureGiro(config);
    onOpenChange(false);
  };

  const getBlockById = (id: string): StudyBlock | undefined => {
    return blocks.find(b => b.id === id);
  };

  const weekLabels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Giro Mensal - {subject.name}
          </DialogTitle>
          <DialogDescription>
            Distribua os blocos em 4 semanas para revisão completa do conteúdo a cada mês.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum bloco cadastrado nesta matéria.</p>
              <p className="text-sm">Crie blocos primeiro para configurar o Giro Mensal.</p>
            </div>
          ) : (
            <>
              {/* Weekly Distribution Preview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {weeklyDistribution.map((weekBlocks, weekIndex) => (
                  <div 
                    key={weekIndex}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                      >
                        {weekIndex + 1}
                      </div>
                      <span className="font-medium text-foreground">{weekLabels[weekIndex]}</span>
                    </div>
                    
                    {weekBlocks.length > 0 ? (
                      <div className="space-y-2">
                        {weekBlocks.map(blockId => {
                          const block = getBlockById(blockId);
                          if (!block) return null;
                          return (
                            <div 
                              key={blockId}
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: subject.color }}
                              />
                              <span className="text-foreground truncate">{block.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Sem blocos
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Como funciona:</strong> Os {blocks.length} blocos 
                  serão distribuídos automaticamente entre as 4 semanas do mês. Isso garante que 
                  você revise todo o conteúdo de <strong>{subject.name}</strong> a cada 30 dias.
                </p>
              </div>

              {/* Confirm Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirm}
                  className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground"
                >
                  <Check className="h-4 w-4" />
                  Ativar Giro Mensal
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
