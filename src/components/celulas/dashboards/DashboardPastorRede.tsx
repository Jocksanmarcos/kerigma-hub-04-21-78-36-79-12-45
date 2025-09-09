import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricasRede {
  total_celulas: number;
  total_membros: number;
  total_lideres: number;
  total_supervisores: number;
  crescimento_membros: number;
  crescimento_celulas: number;
  presenca_media: number;
  visitantes_mes: number;
}

interface CelulaRede {
  id: string;
  nome: string;
  lider_nome: string;
  supervisor_nome?: string;
  status_saude: 'excelente' | 'boa' | 'atencao' | 'critica';
  membros: number;
  presenca_media: number;
  ultima_reuniao: string | null;
  multiplicacoes: number;
}

interface InsightRede {
  id: string;
  tipo_insight: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  metrica_principal?: any;
}

export const DashboardPastorRede: React.FC = () => {
  const [periodoAnalise, setPeriodoAnalise] = useState('3meses');
  const { pessoa } = useCurrentPerson();

  // Buscar métricas gerais da rede
  const { data: metricas, isLoading: loadingMetricas } = useQuery({
    queryKey: ['metricas-rede', pessoa?.id, periodoAnalise],
    queryFn: async () => {
      if (!pessoa?.id) return null;

      // Buscar células da rede
      const { data: celulas, error: errorCelulas } = await supabase
        .from('celulas')
        .select(`
          id,
          nome,
          lider:pessoas!lider_id(nome_completo),
          supervisor:pessoas!supervisor_id(nome_completo),
          membros:pessoas!celula_id(count),
          relatorios:relatorios_celulas!celula_id(
            data_reuniao,
            presentes,
            visitantes,
            created_at
          )
        `)
        .eq('pastor_rede_id', pessoa.id);

      if (errorCelulas) {
        console.error('Erro ao buscar células:', errorCelulas);
        return null;
      }

      // Calcular métricas
      const totalCelulas = celulas.length;
      const totalMembros = celulas.reduce((acc, c) => acc + (c.membros?.[0]?.count || 0), 0);
      
      // Lideres únicos
      const lideresUnicos = new Set(celulas.map(c => c.lider?.nome_completo).filter(Boolean));
      const supervisoresUnicos = new Set(celulas.map(c => c.supervisor?.nome_completo).filter(Boolean));

      // Calcular crescimento (comparar com período anterior)
      const dataInicio = startOfMonth(subMonths(new Date(), 3));
      const dataFim = endOfMonth(new Date());

      const { data: relatorioPeriodo } = await supabase
        .from('relatorios_celulas')
        .select('presentes, visitantes, data_reuniao')
        .gte('data_reuniao', dataInicio.toISOString())
        .lte('data_reuniao', dataFim.toISOString());

      const presencaMedia = relatorioPeriodo?.length ? 
        relatorioPeriodo.reduce((acc, r) => acc + r.presentes, 0) / relatorioPeriodo.length : 0;

      const visitantesMes = relatorioPeriodo?.reduce((acc, r) => acc + r.visitantes, 0) || 0;

      return {
        total_celulas: totalCelulas,
        total_membros: totalMembros,
        total_lideres: lideresUnicos.size,
        total_supervisores: supervisoresUnicos.size,
        crescimento_membros: 5.2, // Simulated - seria calculado com dados históricos
        crescimento_celulas: 2.1, // Simulated - seria calculado com dados históricos
        presenca_media: presencaMedia,
        visitantes_mes: visitantesMes
      } as MetricasRede;
    },
    enabled: !!pessoa?.id
  });

  // Buscar células com status de saúde
  const { data: celulasRede } = useQuery({
    queryKey: ['celulas-rede', pessoa?.id],
    queryFn: async () => {
      if (!pessoa?.id) return [];

      const { data, error } = await supabase
        .from('celulas')
        .select(`
          id,
          nome,
          lider:pessoas!lider_id(nome_completo),
          supervisor:pessoas!supervisor_id(nome_completo),
          membros:pessoas!celula_id(count),
          relatorios:relatorios_celulas!celula_id(
            data_reuniao,
            presentes,
            created_at
          )
        `)
        .eq('pastor_rede_id', pessoa.id);

      if (error) {
        console.error('Erro ao buscar células da rede:', error);
        return [];
      }

      return data.map(celula => {
        const ultimoRelatorio = celula.relatorios?.[0];
        const membrosTotal = celula.membros?.[0]?.count || 0;
        const presencaMedia = celula.relatorios?.length ? 
          celula.relatorios.reduce((acc, r) => acc + r.presentes, 0) / celula.relatorios.length : 0;

        let statusSaude: CelulaRede['status_saude'] = 'boa';
        if (!ultimoRelatorio) statusSaude = 'critica';
        else if (presencaMedia >= membrosTotal * 0.8) statusSaude = 'excelente';
        else if (presencaMedia >= membrosTotal * 0.6) statusSaude = 'boa';
        else statusSaude = 'atencao';

        return {
          id: celula.id,
          nome: celula.nome,
          lider_nome: celula.lider?.nome_completo || 'Sem líder',
          supervisor_nome: celula.supervisor?.nome_completo,
          status_saude: statusSaude,
          membros: membrosTotal,
          presenca_media: presencaMedia,
          ultima_reuniao: ultimoRelatorio?.data_reuniao,
          multiplicacoes: 0 // Simulated - seria calculado com dados históricos
        } as CelulaRede;
      });
    },
    enabled: !!pessoa?.id
  });

  // Buscar insights estratégicos
  const { data: insights } = useQuery({
    queryKey: ['insights-rede', pessoa?.id],
    queryFn: async () => {
      if (!pessoa?.id) return [];

      const { data, error } = await supabase
        .from('insights_celulas')
        .select('*')
        .eq('nivel_hierarquia', 'rede')
        .eq('entidade_id', pessoa.id)
        .eq('ativo', true)
        .order('prioridade', { ascending: false });

      if (error) {
        console.error('Erro ao buscar insights da rede:', error);
        return [];
      }

      return data.map(d => ({
        id: d.id,
        tipo_insight: d.tipo_insight,
        titulo: d.titulo,
        descricao: d.descricao,
        prioridade: d.prioridade as 'baixa' | 'media' | 'alta' | 'critica',
        metrica_principal: d.metrica_principal
      })) as InsightRede[];
    },
    enabled: !!pessoa?.id
  });

  const distribuicaoSaude = celulasRede ? {
    excelente: celulasRede.filter(c => c.status_saude === 'excelente').length,
    boa: celulasRede.filter(c => c.status_saude === 'boa').length,
    atencao: celulasRede.filter(c => c.status_saude === 'atencao').length,
    critica: celulasRede.filter(c => c.status_saude === 'critica').length
  } : { excelente: 0, boa: 0, atencao: 0, critica: 0 };

  if (loadingMetricas) {
    return <div className="p-6">Carregando analytics da rede...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Estratégico */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Analytics da Rede</h1>
          <p className="text-muted-foreground">Visão estratégica e insights de multiplicação</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodoAnalise} onValueChange={setPeriodoAnalise}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1mes">Último mês</SelectItem>
              <SelectItem value="3meses">3 meses</SelectItem>
              <SelectItem value="6meses">6 meses</SelectItem>
              <SelectItem value="1ano">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* KPIs Estratégicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Células</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.total_celulas || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              +{metricas?.crescimento_celulas || 0}% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.total_membros || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              +{metricas?.crescimento_membros || 0}% crescimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presença Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metricas?.presenca_media || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {metricas?.total_membros ? 
                Math.round((metricas.presenca_media / metricas.total_membros) * 100) : 0
              }% dos membros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.visitantes_mes || 0}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>
      </div>

      {/* Painel de Saúde da Rede */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Saúde da Rede
          </CardTitle>
          <CardDescription>Distribuição do status de saúde das células</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{distribuicaoSaude.excelente}</div>
              <p className="text-sm text-muted-foreground">Excelentes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{distribuicaoSaude.boa}</div>
              <p className="text-sm text-muted-foreground">Boas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{distribuicaoSaude.atencao}</div>
              <p className="text-sm text-muted-foreground">Precisam Atenção</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{distribuicaoSaude.critica}</div>
              <p className="text-sm text-muted-foreground">Críticas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo em Abas */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">
            Insights Estratégicos ({insights?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="celulas">
            Células ({celulasRede?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="lideranca">
            Liderança
          </TabsTrigger>
          <TabsTrigger value="multiplicacao">
            Multiplicação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights?.map(insight => (
              <Card key={insight.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{insight.titulo}</h3>
                        <Badge 
                          variant={
                            insight.prioridade === 'critica' ? 'destructive' :
                            insight.prioridade === 'alta' ? 'default' :
                            insight.prioridade === 'media' ? 'secondary' : 'outline'
                          }
                        >
                          {insight.prioridade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.descricao}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Gerando insights estratégicos...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="celulas" className="space-y-4">
          <div className="grid gap-4">
            {celulasRede?.map(celula => (
              <Card key={celula.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{celula.nome}</h3>
                        <Badge 
                          variant={
                            celula.status_saude === 'excelente' ? 'default' :
                            celula.status_saude === 'boa' ? 'secondary' :
                            celula.status_saude === 'atencao' ? 'outline' : 'destructive'
                          }
                        >
                          {celula.status_saude}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Líder</p>
                          <p className="text-muted-foreground">{celula.lider_nome}</p>
                        </div>
                        <div>
                          <p className="font-medium">Supervisor</p>
                          <p className="text-muted-foreground">{celula.supervisor_nome || 'Não definido'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Membros</p>
                          <p className="text-muted-foreground">{celula.membros}</p>
                        </div>
                        <div>
                          <p className="font-medium">Presença Média</p>
                          <p className="text-muted-foreground">{Math.round(celula.presenca_media)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lideranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desenvolvimento de Liderança</CardTitle>
              <CardDescription>Métricas e desenvolvimento da liderança da rede</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Líderes Ativos</h4>
                  <div className="text-2xl font-bold">{metricas?.total_lideres || 0}</div>
                  <p className="text-sm text-muted-foreground">Liderando células ativas</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Supervisores</h4>
                  <div className="text-2xl font-bold">{metricas?.total_supervisores || 0}</div>
                  <p className="text-sm text-muted-foreground">Em atividade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiplicacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estratégia de Multiplicação</CardTitle>
              <CardDescription>Análise e planejamento de multiplicação de células</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidade de multiplicação em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};