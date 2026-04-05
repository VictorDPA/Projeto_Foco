import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorType, ERROR_TYPE_LABELS, Subject } from '@/types/study';

interface AddErrorDialogProps {
  subjects: Subject[];
  onAdd: (error: { subjectId: string; topic: string; trap: string; errorType: ErrorType }) => void;
}

export const AddErrorDialog = ({ subjects, onAdd }: AddErrorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [trap, setTrap] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('lack_attention');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectId && topic.trim() && trap.trim()) {
      onAdd({ subjectId, topic: topic.trim(), trap: trap.trim(), errorType });
      setSubjectId('');
      setTopic('');
      setTrap('');
      setErrorType('lack_attention');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Novo Erro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Registrar Novo Erro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Matéria</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Selecione a matéria" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Tópico / Artigo</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Art. 5, XII - Sigilo de Correspondência"
              className="bg-muted border-border"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trap">A "Pegadinha"</Label>
            <Textarea
              id="trap"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              placeholder="Descreva por que errou ou o truque usado pela banca..."
              className="bg-muted border-border min-h-[100px]"
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="errorType">Tipo de Erro</Label>
            <Select value={errorType} onValueChange={(v) => setErrorType(v as ErrorType)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.entries(ERROR_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!subjectId || !topic.trim() || !trap.trim()}
            >
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
