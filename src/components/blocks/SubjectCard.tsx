import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Plus, Trash2, RefreshCw, Link2, Sprout, Star, Crown, ExternalLink } from 'lucide-react';
import { Subject, StudyBlock, StudyPhase, STUDY_PHASE_LABELS, ExternalLink as ExternalLinkType, MonthlyGiroConfig, SubjectWeight, WEIGHT_LABELS } from '@/types/study';
import { BlockCard } from './BlockCard';
import { AddBlockDialog } from './AddBlockDialog';
import { MonthlyGiroDialog } from './MonthlyGiroDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SubjectCardProps {
  subject: Subject;
  onAddBlock: (subjectId: string, name: string, description: string) => void;
  onUpdateBlockStatus: (subjectId: string, blockId: string, status: StudyBlock['status']) => void;
  onSetCurrentBlock: (subjectId: string, blockId: string, isCurrentlyFocused: boolean) => void;
  onAddQuestionSession: (subjectId: string, blockId: string, session: { date: string; totalQuestions: number; hits: number; examBoard?: string }) => void;
  onDeleteBlock: (subjectId: string, blockId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onUpdateBlockLinks?: (subjectId: string, blockId: string, links: ExternalLinkType[]) => void;
  onUpdateBlockRedoFavorites?: (subjectId: string, blockId: string, value: boolean) => void;
  onConfigureMonthlyGiro?: (subjectId: string, config: MonthlyGiroConfig) => void;
  onUpdateSubjectPhase?: (subjectId: string, phase: StudyPhase) => void;
  onUpdateSubjectWeight?: (subjectId: string, weight: SubjectWeight) => void;
  onUpdateSubjectTecLink?: (subjectId: string, link: string) => void;
  onUpdateSubjectFavoritosUrl?: (subjectId: string, url: string) => void;
  onUpdateBlockUrls?: (subjectId: string, blockId: string, questoesUrl: string, favoritosUrl: string) => void;
  onUpdateBlockCurrentPage?: (subjectId: string, blockId: string, page: number) => void;
  onUpdateBlockDetails?: (subjectId: string, blockId: string, name: string, description: string) => void;
  onResetBlockHours?: (subjectId: string, blockId: string) => void;
  onUpdateBlockPdfProgress?: (subjectId: string, blockId: string, data: { currentPage?: number; totalPages?: number; pdfQuestionsDone?: number; pdfQuestionsTotal?: number }) => void;
  onDeleteQuestionSession?: (sessionId: string) => void;
  onDeleteTimeSession?: (sessionId: string) => void;
  calculateBlockAccuracy: (block: StudyBlock) => number;
}

