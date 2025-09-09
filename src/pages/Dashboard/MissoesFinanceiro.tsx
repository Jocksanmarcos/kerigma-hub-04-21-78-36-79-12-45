import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building, 
  Calendar,
  ArrowRight,
  Download,
  Filter,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useChurches } from '@/hooks/useChurches';
import { useChurchContext } from '@/contexts/ChurchContext';
import { useNewUserRole } from '@/hooks/useNewRole';
import { ResponsiveDashboardGrid } from '@/components/ui/responsive-dashboard-grid';
import { MissoesLayout } from '@/components/missoes/MissoesLayout';
import { DashboardFinanceiroAvancado } from '@/components/missoes/financeiro/DashboardFinanceiroAvancado';
import { SistemaAprovacaoGastos } from '@/components/missoes/financeiro/SistemaAprovacaoGastos';

// Hook consolidado para dados financeiros
const useConsolidatedFinancialData = (churches: any[]) => {
  return useQuery({
    queryKey: ['consolidated-financial', churches.map(c => c.id)],
    queryFn: async () => {
      try {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const { data: lancamentos, error } = await supabase
          .from('lancamentos_financeiros_v2')
          .select('tipo, valor, data_lancamento')
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

        return { receitas, despesas, saldo: receitas - despesas };
      } catch (error) {
        console.error('Error fetching consolidated financial data:', error);
        return { receitas: 0, despesas: 0, saldo: 0 };
      }
    },
    enabled: churches.length > 0,
    refetchInterval: 5 * 60 * 1000,
  });
};

import { FinancialCard } from '@/components/missoes/FinancialCard';
const MissoesFinanceiro: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: churches = [], isLoading } = useChurches();
  const { isSuperAdmin } = useChurchContext();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();

  // Permitir acesso a pastores, líderes e super admins
  const hasAccess = isSuperAdmin || userRole === 'pastor' || userRole === 'lider';

  if (roleLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-muted-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas pastores e líderes podem acessar os dados financeiros das missões.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Movimento Financeiro das Missões</h1>
            <p className="text-muted-foreground">
              Acompanhe as receitas, despesas e saldos de todas as missões
            </p>
          </div>
        </div>
        <ResponsiveDashboardGrid variant="pastor">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveDashboardGrid>
      </div>
    );
  }

  const sedeChurches = churches.filter(church => church.type === 'sede');
  const missaoChurches = churches.filter(church => church.type === 'missao');

  // Buscar dados consolidados
  const { data: consolidatedData, isLoading: consolidatedLoading } = useConsolidatedFinancialData(churches);
  
  const totalReceitas = consolidatedData?.receitas || 0;
  const totalDespesas = consolidatedData?.despesas || 0;

  const saldoTotal = totalReceitas - totalDespesas;

  return (
    <MissoesLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Movimento Financeiro das Missões</h1>
            <p className="text-muted-foreground">
              Acompanhe as receitas, despesas e saldos de todas as missões da rede CBN Kerigma
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Tabs para diferentes visões */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard Avançado
            </TabsTrigger>
            <TabsTrigger value="approval" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Aprovações
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Calendar className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Resumo Consolidado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <div>
                      <div className="text-2xl font-bold text-success">R$ {totalReceitas.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total de Receitas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    <div>
                      <div className="text-2xl font-bold text-destructive">R$ {totalDespesas.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total de Despesas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                        R$ {saldoTotal.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Saldo Consolidado</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-primary">{churches.length}</div>
                      <div className="text-sm text-muted-foreground">Total de Unidades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Igrejas Sede */}
            {sedeChurches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Building className="h-6 w-6" />
                  Movimento Financeiro - Igrejas Sede
                </h2>
                <ResponsiveDashboardGrid variant="pastor">
                  {sedeChurches.map((church) => (
                    <FinancialCard key={church.id} church={church} />
                  ))}
                </ResponsiveDashboardGrid>
              </div>
            )}

            {/* Missões */}
            {missaoChurches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Building className="h-6 w-6" />
                  Movimento Financeiro - Missões
                </h2>
                <ResponsiveDashboardGrid variant="pastor">
                  {missaoChurches.map((church) => (
                    <FinancialCard key={church.id} church={church} />
                  ))}
                </ResponsiveDashboardGrid>
              </div>
            )}

            {/* Empty state */}
            {churches.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-muted-foreground">Nenhuma igreja encontrada</h2>
                  <p className="text-muted-foreground">
                    Não há dados financeiros disponíveis para exibir.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced">
            <DashboardFinanceiroAvancado churches={churches} />
          </TabsContent>

          <TabsContent value="approval">
            <SistemaAprovacaoGastos churches={churches} />
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Relatórios em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Relatórios detalhados e exportação de dados estarão disponíveis em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MissoesLayout>
  );
};

export default MissoesFinanceiro;