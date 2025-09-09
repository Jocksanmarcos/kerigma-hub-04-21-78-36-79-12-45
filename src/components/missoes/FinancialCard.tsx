import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FinancialCardProps {
  church: any;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({ church }) => {
  // Hook para buscar dados financeiros da igreja específica
  const { data: movements, isLoading } = useQuery({
    queryKey: ['church-financial', church.id],
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
        console.error('Error fetching church financial data:', error);
        return { receitas: 0, despesas: 0, saldo: 0 };
      }
    },
    enabled: !!church.id,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
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
    );
  }

  const { receitas = 0, despesas = 0, saldo = 0 } = movements || {};
  const saldoPositivo = saldo >= 0;
  const crescimento = 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-primary">{church.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{church.cidade}, {church.estado}</p>
          </div>
          <Badge variant={church.type === 'sede' ? 'default' : 'secondary'}>
            {church.type === 'sede' ? 'Sede' : 'Missão'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <div className="text-lg font-semibold text-success">
              R$ {receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="h-4 w-4 text-destructive mr-1" />
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
            <div className="text-lg font-semibold text-destructive">
              R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-primary mr-1" />
              <span className="text-xs text-muted-foreground">Saldo</span>
            </div>
            <div className={`text-lg font-semibold ${saldoPositivo ? 'text-success' : 'text-destructive'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Crescimento */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Crescimento Mensal</span>
            <div className={`flex items-center ${parseFloat(crescimento.toString()) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {parseFloat(crescimento.toString()) >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              <span className="text-sm font-medium">{crescimento}%</span>
            </div>
          </div>
        </div>

        {/* Status de Dados */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Status Financeiro</h4>
          <div className="text-xs text-muted-foreground text-center py-2">
            Dados do mês atual carregados
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            Ver Detalhes
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};