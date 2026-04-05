import { useState, useCallback } from 'react';
import { Upload, FileText, Image, Trash2, Eye, BookOpen, FileCheck, Columns } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMaterialsData } from '@/hooks/useMaterialsData';
import { useStudyData } from '@/hooks/useStudyData';
import { useErrorData } from '@/hooks/useErrorData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SplitScreenViewer } from '@/components/materials/SplitScreenViewer';

const Materials = () => {
  const { materials, addMaterial, updateReadingProgress, deleteMaterial, getEditais } = useMaterialsData();
  const { subjects } = useStudyData();
  const { addError } = useErrorData();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<'pdf' | 'image' | 'edital'>('pdf');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [viewingEdital, setViewingEdital] = useState<string | null>(null);
  const [splitScreenMaterial, setSplitScreenMaterial] = useState<{ id: string; url: string; name: string } | null>(null);

  const editais = getEditais();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        addMaterial({
          name: file.name,
          type: file.type === 'application/pdf' ? selectedType : 'image',
          url,
          subjectId: selectedSubject || undefined,
        });
        toast.success(`${file.name} adicionado!`);
      } else {
        toast.error('Apenas PDFs e imagens são permitidos.');
      }
    });
  }, [addMaterial, selectedType, selectedSubject]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        addMaterial({
          name: file.name,
          type: file.type === 'application/pdf' ? selectedType : 'image',
          url,
          subjectId: selectedSubject || undefined,
        });
        toast.success(`${file.name} adicionado!`);
      }
    });
    e.target.value = '';
  }, [addMaterial, selectedType, selectedSubject]);

  const handleDelete = (id: string) => {
    deleteMaterial(id);
    toast.success('Material removido.');
  };

  const handleProgressChange = (id: string, value: number[]) => {
    updateReadingProgress(id, value[0]);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Materiais e Editais
          </h1>
          <p className="text-muted-foreground">
            Organize seus PDFs, apostilas e editais em um só lugar.
          </p>
        </div>

        {/* Quick View Edital */}
        {editais.length > 0 && (
          <div className="rounded-2xl bg-gradient-card border border-primary/30 p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Edital Rápido</h3>
              </div>
              <Select value={viewingEdital || ''} onValueChange={setViewingEdital}>
                <SelectTrigger className="w-48 bg-muted border-border">
                  <SelectValue placeholder="Selecionar edital" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {editais.map(edital => (
                    <SelectItem key={edital.id} value={edital.id}>
                      {edital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {viewingEdital && (
              <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                <iframe
                  src={editais.find(e => e.id === viewingEdital)?.url}
                  className="w-full h-full"
                  title="Visualização do Edital"
                />
              </div>
            )}
          </div>
        )}

        {/* Upload Options */}
        <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
            <SelectTrigger className="w-40 bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="pdf">PDF / Apostila</SelectItem>
              <SelectItem value="edital">Edital</SelectItem>
              <SelectItem value="image">Imagem</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSubject || 'none'} onValueChange={(v) => setSelectedSubject(v === 'none' ? '' : v)}>
            <SelectTrigger className="w-48 bg-muted border-border">
              <SelectValue placeholder="Vincular à matéria" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="none">Nenhuma</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                    {subject.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={cn(
            'relative rounded-2xl border-2 border-dashed p-8 transition-all duration-200 animate-fade-in',
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 bg-gradient-card'
          )}
          style={{ animationDelay: '150ms' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Upload className={cn('h-8 w-8', isDragging ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste e solte seus arquivos'}
            </h3>
            <p className="text-sm text-muted-foreground">
              ou clique para selecionar PDFs e imagens
            </p>
          </div>
        </div>

        {/* Materials List */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Nenhum material
              </h3>
              <p className="text-muted-foreground text-sm">
                Faça upload de PDFs e imagens para começar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map(material => {
                const subject = subjects.find(s => s.id === material.subjectId);
                return (
                  <div
                    key={material.id}
                    className="group rounded-xl bg-gradient-card border border-border p-4 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {material.type === 'image' ? (
                            <Image className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{material.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-border">
                              {material.type === 'edital' ? 'Edital' : material.type === 'pdf' ? 'PDF' : 'Imagem'}
                            </Badge>
                            {subject && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: subject.color, color: subject.color }}
                              >
                                {subject.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {material.type !== 'image' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => setSplitScreenMaterial({ id: material.id, url: material.url, name: material.name })}
                            title="Abrir em Split Screen"
                          >
                            <Columns className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(material.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {material.type !== 'image' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Progresso de Leitura
                          </span>
                          <span className="text-primary font-medium">{material.readingProgress}%</span>
                        </div>
                        <Slider
                          value={[material.readingProgress]}
                          onValueChange={(v) => handleProgressChange(material.id, v)}
                          max={100}
                          step={5}
                          className="cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Split Screen Viewer Modal */}
        {splitScreenMaterial && (
          <SplitScreenViewer
            pdfUrl={splitScreenMaterial.url}
            pdfName={splitScreenMaterial.name}
            subjects={subjects}
            onClose={() => setSplitScreenMaterial(null)}
            onAddError={addError}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Materials;
