import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface RelatorioDados {
  totalPatrimonios: number;
  valorTotalAquisicao: number;
  distribucaoPorStatus: Array<{ status: string; count: number }>;
  distribucaoPorCategoria: Array<{ categoria: string; count: number; valor: number }>;
  manutencoesPorMes: Array<{ mes: string; count: number; valor: number }>;
  reservasPorMes: Array<{ mes: string; count: number }>;
}

export const PatrimonioRelatorios: React.FC = () => {
  const [dados, setDados] = useState<RelatorioDados | null>(null);
  const [tipoRelatorio, setTipoRelatorio] = useState('geral');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar dados básicos do patrimônio
      const { data: patrimonios, error: patrimoniosError } = await supabase
        .from('patrimonios')
        .select(`
          *,
          categorias_patrimonio(nome)
        `);

      if (patrimoniosError) throw patrimoniosError;

      // Carregar manutenções
      const { data: manutencoes, error: manutencoesError } = await supabase
        .from('manutencoes_patrimonio')
        .select('*');

      if (manutencoesError) throw manutencoesError;

      // Carregar reservas
      const { data: reservas, error: reservasError } = await supabase
        .from('patrimonio_reservas')
        .select('*');

      if (reservasError) throw reservasError;

      // Processar dados
      const totalPatrimonios = patrimonios?.length || 0;
      const valorTotalAquisicao = patrimonios?.reduce((total, p) => total + (p.valor_total || 0), 0) || 0;

      // Distribuição por status
      const statusCount = patrimonios?.reduce((acc, p) => {
        const status = p.status || 'Não definido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const distribucaoPorStatus = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count
      }));

      // Distribuição por categoria
      const categoriaStats = patrimonios?.reduce((acc, p) => {
        const categoria = (p.categorias_patrimonio as any)?.nome || 'Sem categoria';
        if (!acc[categoria]) {
          acc[categoria] = { count: 0, valor: 0 };
        }
        acc[categoria].count += 1;
        acc[categoria].valor += p.valor_total || 0;
        return acc;
      }, {} as Record<string, { count: number; valor: number }>) || {};

      const distribucaoPorCategoria = Object.entries(categoriaStats).map(([categoria, stats]) => ({
        categoria,
        count: stats.count,
        valor: stats.valor
      }));

      // Manutenções por mês (últimos 12 meses)
      const manutencoesStats = manutencoes?.reduce((acc, m) => {
        const data = new Date(m.data_manutencao || m.created_at);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[mesAno]) {
          acc[mesAno] = { count: 0, valor: 0 };
        }
        acc[mesAno].count += 1;
        acc[mesAno].valor += m.valor_gasto || 0;
        return acc;
      }, {} as Record<string, { count: number; valor: number }>) || {};

      const manutencoesPorMes = Object.entries(manutencoesStats)
        .sort()
        .slice(-12)
        .map(([mes, stats]) => ({
          mes,
          count: stats.count,
          valor: stats.valor
        }));

      // Reservas por mês (últimos 12 meses)
      const reservasStats = reservas?.reduce((acc, r) => {
        const data = new Date(r.inicio);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        acc[mesAno] = (acc[mesAno] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const reservasPorMes = Object.entries(reservasStats)
        .sort()
        .slice(-12)
        .map(([mes, count]) => ({
          mes,
          count
        }));

      setDados({
        totalPatrimonios,
        valorTotalAquisicao,
        distribucaoPorStatus,
        distribucaoPorCategoria,
        manutencoesPorMes,
        reservasPorMes
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados dos relatórios.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async (formato: 'pdf' | 'xlsx') => {
    if (!dados) return;

    try {
      // Aqui você implementaria a lógica de exportação
      // Por enquanto, simularemos com um toast
      toast({
        title: 'Exportação Iniciada',
        description: `Relatório será exportado em formato ${formato.toUpperCase()}. Esta funcionalidade está em desenvolvimento.`
      });

      // Em uma implementação real, você usaria bibliotecas como:
      // - jsPDF para PDF
      // - xlsx para Excel
      // - Ou um endpoint da API para gerar os relatórios

    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar o relatório.',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMonth = (mesAno: string) => {
    const [ano, mes] = mesAno.split('-');
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Não foi possível carregar os dados</p>
          <Button onClick={carregarDados} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Patrimônio</h2>
          <p className="text-muted-foreground">Análises e estatísticas dos ativos da igreja</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportarRelatorio('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => exportarRelatorio('xlsx')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Relatório Geral</SelectItem>
                  <SelectItem value="manutencoes">Manutenções</SelectItem>
                  <SelectItem value="reservas">Reservas</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={carregarDados}>
                Atualizar Dados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Patrimônios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.totalPatrimonios}</div>
            <p className="text-xs text-muted-foreground">Itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dados.valorTotalAquisicao)}</div>
            <p className="text-xs text-muted-foreground">Valor de aquisição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Manutenções (12m)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dados.manutencoesPorMes.reduce((total, m) => total + m.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reservas (12m)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dados.reservasPorMes.reduce((total, r) => total + r.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Solicitadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dados.distribucaoPorStatus.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{item.status}</span>
                  <span className="text-sm text-muted-foreground">{item.count} itens</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Valor por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dados.distribucaoPorCategoria.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">{item.categoria}</span>
                    <p className="text-xs text-muted-foreground">{item.count} itens</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(item.valor)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manutenções por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Manutenções por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dados.manutencoesPorMes.slice(-6).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{formatMonth(item.mes)}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{item.count} manutenções</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(item.valor)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reservas por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Reservas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dados.reservasPorMes.slice(-6).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{formatMonth(item.mes)}</span>
                  <span className="text-sm font-semibold">{item.count} reservas</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};