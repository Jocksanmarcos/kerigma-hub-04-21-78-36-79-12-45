import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SchedulingDashboard } from '@/components/scheduling/SchedulingDashboard';
import { IntelligentScheduler } from '@/components/scheduling/IntelligentScheduler';
import { AvailabilityManager } from '@/components/scheduling/AvailabilityManager';
import { VolunteerInvitations } from '@/components/scheduling/VolunteerInvitations';
import { ExportEscalaButton } from '@/components/scheduling/ExportEscalaButton';
import { PresencaManager } from '@/components/scheduling/PresencaManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, Brain, UserPlus, CheckCircle } from 'lucide-react';

const EscalasPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Escalas de Serviço</h1>
            <p className="text-muted-foreground">
              Gerencie escalas inteligentes e convide voluntários automaticamente
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Exportar PDF</Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Convite
            </Button>
          </div>
        </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="intelligent" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Scheduler
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Disponibilidade
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Convites
          </TabsTrigger>
          <TabsTrigger value="presence" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Presença
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SchedulingDashboard />
        </TabsContent>

        <TabsContent value="intelligent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Agendador Inteligente
              </CardTitle>
              <CardDescription>
                Use IA para criar escalas otimizadas baseadas em disponibilidade e histórico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <p className="text-muted-foreground">Sistema de IA para criar escalas otimizadas em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Disponibilidade</CardTitle>
              <CardDescription>
                Configure horários e períodos de disponibilidade dos voluntários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilityManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Convites</CardTitle>
              <CardDescription>
                Envie convites automáticos e acompanhe respostas dos voluntários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VolunteerInvitations />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Presença</CardTitle>
              <CardDescription>
                Registre presença e ausências nas escalas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <p className="text-muted-foreground">Sistema de controle de presença em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Participação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Análise detalhada da participação de voluntários
                </p>
                <Button className="w-full">Gerar Relatório</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Eficiência das Escalas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Métricas de eficiência e otimização das escalas
                </p>
                <Button className="w-full">Gerar Relatório</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Histórico completo de serviços por voluntário
                </p>
                <Button className="w-full">Gerar Relatório</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
};

export default EscalasPage;