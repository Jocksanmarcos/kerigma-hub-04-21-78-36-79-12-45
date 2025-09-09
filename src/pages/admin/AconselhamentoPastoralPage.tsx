import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PastoralInbox } from '@/components/aconselhamento/PastoralInbox';
import { SolicitacaoAconselhamentoForm } from '@/components/aconselhamento/SolicitacaoAconselhamentoForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  FileText, 
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Shield
} from 'lucide-react';

const AconselhamentoPastoralPage: React.FC = () => {
  const stats = {
    pendentes: 12,
    agendados: 8,
    concluidos: 156,
    emergenciais: 3
  };

  return (
    <AppLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Aconselhamento Pastoral</h1>
          <p className="text-muted-foreground">
            Central de atendimento e cuidado pastoral
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Sessão
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="font-semibold">Pendentes</p>
            <p className="text-2xl font-bold">{stats.pendentes}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="font-semibold">Agendados</p>
            <p className="text-2xl font-bold">{stats.agendados}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="font-semibold">Concluídos</p>
            <p className="text-2xl font-bold">{stats.concluidos}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="font-semibold">Emergenciais</p>
            <p className="text-2xl font-bold">{stats.emergenciais}</p>
            {stats.emergenciais > 0 && (
              <Badge variant="destructive" className="mt-1">Urgente</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Caixa de Entrada
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nova Solicitação
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-6">
          <PastoralInbox />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda de Atendimentos
              </CardTitle>
              <CardDescription>
                Gerencie seus horários de aconselhamento pastoral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">João Silva</p>
                        <Badge>Hoje 14:00</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Questões matrimoniais</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm">Iniciar</Button>
                        <Button size="sm" variant="outline">Reagendar</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Maria Santos</p>
                        <Badge variant="secondary">Amanhã 10:00</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Orientação vocacional</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Confirmar</Button>
                        <Button size="sm" variant="outline">Reagendar</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Button className="w-full">Ver Agenda Completa</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nova Solicitação de Aconselhamento
              </CardTitle>
              <CardDescription>
                Registre uma nova solicitação de atendimento pastoral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SolicitacaoAconselhamentoForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Questões Matrimoniais</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orientação Vocacional</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conflitos Familiares</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questões Financeiras</span>
                    <span className="font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">45min</p>
                  <p className="text-muted-foreground">Sessão média</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mais rápido:</span>
                    <span>20min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mais longo:</span>
                    <span>90min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Relatório Mensal</CardTitle>
              <CardDescription>
                Estatísticas de atendimento do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-muted-foreground">Atendimentos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">96%</p>
                  <p className="text-sm text-muted-foreground">Taxa de satisfação</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">2.3h</p>
                  <p className="text-sm text-muted-foreground">Tempo médio de resposta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade e Confidencialidade
              </CardTitle>
              <CardDescription>
                Configurações de segurança e privacidade dos atendimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Política de Privacidade</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      Todos os atendimentos pastorais são estritamente confidenciais e protegidos por:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Criptografia end-to-end de todas as conversas</li>
                      <li>Acesso restrito apenas ao pastor responsável</li>
                      <li>Backup seguro com retenção de 7 anos</li>
                      <li>Logs de auditoria para todas as ações</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Consentimentos Ativos</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gravação de sessões (quando aplicável)</span>
                      <Badge variant="secondary">156 pessoas</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compartilhamento com equipe pastoral</span>
                      <Badge variant="secondary">89 pessoas</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contato de acompanhamento</span>
                      <Badge variant="secondary">203 pessoas</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Ações de Segurança</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Auditoria de Acesso
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
};

export default AconselhamentoPastoralPage;