import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CreditCard,
  Plus,
  Download,
  Eye,
  Filter,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { FormularioLancamento } from '@/components/financeiro/FormularioLancamento';
import { GestaoContribuicoes } from '@/components/financeiro/GestaoContribuicoes';
import { RelatoriosAvancados } from '@/components/financeiro/RelatoriosAvancados';
import { OrcamentoBuilder } from '@/components/financeiro/OrcamentoBuilder';
import { ConciliacaoBancariaTool } from '@/components/financeiro/ConciliacaoBancariaTool';
import { useToast } from '@/hooks/use-toast';

const FinanceiroPage: React.FC = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any>({});
  const [fluxoCaixaData, setFluxoCaixaData] = useState<any[]>([]);
  const [transacoesRecentes, setTransacoesRecentes] = useState<any[]>([]);
  const [campanhasAtivas, setCampanhasAtivas] = useState<any[]>([]);
  const [fundosContabeis, setFundosContabeis] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Central Financeira – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Central de Governança Financeira completa com inteligência visual");

    loadFinancialData();

    // Realtime: atualizar ao inserir/atualizar/deletar lançamentos
    const channel = supabase
      .channel('finance-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lancamentos_financeiros_v2' }, () => {
        loadFinancialData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas financeiras
      const { data: statsData } = await supabase.rpc('obter_estatisticas_financeiras');
      if (statsData && statsData.length > 0) {
        const stats = statsData[0];
        setKpiData({
          saldoConsolidado: stats.saldo_total || 0,
          entradasMes: stats.receitas_mes || 0,
          saidasMes: stats.despesas_mes || 0,
          saudeOrcamentaria: stats.receitas_mes && stats.despesas_mes 
            ? ((stats.receitas_mes - stats.despesas_mes) / stats.receitas_mes * 100) 
            : 0
        });
      }

      // Carregar transações recentes
      const { data: transacoes } = await supabase
        .from('lancamentos_financeiros_v2')
        .select(`
          *,
          categorias_financeiras(nome),
          contas_bancarias(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transacoes) {
        setTransacoesRecentes(transacoes);
      }

      // Carregar campanhas ativas
      const { data: campanhas } = await supabase
        .from('campanhas_financeiras')
        .select('*')
        .eq('ativa', true);

      if (campanhas) {
        const campanhasComProgresso = campanhas.map(campanha => ({
          ...campanha,
          progresso: campanha.meta_valor > 0 
            ? (campanha.valor_arrecadado / campanha.meta_valor * 100) 
            : 0
        }));
        setCampanhasAtivas(campanhasComProgresso);
      }

      // Carregar fundos contábeis
      const { data: fundos } = await supabase
        .from('fundos_contabeis')
        .select('*')
        .eq('ativo', true);

      if (fundos) {
        setFundosContabeis(fundos);
      }

      // Gerar dados de fluxo de caixa dos últimos 6 meses
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const fluxoData = await Promise.all(
        meses.map(async (mes, index) => {
          const mesAtual = new Date();
          mesAtual.setMonth(mesAtual.getMonth() - (5 - index));
          
          const { data: receitas } = await supabase
            .from('lancamentos_financeiros_v2')
            .select('valor')
            .eq('tipo', 'receita')
            .eq('status', 'confirmado')
            .gte('data_lancamento', `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-01`)
            .lt('data_lancamento', `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 2).padStart(2, '0')}-01`);

          const { data: despesas } = await supabase
            .from('lancamentos_financeiros_v2')
            .select('valor')
            .eq('tipo', 'despesa')
            .eq('status', 'confirmado')
            .gte('data_lancamento', `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-01`)
            .lt('data_lancamento', `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 2).padStart(2, '0')}-01`);

          const totalReceitas = receitas?.reduce((sum, r) => sum + r.valor, 0) || 0;
          const totalDespesas = despesas?.reduce((sum, d) => sum + d.valor, 0) || 0;

          return {
            mes,
            entradas: totalReceitas,
            saidas: totalDespesas,
            saldo: totalReceitas - totalDespesas
          };
        })
      );
      
      setFluxoCaixaData(fluxoData);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const KPICard = ({ title, value, trend, icon: Icon, color = "primary" }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? formatCurrency(value) : `${value}%`}
              </p>
              {trend && (
                <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
                  {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(trend)}%
                </Badge>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Central Financeira</h1>
            <p className="text-muted-foreground">Dashboard de Inteligência e Governança Financeira</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setActiveTab('dashboard')}>
              <Filter className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setActiveTab('contribuicoes')}>
              <DollarSign className="h-4 w-4" />
              Contribuições
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setActiveTab('relatorios')}>
              <Download className="h-4 w-4" />
              Relatórios
            </Button>
            <FormularioLancamento
              trigger={
                <Button className="gap-2 bg-gradient-to-r from-primary to-blue-600">
                  <Plus className="h-4 w-4" />
                  Novo Lançamento
                </Button>
              }
            />
          </div>
        </div>

        {/* Navigation Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* KPIs Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Saldo Consolidado"
                value={kpiData.saldoConsolidado || 0}
                icon={PiggyBank}
                color="primary"
              />
              <KPICard
                title="Entradas do Mês"
                value={kpiData.entradasMes || 0}
                icon={TrendingUp}
                color="emerald-600"
              />
              <KPICard
                title="Saídas do Mês"
                value={kpiData.saidasMes || 0}
                icon={TrendingDown}
                color="red-500"
              />
              <KPICard
                title="Saúde Orçamentária"
                value={kpiData.saudeOrcamentaria || 0}
                icon={Target}
                color="orange-500"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Fluxo de Caixa Chart - Spans 2 columns */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Fluxo de Caixa (Últimos 6 Meses)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fluxoCaixaData}>
                        <defs>
                          <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Area 
                          type="monotone" 
                          dataKey="entradas" 
                          stackId="1"
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="saidas" 
                          stackId="2"
                          stroke="#ef4444" 
                          fill="#ef4444" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Entradas vs Saídas Donut */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Entradas vs. Saídas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Entradas', value: kpiData.entradasMes || 0, fill: '#10b981' },
                            { name: 'Saídas', value: kpiData.saidasMes || 0, fill: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Entradas', value: kpiData.entradasMes || 0, fill: '#10b981' },
                            { name: 'Saídas', value: kpiData.saidasMes || 0, fill: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm">Entradas</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(kpiData.entradasMes || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Saídas</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(kpiData.saidasMes || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="transacoes" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="transacoes">Transações Recentes</TabsTrigger>
                <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
                <TabsTrigger value="fundos">Fundos</TabsTrigger>
                <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
                <TabsTrigger value="conciliacao">Conciliação</TabsTrigger>
              </TabsList>

              <TabsContent value="transacoes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transacoesRecentes.length > 0 ? (
                        transacoesRecentes.map((transacao) => (
                          <div key={transacao.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${transacao.tipo === 'receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {transacao.tipo === 'receita' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{transacao.descricao}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{transacao.categorias_financeiras?.nome || 'Categoria'}</span>
                                  <span>•</span>
                                  <span>{new Date(transacao.data_lancamento).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={transacao.status === 'confirmado' ? 'default' : 'secondary'}>
                                {transacao.status === 'confirmado' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                                {transacao.status}
                              </Badge>
                              <span className={`font-bold ${transacao.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(transacao.valor)}
                              </span>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma transação encontrada</p>
                          <p className="text-xs mt-2">Use o botão "Novo Lançamento" para adicionar transações</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campanhas" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {campanhasAtivas.length > 0 ? (
                    campanhasAtivas.map((campanha) => (
                      <Card key={campanha.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Arrecadado</span>
                                <span>{campanha.progresso?.toFixed(1) || 0}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${campanha.progresso || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Arrecadado:</span>
                                <span className="font-medium">{formatCurrency(campanha.valor_arrecadado || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Meta:</span>
                                <span className="font-medium">{formatCurrency(campanha.meta_valor || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Restante:</span>
                                <span className="font-medium text-orange-600">
                                  {formatCurrency((campanha.meta_valor || 0) - (campanha.valor_arrecadado || 0))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma campanha ativa encontrada</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="fundos" className="mt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {fundosContabeis.length > 0 ? (
                    fundosContabeis.map((fundo) => (
                      <Card key={fundo.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">{fundo.nome}</p>
                              <p className="text-2xl font-bold text-foreground">R$ 0,00</p>
                              <p className="text-xs text-muted-foreground mt-1">{fundo.descricao}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${fundo.cor}20` }}>
                              <PiggyBank className="h-6 w-6" style={{ color: fundo.cor }} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum fundo contábil encontrado</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="orcamento" className="mt-6">
                <OrcamentoBuilder />
              </TabsContent>

              <TabsContent value="conciliacao" className="mt-6">
                <ConciliacaoBancariaTool />
              </TabsContent>
            </Tabs>
          </>
        )}

        {activeTab === 'contribuicoes' && (
          <GestaoContribuicoes />
        )}

        {activeTab === 'relatorios' && (
          <RelatoriosAvancados />
        )}
      </div>
    </AppLayout>
  );
};

export default FinanceiroPage;