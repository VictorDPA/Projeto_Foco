import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  AlertCircle,
  Settings,
  Menu,
  X,
  Scale,
  FileText,
  Shield,
  Zap,
  Calendar,
  CalendarDays,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarPomodoroTimer } from '@/components/timer/SidebarPomodoroTimer';

const navItems = [
  { icon: LayoutDashboard, label: 'Painel', path: '/', tooltip: 'Dashboard com suas métricas' },
  { icon: Calendar, label: 'Meu Dia', path: '/meu-dia', tooltip: 'Gerador inteligente de cronograma diário' },
  { icon: CalendarDays, label: 'Agenda Ciclo', path: '/agenda-ciclo', tooltip: 'Planejador semanal contínuo' },
  { icon: BookOpen, label: 'Ciclos', path: '/study-blocks', tooltip: 'Gerencie seus blocos de estudo' },
  { icon: AlertCircle, label: 'Caderno de Erros', path: '/error-log', tooltip: 'Revise erros com flashcards' },
  { icon: Scale, label: 'Lei Seca', path: '/law-mapping', tooltip: 'Mapeie artigos por incidência' },
  { icon: FileText, label: 'Materiais', path: '/materials', tooltip: 'Upload de PDFs e editais' },
  { icon: HelpCircle, label: 'Manual', path: '/manual', tooltip: 'Manual de instruções do sistema' },
  { icon: Settings, label: 'Configurações', path: '/settings', tooltip: 'Ajustes do sistema' },
];

export const AppSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <TooltipProvider>
      <>
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">Elite Fiscal</span>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border',
            'transform transition-transform duration-300 ease-in-out',
            'lg:transform-none',
            isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <div className="flex items-center gap-3 px-3 py-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">Elite Fiscal</h1>
                <p className="text-xs text-muted-foreground">Sistema de Estudos</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                          'hover:bg-sidebar-accent group',
                          isActive && 'bg-sidebar-accent text-primary'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'font-medium text-sm transition-colors',
                            isActive ? 'text-primary' : 'text-sidebar-foreground group-hover:text-foreground'
                          )}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-card border-border">
                      <p className="text-xs">{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            {/* Pomodoro Timer */}
            <div className="pt-4 border-t border-sidebar-border">
              <SidebarPomodoroTimer />
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-sidebar-border">
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent group transition-all duration-200 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium text-sm">Sair</span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-sidebar-border">
              <div className="px-3 py-3 rounded-lg bg-gradient-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <p className="text-xs text-primary font-medium">Siga o Plano</p>
                </div>
                <p className="text-xs text-muted-foreground">Foco e disciplina vencem a prova.</p>
              </div>
            </div>
          </div>
        </aside>
      </>
    </TooltipProvider>
  );
};
