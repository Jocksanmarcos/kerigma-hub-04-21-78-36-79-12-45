import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from './useCurrentPerson';

interface AlunoStats {
  nivel: string;
  xp: number;
  next_level_xp: number;
  badge_atual: string;
}

export const useAlunoStats = () => {
  const [stats, setStats] = useState<AlunoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    const loadStats = async () => {
      if (!pessoa) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar stats do aluno
        let { data: alunoStats, error } = await supabase
          .from('aluno_stats')
          .select('nivel, xp, next_level_xp, badge_atual')
          .eq('pessoa_id', pessoa.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Se não existe, criar com valores padrão
        if (!alunoStats) {
          const { data: newStats, error: createError } = await supabase
            .from('aluno_stats')
            .insert({
              pessoa_id: pessoa.id,
              nivel: 'Aprendiz',
              xp: 0,
              next_level_xp: 2000,
              badge_atual: 'Estudante Dedicado'
            })
            .select('nivel, xp, next_level_xp, badge_atual')
            .single();

          if (createError) {
            console.error('Erro ao criar stats:', createError);
            // Usar valores padrão se não conseguir criar
            alunoStats = {
              nivel: 'Aprendiz',
              xp: 0,
              next_level_xp: 2000,
              badge_atual: 'Estudante Dedicado'
            };
          } else {
            alunoStats = newStats;
          }
        }

        setStats(alunoStats);
      } catch (error) {
        console.error('Erro ao carregar stats do aluno:', error);
        // Usar valores padrão em caso de erro
        setStats({
          nivel: 'Aprendiz',  
          xp: 0,
          next_level_xp: 2000,
          badge_atual: 'Estudante Dedicado'
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [pessoa]);

  return { stats, loading };
};