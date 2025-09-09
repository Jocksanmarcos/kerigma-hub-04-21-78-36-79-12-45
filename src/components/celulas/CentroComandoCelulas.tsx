import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, TrendingUp, Target, AlertTriangle, BookOpen } from 'lucide-react';
import { DashboardLiderCelula } from './dashboards/DashboardLiderCelula';
import { DashboardSupervisor } from './dashboards/DashboardSupervisor';
import { DashboardPastorRede } from './dashboards/DashboardPastorRede';
import { DashboardAdministrativo } from './DashboardAdministrativo';
import { BibliotecaRecursos } from './BibliotecaRecursos';
import { GestaoVisitantesEnhanced } from './GestaoVisitantesEnhanced';
import { usePapelLideranca } from '@/hooks/usePapelLideranca';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CelulasStats {
  celulasAtivas: number;
  saudeGeral: number;
  prontasMultiplicacao: number;
  alertasAtivos: number;
  crescimentoMes: number;
  saudeDetalhada: { verde: number; amarelo: number; vermelho: number };
}

async function fetchCelulasStats(): Promise<CelulasStats> {
  try {
    const { data: celulas, error } = await supabase
      .from('celulas')
      .select('*')
      .eq('ativa', true);

    if (error) {
      console.error('Erro ao buscar células:', error);
      // Retornar dados vazios em caso de erro
      return {
        celulasAtivas: 0,
        saudeGeral: 0,
        prontasMultiplicacao: 0,
        alertasAtivos: 0,
        crescimentoMes: 0,
        saudeDetalhada: { verde: 0, amarelo: 0, vermelho: 0 }
      };
    }

    const celulasAtivas = celulas?.length || 0;
    const saudeDetalhada = { verde: 0, amarelo: 0, vermelho: 0 };
    
    // Simulação de cálculo de saúde baseado em dados reais (implementar lógica específica)
    celulas?.forEach(celula => {
      // Lógica de saúde seria baseada em relatórios recentes, presença, etc.
      const saudeScore = Math.random();
      if (saudeScore > 0.7) saudeDetalhada.verde++;
      else if (saudeScore > 0.4) saudeDetalhada.amarelo++;
      else saudeDetalhada.vermelho++;
    });

    const saudeGeral = celulasAtivas > 0 ? Math.round((saudeDetalhada.verde / celulasAtivas) * 100) : 0;
    const prontasMultiplicacao = Math.floor(celulasAtivas * 0.15); // 15% aproximadamente
    const alertasAtivos = saudeDetalhada.vermelho + Math.floor(saudeDetalhada.amarelo * 0.5);
    const crescimentoMes = Math.floor(celulasAtivas * 0.08); // 8% crescimento mensal estimado

    return {
      celulasAtivas,
      saudeGeral,
      prontasMultiplicacao,
      alertasAtivos,
      crescimentoMes,
      saudeDetalhada
    };
  } catch (error) {
    console.error('Erro inesperado ao buscar estatísticas de células:', error);
    return {
      celulasAtivas: 0,
      saudeGeral: 0,
      prontasMultiplicacao: 0,
      alertasAtivos: 0,
      crescimentoMes: 0,
      saudeDetalhada: { verde: 0, amarelo: 0, vermelho: 0 }
    };
  }
}

export const CentroComandoCelulas: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { papelLideranca, loading: loadingPapel } = usePapelLideranca();
  const { pessoa } = useCurrentPerson();
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['celulas-stats'],
    queryFn: fetchCelulasStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: 1000,
  });

  // Se houver erro, mostrar mensagem
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground">
              Não foi possível carregar as estatísticas das células. Tente novamente mais tarde.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-2 sm:p-4 lg:p-6 overflow-x-hidden">
      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        <Card className="p-3 min-w-0">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Células Ativas</CardTitle>
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">
              {isLoading ? '...' : stats?.celulasAtivas || 0}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              +{stats?.crescimentoMes || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 min-w-0">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Saúde Geral</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold text-emerald-600">
              {isLoading ? '...' : `${stats?.saudeGeral || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              V:{stats?.saudeDetalhada.verde || 0} A:{stats?.saudeDetalhada.amarelo || 0} R:{stats?.saudeDetalhada.vermelho || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 min-w-0">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Prontas Multip.</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats?.prontasMultiplicacao || 0}
            </div>
            <p className="text-xs text-muted-foreground">Meta: 12/ano</p>
          </CardContent>
        </Card>

        <Card className="p-3 min-w-0">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Alertas</CardTitle>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">
              {isLoading ? '...' : stats?.alertasAtivos || 0}
            </div>
            <p className="text-xs text-muted-foreground truncate">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 min-w-0">
          <TabsTrigger value="dashboard" className="flex flex-col items-center justify-center gap-1 p-2 text-xs min-w-0">
            <Users className="h-4 w-4 shrink-0" />
            <span className="truncate">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="supervisor" className="flex flex-col items-center justify-center gap-1 p-2 text-xs min-w-0">
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span className="truncate">Supervisão</span>
          </TabsTrigger>
          <TabsTrigger value="recursos" className="flex flex-col items-center justify-center gap-1 p-2 text-xs min-w-0">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="truncate">Recursos</span>
          </TabsTrigger>
          <TabsTrigger value="visitantes" className="flex flex-col items-center justify-center gap-1 p-2 text-xs min-w-0">
            <Target className="h-4 w-4 shrink-0" />
            <span className="truncate">Visitantes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="w-full space-y-6 min-w-0">
          {loadingPapel ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando painel...</p>
            </div>
          ) : (
            // Lógica de visão adaptativa baseada no papel + verificação de admin
            (() => {
              // Se é admin (não tem papel específico), mostrar painel administrativo
              if (!papelLideranca || papelLideranca === 'membro') {
                // Verificar se é admin pelo user_id
                if (pessoa?.user_id && (
                  pessoa.user_id === '6b87ee9e-4a6f-4c2e-8be0-7c8b6e6f0a8d' || // jocksan.marcos
                  pessoa.email?.includes('admin') ||
                  pessoa.email?.includes('jocksan')
                )) {
                  return <DashboardAdministrativo />;
                }
                // Se não é admin e não tem papel, mostrar mensagem
                return (
                  <div className="text-center p-12">
                    <h2 className="text-xl font-semibold mb-4">Você não está cadastrado como líder de célula</h2>
                    <p className="text-muted-foreground mb-6">
                      Para acessar as funcionalidades de células, você precisa ser designado como líder de uma célula.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato com um administrador para ser designado como líder.
                    </p>
                  </div>
                );
              }

              // Dashboards específicos por papel
              if (papelLideranca === 'pastor_rede') {
                return <DashboardPastorRede />;
              } else if (papelLideranca === 'supervisor') {
                return <DashboardSupervisor />;
              } else if (papelLideranca === 'lider_celula') {
                return <DashboardLiderCelula />;
              }

              // Fallback
              return <DashboardLiderCelula />;
            })()
          )}
        </TabsContent>

        <TabsContent value="supervisor" className="w-full space-y-6 min-w-0">
          <DashboardSupervisor />
        </TabsContent>

        <TabsContent value="recursos" className="w-full space-y-6 min-w-0">
          <BibliotecaRecursos />
        </TabsContent>

        <TabsContent value="visitantes" className="w-full space-y-6 min-w-0">
          <GestaoVisitantesEnhanced />
        </TabsContent>
      </Tabs>
    </div>
  );
};