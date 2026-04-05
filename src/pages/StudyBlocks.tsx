import { useState } from 'react';
import { Plus, BookOpen, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SubjectCard } from '@/components/blocks/SubjectCard';
import { AddSubjectDialog } from '@/components/blocks/AddSubjectDialog';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';

const StudyBlocks = () => {
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const {
    subjects,
    isLoading,
    addSubject,
    addBlock,
    updateBlockStatus,
    setCurrentBlock,
    addQuestionSession,
    deleteQuestionSession,
    deleteTimeSession,
    deleteBlock,
    deleteSubject,
    updateBlockLinks,
    updateBlockRedoFavorites,
    configureMonthlyGiro,
    updateSubjectPhase,
    updateSubjectWeight,
    updateSubjectTecLink,
    updateSubjectFavoritosUrl,
    updateBlockUrls,
    updateBlockCurrentPage,
    updateBlockDetails,
    resetBlockHours,
    updateBlockPdfProgress,
    calculateBlockAccuracy,
  } = useSupabaseStudyData();

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Ciclos de Estudo
            </h1>
            <p className="text-muted-foreground">
              Organize suas matérias e ciclos de estudo.
            </p>
          </div>
          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-primary-foreground font-medium shadow-gold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Nova Matéria
          </button>
        </div>

        {/* Subjects List */}
        {subjects.length > 0 ? (
          <div className="space-y-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onAddBlock={addBlock}
                onUpdateBlockStatus={updateBlockStatus}
                onSetCurrentBlock={setCurrentBlock}
                onAddQuestionSession={addQuestionSession}
                onDeleteBlock={deleteBlock}
                onDeleteSubject={deleteSubject}
                onUpdateBlockLinks={updateBlockLinks}
                onUpdateBlockRedoFavorites={updateBlockRedoFavorites}
                onConfigureMonthlyGiro={configureMonthlyGiro}
                onUpdateSubjectPhase={updateSubjectPhase}
                onUpdateSubjectWeight={updateSubjectWeight}
                onUpdateSubjectTecLink={updateSubjectTecLink}
                onUpdateSubjectFavoritosUrl={updateSubjectFavoritosUrl}
                onUpdateBlockUrls={updateBlockUrls}
                onUpdateBlockCurrentPage={updateBlockCurrentPage}
                onUpdateBlockDetails={updateBlockDetails}
                onResetBlockHours={resetBlockHours}
                onUpdateBlockPdfProgress={updateBlockPdfProgress}
                onDeleteQuestionSession={deleteQuestionSession}
                onDeleteTimeSession={deleteTimeSession}
                calculateBlockAccuracy={calculateBlockAccuracy}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Nenhuma matéria ainda
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Comece criando sua primeira matéria para organizar seus ciclos de estudo.
            </p>
            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-primary-foreground font-medium shadow-gold hover:opacity-90 transition-opacity"
            >
              <Plus className="h-5 w-5" />
              Criar Primeira Matéria
            </button>
          </div>
        )}
      </div>

      <AddSubjectDialog
        open={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        onSubmit={addSubject}
      />
    </MainLayout>
  );
};

export default StudyBlocks;
