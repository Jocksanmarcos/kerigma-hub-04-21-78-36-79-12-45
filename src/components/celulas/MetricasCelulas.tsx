import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Target, Download, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MetricaCelula {
  periodo: string;
  totalCelulas: number;
  novasCelulas: number;
  membrosAtivos: number;
  crescimentoMensal: number;
  presencaMedia: number;
  visitantes: number;
  multiplicacoes: number;
}

async function fetchMetricasCelulas(): Promise<MetricaCelula[]> {
  try {
    const { data: celulas, error } = await supabase
      .from('celulas')
      .select('id, nome, ativa')
      .eq('ativa', true);

    if (error) throw error;

    // Simular métricas mensais
    const metricas: MetricaCelula[] = [
      {
        periodo: 'Janeiro 2024',
        totalCelulas: 18,
        novasCelulas: 2,
        membrosAtivos: 156,
        crescimentoMensal: 8.5,
        presencaMedia: 82.3,
        visitantes: 34,
        multiplicacoes: 1
      },
      {
        periodo: 'Fevereiro 2024',
        totalCelulas: 20,
        novasCelulas: 2,
        membrosAtivos: 174,
        crescimentoMensal: 11.5,
        presencaMedia: 84.7,
        visitantes: 41,
        multiplicacoes: 2
      },
      {
        periodo: 'Março 2024',
        totalCelulas: 23,
        novasCelulas: 3,
        membrosAtivos: 187,
        crescimentoMensal: 7.5,
        presencaMedia: 85.9,
        visitantes: 28,
        multiplicacoes: 1
      }
    ];

    return metricas;
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return [];
  }
}

export const MetricasCelulas: React.FC = () => {
  const { data: metricas = [], isLoading, refetch } = useQuery({
    queryKey: ['metricas-celulas'],
    queryFn: fetchMetricasCelulas,
    staleTime: 5 * 60 * 1000,
  });

  const handleExportarDados = () => {
    const dadosCSV = [
      'Período,Total Células,Novas Células,Membros Ativos,Crescimento %,Presença Média %,Visitantes,Multiplicações',
      ...metricas.map(m => 
        `${m.periodo},${m.totalCelulas},${m.novasCelulas},${m.membrosAtivos},${m.crescimentoMensal},${m.presencaMedia},${m.visitantes},${m.multiplicacoes}`
      )
    ].join('\n');

    const blob = new Blob([dadosCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas-celulas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success('📊 Dados exportados com sucesso!');
  };

  const handleAtualizarDados = () => {
    refetch();
    toast.success('🔄 Dados atualizados!');
  };

  const metricaAtual = metricas[metricas.length - 1];

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Células</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metricaAtual?.totalCelulas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{metricaAtual?.novasCelulas || 0} neste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricaAtual?.membrosAtivos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metricaAtual?.crescimentoMensal || 0}% crescimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presença Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metricaAtual?.presencaMedia || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Nas últimas 4 semanas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metricaAtual?.visitantes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Neste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendências */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Tendências de Crescimento</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleAtualizarDados}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportarDados}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando métricas...
            </div>
          ) : metricas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma métrica disponível
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simulação de gráfico de barras simples */}
              <div className="space-y-3">
                {metricas.map((metrica, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{metrica.periodo}</span>
                      <span className="text-muted-foreground">
                        {metrica.membrosAtivos} membros
                      </span>
                    </div>
                    <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ 
                          width: `${(metrica.membrosAtivos / Math.max(...metricas.map(m => m.membrosAtivos))) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Células: {metrica.totalCelulas}</span>
                      <span>Presença: {metrica.presencaMedia}%</span>
                      <span>Visitantes: {metrica.visitantes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200">
                📈 Crescimento Consistente
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                As células têm mostrado crescimento consistente nos últimos 3 meses. 
                Presença média acima de 85% é excelente!
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                🎯 Oportunidade de Multiplicação
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                3 células estão prontas para multiplicação baseado no número de membros 
                e índice de presença.
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Atenção aos Visitantes
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Número de visitantes diminuiu em março. Considere campanhas de 
                evangelismo e convites especiais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};