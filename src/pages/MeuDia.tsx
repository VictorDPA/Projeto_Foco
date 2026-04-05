import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, Clock, Target, BookOpen, AlertCircle, CheckCircle2, Play, Focus, ChevronRight, FileText, Scale, Star, RotateCcw, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';
import { useAgendaData, AgendaSlot } from '@/hooks/useAgendaData';
import { useErrorData } from '@/hooks/useErrorData';
import { useUserSettings } from '@/hooks/useUserSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatHoursToHHMMSS } from '@/lib/timeFormat';
import { useNavigate } from 'react-router-dom';

const MeuDia = () => {
  const navigate = useNavigate();
  const { subjects, updateHoursStudied, setCurrentBlock } = useSupabaseStudyData();
  const { 
    todaySlots, 
    todayConfig, 
    todayMetrics, 
    toggleSlotCompleted, 
    markSlotCompleted,
    isLoading: isAgendaLoading 
  } = useAgendaData();
  const { errors } = useErrorData();
  const { settings } = useUserSettings();
  
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Handle slot click - navigate to study block
  const handleSlotClick = async (slot: AgendaSlot) => {
    try {
      await setCurrentBlock(slot.subjectId, slot.blockId, false);
      toast.success(`Iniciando: ${slot.blockName}`, {
        description: `${slot.subjectName}`
      });
      navigate('/study-blocks');
    } catch (error) {
      toast.error('Erro ao selecionar bloco');
    }
  };

  // Handle task completion with time tracking
  const handleCompleteSlot = useCallback(async (slot: AgendaSlot) => {
    // Log hours automatically
    const hoursStudied = slot.durationMinutes / 60;
    const subject = subjects.find(s => s.id === slot.subjectId);
    const block = subject?.blocks.find(b => b.id === slot.blockId);
    
    if (block) {
      await updateHoursStudied(slot.subjectId, slot.blockId, block.hoursStudied + hoursStudied);
    }

    await markSlotCompleted(slot.id, slot.durationMinutes);
    toast.success(`+${hoursStudied.toFixed(1)}h registradas`);
  }, [subjects, updateHoursStudied, markSlotCompleted]);

  const getSlotStyles = (slot: AgendaSlot) => {
    if (slot.isCompleted) {
      return 'bg-emerald-500/10 border-emerald-500/50 opacity-70';
    }
    if (slot.weight === 3) {
      return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50';
    }
    if (slot.slotType === 'practice' || slot.studyPhase === 'avancado') {
      return 'bg-muted/50 border-muted-foreground/30';
    }
    return 'bg-card border-border';
  };

  const getTypeIcon = (type: string, studyPhase: string) => {
    if (type === 'reinforcement') return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    if (type === 'practice' || studyPhase === 'avancado') return <Target className="h-4 w-4 text-muted-foreground" />;
    return <BookOpen className="h-4 w-4 text-foreground" />;
  };

  const getTypeLabel = (type: string, studyPhase: string) => {
    if (type === 'reinforcement') return 'Reforço';
    if (type === 'practice' || studyPhase === 'avancado') return 'Questões';
    return 'Teoria';
  };

  const blockProgressPercent = todayMetrics.totalSlots > 0 
    ? (todayMetrics.completedSlots / todayMetrics.totalSlots) * 100 
    : 0;

  const hasAgenda = todaySlots.length > 0;

  if (isAgendaLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className={cn(
        "max-w-4xl mx-auto transition-all duration-500",
        isFocusMode && "max-w-2xl"
      )}>
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Meu Dia
              </h1>
              <p className="text-muted-foreground">
                {hasAgenda 
                  ? `${todayConfig?.availableHours || 0}h disponíveis • ${todaySlots.length} blocos programados`
                  : 'Nenhuma agenda configurada para hoje'
                }
              </p>
            </div>
            {hasAgenda && (
              <Button
                variant={isFocusMode ? "default" : "outline"}
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="gap-2"
              >
                <Focus className="h-4 w-4" />
                {isFocusMode ? 'Modo Normal' : 'Modo Foco'}
              </Button>
            )}
          </div>
        </div>

        {/* No agenda state */}
        {!hasAgenda && (
          <Card className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma agenda para hoje</h3>
              <p className="text-muted-foreground mb-4">
                Acesse a Agenda de Ciclo para configurar suas horas disponíveis e gerar sua programação semanal.
              </p>
              <Button onClick={() => navigate('/agenda-ciclo')} className="bg-gradient-gold">
                Ir para Agenda de Ciclo
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Overview */}
        {hasAgenda && (
          <>
            <div className={cn(
              "grid gap-4 mb-8 animate-fade-in",
              isFocusMode ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
            )}>
              {/* Block Progress */}
              <Card className="p-4 border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Meta de Blocos</p>
                    <p className="font-bold text-lg">{todayMetrics.completedSlots}/{todayMetrics.totalSlots}</p>
                  </div>
                </div>
                <Progress value={blockProgressPercent} className="h-2" />
              </Card>

              {/* Hours Progress */}
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Horas Estudadas</p>
                    <p className="font-bold text-lg">
                      {todayMetrics.completedHours.toFixed(1)}h / {todayMetrics.plannedHours.toFixed(1)}h
                    </p>
                  </div>
                </div>
                <Progress 
                  value={todayMetrics.plannedHours > 0 ? (todayMetrics.completedHours / todayMetrics.plannedHours) * 100 : 0} 
                  className="h-2" 
                />
              </Card>

              {!isFocusMode && (
                <>
                  {/* Overrun Alert */}
                  <Card className={cn(
                    "p-4",
                    todayMetrics.isOverrun && "border-red-500/50 bg-red-500/5"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        todayMetrics.isOverrun ? "bg-red-500/10" : "bg-muted"
                      )}>
                        <AlertCircle className={cn(
                          "h-5 w-5",
                          todayMetrics.isOverrun ? "text-red-500" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tempo Extra</p>
                        <p className={cn(
                          "font-bold text-lg",
                          todayMetrics.isOverrun && "text-red-500"
                        )}>
                          {todayMetrics.isOverrun ? `+${todayMetrics.overrunMinutes}min` : 'No prazo'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Errors to Review */}
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <RotateCcw className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Erros Pendentes</p>
                        <p className="font-bold text-lg">{errors.length}</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Overrun Warning Banner */}
            {todayMetrics.isOverrun && (
              <Card className="mb-6 p-4 border-red-500 bg-red-500/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-500">Cronograma atrasado</p>
                    <p className="text-sm text-muted-foreground">
                      Você gastou {todayMetrics.overrunMinutes} minutos a mais do que o planejado. Considere ajustar os próximos slots.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Today's Schedule */}
            <Card className="p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Programação de Hoje
                </h2>
                <Badge variant="outline">
                  {todayConfig?.dayName}
                </Badge>
              </div>

              <div className="space-y-3">
                {todaySlots.map((slot, index) => {
                  const isNext = !slot.isCompleted && todaySlots.slice(0, index).every(s => s.isCompleted);
                  
                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "group relative p-4 rounded-lg border transition-all",
                        getSlotStyles(slot),
                        isNext && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Completion checkbox */}
                        <button
                          onClick={() => slot.isCompleted ? toggleSlotCompleted(slot.id) : handleCompleteSlot(slot)}
                          className={cn(
                            "mt-1 p-1.5 rounded-full border-2 transition-all",
                            slot.isCompleted 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : "border-muted-foreground/30 hover:border-primary"
                          )}
                        >
                          {slot.isCompleted && <CheckCircle2 className="h-4 w-4" />}
                        </button>

                        {/* Slot content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="font-medium"
                              style={{ color: slot.isCompleted ? 'inherit' : slot.subjectColor }}
                            >
                              {slot.subjectName}
                            </span>
                            {slot.weight === 3 && (
                              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                                <Zap className="h-3 w-3 mr-1" />
                                Peso 3
                              </Badge>
                            )}
                            {slot.slotType === 'reinforcement' && (
                              <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Reforço
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            {getTypeIcon(slot.slotType, slot.studyPhase)}
                            <span>{getTypeLabel(slot.slotType, slot.studyPhase)}</span>
                            <span>•</span>
                            <span>{slot.durationMinutes} min</span>
                            {slot.accuracy > 0 && (
                              <>
                                <span>•</span>
                                <span className={slot.accuracy < 70 ? 'text-orange-500' : 'text-emerald-500'}>
                                  {slot.accuracy.toFixed(0)}%
                                </span>
                              </>
                            )}
                          </div>

                          <p className="text-sm text-foreground/80">{slot.blockName}</p>

                          {slot.totalPages && slot.totalPages > 0 && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>Página {slot.currentPage || 0} de {slot.totalPages}</span>
                            </div>
                          )}
                        </div>

                        {/* Action button */}
                        <Button
                          variant={isNext ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleSlotClick(slot)}
                          disabled={slot.isCompleted}
                          className={cn(
                            "gap-1",
                            isNext && "bg-gradient-gold"
                          )}
                        >
                          {isNext ? 'Iniciar' : 'Abrir'}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Error Review Block */}
                {errors.length > 0 && !isFocusMode && (
                  <div className="p-4 rounded-lg border border-dashed bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <RotateCcw className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium">Revisão de Erros</p>
                          <p className="text-sm text-muted-foreground">
                            {errors.length} erros pendentes para revisar
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/error-log')}>
                        Revisar
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* All completed state */}
            {todayMetrics.completedSlots === todayMetrics.totalSlots && todayMetrics.totalSlots > 0 && (
              <Card className="mt-6 p-6 text-center bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                <h3 className="text-lg font-semibold text-emerald-500 mb-1">Parabéns!</h3>
                <p className="text-muted-foreground">
                  Você completou todos os blocos programados para hoje!
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default MeuDia;
