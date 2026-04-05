import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SubjectWeight, WEIGHT_LABELS } from '@/types/study';

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, color: string, weight: SubjectWeight) => void;
}

const colorOptions = [
  '#FFD700', // Gold
  '#4ECDC4', // Teal
  '#FF6B6B', // Coral
  '#A78BFA', // Purple
  '#34D399', // Emerald
  '#F472B6', // Pink
  '#60A5FA', // Blue
  '#FBBF24', // Amber
];

export const AddSubjectDialog = ({ open, onOpenChange, onSubmit }: AddSubjectDialogProps) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [weight, setWeight] = useState<SubjectWeight>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), selectedColor, weight);
      onOpenChange(false);
      setName('');
      setSelectedColor(colorOptions[0]);
      setWeight(2);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Nova Matéria</DialogTitle>
          <DialogDescription>
            Adicione uma nova matéria para organizar seus ciclos de estudo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Matéria</Label>
            <Input
              id="name"
              placeholder="Ex: Direito Tributário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso da Matéria</Label>
            <Select value={String(weight)} onValueChange={(v) => setWeight(Number(v) as SubjectWeight)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {([1, 2, 3] as SubjectWeight[]).map(w => (
                  <SelectItem key={w} value={String(w)}>
                    {WEIGHT_LABELS[w]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Matérias com peso maior impactam mais na média ponderada
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    selectedColor === color && 'ring-2 ring-offset-2 ring-offset-background ring-foreground'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              Criar Matéria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
