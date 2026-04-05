import { useState } from 'react';
import { Play, BookOpen, CheckCircle, Target, Plus, Trash2, Award, AlertTriangle, AlertCircle, Star, Settings2, X, ChevronDown, FileText, Pencil, RotateCcw, History } from 'lucide-react';
import { StudyBlock, StudyStatus, ExternalLink, getPerformanceStatus, PERFORMANCE_STATUS_CONFIG, StudyTimeSession } from '@/types/study';
import { cn } from '@/lib/utils';
import { formatHoursToHHMMSS } from '@/lib/timeFormat';
import { AddSessionDialog } from './AddSessionDialog';
import { SessionHistoryModal } from './SessionHistoryModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface BlockCardProps {
  block: StudyBlock;
  subjectColor: string;
  subjectId: string;
  accuracy: number;
  subjectPhase?: 'iniciante' | 'intermediario' | 'avancado';
  onStatusChange: (status: StudyStatus) => void;
  onSetCurrent: () => void;
  onAddSession: (session: { date: string; totalQuestions: number; hits: number; examBoard?: string }) => void;
  onDelete: () => void;
  onUpdateLinks?: (links: ExternalLink[]) => void;
  onUpdateRedoFavorites?: (value: boolean) => void;
  onUpdateBlockUrls?: (questoesUrl: string, favoritosUrl: string) => void;
  onUpdateCurrentPage?: (page: number) => void;
  onUpdateBlockDetails?: (name: string, description: string) => void;
  onResetBlockHours?: () => void;
  onUpdatePdfProgress?: (data: { currentPage?: number; totalPages?: number; pdfQuestionsDone?: number; pdfQuestionsTotal?: number }) => void;
  onDeleteQuestionSession?: (sessionId: string) => void;
  onDeleteTimeSession?: (sessionId: string) => void;
}

const statusConfig: Record<StudyStatus, { label: string; icon: typeof Play; bgClass: string; textClass: string }> = {
  not_started: {
    label: 'Não Iniciado',
    icon: Play,
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
  },
  reading_pdf: {
    label: 'Lendo PDF',
    icon: BookOpen,
    bgClass: 'bg-warning/20',
    textClass: 'text-warning',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    bgClass: 'bg-success/20',
    textClass: 'text-success',
  },
};

const performanceIcons = {
  revision_needed: AlertCircle,
  topic_adjustment: AlertTriangle,
  mastered: Award,
};

