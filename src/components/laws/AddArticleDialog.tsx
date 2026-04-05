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
import { HeatMapStatus, HEAT_MAP_LABELS, Subject } from '@/types/study';

interface AddArticleDialogProps {
  subjects: Subject[];
  onAdd: (article: {
    lawName: string;
    articleNumber: string;
    description: string;
    heatMapStatus: HeatMapStatus;
    subjectId: string;
  }) => void;
}

export const AddArticleDialog = ({ subjects, onAdd }: AddArticleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [lawName, setLawName] = useState('');
  const [articleNumber, setArticleNumber] = useState('');
  const [description, setDescription] = useState('');
  const [heatMapStatus, setHeatMapStatus] = useState<HeatMapStatus>('medium');
  const [subjectId, setSubjectId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lawName.trim() && articleNumber.trim() && subjectId) {
      onAdd({
        lawName: lawName.trim(),
        articleNumber: articleNumber.trim(),
        description: description.trim(),
        heatMapStatus,
        subjectId,
      });
      setLawName('');
      setArticleNumber('');
      setDescription('');
      setHeatMapStatus('medium');
      setSubjectId('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Novo Artigo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Adicionar Artigo de Lei</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lawName">Nome da Lei</Label>
            <Input
              id="lawName"
              value={lawName}
              onChange={(e) => setLawName(e.target.value)}
              placeholder="Ex: Constituição Federal"
              className="bg-muted border-border"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="articleNumber">Artigo</Label>
            <Input
              id="articleNumber"
              value={articleNumber}
              onChange={(e) => setArticleNumber(e.target.value)}
              placeholder="Ex: Art. 5º, XII"
              className="bg-muted border-border"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Ementa</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sigilo de correspondência e das comunicações..."
              className="bg-muted border-border"
              maxLength={500}
            />
          </div>

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
            <Label htmlFor="heatMap">Incidência em Provas</Label>
            <Select value={heatMapStatus} onValueChange={(v) => setHeatMapStatus(v as HeatMapStatus)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.entries(HEAT_MAP_LABELS).map(([value, label]) => (
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
              disabled={!lawName.trim() || !articleNumber.trim() || !subjectId}
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
