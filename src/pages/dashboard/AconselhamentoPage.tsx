import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AgendamentoModal } from '@/components/aconselhamento/AgendamentoModal';
import { AgendamentosList } from '@/components/aconselhamento/AgendamentosList';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AconselhamentoPage: React.FC = () => {
  const { agendamentos, isConselheiro, currentUser } = useAgendamentos();

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!agendamentos) return { total: 0, solicitados: 0, agendados: 0, realizados: 0 };

    const myAgendamentos = agendamentos.filter(ag => 
      ag.solicitante_id === currentUser?.user_id || ag.conselheiro_id === currentUser?.user_id
    );

    return {
      total: myAgendamentos.length,
      solicitados: myAgendamentos.filter(ag => ag.status === 'solicitado').length,
      agendados: myAgendamentos.filter(ag => ag.status === 'agendado').length,
      realizados: myAgendamentos.filter(ag => ag.status === 'realizado').length,
    };
  }, [agendamentos, currentUser]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aconselhamento Pastoral</h1>
            <p className="text-muted-foreground">
              {isConselheiro 
                ? 'Gerencie suas sessões de aconselhamento e solicitações'
                : 'Solicite e acompanhe seus agendamentos de aconselhamento'
              }
            </p>
          </div>
          <AgendamentoModal />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                agendamentos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitados</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.solicitados}</div>
              <p className="text-xs text-muted-foreground">
                aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.agendados}</div>
              <p className="text-xs text-muted-foreground">
                confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.realizados}</div>
              <p className="text-xs text-muted-foreground">
                concluídos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions for different user types */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {isConselheiro ? 'Como Conselheiro' : 'Como Solicitar Aconselhamento'}
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  {isConselheiro ? (
                    <>
                      <p>• <strong>Criar Agendamento:</strong> Use o botão "Novo Agendamento" para agendar diretamente para um membro</p>
                      <p>• <strong>Aprovar Solicitações:</strong> Revise e aprove/recuse solicitações pendentes</p>
                      <p>• <strong>Gerenciar Sessões:</strong> Use o link do Google Meet para realizar as sessões</p>
                    </>
                  ) : (
                    <>
                      <p>• <strong>Solicitar:</strong> Use o botão "Novo Agendamento" para solicitar uma sessão</p>
                      <p>• <strong>Aguardar:</strong> Sua solicitação será analisada pelo conselheiro</p>
                      <p>• <strong>Participar:</strong> Quando aprovada, use o link da reunião para participar</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isConselheiro ? 'Suas Sessões e Solicitações' : 'Seus Agendamentos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AgendamentosList />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AconselhamentoPage;