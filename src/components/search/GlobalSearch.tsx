import { useState, useMemo } from 'react';
import { Search, X, BookOpen, AlertTriangle, Scale, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudyData } from '@/hooks/useStudyData';
import { useErrorData } from '@/hooks/useErrorData';
import { useLawData } from '@/hooks/useLawData';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  className?: string;
}

type SearchResult = {
  type: 'block' | 'error' | 'law';
  id: string;
  title: string;
  subtitle: string;
  color?: string;
  route: string;
};

export const GlobalSearch = ({ className }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const { subjects } = useStudyData();
  const { errors } = useErrorData();
  const { articles } = useLawData();

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search blocks
    subjects.forEach(subject => {
      subject.blocks.forEach(block => {
        if (
          block.name.toLowerCase().includes(q) ||
          block.description.toLowerCase().includes(q)
        ) {
          results.push({
            type: 'block',
            id: block.id,
            title: block.name,
            subtitle: subject.name,
            color: subject.color,
            route: '/study-blocks',
          });
        }
      });
    });

    // Search errors
    errors.forEach(error => {
      if (
        error.topic.toLowerCase().includes(q) ||
        error.trap.toLowerCase().includes(q)
      ) {
        const subject = subjects.find(s => s.id === error.subjectId);
        results.push({
          type: 'error',
          id: error.id,
          title: error.topic,
          subtitle: subject?.name || 'Erro',
          color: subject?.color,
          route: '/error-log',
        });
      }
    });

    // Search law articles
    articles.forEach(article => {
      if (
        article.articleNumber.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.lawName.toLowerCase().includes(q)
      ) {
        const subject = subjects.find(s => s.id === article.subjectId);
        results.push({
          type: 'law',
          id: article.id,
          title: article.articleNumber,
          subtitle: article.lawName,
          color: subject?.color,
          route: '/law-mapping',
        });
      }
    });

    return results.slice(0, 8);
  }, [query, subjects, errors, articles]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    setQuery('');
    setIsFocused(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'block':
        return <BookOpen className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'law':
        return <Scale className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'block':
        return 'Bloco';
      case 'error':
        return 'Erro';
      case 'law':
        return 'Lei';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar blocos, erros, leis..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 pr-10 bg-muted border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isFocused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
              onClick={() => handleResultClick(result)}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: result.color ? `${result.color}20` : 'hsl(var(--muted))' }}
              >
                <span style={{ color: result.color || 'hsl(var(--muted-foreground))' }}>
                  {getIcon(result.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
              </div>
              <Badge variant="outline" className="text-xs border-border shrink-0">
                {getTypeLabel(result.type)}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}

      {isFocused && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated z-50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  );
};
