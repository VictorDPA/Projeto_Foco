import { useState, useMemo } from 'react';
import { Scale, BookOpen, Award, Filter, Flame, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useStudyData } from '@/hooks/useStudyData';
import { useLawData } from '@/hooks/useLawData';
import { AddArticleDialog } from '@/components/laws/AddArticleDialog';
import { LawArticleCard } from '@/components/laws/LawArticleCard';
import { LawProgress } from '@/components/laws/LawProgress';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LawMapping = () => {
  const { subjects } = useStudyData();
  const {
    articles,
    addArticle,
    deleteArticle,
    toggleRead,
    toggleMastered,
    getUniqueLaws,
    getProgressByLaw,
  } = useLawData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const uniqueLaws = useMemo(() => getUniqueLaws(), [getUniqueLaws]);

  // Count articles by heat status
  const heatCounts = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    articles.forEach(a => {
      counts[a.heatMapStatus]++;
    });
    return counts;
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Focus mode: show only high incidence
    if (focusMode) {
      result = result.filter(a => a.heatMapStatus === 'high');
    }

    if (selectedLaw) {
      result = result.filter((a) => a.lawName === selectedLaw);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.articleNumber.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.lawName.toLowerCase().includes(query)
      );
    }

    // Sort by heat status (high first)
    result.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.heatMapStatus] - order[b.heatMapStatus];
    });

    return result;
  }, [articles, selectedLaw, searchQuery, focusMode]);

  const handleAddArticle = (article: Parameters<typeof addArticle>[0]) => {
    addArticle(article);
    toast.success('Artigo adicionado com sucesso!');
  };

  const handleDeleteArticle = (id: string) => {
    deleteArticle(id);
    toast.success('Artigo removido.');
  };

  const totalRead = articles.filter((a) => a.isRead).length;
  const totalMastered = articles.filter((a) => a.isMastered).length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Lei Seca
            </h1>
            <p className="text-muted-foreground">
              Mapeie os artigos mais cobrados e domine a legislação.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Focus Mode Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <Eye className="h-4 w-4 text-primary" />
              <Label htmlFor="focus-mode" className="text-sm cursor-pointer">
                Modo Foco
              </Label>
              <Switch
                id="focus-mode"
                checked={focusMode}
                onCheckedChange={setFocusMode}
              />
            </div>
            <AddArticleDialog subjects={subjects} onAdd={handleAddArticle} />
          </div>
        </div>

        {/* Visual Heatmap Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="rounded-xl bg-gradient-card border border-border p-4 text-center">
            <Scale className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{articles.length}</p>
            <p className="text-xs text-muted-foreground">Total de Artigos</p>
          </div>
          <div className="rounded-xl bg-muted/50 border border-muted p-4 text-center">
            <div className="w-6 h-6 rounded bg-muted-foreground/20 mx-auto mb-2 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">❄️</span>
            </div>
            <p className="text-2xl font-bold text-muted-foreground">{heatCounts.low}</p>
            <p className="text-xs text-muted-foreground">Baixa Incidência</p>
          </div>
          <div className="rounded-xl bg-warning/10 border border-warning/30 p-4 text-center">
            <div className="w-6 h-6 rounded bg-warning/20 mx-auto mb-2 flex items-center justify-center">
              <span className="text-xs">🔥</span>
            </div>
            <p className="text-2xl font-bold text-warning">{heatCounts.medium}</p>
            <p className="text-xs text-muted-foreground">Média Incidência</p>
          </div>
          <div className="rounded-xl bg-gradient-gold border border-primary/50 p-4 text-center shadow-gold">
            <Flame className="h-6 w-6 text-primary-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary-foreground">{heatCounts.high}</p>
            <p className="text-xs text-primary-foreground/80">Alta Incidência 🔥</p>
          </div>
        </div>

        {/* Focus Mode Banner */}
        {focusMode && (
          <div className="rounded-xl bg-gradient-gold border border-primary/50 p-4 flex items-center gap-3 animate-fade-in shadow-gold">
            <Flame className="h-5 w-5 text-primary-foreground" />
            <div className="flex-1">
              <p className="font-medium text-primary-foreground">Modo Foco Ativado</p>
              <p className="text-sm text-primary-foreground/80">
                Mostrando apenas artigos de Alta Incidência para revisão rápida.
              </p>
            </div>
            <Badge className="bg-primary-foreground text-primary">
              {heatCounts.high} artigos
            </Badge>
          </div>
        )}

        {/* Progress by Law */}
        {uniqueLaws.length > 0 && !focusMode && (
          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-3">
              Progresso por Lei
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueLaws.map((lawName) => (
                <LawProgress
                  key={lawName}
                  lawName={lawName}
                  progress={getProgressByLaw(lawName)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>

          {uniqueLaws.length > 0 && !focusMode && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedLaw === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLaw(null)}
                className={selectedLaw === null ? 'bg-primary text-primary-foreground' : 'border-border'}
              >
                Todas
              </Button>
              {uniqueLaws.map((lawName) => (
                <Button
                  key={lawName}
                  variant={selectedLaw === lawName ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLaw(selectedLaw === lawName ? null : lawName)}
                  className={
                    selectedLaw === lawName
                      ? 'bg-primary text-primary-foreground'
                      : 'border-border'
                  }
                >
                  {lawName}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Scale className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {articles.length === 0 ? 'Nenhum artigo cadastrado' : focusMode ? 'Nenhum artigo de alta incidência' : 'Nenhum artigo encontrado'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {articles.length === 0
                  ? 'Comece adicionando artigos de lei para mapear sua leitura. Siga o plano!'
                  : focusMode 
                    ? 'Adicione artigos com status "Alta Incidência" para usar o Modo Foco.'
                    : 'Tente ajustar os filtros ou a busca.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredArticles.map((article) => (
                <LawArticleCard
                  key={article.id}
                  article={article}
                  subject={subjects.find((s) => s.id === article.subjectId)}
                  onToggleRead={toggleRead}
                  onToggleMastered={toggleMastered}
                  onDelete={handleDeleteArticle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default LawMapping;
