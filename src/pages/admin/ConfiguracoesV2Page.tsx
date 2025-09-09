import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Shield, Palette, Database, Loader2, Save } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GeralTab, PerfilTab, NotificacoesTab, SegurancaTab, AparenciaTab, SistemaTab } from '@/components/admin/config/SettingsTabs';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';
import { Button } from '@/components/ui/button';

const ConfiguracoesV2Page = () => {
  const [activeTab, setActiveTab] = useState('geral');
  const { configuracoes, setConfiguracoes, loading, saving, salvarConfiguracoes } = useSystemConfigurations();

  React.useEffect(() => {
    document.title = "Configurações V2 – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Nova versão das configurações do sistema");
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando configurações...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

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
    <AppLayout>
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie todas as configurações e preferências do sistema
          </p>
        </div>
        
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="geral" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="seguranca" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="aparencia" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Aparência</span>
              </TabsTrigger>
              <TabsTrigger value="sistema" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Sistema</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6 space-y-6">
              <div className="w-full">
                {renderTabContent()}
              </div>
              
              {/* Botão de Salvar */}
              <div className="flex justify-end">
                <Button onClick={salvarConfiguracoes} disabled={saving} className="gap-2">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConfiguracoesV2Page;