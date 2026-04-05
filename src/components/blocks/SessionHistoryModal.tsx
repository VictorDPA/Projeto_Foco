import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, History, Clock, Target } from 'lucide-react';
import { QuestionSession, StudyTimeSession, EXAM_BOARD_LABELS } from '@/types/study';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface SessionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockName: string;
  questionSessions: QuestionSession[];
  timeSessions: StudyTimeSession[];
  onDeleteQuestionSession: (sessionId: string) => void;
  onDeleteTimeSession: (sessionId: string) => void;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const SessionHistoryModal = ({
  open,
  onOpenChange,
  blockName,
  questionSessions,
  timeSessions,
  onDeleteQuestionSession,
  onDeleteTimeSession,
}: SessionHistoryModalProps) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'question' | 'time'; id: string; label: string } | null>(null);

  const handleDeleteClick = (type: 'question' | 'time', id: string, label: string) => {
    setDeleteTarget({ type, id, label });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'question') {
        onDeleteQuestionSession(deleteTarget.id);
      } else {
        onDeleteTimeSession(deleteTarget.id);
      }
    }
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  // Calculate totals
  const totalQuestions = questionSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalHits = questionSessions.reduce((sum, s) => sum + s.hits, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : 0;
  const totalTimeSeconds = timeSessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico - {blockName}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions" className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                Questões ({questionSessions.length})
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Tempo ({timeSessions.length})
              </TabsTrigger>
            </TabsList>

            {/* Question Sessions Tab */}
            <TabsContent value="questions" className="mt-4">
              {/* Summary */}
              <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">Questões</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-success">{totalHits}</p>
                    <p className="text-xs text-muted-foreground">Acertos</p>
                  </div>
                  <div>
                    <p className={cn(
                      "text-lg font-bold",
                      overallAccuracy >= 80 ? "text-amber-500" : overallAccuracy >= 60 ? "text-blue-500" : "text-destructive"
                    )}>
                      {overallAccuracy}%
                    </p>
                    <p className="text-xs text-muted-foreground">Acurácia</p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[280px] pr-3">
                {questionSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma sessão registrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {questionSessions.map((session) => {
                      const accuracy = session.totalQuestions > 0 
                        ? Math.round((session.hits / session.totalQuestions) * 100) 
                        : 0;
                      return (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {format(new Date(session.date), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              {session.examBoard && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">
                                  {EXAM_BOARD_LABELS[session.examBoard]}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{session.hits}/{session.totalQuestions} acertos</span>
                              <span className={cn(
                                "font-semibold",
                                accuracy >= 80 ? "text-amber-500" : accuracy >= 60 ? "text-blue-500" : "text-destructive"
                              )}>
                                {accuracy}%
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteClick(
                              'question', 
                              session.id, 
                              `Sessão de ${format(new Date(session.date), "dd/MM/yyyy")}`
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Time Sessions Tab */}
            <TabsContent value="time" className="mt-4">
              {/* Summary */}
              <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="text-center">
                  <p className="text-xl font-mono font-bold text-foreground">{formatDuration(totalTimeSeconds)}</p>
                  <p className="text-xs text-muted-foreground">Tempo Total</p>
                </div>
              </div>

              <ScrollArea className="h-[280px] pr-3">
                {timeSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma sessão de tempo registrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeSessions.map((session) => (
                      <div 
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">
                              {format(new Date(session.sessionDate), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <span className="font-mono text-sm font-semibold text-primary">
                              {formatDuration(session.durationSeconds)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteClick(
                            'time', 
                            session.id, 
                            `${formatDuration(session.durationSeconds)} em ${format(new Date(session.sessionDate), "dd/MM/yyyy")}`
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir <strong>{deleteTarget?.label}</strong>? 
              <br />
              {deleteTarget?.type === 'question' 
                ? 'A acurácia do bloco será recalculada.'
                : 'O tempo total do bloco será atualizado.'}
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
    </>
  );
};
