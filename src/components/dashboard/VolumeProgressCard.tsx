import { useState, useEffect } from 'react';
import { Layers, Target, CheckCircle, Edit2, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSupabaseStudyData } from '@/hooks/useSupabaseStudyData';

const VOLUME_STORAGE_KEY = 'elite_fiscal_volume_config';

interface VolumeConfig {
  totalMaterials: number;
  dailyGoal: number;
}

export const VolumeProgressCard = () => {
  const { subjects } = useSupabaseStudyData();
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState<VolumeConfig>(() => {
    const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { totalMaterials: 100, dailyGoal: 3 };
  });
  const [tempConfig, setTempConfig] = useState(config);

  // Count completed blocks
  const completedBlocks = subjects.reduce((count, subject) => {
    return count + subject.blocks.filter(block => block.status === 'completed').length;
  }, 0);

  const totalBlocks = subjects.reduce((count, subject) => {
    return count + subject.blocks.length;
  }, 0);

  const progressPercentage = config.totalMaterials > 0 
    ? Math.min(100, Math.round((completedBlocks / config.totalMaterials) * 100))
    : 0;

  const handleSave = () => {
    setConfig(tempConfig);
    localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(tempConfig));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsEditing(false);
  };

  return (
    <Card className="p-5 border-primary/20 bg-gradient-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Progresso do Edital</h3>
            <p className="text-xs text-muted-foreground">Volume de Materiais</p>
          </div>
        </div>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 text-success" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <span className="text-destructive text-sm">✕</span>
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Total de Materiais do Edital</label>
            <Input
              type="number"
              min={1}
              value={tempConfig.totalMaterials}
              onChange={(e) => setTempConfig(prev => ({ ...prev, totalMaterials: parseInt(e.target.value) || 1 }))}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Meta Diária (blocos)</label>
            <Input
              type="number"
              min={1}
              value={tempConfig.dailyGoal}
              onChange={(e) => setTempConfig(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) || 1 }))}
              className="h-9"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso Global</span>
              <span className="font-semibold text-foreground">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <p className="text-lg font-bold text-foreground">{completedBlocks}</p>
              <p className="text-[10px] text-muted-foreground">Concluídos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-foreground">{config.totalMaterials}</p>
              <p className="text-[10px] text-muted-foreground">Total Edital</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-warning" />
              </div>
              <p className="text-lg font-bold text-foreground">{config.dailyGoal}</p>
              <p className="text-[10px] text-muted-foreground">Meta/Dia</p>
            </div>
          </div>

          {/* Remaining */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Restam <span className="font-semibold text-foreground">{Math.max(0, config.totalMaterials - completedBlocks)}</span> materiais para completar o edital
            </p>
          </div>
        </>
      )}
    </Card>
  );
};