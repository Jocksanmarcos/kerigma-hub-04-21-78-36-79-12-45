import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface SaldoData {
  atual: number;
  projecao: number;
  pendentes: {
    receitas: number;
    despesas: number;
  };
  movimentacoes: any[];
}

const SaldoInteligente: React.FC<{ contaId?: string }> = ({ contaId }) => {
  const [dados, setDados] = useState<SaldoData>({
    atual: 0,
    projecao: 0,
    pendentes: { receitas: 0, despesas: 0 },
    movimentacoes: []
  });

  const calcularSaldos = async () => {
    try {
      // Buscar contas bancárias (ou uma específica)
      const contasQuery = supabase
        .from('contas_bancarias')
        .select('id, nome, saldo_atual')
        .eq('ativa', true);
      
      if (contaId) {
        contasQuery.eq('id', contaId);
      }
      
      const { data: contas } = await contasQuery;
      
      if (!contas?.length) return;
      
      const contaIds = contas.map(c => c.id);
      const saldoAtualTotal = contas.reduce((sum, c) => sum + Number(c.saldo_atual || 0), 0);

      // Buscar lançamentos pendentes
      const { data: lancamentosPendentes } = await supabase
        .from('lancamentos_financeiros_v2')
        .select('tipo, valor, data_lancamento, status, descricao, categoria_id, categorias_financeiras(nome)')
        .in('conta_id', contaIds)
        .eq('status', 'pendente')
        .order('data_lancamento', { ascending: true });

      // Calcular receitas e despesas pendentes
      const receitasPendentes = lancamentosPendentes
        ?.filter(l => l.tipo === 'receita')
        .reduce((sum, l) => sum + Number(l.valor), 0) || 0;
      
      const despesasPendentes = lancamentosPendentes
        ?.filter(l => l.tipo === 'despesa')
        .reduce((sum, l) => sum + Number(l.valor), 0) || 0;

      // Projeção = Saldo atual + receitas pendentes - despesas pendentes
      const projecao = saldoAtualTotal + receitasPendentes - despesasPendentes;

      setDados({
        atual: saldoAtualTotal,
        projecao,
        pendentes: {
          receitas: receitasPendentes,
          despesas: despesasPendentes
        },
        movimentacoes: lancamentosPendentes || []
      });

    } catch (error) {
      console.error('Erro ao calcular saldos:', error);
    }
  };

  useEffect(() => {
    calcularSaldos();
  }, [contaId]);

  const statusSaldo = useMemo(() => {
    if (dados.projecao < 0) return 'critico';
    if (dados.projecao < dados.atual * 0.3) return 'atencao';
    return 'bom';
  }, [dados]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dados.atual)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Projeção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {formatCurrency(dados.projecao)}
              </span>
              <Badge 
                variant={statusSaldo === 'critico' ? 'destructive' : statusSaldo === 'atencao' ? 'secondary' : 'default'}
                className="ml-2"
              >
                {statusSaldo === 'critico' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {statusSaldo === 'critico' ? 'Crítico' : statusSaldo === 'atencao' ? 'Atenção' : 'Bom'}
              </Badge>
            </div>
            {dados.projecao !== dados.atual && (
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {dados.projecao > dados.atual ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {dados.projecao > dados.atual ? '+' : ''}
                {formatCurrency(dados.projecao - dados.atual)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Receitas:</span>
                <span className="font-medium">{formatCurrency(dados.pendentes.receitas)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Despesas:</span>
                <span className="font-medium">{formatCurrency(dados.pendentes.despesas)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {dados.movimentacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Movimentações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dados.movimentacoes.map((mov, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{mov.descricao}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(mov.data_lancamento).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${mov.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {mov.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(mov.valor))}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Pendente
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SaldoInteligente;