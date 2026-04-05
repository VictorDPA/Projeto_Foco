import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExamBoard, EXAM_BOARD_LABELS } from '@/types/study';

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (session: { date: string; totalQuestions: number; hits: number; examBoard?: ExamBoard }) => void;
}

export const AddSessionDialog = ({ open, onOpenChange, onSubmit }: AddSessionDialogProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalQuestions, setTotalQuestions] = useState('');
  const [hits, setHits] = useState('');
  const [examBoard, setExamBoard] = useState<ExamBoard | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseInt(totalQuestions);
    const hitCount = parseInt(hits);
    
    if (total > 0 && hitCount >= 0 && hitCount <= total) {
      onSubmit({ 
        date, 
        totalQuestions: total, 
        hits: hitCount,
        examBoard: examBoard || undefined,
      });
      onOpenChange(false);
      setTotalQuestions('');
      setHits('');
      setExamBoard('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Nova Sessão de Questões</DialogTitle>
          <DialogDescription>
            Registre os resultados da sua sessão de estudos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="board">Banca</Label>
            <Select value={examBoard} onValueChange={(v) => setExamBoard(v as ExamBoard | '')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a banca (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não especificar</SelectItem>
                {Object.entries(EXAM_BOARD_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="total">Total de Questões</Label>
            <Input
              id="total"
              type="number"
              min="1"
              placeholder="Ex: 20"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hits">Acertos</Label>
            <Input
              id="hits"
              type="number"
              min="0"
              placeholder="Ex: 18"
              value={hits}
              onChange={(e) => setHits(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
