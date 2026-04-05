import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Subject } from '@/types/study';

interface ErrorFiltersProps {
  subjects: Subject[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string | null;
  onSubjectChange: (subjectId: string | null) => void;
  showPriority: boolean;
  onPriorityToggle: () => void;
}

export const ErrorFilters = ({
  subjects,
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  showPriority,
  onPriorityToggle,
}: ErrorFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por tópico ou descrição..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted border-border"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedSubject === null && !showPriority ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            onSubjectChange(null);
            if (showPriority) onPriorityToggle();
          }}
          className={
            selectedSubject === null && !showPriority
              ? 'bg-primary text-primary-foreground'
              : 'border-border'
          }
        >
          Todos
        </Button>

        <Button
          variant={showPriority ? 'default' : 'outline'}
          size="sm"
          onClick={onPriorityToggle}
          className={
            showPriority
              ? 'bg-primary text-primary-foreground'
              : 'border-border'
          }
        >
          <Filter className="h-3 w-3 mr-1" />
          Mais Errados
        </Button>

        {subjects.map((subject) => (
          <Button
            key={subject.id}
            variant={selectedSubject === subject.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSubjectChange(selectedSubject === subject.id ? null : subject.id)}
            className={
              selectedSubject === subject.id
                ? ''
                : 'border-border'
            }
            style={
              selectedSubject === subject.id
                ? { backgroundColor: subject.color, color: '#000' }
                : { borderColor: subject.color, color: subject.color }
            }
          >
            {subject.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
