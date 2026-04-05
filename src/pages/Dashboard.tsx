import { Clock, Target, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { CurrentFocusCard } from '@/components/dashboard/CurrentFocusCard';
import { RecentErrorsWidget } from '@/components/dashboard/RecentErrorsWidget';
import { AccuracyChart } from '@/components/dashboard/AccuracyChart';
import { AccuracyEvolutionChart } from '@/components/dashboard/AccuracyEvolutionChart';
import { SubjectStrengthChart } from '@/components/dashboard/SubjectStrengthChart';
import { StudyStreakCard } from '@/components/dashboard/StudyStreakCard';
import { FiscalPerformanceCard } from '@/components/dashboard/FiscalPerformanceCard';
import { StudyPriorityWidget } from '@/components/dashboard/StudyPriorityWidget';
import { ReinforcementPriorityWidget } from '@/components/dashboard/ReinforcementPriorityWidget';
import { DailyCycleWidget } from '@/components/dashboard/DailyCycleWidget';
import { ConsistencyCalendar } from '@/components/dashboard/ConsistencyCalendar';
import { BoardAccuracyWidget } from '@/components/dashboard/BoardAccuracyWidget';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { VolumeProgressCard } from '@/components/dashboard/VolumeProgressCard';
import { TodayHoursWidget } from '@/components/dashboard/TodayHoursWidget';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';
import { useErrorData } from '@/hooks/useErrorData';
import { formatHoursToHHMMSS } from '@/lib/timeFormat';
import { toast } from 'sonner';
import { useMemo } from 'react';

const Dashboard = () => {
  const { subjects, isLoading, getStats, getCurrentBlock, calculateBlockAccuracy, updateHoursStudied } = useSupabaseStudyData();
  const { getRecentErrors } = useErrorData();
  const stats = getStats();
  const currentFocus = getCurrentBlock();
  const currentAccuracy = currentFocus ? calculateBlockAccuracy(currentFocus.block) : 0;
  const recentErrors = getRecentErrors(4);

  // Calculate weighted accuracy
  const weightedAccuracy = useMemo(() => {
    let weightedHits = 0;
    let totalWeight = 0;

    subjects.forEach(subject => {
      const weight = subject.weight || 1;
      let subjectHits = 0;
      let subjectTotal = 0;

      subject.blocks.forEach(block => {
        block.questionSessions.forEach(session => {
          subjectHits += session.hits;
          subjectTotal += session.totalQuestions;
        });
      });

      if (subjectTotal > 0) {
        const subjectAccuracy = subjectHits / subjectTotal;
        weightedHits += subjectAccuracy * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round((weightedHits / totalWeight) * 100) : 0;
  }, [subjects]);

  const handleLogTime = (minutes: number) => {
    if (currentFocus) {
      const hours = minutes / 60;
      const newHours = currentFocus.block.hoursStudied + hours;
      updateHoursStudied(currentFocus.subject.id, currentFocus.block.id, Math.round(newHours * 10) / 10);
      toast.success(`${minutes.toFixed(1)} minutos registrados!`);
    } else {
      toast.info('Selecione um bloco de foco para registrar o tempo.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
          <div className="flex-1">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Painel Elite
            </h1>
            <p className="text-muted-foreground">
              Siga o plano e domine a prova.
            </p>
          </div>
          <GlobalSearch className="w-full sm:w-72" />
        </div>

        {/* Summary Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <StatCard icon={Clock} label="Horas Líquidas" value={formatHoursToHHMMSS(stats.totalHoursStudied)} variant="gold" />
          <StatCard icon={TrendingUp} label="Média Ponderada" value={weightedAccuracy} suffix="%" variant={weightedAccuracy >= 80 ? 'success' : 'default'} />
          <StatCard icon={Target} label="Ciclos Ativos" value={stats.activeBlocks} />
          <StatCard icon={CheckCircle} label="Concluídos" value={stats.completedBlocks} variant="success" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CurrentFocusCard block={currentFocus?.block ?? null} subject={currentFocus?.subject ?? null} accuracy={currentAccuracy} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
              <AccuracyEvolutionChart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <AccuracyChart />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
                <SubjectStrengthChart />
              </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <ConsistencyCalendar />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
              <BoardAccuracyWidget subjects={subjects} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <TodayHoursWidget />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
              <VolumeProgressCard />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <ReinforcementPriorityWidget />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <DailyCycleWidget />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
              <FiscalPerformanceCard />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
              <StudyStreakCard />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '550ms' }}>
              <RecentErrorsWidget errors={recentErrors} subjects={subjects} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
