import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Church,
  Users,
  Mail,
  Bell,
  Shield,
  Database,
  Globe,
  Save,
  RefreshCw,
  UserPlus,
  FileText,
  Key
} from 'lucide-react';
import { MissoesLayout } from '@/components/missoes/MissoesLayout';
import { useChurchContext } from '@/contexts/ChurchContext';
import { useNewUserRole } from '@/hooks/useNewRole';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const MissoesConfiguracoes: React.FC = () => {
  const { isSuperAdmin } = useChurchContext();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();
  const [isSaving, setIsSaving] = useState(false);

  // Estados para as configurações
  const [configs, setConfigs] = useState({
    geral: {
      nome_rede: 'CBN Kerigma',
      sede_principal: 'Igreja Sede - São Luís/MA',
      telefone_contato: '(98) 99999-0000',
      email_contato: 'contato@cbnkerigma.com.br',
      site_oficial: 'https://cbnkerigma.com.br',
      timezone: 'America/Sao_Paulo'
    },
    missoes: {
      aprovacao_automatica: false,
      limite_membros_inicial: 50,
      meta_crescimento_anual: 20,
      periodo_relatorio: 'mensal',
      permite_submissoes: true,
      requer_aprovacao_eventos: true
    },
    notificacoes: {
      email_relatorios: true,
      email_novos_membros: true,
      email_eventos: true,
      sms_urgentes: false,
      notif_desktop: true,
      resumo_semanal: true
    },
    permissoes: {
      pastores_podem_criar_missoes: true,
      lideres_podem_editar_dados: false,
      membros_podem_ver_financeiro: false,
      acesso_publico_relatorios: false
    },
    integracao: {
      backup_automatico: true,
      sincronizacao_calendario: true,
      api_externa_ativa: false,
      webhook_eventos: false
    }
  });

  const hasAccess = isSuperAdmin || userRole === 'pastor';

  if (roleLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <MissoesLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-muted-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas super administradores e pastores podem acessar as configurações.
            </p>
          </div>
        </div>
      </MissoesLayout>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement real configuration saving to database
      // This would save to a missoes_configuracoes table
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (section: string, key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof configs],
        [key]: value
      }
    }));
  };

  return (
    <MissoesLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Configurações</h1>
            <p className="text-muted-foreground">
              Configurações gerais do sistema de missões
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Restaurar Padrões
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>

        {/* Painel de Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Church className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Missões Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">1</p>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">98%</p>
                  <p className="text-sm text-muted-foreground">Sincronização</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Segurança</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="geral" className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="geral" className="gap-2">
                  <Church className="h-4 w-4" />
                  Geral
                </TabsTrigger>
                <TabsTrigger value="missoes" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Missões
                </TabsTrigger>
                <TabsTrigger value="notificacoes" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="permissoes" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Permissões
                </TabsTrigger>
                <TabsTrigger value="integracao" className="gap-2">
                  <Database className="h-4 w-4" />
                  Integração
                </TabsTrigger>
              </TabsList>

              {/* Configurações Gerais */}
              <TabsContent value="geral" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_rede">Nome da Rede</Label>
                      <Input
                        id="nome_rede"
                        value={configs.geral.nome_rede}
                        onChange={(e) => updateConfig('geral', 'nome_rede', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sede_principal">Sede Principal</Label>
                      <Input
                        id="sede_principal"
                        value={configs.geral.sede_principal}
                        onChange={(e) => updateConfig('geral', 'sede_principal', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone_contato">Telefone de Contato</Label>
                      <Input
                        id="telefone_contato"
                        value={configs.geral.telefone_contato}
                        onChange={(e) => updateConfig('geral', 'telefone_contato', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email_contato">Email de Contato</Label>
                      <Input
                        id="email_contato"
                        type="email"
                        value={configs.geral.email_contato}
                        onChange={(e) => updateConfig('geral', 'email_contato', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_oficial">Site Oficial</Label>
                      <Input
                        id="site_oficial"
                        value={configs.geral.site_oficial}
                        onChange={(e) => updateConfig('geral', 'site_oficial', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select value={configs.geral.timezone} onValueChange={(value) => updateConfig('geral', 'timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                          <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                          <SelectItem value="America/Rio_Branco">Rio Branco (UTC-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Configurações de Missões */}
              <TabsContent value="missoes" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Aprovação Automática</Label>
                        <p className="text-sm text-muted-foreground">
                          Aprovar automaticamente novas missões
                        </p>
                      </div>
                      <Switch
                        checked={configs.missoes.aprovacao_automatica}
                        onCheckedChange={(checked) => updateConfig('missoes', 'aprovacao_automatica', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limite_membros">Limite Inicial de Membros</Label>
                      <Input
                        id="limite_membros"
                        type="number"
                        value={configs.missoes.limite_membros_inicial}
                        onChange={(e) => updateConfig('missoes', 'limite_membros_inicial', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_crescimento">Meta de Crescimento Anual (%)</Label>
                      <Input
                        id="meta_crescimento"
                        type="number"
                        value={configs.missoes.meta_crescimento_anual}
                        onChange={(e) => updateConfig('missoes', 'meta_crescimento_anual', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="periodo_relatorio">Período de Relatórios</Label>
                      <Select value={configs.missoes.periodo_relatorio} onValueChange={(value) => updateConfig('missoes', 'periodo_relatorio', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Submissões</Label>
                        <p className="text-sm text-muted-foreground">
                          Permitir submissão de relatórios
                        </p>
                      </div>
                      <Switch
                        checked={configs.missoes.permite_submissoes}
                        onCheckedChange={(checked) => updateConfig('missoes', 'permite_submissoes', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Aprovação de Eventos</Label>
                        <p className="text-sm text-muted-foreground">
                          Requer aprovação para eventos
                        </p>
                      </div>
                      <Switch
                        checked={configs.missoes.requer_aprovacao_eventos}
                        onCheckedChange={(checked) => updateConfig('missoes', 'requer_aprovacao_eventos', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Configurações de Notificações */}
              <TabsContent value="notificacoes" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notificações por Email</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Relatórios</Label>
                          <p className="text-sm text-muted-foreground">
                            Receber relatórios por email
                          </p>
                        </div>
                        <Switch
                          checked={configs.notificacoes.email_relatorios}
                          onCheckedChange={(checked) => updateConfig('notificacoes', 'email_relatorios', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Novos Membros</Label>
                          <p className="text-sm text-muted-foreground">
                            Notificar sobre novos membros
                          </p>
                        </div>
                        <Switch
                          checked={configs.notificacoes.email_novos_membros}
                          onCheckedChange={(checked) => updateConfig('notificacoes', 'email_novos_membros', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Eventos</Label>
                          <p className="text-sm text-muted-foreground">
                            Notificar sobre eventos
                          </p>
                        </div>
                        <Switch
                          checked={configs.notificacoes.email_eventos}
                          onCheckedChange={(checked) => updateConfig('notificacoes', 'email_eventos', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Outras Notificações</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS Urgentes</Label>
                          <p className="text-sm text-muted-foreground">
                            Receber SMS em emergências
                          </p>
                        </div>
                        <Switch
                          checked={configs.notificacoes.sms_urgentes}
                          onCheckedChange={(checked) => updateConfig('notificacoes', 'sms_urgentes', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações Desktop</Label>
                          <p className="text-sm text-muted-foreground">
                            Mostrar notificações no desktop
                          </p>
                        </div>
                        <Switch
                          checked={configs.notificacoes.notif_desktop}
                          onCheckedChange={(checked) => updateConfig('notificacoes', 'notif_desktop', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Resumo Semanal</Label>
                          <p className="text-sm text-muted-foreground">
                            Receber resumo semanal
                          </p>
                        </div>
                        <Switch
                          checked={configs.notificacoes.resumo_semanal}
                          onCheckedChange={(checked) => updateConfig('notificacoes', 'resumo_semanal', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Configurações de Permissões */}
              <TabsContent value="permissoes" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Permissões de Liderança</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Pastores Podem Criar Missões</Label>
                          <p className="text-sm text-muted-foreground">
                            Permitir pastores criarem novas missões
                          </p>
                        </div>
                        <Switch
                          checked={configs.permissoes.pastores_podem_criar_missoes}
                          onCheckedChange={(checked) => updateConfig('permissoes', 'pastores_podem_criar_missoes', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Líderes Podem Editar Dados</Label>
                          <p className="text-sm text-muted-foreground">
                            Permitir líderes editarem dados
                          </p>
                        </div>
                        <Switch
                          checked={configs.permissoes.lideres_podem_editar_dados}
                          onCheckedChange={(checked) => updateConfig('permissoes', 'lideres_podem_editar_dados', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Permissões Gerais</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Membros Veem Financeiro</Label>
                          <p className="text-sm text-muted-foreground">
                            Permitir membros verem dados financeiros
                          </p>
                        </div>
                        <Switch
                          checked={configs.permissoes.membros_podem_ver_financeiro}
                          onCheckedChange={(checked) => updateConfig('permissoes', 'membros_podem_ver_financeiro', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Relatórios Públicos</Label>
                          <p className="text-sm text-muted-foreground">
                            Acesso público aos relatórios
                          </p>
                        </div>
                        <Switch
                          checked={configs.permissoes.acesso_publico_relatorios}
                          onCheckedChange={(checked) => updateConfig('permissoes', 'acesso_publico_relatorios', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Configurações de Integração */}
              <TabsContent value="integracao" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sincronização e Backup</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Backup Automático</Label>
                          <p className="text-sm text-muted-foreground">
                            Realizar backup diário automático
                          </p>
                        </div>
                        <Switch
                          checked={configs.integracao.backup_automatico}
                          onCheckedChange={(checked) => updateConfig('integracao', 'backup_automatico', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sincronização de Calendário</Label>
                          <p className="text-sm text-muted-foreground">
                            Sincronizar com calendários externos
                          </p>
                        </div>
                        <Switch
                          checked={configs.integracao.sincronizacao_calendario}
                          onCheckedChange={(checked) => updateConfig('integracao', 'sincronizacao_calendario', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">APIs e Webhooks</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>API Externa Ativa</Label>
                          <p className="text-sm text-muted-foreground">
                            Permitir acesso via API externa
                          </p>
                        </div>
                        <Switch
                          checked={configs.integracao.api_externa_ativa}
                          onCheckedChange={(checked) => updateConfig('integracao', 'api_externa_ativa', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Webhook de Eventos</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar webhooks para eventos
                          </p>
                        </div>
                        <Switch
                          checked={configs.integracao.webhook_eventos}
                          onCheckedChange={(checked) => updateConfig('integracao', 'webhook_eventos', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Convitar Administradores</h3>
                  <p className="text-sm text-muted-foreground">Adicionar novos administradores</p>
                </div>
              </div>
              <Button className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Enviar Convite
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Logs do Sistema</h3>
                  <p className="text-sm text-muted-foreground">Ver logs de atividades</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Ver Logs
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Chaves API</h3>
                  <p className="text-sm text-muted-foreground">Gerenciar chaves de API</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Key className="h-4 w-4" />
                Gerenciar Chaves
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MissoesLayout>
  );
};

export default MissoesConfiguracoes;