export const SubjectCard = ({
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
  onUpdateSubjectPhase,
  onUpdateSubjectWeight,
  onUpdateSubjectTecLink,
  onUpdateSubjectFavoritosUrl,
  onUpdateBlockUrls,
  onUpdateBlockCurrentPage,
  onUpdateBlockDetails,
  onResetBlockHours,
  onUpdateBlockPdfProgress,
  onDeleteQuestionSession,
  onDeleteTimeSession,
  calculateBlockAccuracy,
}: SubjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isGiroOpen, setIsGiroOpen] = useState(false);
  const [isTecLinkOpen, setIsTecLinkOpen] = useState(false);
  const [isFavoritosLinkOpen, setIsFavoritosLinkOpen] = useState(false);
  const [tecLinkInput, setTecLinkInput] = useState(subject.tecCadernoLink || '');
  const [favoritosLinkInput, setFavoritosLinkInput] = useState(subject.favoritosUrl || '');

  const handleSaveTecLink = () => {
    if (onUpdateSubjectTecLink) {
      onUpdateSubjectTecLink(subject.id, tecLinkInput);
      toast.success('Link do TEC salvo!');
    }
    setIsTecLinkOpen(false);
  };

  const handleSaveFavoritosLink = () => {
    if (onUpdateSubjectFavoritosUrl) {
      onUpdateSubjectFavoritosUrl(subject.id, favoritosLinkInput);
      toast.success('Link de Favoritos salvo!');
    }
    setIsFavoritosLinkOpen(false);
  };

  return (
    <>
      <div className="mb-8 animate-fade-in">
        {/* Subject Header */}
        <div className="rounded-xl bg-gradient-card border border-border p-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Title & Info */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3 group text-left"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${subject.color}20` }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-6 w-6" style={{ color: subject.color }} />
                ) : (
                  <ChevronRight className="h-6 w-6" style={{ color: subject.color }} />
                )}
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {subject.name}
                  {/* Phase Icon Indicator */}
                  {subject.studyPhase === 'iniciante' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Sprout className="h-4 w-4 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent><p>Iniciante</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {subject.studyPhase === 'intermediario' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent><p>Intermediário</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {subject.studyPhase === 'avancado' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Crown className="h-4 w-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent><p>Avançado</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {subject.monthlyGiro?.enabled && (
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      Giro Ativo
                    </Badge>
                  )}
                </h2>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {subject.blocks.length} {subject.blocks.length === 1 ? 'bloco' : 'blocos'}
                  </span>
                  {/* Study Orientation based on Phase */}
                  {subject.studyPhase === 'iniciante' && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      📚 Foco: 70% Teoria / 30% Questões
                    </span>
                  )}
                  {subject.studyPhase === 'intermediario' && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      ⚖️ Foco: 50% Teoria / 50% Questões
                    </span>
                  )}
                  {subject.studyPhase === 'avancado' && (
                    <span className="text-xs text-primary font-medium">
                      🎯 Foco: 80% Questões / 20% Revisão
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Quick Actions Row - Prominent Level + Weight + TEC */}
            <div className="flex items-center gap-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {/* Study Phase Selector - Native HTML Select for max compatibility */}
              {onUpdateSubjectPhase && (
                <select
                  value={subject.studyPhase || 'iniciante'}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateSubjectPhase(subject.id, e.target.value as StudyPhase);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-9 px-3 text-sm font-medium bg-muted/80 border-2 border-primary/30 hover:border-primary/50 transition-colors rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="iniciante">🌱 Iniciante</option>
                  <option value="intermediario">⭐ Intermediário</option>
                  <option value="avancado">👑 Avançado</option>
                </select>
              )}

              {/* Weight Selector */}
              {onUpdateSubjectWeight && (
                <select
                  value={String(subject.weight)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateSubjectWeight(subject.id, Number(e.target.value) as SubjectWeight);
                    toast.success('Peso atualizado!');
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-9 px-3 text-sm font-medium bg-muted/80 border-2 border-amber-500/30 hover:border-amber-500/50 transition-colors rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="1">⚖️ Peso 1</option>
                  <option value="2">⚖️ Peso 2</option>
                  <option value="3">⚖️ Peso 3</option>
                </select>
              )}


              {/* Secondary Actions */}
              <div className="flex items-center gap-1">
                {onConfigureMonthlyGiro && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setIsGiroOpen(true)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Configurar Giro Mensal</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 h-9"
                  onClick={() => setIsAddBlockOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Bloco</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
                subjectPhase={subject.studyPhase}
                onStatusChange={(status) => onUpdateBlockStatus(subject.id, block.id, status)}
                onSetCurrent={() => onSetCurrentBlock(subject.id, block.id, block.isCurrent)}
                onAddSession={(session) => onAddQuestionSession(subject.id, block.id, session)}
                onDelete={() => onDeleteBlock(subject.id, block.id)}
                onUpdateLinks={onUpdateBlockLinks ? (links) => onUpdateBlockLinks(subject.id, block.id, links) : undefined}
                onUpdateRedoFavorites={onUpdateBlockRedoFavorites ? (v) => onUpdateBlockRedoFavorites(subject.id, block.id, v) : undefined}
                onUpdateBlockUrls={onUpdateBlockUrls ? (questoesUrl, favoritosUrl) => onUpdateBlockUrls(subject.id, block.id, questoesUrl, favoritosUrl) : undefined}
                onUpdateCurrentPage={onUpdateBlockCurrentPage ? (page) => onUpdateBlockCurrentPage(subject.id, block.id, page) : undefined}
                onUpdateBlockDetails={onUpdateBlockDetails ? (name, description) => onUpdateBlockDetails(subject.id, block.id, name, description) : undefined}
                onResetBlockHours={onResetBlockHours ? () => onResetBlockHours(subject.id, block.id) : undefined}
                onUpdatePdfProgress={onUpdateBlockPdfProgress ? (data) => onUpdateBlockPdfProgress(subject.id, block.id, data) : undefined}
                onDeleteQuestionSession={onDeleteQuestionSession}
                onDeleteTimeSession={onDeleteTimeSession}
              />
            </div>
          ))}
          {subject.blocks.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground rounded-lg border border-dashed border-border">
              <p className="mb-2">Nenhum bloco criado ainda.</p>
              <button onClick={() => setIsAddBlockOpen(true)} className="text-primary hover:underline">
                Criar primeiro bloco
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Block Dialog */}
      <AddBlockDialog
        open={isAddBlockOpen}
        onOpenChange={setIsAddBlockOpen}
        onSubmit={(name, description) => onAddBlock(subject.id, name, description)}
        subjectName={subject.name}
      />

      {/* Monthly Giro Dialog */}
      {onConfigureMonthlyGiro && (
        <MonthlyGiroDialog
          open={isGiroOpen}
          onOpenChange={setIsGiroOpen}
          subject={subject}
          onConfigureGiro={(config) => onConfigureMonthlyGiro(subject.id, config)}
        />
      )}

      {/* TEC Link Dialog */}
      <Dialog open={isTecLinkOpen} onOpenChange={(open) => {
        if (open) setTecLinkInput(subject.tecCadernoLink || '');
        setIsTecLinkOpen(open);
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Link do Caderno TEC
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cole o link do seu caderno de questões do TEC Concursos para acesso rápido.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.tecconcursos.com.br/..."
                value={tecLinkInput}
                onChange={(e) => setTecLinkInput(e.target.value)}
                className="bg-muted border-border flex-1"
              />
              {tecLinkInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTecLinkInput('')}
                  className="shrink-0 h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTecLinkOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTecLink} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Salvar Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Favoritos Link Dialog */}
      <Dialog open={isFavoritosLinkOpen} onOpenChange={(open) => {
        if (open) setFavoritosLinkInput(subject.favoritosUrl || '');
        setIsFavoritosLinkOpen(open);
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Link de Questões Favoritadas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cole o link das suas questões favoritadas para revisão rápida.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.tecconcursos.com.br/..."
                value={favoritosLinkInput}
                onChange={(e) => setFavoritosLinkInput(e.target.value)}
                className="bg-muted border-border flex-1"
              />
              {favoritosLinkInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFavoritosLinkInput('')}
                  className="shrink-0 h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFavoritosLinkOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveFavoritosLink} className="gap-2">
                <Star className="h-4 w-4" />
                Salvar Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Matéria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{subject.name}" e todos os seus blocos? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteSubject(subject.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
