import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Target,
  Calendar,
  Building,
  ArrowUpDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardFinanceiroAvancadoProps {
  churches: any[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export const DashboardFinanceiroAvancado: React.FC<DashboardFinanceiroAvancadoProps> = ({ churches }) => {
  // Hook para dados financeiros consolidados com tendências
  const { data: financialTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['financial-trends', churches.map(c => c.id)],
    queryFn: async () => {
      try {
        // Buscar dados dos últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: lancamentos, error } = await supabase
          .from('lancamentos_financeiros_v2')
          .select('tipo, valor, data_lancamento')
          .eq('status', 'confirmado')
          .gte('data_lancamento', sixMonthsAgo.toISOString().split('T')[0]);

        if (error) throw error;

        // Agrupar por mês
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().slice(0, 7); // YYYY-MM

          const monthLancamentos = lancamentos?.filter(l => 
            l.data_lancamento.startsWith(monthKey)
          ) || [];

          const receitas = monthLancamentos
            .filter(l => l.tipo === 'receita')
            .reduce((sum, l) => sum + Number(l.valor), 0);

          const despesas = monthLancamentos
            .filter(l => l.tipo === 'despesa')
            .reduce((sum, l) => sum + Number(l.valor), 0);

          monthlyData.push({
            mes: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            receitas,
            despesas,
            saldo: receitas - despesas
          });
        }

        return monthlyData;
      } catch (error) {
        console.error('Error fetching financial trends:', error);
        return [];
      }
    },
    enabled: churches.length > 0,
  });

  // Hook para comparativo entre missões
  const { data: churchComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['church-comparison', churches.map(c => c.id)],
    queryFn: async () => {
      try {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const comparisonData = await Promise.all(
          churches.map(async (church) => {
            const { data: lancamentos, error } = await supabase
              .from('lancamentos_financeiros_v2')
              .select('tipo, valor')
              .eq('status', 'confirmado')
              .gte('data_lancamento', firstDay.toISOString().split('T')[0])
              .lte('data_lancamento', lastDay.toISOString().split('T')[0]);

            if (error) throw error;

            const receitas = lancamentos
              ?.filter(l => l.tipo === 'receita')
              .reduce((sum, l) => sum + Number(l.valor), 0) || 0;

            const despesas = lancamentos
              ?.filter(l => l.tipo === 'despesa')
              .reduce((sum, l) => sum + Number(l.valor), 0) || 0;

            return {
              name: church.name,
              type: church.type,
              receitas,
              despesas,
              saldo: receitas - despesas,
              eficiencia: receitas > 0 ? ((receitas - despesas) / receitas * 100) : 0
            };
          })
        );

        return comparisonData;
      } catch (error) {
        console.error('Error fetching church comparison:', error);
        return [];
      }
    },
    enabled: churches.length > 0,
  });

  // Hook para metas e orçamentos
  const { data: budgetGoals, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-goals', churches.map(c => c.id)],
    queryFn: async () => {
      // Por enquanto, dados simulados - depois conectar com tabela de orçamentos
      return churches.map(church => ({
        church_id: church.id,
        church_name: church.name,
        meta_receita: 50000,
        meta_despesa: 45000,
        receita_atual: Math.random() * 60000,
        despesa_atual: Math.random() * 50000,
        status: Math.random() > 0.7 ? 'alerta' : 'normal'
      }));
    },
    enabled: churches.length > 0,
  });

  if (trendsLoading || comparisonLoading || budgetLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalReceitas = financialTrends?.reduce((sum, month) => sum + month.receitas, 0) || 0;
  const totalDespesas = financialTrends?.reduce((sum, month) => sum + month.despesas, 0) || 0;
  const crescimentoReceitas = financialTrends?.length >= 2 ? 
    ((financialTrends[financialTrends.length - 1].receitas - financialTrends[financialTrends.length - 2].receitas) / 
     financialTrends[financialTrends.length - 2].receitas * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receitas (6m)</p>
                <p className="text-2xl font-bold text-success">
                  R$ {totalReceitas.toLocaleString('pt-BR')}
                </p>
                <p className={`text-xs ${crescimentoReceitas >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {crescimentoReceitas >= 0 ? '+' : ''}{crescimentoReceitas.toFixed(1)}% vs mês anterior
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas (6m)</p>
                <p className="text-2xl font-bold text-destructive">
                  R$ {totalDespesas.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((totalDespesas / totalReceitas) * 100).toFixed(1)}% das receitas
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Consolidado</p>
                <p className={`text-2xl font-bold ${(totalReceitas - totalDespesas) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {churches.length} unidades
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas de Orçamento</p>
                <p className="text-2xl font-bold text-orange-500">
                  {budgetGoals?.filter(goal => goal.status === 'alerta').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requerem atenção
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Tendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência Financeira (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-300 flex items-center justify-center text-muted-foreground">
              Gráfico de tendências será implementado em breve
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Comparativo Entre Unidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-300 flex items-center justify-center text-muted-foreground">
              Gráfico comparativo será implementado em breve
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas e Orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Acompanhamento de Metas Orçamentárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetGoals?.map((goal, index) => (
              <div key={goal.church_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{goal.church_name}</span>
                    <Badge variant={goal.status === 'alerta' ? 'destructive' : 'default'}>
                      {goal.status === 'alerta' ? 'Atenção' : 'Normal'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((goal.receita_atual / goal.meta_receita) * 100).toFixed(1)}% da meta
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Receitas</span>
                      <span>R$ {goal.receita_atual.toLocaleString('pt-BR')} / R$ {goal.meta_receita.toLocaleString('pt-BR')}</span>
                    </div>
                    <Progress 
                      value={(goal.receita_atual / goal.meta_receita) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Despesas</span>
                      <span>R$ {goal.despesa_atual.toLocaleString('pt-BR')} / R$ {goal.meta_despesa.toLocaleString('pt-BR')}</span>
                    </div>
                    <Progress 
                      value={(goal.despesa_atual / goal.meta_despesa) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Financeiras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Definir Metas Mensais
            </Button>
            <Button size="sm" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Configurar Alertas
            </Button>
            <Button size="sm" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Revisar Orçamentos
            </Button>
            <Button size="sm" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Relatório Detalhado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};