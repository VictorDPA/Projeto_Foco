import { Moon, Sun, Bell, Trash2, Shield } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/hooks/useTheme';

const Settings = () => {
  const { settings, updateSetting } = useUserSettings();
  const { theme, toggleTheme } = useTheme();

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('elite_fiscal_data');
      localStorage.removeItem('elite_fiscal_errors');
      localStorage.removeItem('elite_fiscal_laws');
      localStorage.removeItem('elite_fiscal_pomodoro');
      localStorage.removeItem('elite_fiscal_streak');
      localStorage.removeItem('elite_fiscal_materials');
      localStorage.removeItem('elite_fiscal_settings');
      localStorage.removeItem('elite_fiscal_sidebar_pomodoro');
      window.location.reload();
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência no Elite Fiscal.</p>
        </div>

        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {/* Appearance */}
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">Aparência</h2>
                <p className="text-sm text-muted-foreground">Personalize o visual do app</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Modo Escuro ativo' : 'Modo Claro ativo'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="gap-2"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Ativar Claro
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Ativar Escuro
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div><p className="font-medium text-foreground">Animações</p><p className="text-sm text-muted-foreground">Efeitos visuais suaves</p></div>
                <Switch checked={settings.animations} onCheckedChange={(v) => updateSetting('animations', v)} />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">Notificações</h2>
                <p className="text-sm text-muted-foreground">Gerencie seus alertas</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div><p className="font-medium text-foreground">Lembretes de Estudo</p><p className="text-sm text-muted-foreground">Receba lembretes para estudar</p></div>
                <Switch checked={settings.studyReminders} onCheckedChange={(v) => updateSetting('studyReminders', v)} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div><p className="font-medium text-foreground">Alertas de Meta</p><p className="text-sm text-muted-foreground">Notifique quando atingir 80%</p></div>
                <Switch checked={settings.goalAlerts} onCheckedChange={(v) => updateSetting('goalAlerts', v)} />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">Dados</h2>
                <p className="text-sm text-muted-foreground">Gerencie seus dados locais</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-muted-foreground mb-4">Esta ação irá remover todos os seus dados de estudo. Não pode ser desfeita.</p>
              <Button variant="destructive" onClick={handleClearData} className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />Limpar Todos os Dados
              </Button>
            </div>
          </div>

          {/* About */}
          <div className="rounded-xl bg-gradient-card border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">Elite Fiscal</h2>
                <p className="text-sm text-muted-foreground">Versão 2.1.0</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Sistema de gestão de estudos focado em produtividade de elite. Desenvolvido para concurseiros que buscam resultados extraordinários.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
