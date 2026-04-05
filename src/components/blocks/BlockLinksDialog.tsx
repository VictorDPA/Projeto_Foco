import { useState } from 'react';
import { Link as LinkIcon, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink as ExternalLinkType, StudyBlock } from '@/types/study';

interface BlockLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: StudyBlock;
  onUpdateLinks: (links: ExternalLinkType[]) => void;
  onUpdateRedoFavorites: (value: boolean) => void;
}

export const BlockLinksDialog = ({
  open,
  onOpenChange,
  block,
  onUpdateLinks,
  onUpdateRedoFavorites,
}: BlockLinksDialogProps) => {
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<'caderno' | 'questoes' | 'outro'>('caderno');
  const links = block.externalLinks || [];

  const handleAddLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;

    const newLink: ExternalLinkType = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLinkName.trim(),
      url: newLinkUrl.trim(),
      type: newLinkType,
    };

    onUpdateLinks([...links, newLink]);
    setNewLinkName('');
    setNewLinkUrl('');
    setNewLinkType('caderno');
  };

  const handleRemoveLink = (linkId: string) => {
    onUpdateLinks(links.filter(l => l.id !== linkId));
  };

  const openExternalLink = (url: string) => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Links & Questões Favoritadas
          </DialogTitle>
          <DialogDescription>
            Gerencie links externos e questões importantes do bloco.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Refazer Favoritadas Checkbox */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-muted/30">
            <Checkbox
              id="redo-favorites"
              checked={block.redoFavorites || false}
              onCheckedChange={(checked) => onUpdateRedoFavorites(!!checked)}
            />
            <Label htmlFor="redo-favorites" className="cursor-pointer">
              <span className="font-medium text-foreground">Refazer Favoritadas</span>
              <p className="text-sm text-muted-foreground">
                Questões marcadas como importantes que precisam ser refeitas
              </p>
            </Label>
          </div>

          {/* Links List */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Links de Cadernos (TEC/Questões)</Label>
            
            {links.length > 0 ? (
              <div className="space-y-2">
                {links.map(link => (
                  <div 
                    key={link.id} 
                    className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{link.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {link.type === 'caderno' ? 'Caderno' : link.type === 'questoes' ? 'Questões' : 'Outro'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openExternalLink(link.url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                Nenhum link cadastrado
              </p>
            )}
          </div>

          {/* Add New Link */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-foreground font-medium">Adicionar Novo Link</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nome do link"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
              />
              <Select value={newLinkType} onValueChange={(v) => setNewLinkType(v as typeof newLinkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caderno">Caderno TEC</SelectItem>
                  <SelectItem value="questoes">Questões</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="URL (ex: tecconcursos.com.br/...)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddLink} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
