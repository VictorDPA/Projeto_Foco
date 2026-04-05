import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Subject, StudyBlock, StudyStatus, ExternalLink, MonthlyGiroConfig } from '@/types/study';
import { BlockCard } from './BlockCard';
import { AddBlockDialog } from './AddBlockDialog';
import { MonthlyGiroDialog } from './MonthlyGiroDialog';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubjectSectionProps {
  subject: Subject;
  onAddBlock: (subjectId: string, name: string, description: string) => void;
  onUpdateBlockStatus: (subjectId: string, blockId: string, status: StudyStatus) => void;
  onSetCurrentBlock: (subjectId: string, blockId: string) => void;
  onAddQuestionSession: (subjectId: string, blockId: string, session: { date: string; totalQuestions: number; hits: number; examBoard?: string }) => void;
  onDeleteBlock: (subjectId: string, blockId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onUpdateBlockLinks?: (subjectId: string, blockId: string, links: ExternalLink[]) => void;
  onUpdateBlockRedoFavorites?: (subjectId: string, blockId: string, value: boolean) => void;
  onConfigureMonthlyGiro?: (subjectId: string, config: MonthlyGiroConfig) => void;
  calculateBlockAccuracy: (block: StudyBlock) => number;
}

export const SubjectSection = ({
  subject,
  onAddBlock,
  onUpdateBlockStatus,
  onSetCurrentBlock,
  onAddQuestionSession,
  onDeleteBlock,
  onDeleteSubject,
  onUpdateBlockLinks,
  onUpdateBlockRedoFavorites,
  onConfigureMonthlyGiro,
  calculateBlockAccuracy,
}: SubjectSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isGiroOpen, setIsGiroOpen] = useState(false);

  return (
    <>
      <div className="mb-8 animate-fade-in">
        {/* Subject Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" style={{ color: subject.color }} />
              ) : (
                <ChevronRight className="h-5 w-5" style={{ color: subject.color }} />
              )}
            </div>
            <div className="text-left">
              <h2 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                {subject.name}
                {subject.monthlyGiro?.enabled && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Giro Ativo</span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                {subject.blocks.length} {subject.blocks.length === 1 ? 'bloco' : 'blocos'}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {onConfigureMonthlyGiro && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsGiroOpen(true)}
                      className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Configurar Giro Mensal</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <button
              onClick={() => setIsAddBlockOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Bloco</span>
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Blocks Grid */}
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-all duration-300',
            isExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'
          )}
        >
          {subject.blocks.map((block, index) => (
            <div key={block.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <BlockCard
                block={block}
                subjectColor={subject.color}
                subjectId={subject.id}
                accuracy={calculateBlockAccuracy(block)}
                onStatusChange={(status) => onUpdateBlockStatus(subject.id, block.id, status)}
                onSetCurrent={() => onSetCurrentBlock(subject.id, block.id)}
                onAddSession={(session) => onAddQuestionSession(subject.id, block.id, session)}
                onDelete={() => onDeleteBlock(subject.id, block.id)}
                onUpdateLinks={onUpdateBlockLinks ? (links) => onUpdateBlockLinks(subject.id, block.id, links) : undefined}
                onUpdateRedoFavorites={onUpdateBlockRedoFavorites ? (v) => onUpdateBlockRedoFavorites(subject.id, block.id, v) : undefined}
              />
            </div>
          ))}
          {subject.blocks.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="mb-2">Nenhum bloco criado ainda.</p>
              <button onClick={() => setIsAddBlockOpen(true)} className="text-primary hover:underline">
                Criar primeiro bloco
              </button>
            </div>
          )}
        </div>
      </div>

      <AddBlockDialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen} onSubmit={(name, description) => onAddBlock(subject.id, name, description)} subjectName={subject.name} />

      {onConfigureMonthlyGiro && (
        <MonthlyGiroDialog open={isGiroOpen} onOpenChange={setIsGiroOpen} subject={subject} onConfigureGiro={(config) => onConfigureMonthlyGiro(subject.id, config)} />
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Matéria</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir "{subject.name}" e todos os seus blocos? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDeleteSubject(subject.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
