import { useMemo } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyError, ERROR_TYPE_LABELS, Subject } from '@/types/study';

interface ErrorExportProps {
  errors: StudyError[];
  subjects: Subject[];
  onClose: () => void;
}

export const ErrorExport = ({ errors, subjects, onClose }: ErrorExportProps) => {
  const errorsBySubject = useMemo(() => {
    const grouped: Record<string, { subject: Subject; errors: StudyError[] }> = {};
    
    errors.forEach(error => {
      const subject = subjects.find(s => s.id === error.subjectId);
      if (subject) {
        if (!grouped[subject.id]) {
          grouped[subject.id] = { subject, errors: [] };
        }
        grouped[subject.id].errors.push(error);
      }
    });
    
    return Object.values(grouped).sort((a, b) => b.errors.length - a.errors.length);
  }, [errors, subjects]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Header - Hidden in print */}
      <div className="print:hidden sticky top-0 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold text-foreground">
            Exportar Caderno de Erros
          </span>
          <Badge variant="outline" className="border-primary text-primary">
            {errors.length} erros
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir / Salvar PDF
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-full">
        {/* Print Header */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            📚 Caderno de Erros - Elite Fiscal
          </h1>
          <p className="text-muted-foreground">
            Exportado em {new Date().toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {errors.length} erros em {errorsBySubject.length} matérias
          </p>
        </div>

        {/* Errors by Subject */}
        {errorsBySubject.map(({ subject, errors: subjectErrors }) => (
          <div key={subject.id} className="mb-8 print:break-inside-avoid-page">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2" style={{ borderColor: subject.color }}>
              <div
                className="w-4 h-4 rounded-full print:border print:border-current"
                style={{ backgroundColor: subject.color }}
              />
              <h2 className="font-display font-semibold text-lg text-foreground">
                {subject.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({subjectErrors.length} {subjectErrors.length === 1 ? 'erro' : 'erros'})
              </span>
            </div>

            <div className="space-y-3">
              {subjectErrors.map((error, index) => (
                <div
                  key={error.id}
                  className="p-4 rounded-lg border border-border bg-card print:border-gray-300 print:break-inside-avoid"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Badge variant="outline" className="text-xs print:border-gray-400">
                        {ERROR_TYPE_LABELS[error.errorType]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(error.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-foreground mb-1">
                    {error.topic}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {error.trap}
                  </p>
                  
                  {error.reviewCount > 0 && (
                    <p className="text-xs text-primary mt-2">
                      Revisado {error.reviewCount}x
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8 pt-4 border-t border-border print:mt-4">
          <p>Elite Fiscal - Sistema de Estudos para Concursos</p>
          <p className="text-xs mt-1">Gerado automaticamente pelo sistema</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:break-inside-avoid-page { break-inside: avoid-page; }
        }
      `}</style>
    </div>
  );
};
