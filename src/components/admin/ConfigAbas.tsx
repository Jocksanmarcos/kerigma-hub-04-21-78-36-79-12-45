import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { GeralTab, PerfilTab, NotificacoesTab, SegurancaTab, AparenciaTab, SistemaTab } from '@/components/admin/config/SettingsTabs';
import { type ConfiguracoesState } from '@/hooks/useSystemConfigurations';

interface ConfigAbasProps {
  activeTab: string;
  configuracoes: ConfiguracoesState;
  setConfiguracoes: React.Dispatch<React.SetStateAction<ConfiguracoesState>>;
  saving: boolean;
  onSave: () => Promise<void>;
}

export const ConfigAbas: React.FC<ConfigAbasProps> = ({ 
  activeTab, 
  configuracoes, 
  setConfiguracoes, 
  saving, 
  onSave 
}) => {

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geral':
        return <GeralTab configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />;
      case 'perfil':
        return <PerfilTab configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />;
      case 'notificacoes':
        return <NotificacoesTab configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />;
      case 'seguranca':
        return <SegurancaTab configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />;
      case 'aparencia':
        return <AparenciaTab configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />;
      case 'sistema':
        return <SistemaTab configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />;
      default:
        return <GeralTab configuracoes={configuracoes} setConfiguracoes={setConfiguracoes} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderTabContent()}
      
      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};