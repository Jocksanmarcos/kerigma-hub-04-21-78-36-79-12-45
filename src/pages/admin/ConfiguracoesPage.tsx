import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Shield, Palette, Database, Loader2 } from 'lucide-react';
import { ConfigAbas } from '@/components/admin/ConfigAbas';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';

const ConfiguracoesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('geral');
  const { configuracoes, setConfiguracoes, loading, saving, salvarConfiguracoes } = useSystemConfigurations();

  React.useEffect(() => {
    document.title = "Configurações – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Configurações do sistema e preferências");
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

  return (
    <AppLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema e suas preferências</p>
      </header>
      <div className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
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

          <div className="mt-6">
            <ConfigAbas 
              activeTab={activeTab} 
              configuracoes={configuracoes} 
              setConfiguracoes={setConfiguracoes}
              saving={saving}
              onSave={salvarConfiguracoes}
            />
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ConfiguracoesPage;