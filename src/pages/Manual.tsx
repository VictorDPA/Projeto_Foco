import { BookOpen, Calendar, Lightbulb, AlertTriangle, Scale, Timer, Palette, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';

const manualSections = [
  {
    id: 'metodologia',
    icon: BookOpen,
    title: '🏆 Metodologia Elite Fiscal',
    subtitle: 'Semáforo de Acurácia e Priorização',
    content: [
      {
        heading: 'Semáforo de Acurácia',
        text: 'O sistema usa cores para indicar seu desempenho:\n• 🟢 Verde/Dourado (>80%): Avanço liberado para próximo bloco\n• 🟡 Azul/Amarelo (60-80%): Revisão por questões necessária\n• 🔴 Vermelho (<60%): Retorno à teoria recomendado',
      },
      {
        heading: 'Horas Líquidas vs Progresso do Edital',
        text: 'O contador de Horas Líquidas registra seu esforço real via Timer de Foco no formato HH:MM:SS. Mudar status de blocos NÃO altera esse contador. A barra de Progresso do Edital registra o volume de materiais com status "Concluído".',
      },
      {
        heading: 'Precisão de Tempo',
        text: 'O Elite Fiscal monitora seu tempo em horas, minutos e segundos (00:00:00) para um controle rigoroso do seu desempenho. Use o botão de reset no card para zerar o tempo de um bloco específico.',
      },
      {
        heading: 'Priorização por Peso',
        text: 'Matérias com Peso 3 (alto impacto no concurso) são priorizadas automaticamente. O Dashboard ordena sugestões pelo maior retorno em pontos.',
      },
      {
        heading: 'Maturidade por Disciplina',
        text: 'Cada matéria possui um nível (Iniciante/Intermediário/Avançado) que define a proporção ideal de estudo. A orientação aparece diretamente no card da matéria.',
      },
      {
        heading: 'Continuidade de Leitura',
        text: 'Use o campo "Página Atual" em cada bloco para nunca perder o fio da meada em PDFs longos. O progresso é salvo automaticamente ao sair do campo.',
      },
    ],
  },
  {
    id: 'timer',
    icon: Timer,
    title: '⏱️ Timer Manual de Foco',
    subtitle: 'Controle personalizado de tempo de estudo',
    content: [
      {
        heading: 'Tempo Personalizável',
        text: 'No menu lateral, você pode digitar manualmente o tempo de estudo e o tempo de pausa em minutos. Configure ciclos de 25/5, 50/10, 90/15 ou qualquer combinação que preferir.',
      },
      {
        heading: 'Registro de Tempo',
        text: 'Selecione a MATÉRIA e o BLOCO no Timer lateral antes de iniciar. O tempo será gravado exclusivamente no bloco correspondente, independentemente de você marcá-lo como "Concluído" ou não. Status e tempo são métricas independentes.',
      },
      {
        heading: 'Persistência',
        text: 'O timer não reseta ao navegar entre páginas. Você pode alternar entre "Meu Dia", "Materiais" e outras telas sem perder o progresso do ciclo.',
      },
    ],
  },
  {
    id: 'interface',
    icon: Settings,
    title: '🎯 Interface Simplificada',
    subtitle: 'Todas as ações em um só lugar',
    content: [
      {
        heading: 'Gestão de Status',
        text: 'Use o botão único de status para alternar o progresso da aula. Clique para abrir o menu e escolha entre "Não Iniciado", "Lendo PDF" ou "Concluído".',
      },
      {
        heading: 'Ícones de Ação',
        text: '🎯 Alvo = Foco | ⚙️ Engrenagem = Editar Links | 🗑️ Lixeira = Excluir. Cada função existe em apenas um lugar no card.',
      },
      {
        heading: 'Exclusão Segura',
        text: 'Ao clicar na lixeira, um alerta de confirmação aparece para evitar exclusões acidentais. A ação só ocorre após confirmação.',
      },
      {
        heading: 'Sidebar Limpa',
        text: 'A barra lateral contém apenas: Logotipo, Menu de Navegação e Timer de Foco. Sem redundâncias.',
      },
    ],
  },
  {
    id: 'ciclo',
    icon: Calendar,
    title: '🔄 Ciclo de Estudos Inteligente',
    subtitle: 'Rotação ponderada de matérias',
    content: [
      {
        heading: 'Rotação Completa',
        text: 'O sistema rotaciona matérias de todos os pesos. Matérias com Peso 3 e acurácia < 80% aparecem com maior frequência.',
      },
      {
        heading: 'Proporcionalidade',
        text: 'Matérias Peso 3 recebem sessões mais longas. Matérias Peso 1 e 2 são incluídas para cobertura completa do edital.',
      },
      {
        heading: 'Priorização Inteligente',
        text: 'Blocos com baixa acurácia são priorizados automaticamente, garantindo foco nos pontos fracos.',
      },
    ],
  },
  {
    id: 'divisao',
    icon: Scale,
    title: '📊 Divisão por Nível',
    subtitle: 'Proporção Teoria vs Prática personalizada',
    content: [
      {
        heading: 'Iniciante (70% Teoria / 30% Prática)',
        text: 'Foco em construir base teórica sólida antes de partir para questões.',
      },
      {
        heading: 'Intermediário (50% Teoria / 50% Prática)',
        text: 'Equilíbrio entre revisão teórica e resolução de questões.',
      },
      {
        heading: 'Avançado (20% Revisão / 80% Prática)',
        text: 'Foco intensivo em questões com revisão pontual.',
      },
    ],
  },
  {
    id: 'revisao',
    icon: AlertTriangle,
    title: '⚠️ Revisão e Caderno de Erros',
    subtitle: 'Flashcards e repetição espaçada',
    content: [
      {
        heading: 'Modo Flashcard',
        text: 'No Caderno de Erros, clique em "Flashcards" para revisão. A resposta fica oculta até você clicar.',
      },
      {
        heading: 'Classificação de Dificuldade',
        text: 'Após revelar, classifique como Fácil, Médio ou Difícil para ajustar o intervalo de revisão.',
      },
      {
        heading: 'Exportar Caderno',
        text: 'Clique em "Exportar" para gerar versão pronta para impressão, organizada por matéria.',
      },
    ],
  },
  {
    id: 'tema',
    icon: Palette,
    title: '🎨 Troca de Temas',
    subtitle: 'Modo Claro e Escuro',
    content: [
      {
        heading: 'Seletor de Tema',
        text: 'Acesse Configurações e clique no botão "Ativar Claro" ou "Ativar Escuro" para alternar entre os modos.',
      },
      {
        heading: 'Identidade Elite Fiscal',
        text: 'Ambos os temas mantêm os detalhes dourados característicos da metodologia Elite Fiscal.',
      },
    ],
  },
];

const Manual = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Manual de Instruções
          </h1>
          <p className="text-muted-foreground">
            Aprenda a usar todas as funcionalidades do Elite Fiscal
          </p>
        </div>

        {/* Accordion Sections */}
        <Card className="p-6 border-primary/20 animate-fade-in">
          <Accordion type="single" collapsible className="space-y-4">
            {manualSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-13">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-primary/30 pl-4">
                        <h4 className="font-medium text-foreground mb-1">
                          {item.heading}
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Quick Tips */}
        <Card className="p-6 mt-6 border-primary/20 bg-gradient-card animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Dicas Rápidas
          </h3>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use <strong>Ctrl+K</strong> para abrir a busca global em qualquer tela.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Clique no ícone <strong className="text-primary">dourado</strong> no card do bloco para abrir o TEC instantaneamente.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Configure o <strong>Timer Manual</strong> no menu lateral com tempos personalizados.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Revise seu <strong>Caderno de Erros</strong> pelo menos 2x por semana para fixação.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Alterne entre <strong>Tema Claro/Escuro</strong> em Configurações conforme o ambiente.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use o botão <strong>"X"</strong> na edição de links para limpar URLs rapidamente.</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Manual;
