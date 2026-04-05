import { useState } from 'react';
import { X, FileText, AlertCircle, Sparkles, SendHorizonal, List, Lightbulb, AlertTriangle, ExternalLink, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Subject, StudyError } from '@/types/study';
import { toast } from 'sonner';

interface SplitScreenViewerProps {
  pdfUrl: string;
  pdfName: string;
  subjects: Subject[];
  onClose: () => void;
  onAddError: (error: Omit<StudyError, 'id' | 'createdAt' | 'reviewCount'>) => void;
}

interface FormattedContent {
  bullets: string[];
  pegadinhas: string[];
  mnemonicos: string[];
}

export const SplitScreenViewer = ({
  pdfUrl,
  pdfName,
  subjects,
  onClose,
  onAddError,
}: SplitScreenViewerProps) => {
  const [rawText, setRawText] = useState('');
  const [formattedContent, setFormattedContent] = useState<FormattedContent | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [panelWidth, setPanelWidth] = useState(55);
  
  const formatResumo = () => {
    if (!rawText.trim()) {
      toast.error('Cole o conteúdo do PDF primeiro.');
      return;
    }

    const lines = rawText.split('\n').filter(l => l.trim());
    const bullets: string[] = [];
    const pegadinhas: string[] = [];
    const mnemonicos: string[] = [];

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('atenção') || lower.includes('cuidado') || lower.includes('pegadinha') || lower.includes('lembre-se')) {
        pegadinhas.push(line.trim());
      } else if (lower.includes('mnemônico') || lower.includes('dica') || /^[A-Z]{2,}:/.test(line)) {
        mnemonicos.push(line.trim());
      } else if (line.trim().length > 10) {
        bullets.push(line.trim());
      }
    });

    if (bullets.length === 0 && pegadinhas.length === 0 && mnemonicos.length === 0) {
      lines.slice(0, 10).forEach(l => bullets.push(l.trim()));
    }

    setFormattedContent({ bullets, pegadinhas, mnemonicos });
    toast.success('Resumo formatado com sucesso!');
  };

  const sendToErrorLog = (content: string) => {
    if (!selectedSubject) {
      toast.error('Selecione uma matéria primeiro.');
      return;
    }

    onAddError({
      subjectId: selectedSubject,
      topic: selectedTopic || 'Nota do Resumo',
      trap: content,
      errorType: 'didnt_know_law',
    });
    
    toast.success('Enviado para o Caderno de Erros!');
  };

  // Get quick links from selected subject
  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
  const quickLinks = [
    ...(selectedSubjectData?.tecCadernoLink ? [{ name: 'Caderno TEC', url: selectedSubjectData.tecCadernoLink }] : []),
    ...(selectedSubjectData?.favoritosUrl ? [{ name: 'Questões Favoritadas', url: selectedSubjectData.favoritosUrl }] : []),
    ...(selectedSubjectData?.blocks.flatMap(b => b.externalLinks || []) || []),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground truncate max-w-[300px]">{pdfName}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Split Screen Content */}
      <div className="flex-1 flex">
        {/* Left: PDF Viewer */}
        <div className="h-full bg-muted" style={{ width: `${panelWidth}%` }}>
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="Visualização do PDF"
          />
        </div>

        {/* Divider */}
        <div 
          className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = panelWidth;
            const onMouseMove = (e: MouseEvent) => {
              const delta = e.clientX - startX;
              const newWidth = startWidth + (delta / window.innerWidth) * 100;
              setPanelWidth(Math.min(80, Math.max(30, newWidth)));
            };
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />

        {/* Right: Tabs */}
        <div className="flex-1" style={{ width: `${100 - panelWidth}%` }}>
          <Tabs defaultValue="resumo" className="h-full flex flex-col">
            <TabsList className="mx-3 mt-3 grid w-auto grid-cols-3">
              <TabsTrigger value="resumo" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Resumo IA
              </TabsTrigger>
              <TabsTrigger value="erros" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Erros
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-2">
                <Link2 className="h-4 w-4" />
                Links
              </TabsTrigger>
            </TabsList>

            {/* Resumo IA Tab */}
            <TabsContent value="resumo" className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-4">
                {/* Input Area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Cole o conteúdo do PDF aqui:
                  </label>
                  <Textarea
                    placeholder="Cole o texto copiado do PDF para formatar..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="min-h-[150px] bg-muted border-border"
                  />
                  <Button onClick={formatResumo} className="w-full gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                    Formatar Resumo
                  </Button>
                </div>

                {/* Formatted Output */}
                {formattedContent && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Bullets */}
                    {formattedContent.bullets.length > 0 && (
                      <div className="rounded-lg border border-border p-3 bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <List className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm text-foreground">Pontos Principais</span>
                        </div>
                        <ul className="space-y-1.5">
                          {formattedContent.bullets.map((b, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span className="flex-1">{b}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => sendToErrorLog(b)}
                              >
                                <SendHorizonal className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pegadinhas */}
                    {formattedContent.pegadinhas.length > 0 && (
                      <div className="rounded-lg border border-warning/50 p-3 bg-warning/5">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="font-medium text-sm text-foreground">Atenção: Pegadinhas</span>
                        </div>
                        <ul className="space-y-1.5">
                          {formattedContent.pegadinhas.map((p, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-warning mt-0.5">⚠</span>
                              <span className="flex-1">{p}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => sendToErrorLog(p)}
                              >
                                <SendHorizonal className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mnemônicos */}
                    {formattedContent.mnemonicos.length > 0 && (
                      <div className="rounded-lg border border-primary/50 p-3 bg-primary/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm text-foreground">Mnemônicos</span>
                        </div>
                        <ul className="space-y-1.5">
                          {formattedContent.mnemonicos.map((m, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">💡</span>
                              <span className="flex-1">{m}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => sendToErrorLog(m)}
                              >
                                <SendHorizonal className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Caderno de Erros Tab */}
            <TabsContent value="erros" className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-card">
                  <h3 className="font-medium text-foreground mb-3">Adicionar Nota Rápida</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Matéria</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm"
                      >
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Tópico</label>
                      <input
                        type="text"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        placeholder="Ex: Art. 37, CF"
                        className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm"
                      />
                    </div>

                    <Textarea
                      placeholder="Descreva a pegadinha ou nota importante..."
                      className="min-h-[100px] bg-muted border-border"
                      id="error-content"
                    />

                    <Button
                      onClick={() => {
                        const content = (document.getElementById('error-content') as HTMLTextAreaElement)?.value;
                        if (content) {
                          sendToErrorLog(content);
                          (document.getElementById('error-content') as HTMLTextAreaElement).value = '';
                        }
                      }}
                      className="w-full gap-2"
                    >
                      <SendHorizonal className="h-4 w-4" />
                      Enviar para Caderno de Erros
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground p-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Use a aba "Resumo IA" para formatar</p>
                  <p>e enviar notas rapidamente.</p>
                </div>
              </div>
            </TabsContent>

            {/* Links Rápidos Tab */}
            <TabsContent value="links" className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-4">
                {/* Subject Selector */}
                <div className="rounded-lg border border-border p-4 bg-card">
                  <label className="text-sm text-muted-foreground mb-2 block">Selecionar Matéria</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Links */}
                {quickLinks.length > 0 ? (
                  <div className="space-y-2">
                    {quickLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <ExternalLink className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{link.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground p-8">
                    <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum link cadastrado.</p>
                    <p className="mt-1">Adicione links no card da matéria</p>
                    <p>ou configure o Caderno TEC.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
