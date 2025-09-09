import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from './useCurrentPerson';

interface StudyStreakData {
  sequenciaAtual: number;
  melhorSequencia: number;
  diasEsteMes: number;
  atividadesEstaSemana: number;
  ultimosDias: boolean[];
  loading: boolean;
  error: string | null;
  registrarAtividade?: (tipoAtividade: string, cursoId?: string, licaoId?: string, duracaoMinutos?: number) => Promise<void>;
}

export const useStudyStreak = (): StudyStreakData => {
  const [streakData, setStreakData] = useState<StudyStreakData>({
    sequenciaAtual: 0,
    melhorSequencia: 0,
    diasEsteMes: 0,
    atividadesEstaSemana: 0,
    ultimosDias: [],
    loading: true,
    error: null
  });

  const { pessoa, loading: personLoading } = useCurrentPerson();

  const loadStreakData = async () => {
    if (personLoading || !pessoa) return;
    
    try {
      setStreakData(prev => ({ ...prev, loading: true, error: null }));

      // Buscar dados da sequência
      const { data: sequenciaData, error: sequenciaError } = await supabase
        .rpc('calcular_sequencia_estudos', { p_pessoa_id: pessoa.id });

      if (sequenciaError) throw sequenciaError;

      // Buscar atividades dos últimos 7 dias
      const hoje = new Date();
      const setediasAtras = new Date(hoje.getTime() - (6 * 24 * 60 * 60 * 1000));

      const { data: atividadesData, error: atividadesError } = await supabase
        .from('atividades_estudo')
        .select('data_atividade')
        .eq('pessoa_id', pessoa.id)
        .gte('data_atividade', setediasAtras.toISOString().split('T')[0])
        .lte('data_atividade', hoje.toISOString().split('T')[0]);

      if (atividadesError) throw atividadesError;

      // Processar últimos 7 dias
      const ultimosDias: boolean[] = [];
      for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje.getTime() - (i * 24 * 60 * 60 * 1000));
        const dataStr = data.toISOString().split('T')[0];
        const temAtividade = atividadesData?.some(ativ => ativ.data_atividade === dataStr) || false;
        ultimosDias.push(temAtividade);
      }

      const resultado = sequenciaData?.[0];
      setStreakData({
        sequenciaAtual: resultado?.sequencia_atual || 0,
        melhorSequencia: resultado?.melhor_sequencia || 0,
        diasEsteMes: resultado?.dias_este_mes || 0,
        atividadesEstaSemana: resultado?.atividades_esta_semana || 0,
        ultimosDias,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Erro ao carregar dados de sequência:', error);
      setStreakData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  const registrarAtividade = async (tipoAtividade: string, cursoId?: string, licaoId?: string, duracaoMinutos: number = 0) => {
    if (!pessoa) return;

    try {
      const { error } = await supabase
        .from('atividades_estudo')
        .insert({
          pessoa_id: pessoa.id,
          tipo_atividade: tipoAtividade,
          curso_id: cursoId,
          licao_id: licaoId,
          duracao_minutos: duracaoMinutos,
          data_atividade: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Recarregar dados após registrar atividade
      loadStreakData();
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  };

  useEffect(() => {
    loadStreakData();
  }, [pessoa, personLoading]);

  return {
    ...streakData,
    registrarAtividade
  };
};