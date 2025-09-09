import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MissionStats {
  membros_ativos: number;
  celulas_ativas: number;
  entradas_mes: number;
  eventos_mes: number;
}

export const useMissionStatsSimple = (churchId: string) => {
  return useQuery({
    queryKey: ['mission-stats', churchId],
    queryFn: async (): Promise<MissionStats> => {
      if (!churchId) {
        return {
          membros_ativos: 0,
          celulas_ativas: 0,
          entradas_mes: 0,
          eventos_mes: 0,
        };
      }

      try {
        // Buscar membros ativos da igreja/missão
        const { data: membrosData, error: membrosError } = await supabase
          .from('pessoas')
          .select('id')
          .eq('church_id', churchId)
          .eq('situacao', 'ativo');

        if (membrosError) throw membrosError;

        // Buscar células ativas (usando church_id se disponível)
        const { data: celulasData, error: celulasError } = await supabase
          .from('celulas')
          .select('id')
          .eq('status', 'ativa');

        if (celulasError) throw celulasError;

        // Buscar entradas financeiras do mês atual
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const { data: entradasData, error: entradasError } = await supabase
          .from('lancamentos_financeiros_v2')
          .select('valor')
          .eq('tipo', 'receita')
          .eq('status', 'confirmado')
          .gte('data_lancamento', firstDay.toISOString().split('T')[0])
          .lte('data_lancamento', lastDay.toISOString().split('T')[0]);

        if (entradasError) throw entradasError;

        // Buscar eventos do mês atual
        const { data: eventosData, error: eventosError } = await supabase
          .from('eventos')
          .select('id')
          .gte('data_evento', firstDay.toISOString().split('T')[0])
          .lte('data_evento', lastDay.toISOString().split('T')[0]);

        if (eventosError) throw eventosError;

        // Calcular total de entradas do mês
        const totalEntradas = entradasData?.reduce((sum, entrada) => sum + Number(entrada.valor), 0) || 0;

        return {
          membros_ativos: membrosData?.length || 0,
          celulas_ativas: celulasData?.length || 0,
          entradas_mes: totalEntradas,
          eventos_mes: eventosData?.length || 0,
        };
      } catch (error) {
        console.error('Error fetching mission stats:', error);
        return {
          membros_ativos: 0,
          celulas_ativas: 0,
          entradas_mes: 0,
          eventos_mes: 0,
        };
      }
    },
    enabled: !!churchId,
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });
};