export const BlockCard = ({
  block,
  subjectColor,
  accuracy,
  subjectPhase = 'iniciante',
  onStatusChange,
  onSetCurrent,
  onAddSession,
  onDelete,
  onUpdateBlockUrls,
  onUpdateCurrentPage,
  onUpdateBlockDetails,
  onResetBlockHours,
  onUpdatePdfProgress,
  onDeleteQuestionSession,
  onDeleteTimeSession,
}: BlockCardProps) => {
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isInlineEditOpen, setIsInlineEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetHoursDialogOpen, setIsResetHoursDialogOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [questoesUrlInput, setQuestoesUrlInput] = useState(block.questoesUrl || '');
  const [favoritosUrlInput, setFavoritosUrlInput] = useState(block.favoritosUrl || '');
  const [currentPageInput, setCurrentPageInput] = useState(block.currentPage?.toString() || '0');
  const [totalPagesInput, setTotalPagesInput] = useState(block.totalPages?.toString() || '0');
  const [pdfQuestionsDoneInput, setPdfQuestionsDoneInput] = useState(block.pdfQuestionsDone?.toString() || '0');
  const [pdfQuestionsTotalInput, setPdfQuestionsTotalInput] = useState(block.pdfQuestionsTotal?.toString() || '0');
  const [nameInput, setNameInput] = useState(block.name);
  const [descriptionInput, setDescriptionInput] = useState(block.description || '');
  
  // Calculate progress percentages
  const theoryProgress = (block.totalPages || 0) > 0 
    ? Math.round(((block.currentPage || 0) / (block.totalPages || 1)) * 100) 
    : 0;
  const pdfQuestionsProgress = (block.pdfQuestionsTotal || 0) > 0 
    ? Math.round(((block.pdfQuestionsDone || 0) / (block.pdfQuestionsTotal || 1)) * 100) 
    : 0;
  const isReadyToAdvance = accuracy >= 80 && block.questionSessions.length > 0;
  
  // Maintenance Mode: accuracy > 80% = focus on questions only
  const isMaintenanceMode = accuracy > 80 && block.questionSessions.length > 0;
  // Alert Mode: was in maintenance but dropped below 80%
  const isAlertMode = accuracy > 0 && accuracy < 80 && block.questionSessions.length >= 3;
  // Advanced subject = questions-first interface
  const isAdvancedSubject = subjectPhase === 'avancado';

  const currentStatus = statusConfig[block.status];
  const StatusIcon = currentStatus.icon;

  // Performance status based on accuracy
  const performanceStatus = block.questionSessions.length > 0 ? getPerformanceStatus(accuracy) : null;
  const performanceConfig = performanceStatus ? PERFORMANCE_STATUS_CONFIG[performanceStatus] : null;
  const PerformanceIcon = performanceStatus ? performanceIcons[performanceStatus] : null;

  const hasQuestoesUrl = !!block.questoesUrl;
  const hasFavoritasUrl = !!block.favoritosUrl;

  const handleSaveUrls = () => {
    if (onUpdateBlockUrls) {
      const questoesValue = questoesUrlInput.trim() || '';
      const favoritasValue = favoritosUrlInput.trim() || '';
      onUpdateBlockUrls(questoesValue, favoritasValue);
      toast.success(questoesValue || favoritasValue ? 'Links salvos!' : 'Links limpos!');
    }
    setIsInlineEditOpen(false);
  };

  const openInlineEdit = () => {
    setQuestoesUrlInput(block.questoesUrl || '');
    setFavoritosUrlInput(block.favoritosUrl || '');
    setIsInlineEditOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
    toast.success('Bloco excluído com sucesso!');
  };

  const handleSaveDetails = () => {
    if (onUpdateBlockDetails && nameInput.trim()) {
      onUpdateBlockDetails(nameInput.trim(), descriptionInput.trim());
      toast.success('Bloco atualizado!');
      setIsEditingDetails(false);
    }
  };

  const handleResetHours = () => {
    if (onResetBlockHours) {
      onResetBlockHours();
      toast.success('Tempo zerado!');
      setIsResetHoursDialogOpen(false);
    }
  };

  const openDetailsEdit = () => {
    setNameInput(block.name);
    setDescriptionInput(block.description || '');
    setIsEditingDetails(true);
  };

  return (
    <>
      <div
        className={cn(
          'group relative rounded-xl bg-card border border-border p-5 transition-all duration-300',
          'hover:shadow-elevated hover:-translate-y-0.5',
          block.isCurrent && 'ring-2 ring-primary/50 glow-gold'
        )}
      >
        {/* Current indicator */}
        {block.isCurrent && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-gold text-primary-foreground shadow-gold">
            Foco
          </div>
        )}

        {/* Header with Title + Action Icons */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-1 h-10 rounded-full shrink-0"
              style={{ backgroundColor: subjectColor }}
            />
            {isEditingDetails ? (
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Título do bloco"
                  className="h-8 text-sm font-semibold"
                  autoFocus
                />
                <Textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Descrição"
                  className="min-h-[60px] text-xs resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleSaveDetails(); }}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setIsEditingDetails(false); }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="font-display font-semibold text-foreground mb-0.5 truncate">{block.name}</h3>
                  {onUpdateBlockDetails && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetailsEdit(); }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{block.description}</p>
              </div>
            )}
          </div>

          {/* Action Icons - Focus, Edit Links, Delete */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {/* Focus Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetCurrent();
                    }}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      block.isCurrent 
                        ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Target className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{block.isCurrent ? 'Remover Foco' : 'Definir como Foco'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Edit Links */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInlineEdit();
                    }}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      isInlineEditOpen
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar Links</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Delete */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick();
                    }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Excluir Bloco</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Status Dropdown + Performance Badge */}
        <div className="flex items-center gap-2 mb-3">
          {/* Single Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  currentStatus.bgClass,
                  currentStatus.textClass,
                  'hover:opacity-80'
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {currentStatus.label}
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 bg-popover border border-border shadow-lg z-50">
              <DropdownMenuItem 
                onClick={() => onStatusChange('not_started')}
                className={cn(block.status === 'not_started' && 'bg-muted')}
              >
                <Play className="h-4 w-4 mr-2 text-muted-foreground" />
                Não Iniciado
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange('reading_pdf')}
                className={cn(block.status === 'reading_pdf' && 'bg-warning/10')}
              >
                <BookOpen className="h-4 w-4 mr-2 text-warning" />
                Lendo PDF
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange('completed')}
                className={cn(block.status === 'completed' && 'bg-success/10')}
              >
                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                Concluído
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Maintenance Mode Badge */}
          {isMaintenanceMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    🛡️ Manutenção
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Foco 100% Questões - Acurácia &gt;80%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Alert Mode Badge - Performance Drop */}
          {isAlertMode && !isMaintenanceMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-destructive/10 border border-destructive/30 text-destructive animate-pulse">
                    ⚠️ Alerta
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Queda de desempenho - Voltar ao Ciclo Regular</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Performance Badge */}
          {performanceConfig && PerformanceIcon && !isMaintenanceMode && !isAlertMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                    performanceConfig.bgColor,
                    performanceConfig.color
                  )}>
                    <PerformanceIcon className="h-3 w-3" />
                    {performanceStatus === 'mastered' ? '🏆' : performanceStatus === 'topic_adjustment' ? '⚠️' : '🔴'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{performanceConfig.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isReadyToAdvance && !performanceConfig && !isMaintenanceMode && (
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-success/10 text-success">
              ✓ Pronto
            </span>
          )}
        </div>

        {/* Maintenance Mode Indicator */}
        {isMaintenanceMode && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              🎯 Modo Manutenção: Foco 100% em Questões
            </p>
          </div>
        )}

        {/* Alert Mode Indicator */}
        {isAlertMode && !isMaintenanceMode && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-xs text-destructive font-medium">
              📚 Ciclo Regular: Volte à Teoria + Questões
            </p>
          </div>
        )}
        {/* Link Shortcuts - Order based on mode */}
        {(hasQuestoesUrl || hasFavoritasUrl) && (
          <div className={cn(
            "flex items-center gap-2 mb-3",
            (isAdvancedSubject || isMaintenanceMode) && "flex-row-reverse justify-end"
          )}>
            {/* Caderno/Questions - Primary for Advanced/Maintenance */}
            {hasQuestoesUrl && (
              <a
                href={block.questoesUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  (isAdvancedSubject || isMaintenanceMode) 
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 border-2 border-primary/50 text-primary font-semibold"
                    : "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 border border-amber-500/30"
                )}
                style={{ color: (isAdvancedSubject || isMaintenanceMode) ? undefined : '#D4AF37' }}
              >
                <BookOpen className="h-3.5 w-3.5" />
                {(isAdvancedSubject || isMaintenanceMode) ? '🎯 Questões' : 'Caderno'}
              </a>
            )}
            {hasFavoritasUrl && (
              <a
                href={block.favoritosUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 border border-amber-500/30 text-xs font-medium transition-all"
                style={{ color: '#D4AF37' }}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                Favoritas
              </a>
            )}
          </div>
        )}

        {/* Primary Action Button for Advanced/Maintenance Mode */}
        {(isAdvancedSubject || isMaintenanceMode) && hasQuestoesUrl && (
          <a
            href={block.questoesUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Target className="h-4 w-4" />
            Iniciar Questões
          </a>
        )}

        {/* Inline Link Edit Area */}
        {isInlineEditOpen && (
          <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border space-y-2.5 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Editar Links</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInlineEditOpen(false);
                }}
                className="p-0.5 rounded hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Caderno Input */}
            <div className="flex gap-1.5 items-center">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Link do Caderno"
                value={questoesUrlInput}
                onChange={(e) => setQuestoesUrlInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-xs bg-background"
                autoComplete="off"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuestoesUrlInput('');
                }}
                className="p-1 rounded hover:bg-destructive/10 text-destructive shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Favoritas Input */}
            <div className="flex gap-1.5 items-center">
              <Star className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Link de Favoritas"
                value={favoritosUrlInput}
                onChange={(e) => setFavoritosUrlInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-xs bg-background"
                autoComplete="off"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFavoritosUrlInput('');
                }}
                className="p-1 rounded hover:bg-destructive/10 text-destructive shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Save Button */}
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleSaveUrls();
              }} 
              size="sm" 
              className="w-full h-8 text-xs"
            >
              Salvar
            </Button>
          </div>
        )}

        {/* Stats with Accuracy Semaphore */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="relative text-center p-2 rounded-lg bg-muted/50 group/time">
            <p className="text-sm font-mono font-semibold text-foreground">{formatHoursToHHMMSS(block.hoursStudied)}</p>
            <p className="text-[10px] text-muted-foreground">Estudado</p>
            {onResetBlockHours && block.hoursStudied > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsResetHoursDialogOpen(true); }}
                className="absolute -top-1 -right-1 p-1 rounded-full bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover/time:opacity-100"
                title="Zerar tempo"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="relative text-center p-2 rounded-lg bg-muted/50 group/sessions cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsHistoryModalOpen(true); }}>
            <p className="text-base font-semibold text-foreground">{block.questionSessions.length}</p>
            <p className="text-[10px] text-muted-foreground">Sessões</p>
            <button
              onClick={(e) => { e.stopPropagation(); setIsHistoryModalOpen(true); }}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover/sessions:opacity-100"
              title="Ver histórico"
            >
              <History className="h-3 w-3" />
            </button>
          </div>
          {/* Accuracy with Elite Fiscal Semaphore */}
          <div className={cn(
            'text-center p-2 rounded-lg border',
            accuracy >= 80 
              ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/40' 
              : accuracy >= 60 
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-destructive/10 border-destructive/30'
          )}>
            <p className={cn(
              'text-base font-bold',
              accuracy >= 80 ? 'text-amber-500' : accuracy >= 60 ? 'text-blue-500' : 'text-destructive'
            )}>
              {accuracy}%
            </p>
            <p className={cn(
              'text-[10px] font-medium',
              accuracy >= 80 ? 'text-amber-600 dark:text-amber-400' : accuracy >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-destructive'
            )}>
              {accuracy >= 80 ? '✓ Avançar' : accuracy >= 60 ? '↻ Revisar' : '⚠ Teoria'}
            </p>
          </div>
        </div>

        {/* PDF Progress Section */}
        <div className="space-y-2.5 mb-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          {/* Theory Progress - Pages */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Teoria
              </span>
              <span className={cn(
                "text-xs font-semibold",
                theoryProgress >= 100 ? "text-success" : theoryProgress > 0 ? "text-primary" : "text-muted-foreground"
              )}>
                {theoryProgress}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Pág"
                value={currentPageInput}
                onChange={(e) => setCurrentPageInput(e.target.value)}
                onBlur={() => {
                  const page = parseInt(currentPageInput) || 0;
                  if (onUpdatePdfProgress && page !== (block.currentPage || 0)) {
                    onUpdatePdfProgress({ currentPage: page });
                    toast.success('Progresso salvo!');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-16 text-xs text-center"
              />
              <span className="text-xs text-muted-foreground">/</span>
              <Input
                type="number"
                min={0}
                placeholder="Total"
                value={totalPagesInput}
                onChange={(e) => setTotalPagesInput(e.target.value)}
                onBlur={() => {
                  const total = parseInt(totalPagesInput) || 0;
                  if (onUpdatePdfProgress && total !== (block.totalPages || 0)) {
                    onUpdatePdfProgress({ totalPages: total });
                    toast.success('Total de páginas salvo!');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-16 text-xs text-center"
              />
            </div>
            {(block.totalPages || 0) > 0 && (
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    theoryProgress >= 100 ? "bg-success" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(theoryProgress, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* PDF Questions Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Q. PDF
              </span>
              <span className={cn(
                "text-xs font-semibold",
                pdfQuestionsProgress >= 100 ? "text-success" : pdfQuestionsProgress > 0 ? "text-blue-500" : "text-muted-foreground"
              )}>
                {pdfQuestionsProgress}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Feitas"
                value={pdfQuestionsDoneInput}
                onChange={(e) => setPdfQuestionsDoneInput(e.target.value)}
                onBlur={() => {
                  const done = parseInt(pdfQuestionsDoneInput) || 0;
                  if (onUpdatePdfProgress && done !== (block.pdfQuestionsDone || 0)) {
                    onUpdatePdfProgress({ pdfQuestionsDone: done });
                    toast.success('Questões atualizadas!');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-16 text-xs text-center"
              />
              <span className="text-xs text-muted-foreground">/</span>
              <Input
                type="number"
                min={0}
                placeholder="Total"
                value={pdfQuestionsTotalInput}
                onChange={(e) => setPdfQuestionsTotalInput(e.target.value)}
                onBlur={() => {
                  const total = parseInt(pdfQuestionsTotalInput) || 0;
                  if (onUpdatePdfProgress && total !== (block.pdfQuestionsTotal || 0)) {
                    onUpdatePdfProgress({ pdfQuestionsTotal: total });
                    toast.success('Total de questões salvo!');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-16 text-xs text-center"
              />
            </div>
            {(block.pdfQuestionsTotal || 0) > 0 && (
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    pdfQuestionsProgress >= 100 ? "bg-success" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.min(pdfQuestionsProgress, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Add Session Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSessionDialogOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar Sessão
        </button>
      </div>

      <AddSessionDialog
        open={isSessionDialogOpen}
        onOpenChange={setIsSessionDialogOpen}
        onSubmit={onAddSession}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir o bloco "<strong>{block.name}</strong>"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Hours Confirmation Dialog */}
      <AlertDialog open={isResetHoursDialogOpen} onOpenChange={setIsResetHoursDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-warning" />
              Zerar Tempo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja zerar o tempo estudado deste bloco? O tempo voltará para <strong>00:00:00</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetHours}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              Zerar Tempo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session History Modal */}
      <SessionHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        blockName={block.name}
        questionSessions={block.questionSessions}
        timeSessions={block.timeSessions || []}
        onDeleteQuestionSession={(sessionId) => {
          if (onDeleteQuestionSession) {
            onDeleteQuestionSession(sessionId);
          }
        }}
        onDeleteTimeSession={(sessionId) => {
          if (onDeleteTimeSession) {
            onDeleteTimeSession(sessionId);
          }
        }}
      />
    </>
  );
};
