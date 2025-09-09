import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EventoDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['eventos-dashboard'],
    queryFn: async () => {
      const now = new Date();
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const nextWeekEnd = addDays(thisWeekEnd, 7);

      // Eventos totais
      const { count: totalEventos } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true });

      // Eventos desta semana
      const { data: eventosEstaSemana } = await supabase
        .from('eventos')
        .select('*')
        .gte('data_inicio', thisWeekStart.toISOString())
        .lte('data_inicio', thisWeekEnd.toISOString());

      // Eventos próximos (próxima semana)
      const { data: eventosProximos } = await supabase
        .from('eventos')
        .select('*')
        .gte('data_inicio', thisWeekEnd.toISOString())
        .lte('data_inicio', nextWeekEnd.toISOString());

      // Inscrições totais
      const { count: totalInscricoes } = await supabase
        .from('evento_inscricoes')
        .select('*', { count: 'exact', head: true });

      // Check-ins realizados
      const { count: checkInsRealizados } = await supabase
        .from('evento_inscricoes')
        .select('*', { count: 'exact', head: true })
        .eq('check_in_status', true);

      // Receita total (pagamentos confirmados)
      const { data: pagamentosConfirmados } = await supabase
        .from('evento_inscricoes')
        .select('pagamento_valor')
        .eq('status_pagamento', 'Pago');

      const receitaTotal = pagamentosConfirmados?.reduce((total, inscricao) => 
        total + (inscricao.pagamento_valor || 0), 0) || 0;

      // Eventos com inscrições abertas
      const { count: eventosAbertos } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .eq('inscricoes_abertas', true)
        .gte('data_inicio', now.toISOString());

      // Taxa de check-in
      const taxaCheckIn = totalInscricoes > 0 ? Math.round((checkInsRealizados / totalInscricoes) * 100) : 0;

      return {
        totalEventos: totalEventos || 0,
        eventosEstaSemana: eventosEstaSemana?.length || 0,
        eventosProximos: eventosProximos?.length || 0,
        totalInscricoes: totalInscricoes || 0,
        checkInsRealizados: checkInsRealizados || 0,
        receitaTotal,
        eventosAbertos: eventosAbertos || 0,
        taxaCheckIn,
        eventosProximosDetalhes: eventosProximos?.slice(0, 3) || []
      };
    }
  });

  const { data: eventosRecentes } = useQuery({
    queryKey: ['eventos-recentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          evento_inscricoes!inner(count)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Count inscricoes for each evento
      const eventosWithCounts = await Promise.all(
        data.map(async (evento) => {
          const { count } = await supabase
            .from('evento_inscricoes')
            .select('*', { count: 'exact', head: true })
            .eq('evento_id', evento.id);

          return {
            ...evento,
            _count: { inscricoes: count || 0 }
          };
        })
      );

      return eventosWithCounts;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard de Eventos</h2>
        <p className="text-muted-foreground">Visão geral das atividades e estatísticas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Eventos"
          value={stats?.totalEventos || 0}
          icon={Calendar}
          variant="primary"
        />
        
        <StatsCard
          title="Inscrições Ativas"
          value={stats?.totalInscricoes || 0}
          description="Total de participantes"
          icon={Users}
          variant="default"
        />
        
        <StatsCard
          title="Receita Total"
          value={`R$ ${(stats?.receitaTotal || 0).toFixed(2)}`}
          icon={DollarSign}
          variant="secondary"
        />
        
        <StatsCard
          title="Taxa de Check-in"
          value={`${stats?.taxaCheckIn || 0}%`}
          description={`${stats?.checkInsRealizados || 0} de ${stats?.totalInscricoes || 0}`}
          icon={CheckCircle}
          variant="default"
        />
      </div>

      {/* Second row of stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Esta Semana"
          value={stats?.eventosEstaSemana || 0}
          description="Eventos programados"
          icon={Clock}
          variant="default"
        />
        
        <StatsCard
          title="Próxima Semana"
          value={stats?.eventosProximos || 0}
          description="Eventos futuros"
          icon={TrendingUp}
          variant="default"
        />
        
        <StatsCard
          title="Inscrições Abertas"
          value={stats?.eventosAbertos || 0}
          description="Eventos disponíveis"
          icon={UserCheck}
          variant="default"
        />
      </div>

      {/* Próximos eventos e Eventos recentes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Próximos eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.eventosProximosDetalhes && stats.eventosProximosDetalhes.length > 0 ? (
              <div className="space-y-4">
                {stats.eventosProximosDetalhes.map((evento: any) => (
                  <div key={evento.id} className="flex items-center gap-4 p-3 rounded-kerigma bg-muted/30">
                    <div className="flex-1">
                      <h4 className="font-semibold">{evento.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(evento.data_inicio), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">{evento.local}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{evento.tipo}</Badge>
                      {evento.inscricoes_abertas && (
                        <Badge variant="default" className="ml-2">Aberto</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento programado</p>
                <p className="text-sm">para a próxima semana</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eventos recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Eventos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventosRecentes && eventosRecentes.length > 0 ? (
              <div className="space-y-4">
                {eventosRecentes.map((evento: any) => (
                  <div key={evento.id} className="flex items-center gap-4 p-3 rounded-kerigma bg-muted/30">
                    <div className="flex-1">
                      <h4 className="font-semibold">{evento.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(evento.data_inicio), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">{evento.local}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{evento._count?.inscricoes || 0}</p>
                      <p className="text-sm text-muted-foreground">inscrições</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento encontrado</p>
                <p className="text-sm">Comece criando seu primeiro evento</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};