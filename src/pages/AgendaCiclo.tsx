import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Target, 
  Zap, 
  BookOpen, 
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAgendaData, AgendaSlot } from '@/hooks/useAgendaData';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AgendaCiclo = () => {
  const navigate = useNavigate();
  const { setCurrentBlock } = useSupabaseStudyData();
  const {
    daysConfig,
    slots,
    isLoading,
    todayDayOfWeek,
    weekMetrics,
    updateDayHours,
    toggleSlotCompleted,
    generateWeekSchedule,
    getSlotsForDay,
  } = useAgendaData();

  const handleSlotClick = async (slot: AgendaSlot) => {
    try {
      await setCurrentBlock(slot.subjectId, slot.blockId, false);
      toast.success(`Iniciando: ${slot.blockName}`, {
        description: `${slot.subjectName} • ${getTypeLabel(slot.slotType, slot.studyPhase)}`
      });
      navigate('/study-blocks');
    } catch (error) {
      toast.error('Erro ao selecionar bloco');
    }
  };

  const getSlotStyles = (slot: AgendaSlot) => {
    const baseStyles = 'transition-all';
    
    if (slot.isCompleted) {
      return `${baseStyles} bg-emerald-500/10 border-emerald-500/50 opacity-70`;
    }
    if (slot.weight === 3) {
      return `${baseStyles} bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 hover:border-amber-500`;
    }
    if (slot.slotType === 'practice' || slot.studyPhase === 'avancado') {
      return `${baseStyles} bg-muted/50 border-muted-foreground/30 hover:border-muted-foreground/50`;
    }
    return `${baseStyles} bg-card border-border hover:border-primary/50`;
  };

  const getTypeIcon = (type: string, studyPhase: string) => {
    if (type === 'reinforcement') return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />;
    if (type === 'practice' || studyPhase === 'avancado') return <Target className="h-3.5 w-3.5 text-muted-foreground" />;
    return <BookOpen className="h-3.5 w-3.5 text-foreground" />;
  };

  const getTypeLabel = (type: string, studyPhase: string) => {
    if (type === 'reinforcement') return 'Reforço';
    if (type === 'practice' || studyPhase === 'avancado') return 'Questões';
    return 'Teoria';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  const hasSlots = slots.length > 0;

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Agenda de Ciclo
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Defina suas horas disponíveis e o sistema organizará seus blocos automaticamente
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Semanal</div>
              <div className="font-bold text-lg">{weekMetrics.totalPlannedHours}h • {weekMetrics.totalSlots} blocos</div>
            </div>
            <Button 
              onClick={generateWeekSchedule}
              className="bg-gradient-gold hover:opacity-90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {hasSlots ? 'Regenerar' : 'Gerar Agenda'}
            </Button>
          </div>
        </div>

        {/* Days Configuration */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Carga Horária por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {daysConfig.map(day => (
                <div key={day.dayOfWeek} className={cn(
                  "text-center",
                  day.dayOfWeek === todayDayOfWeek && "ring-2 ring-primary rounded-lg p-1"
                )}>
                  <div className={cn(
                    "text-xs font-medium mb-2",
                    day.dayOfWeek === todayDayOfWeek ? "text-primary" : "text-muted-foreground"
                  )}>
                    {day.shortName}
                    {day.dayOfWeek === todayDayOfWeek && <span className="ml-1">•</span>}
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="12"
                      step="0.5"
                      value={day.availableHours}
                      onChange={(e) => updateDayHours(day.dayOfWeek, parseFloat(e.target.value) || 0)}
                      className="text-center h-10 text-sm font-medium"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">h</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Week Calendar Grid */}
        {hasSlots ? (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {daysConfig.map(day => {
              const daySlots = getSlotsForDay(day.dayOfWeek);
              const totalMinutes = daySlots.reduce((sum, s) => sum + s.durationMinutes, 0);
              const completedMinutes = daySlots.filter(s => s.isCompleted).reduce((sum, s) => sum + s.durationMinutes, 0);
              const weight3Count = daySlots.filter(s => s.weight === 3).length;
              const completedCount = daySlots.filter(s => s.isCompleted).length;
              const isToday = day.dayOfWeek === todayDayOfWeek;
              const progressPercent = totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;
              
              return (
                <Card key={day.dayOfWeek} className={cn(
                  "overflow-hidden",
                  isToday && "ring-2 ring-primary"
                )}>
                  <CardHeader className={cn(
                    "py-3 px-4 border-b",
                    isToday ? "bg-primary/10" : "bg-muted/30"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={cn(
                          "font-semibold text-sm",
                          isToday && "text-primary"
                        )}>
                          {day.shortName}
                          {isToday && <span className="ml-1 text-xs">(Hoje)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.availableHours}h disponíveis
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {completedCount}/{daySlots.length} blocos
                        </div>
                        {weight3Count > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-500/50 text-amber-600">
                            {weight3Count} P3
                          </Badge>
                        )}
                      </div>
                    </div>
                    {daySlots.length > 0 && (
                      <Progress value={progressPercent} className="h-1 mt-2" />
                    )}
                  </CardHeader>
                  <CardContent className="p-2">
                    <ScrollArea className="h-[320px]">
                      <div className="space-y-2 pr-2">
                        {daySlots.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhum slot
                          </div>
                        ) : (
                          daySlots.map(slot => (
                            <TooltipProvider key={slot.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative">
                                    <button
                                      onClick={() => handleSlotClick(slot)}
                                      className={`w-full text-left p-2.5 rounded-lg border ${getSlotStyles(slot)}`}
                                    >
                                      <div className="flex items-start justify-between gap-1 mb-1">
                                        <span 
                                          className="text-xs font-medium truncate flex-1"
                                          style={{ color: slot.isCompleted ? 'inherit' : slot.subjectColor }}
                                        >
                                          {slot.subjectName}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          {slot.isCompleted && (
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                          )}
                                          {slot.weight === 3 && !slot.isCompleted && (
                                            <Zap className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                                        {getTypeIcon(slot.slotType, slot.studyPhase)}
                                        <span>{getTypeLabel(slot.slotType, slot.studyPhase)}</span>
                                        <span className="ml-auto">{slot.durationMinutes}min</span>
                                      </div>
                                      
                                      <div className="text-[10px] truncate text-foreground/80">
                                        {slot.blockName}
                                      </div>
                                      
                                      {slot.accuracy > 0 && (
                                        <div className={`text-[10px] mt-1 ${slot.accuracy < 70 ? 'text-orange-500' : 'text-emerald-500'}`}>
                                          {slot.accuracy.toFixed(0)}% acurácia
                                        </div>
                                      )}
                                      
                                      {slot.totalPages && slot.totalPages > 0 && (
                                        <div className="text-[10px] text-muted-foreground">
                                          Pág {slot.currentPage || 0}/{slot.totalPages}
                                        </div>
                                      )}
                                    </button>
                                    
                                    {/* Toggle completion button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSlotCompleted(slot.id);
                                      }}
                                      className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
                                    >
                                      <CheckCircle2 className={cn(
                                        "h-4 w-4",
                                        slot.isCompleted ? "text-emerald-500" : "text-muted-foreground/50"
                                      )} />
                                    </button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[200px]">
                                  <p className="font-medium">{slot.blockName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Clique para iniciar estudo
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma agenda gerada</h3>
              <p className="text-muted-foreground mb-4">
                Configure suas horas disponíveis acima e clique em "Gerar Agenda" para criar seu plano semanal.
              </p>
              <Button onClick={generateWeekSchedule} className="bg-gradient-gold">
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Agenda
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Manual Info */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>O Ciclo é contínuo.</strong> Defina suas horas disponíveis para o dia e o sistema organizará seus blocos 
              priorizando o peso das matérias e sua recuperação de desempenho. Clique em qualquer slot para iniciar o estudo.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AgendaCiclo;
