import { useState, useEffect } from 'react';
import { ExternalLink, Star, Link2, BookOpen } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudyData } from '@/hooks/useStudyData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FavoriteLink {
  subjectId: string;
  subjectName: string;
  tecUrl?: string;
  favoritosUrl?: string;
  weight: number;
  isFavorite: boolean;
}

const LinksFavoritos = () => {
  const { subjects } = useStudyData();
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('linksFavorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Get all subjects with any links (TEC or Favoritos)
  const subjectsWithLinks: FavoriteLink[] = subjects
    .filter(s => s.tecCadernoLink || s.favoritosUrl)
    .map(s => ({
      subjectId: s.id,
      subjectName: s.name,
      tecUrl: s.tecCadernoLink,
      favoritosUrl: s.favoritosUrl,
      weight: s.weight,
      isFavorite: favorites.has(s.id),
    }));

  // Sort: favorites first, then by weight (3 to 1)
  const sortedLinks = [...subjectsWithLinks].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    return b.weight - a.weight;
  });

  const toggleFavorite = (subjectId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(subjectId)) {
      newFavorites.delete(subjectId);
      toast.success('Removido dos favoritos');
    } else {
      newFavorites.add(subjectId);
      toast.success('Adicionado aos favoritos');
    }
    setFavorites(newFavorites);
    localStorage.setItem('linksFavorites', JSON.stringify([...newFavorites]));
  };

  const openLink = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Link2 className="h-8 w-8 text-primary" />
            Links & Favoritos
          </h1>
          <p className="text-muted-foreground">
            Acesso rápido aos seus cadernos de questões do TEC Concursos
          </p>
        </div>

        {/* Links List */}
        {sortedLinks.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {sortedLinks.map((link) => (
              <Card
                key={link.subjectId}
                className={cn(
                  'p-4 border transition-all hover:shadow-md',
                  link.isFavorite ? 'border-primary/50 bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Favorite Toggle */}
                  <button
                    onClick={() => toggleFavorite(link.subjectId)}
                    className="relative z-50 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-all',
                        link.isFavorite
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground hover:text-primary'
                      )}
                    />
                  </button>

                  {/* Subject Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {link.subjectName}
                      </h3>
                      <Badge variant="outline" className="text-xs shrink-0">
                        Peso {link.weight}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {link.tecUrl && link.favoritosUrl
                        ? 'Caderno TEC + Favoritos'
                        : link.tecUrl
                        ? 'Caderno TEC'
                        : 'Questões Favoritadas'}
                    </p>
                  </div>

                  {/* Link Buttons */}
                  <div className="flex items-center gap-2">
                    {/* TEC Button */}
                    {link.tecUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={link.tecUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => openLink(link.tecUrl!, e)}
                              className="relative z-50 p-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 hover:border-amber-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                              <BookOpen className="h-5 w-5" style={{ color: '#D4AF37' }} />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent><p>Abrir Caderno TEC</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Favoritos Button */}
                    {link.favoritosUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={link.favoritosUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => openLink(link.favoritosUrl!, e)}
                              className="relative z-50 p-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 hover:border-amber-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                              <Star className="h-5 w-5 fill-amber-400" style={{ color: '#D4AF37' }} />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent><p>Abrir Questões Favoritadas</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-border animate-fade-in">
            <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Nenhum link cadastrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Adicione links do TEC Concursos nos cards das matérias em "Ciclos de Estudo" para acessá-los rapidamente aqui.
            </p>
          </Card>
        )}

        {/* Quick Tip */}
        <Card className="p-4 mt-6 border-primary/20 bg-gradient-card animate-fade-in">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Dica:</strong> Marque como favorito as matérias que você mais precisa revisar. Elas aparecerão sempre no topo da lista.
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LinksFavoritos;
