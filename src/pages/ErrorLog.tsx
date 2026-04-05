import { useState, useMemo } from 'react';
import { BookOpen, Download, AlertTriangle, Layers, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useStudyData } from '@/hooks/useStudyData';
import { useErrorData } from '@/hooks/useErrorData';
import { AddErrorDialog } from '@/components/errors/AddErrorDialog';
import { ErrorCard } from '@/components/errors/ErrorCard';
import { ErrorFilters } from '@/components/errors/ErrorFilters';
import { FlashcardReview } from '@/components/errors/FlashcardReview';
import { ErrorExport } from '@/components/errors/ErrorExport';
import { toast } from 'sonner';

const ErrorLog = () => {
  const { subjects } = useStudyData();
  const { errors, addError, deleteError, incrementReviewCount, getTopicCounts } = useErrorData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showPriority, setShowPriority] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isExportMode, setIsExportMode] = useState(false);

  const topicCounts = useMemo(() => getTopicCounts(), [getTopicCounts]);

  const filteredErrors = useMemo(() => {
    let result = [...errors];

    // Filter by subject
    if (selectedSubject) {
      result = result.filter((e) => e.subjectId === selectedSubject);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.topic.toLowerCase().includes(query) ||
          e.trap.toLowerCase().includes(query)
      );
    }

    // Sort by priority (most repeated topics first)
    if (showPriority) {
      const topicCountMap = new Map(topicCounts.map((t) => [t.topic, t.count]));
      result.sort((a, b) => {
        const countA = topicCountMap.get(a.topic) || 0;
        const countB = topicCountMap.get(b.topic) || 0;
        return countB - countA;
      });
    }

    return result;
  }, [errors, selectedSubject, searchQuery, showPriority, topicCounts]);

  const handleAddError = (error: Parameters<typeof addError>[0]) => {
    addError(error);
    toast.success('Erro registrado com sucesso!');
  };

  const handleDeleteError = (id: string) => {
    deleteError(id);
    toast.success('Erro removido.');
  };

  const handleExport = () => {
    if (errors.length === 0) {
      toast.error('Nenhum erro para exportar.');
      return;
    }
    setIsExportMode(true);
  };

  const handleReviewed = (errorId: string, difficulty?: 'easy' | 'medium' | 'hard') => {
    incrementReviewCount(errorId);
    // In a full implementation, we would store the next review date based on difficulty
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Caderno de Erros
            </h1>
            <p className="text-muted-foreground">
              Revisão ativa com flashcards e repetição espaçada.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-border gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <AddErrorDialog subjects={subjects} onAdd={handleAddError} />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="rounded-xl bg-error-card border border-border p-4">
            <p className="text-2xl font-bold text-foreground">{errors.length}</p>
            <p className="text-sm text-muted-foreground">Total de Erros</p>
          </div>
          <div className="rounded-xl bg-error-card border border-border p-4">
            <p className="text-2xl font-bold text-foreground">{topicCounts.length}</p>
            <p className="text-sm text-muted-foreground">Tópicos Únicos</p>
          </div>
          <div className="rounded-xl bg-error-card border border-border p-4">
            <p className="text-2xl font-bold text-primary">
              {topicCounts[0]?.count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Maior Recorrência</p>
          </div>
          <div className="rounded-xl bg-gradient-gold border border-primary/50 p-4 sm:col-span-1 col-span-2 shadow-gold">
            <Button
              className="w-full bg-primary-foreground hover:bg-primary-foreground/90 text-primary gap-2"
              onClick={() => setIsReviewMode(true)}
              disabled={errors.length === 0}
            >
              <Zap className="h-4 w-4" />
              Modo Flashcard
            </Button>
          </div>
        </div>

        {/* Flashcard Info */}
        {errors.length > 0 && (
          <div className="rounded-xl bg-muted/50 border border-border p-4 flex items-start gap-3 animate-fade-in" style={{ animationDelay: '120ms' }}>
            <Layers className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Revisão Ativa</p>
              <p className="text-sm text-muted-foreground">
                Use o Modo Flashcard para revisar os erros. Após revelar a resposta, classifique 
                como Fácil, Médio ou Difícil para agendar a próxima revisão automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <ErrorFilters
            subjects={subjects}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            showPriority={showPriority}
            onPriorityToggle={() => setShowPriority(!showPriority)}
          />
        </div>

        {/* Error List */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          {filteredErrors.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {errors.length === 0 ? 'Nenhum erro registrado' : 'Nenhum erro encontrado'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {errors.length === 0
                  ? 'Comece registrando os erros cometidos durante suas sessões de questões. Siga o plano!'
                  : 'Tente ajustar os filtros ou a busca.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredErrors.map((error) => (
                <ErrorCard
                  key={error.id}
                  error={error}
                  subject={subjects.find((s) => s.id === error.subjectId)}
                  onDelete={handleDeleteError}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Mode Modal */}
      {isReviewMode && (
        <FlashcardReview
          errors={filteredErrors}
          subjects={subjects}
          onClose={() => setIsReviewMode(false)}
          onReviewed={handleReviewed}
        />
      )}

      {/* Export Mode */}
      {isExportMode && (
        <ErrorExport
          errors={errors}
          subjects={subjects}
          onClose={() => setIsExportMode(false)}
        />
      )}
    </MainLayout>
  );
};

export default ErrorLog;
