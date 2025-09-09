import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ensinoAI } from '@/lib/ensinoAI';
import { useCurrentPerson } from './useCurrentPerson';

interface AIRecommendationsReturn {
  recommendations: string;
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => void;
  askQuestion: (question: string) => Promise<string>;
}

export const useAIRecommendations = (): AIRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pessoa, loading: personLoading } = useCurrentPerson();

  const loadRecommendations = async () => {
    if (personLoading || !pessoa) return;
    
    try {
      setLoading(true);
      setError(null);

      // Buscar dados necessários para recomendações
      const [cursosResponse, matriculasResponse] = await Promise.all([
        supabase.from('cursos').select('*').eq('ativo', true),
        supabase.from('matriculas').select('*, cursos(*)').eq('pessoa_id', pessoa.id)
      ]);

      if (cursosResponse.error) throw cursosResponse.error;
      if (matriculasResponse.error) throw matriculasResponse.error;

      // Gerar recomendações com IA
      const aiResponse = await ensinoAI({
        type: 'recommendations',
        cursos: cursosResponse.data,
        matriculas: matriculasResponse.data
      });

      setRecommendations(aiResponse);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (question: string): Promise<string> => {
    if (!pessoa) throw new Error('Usuário não encontrado');

    try {
      // Buscar dados atualizados
      const cursosResponse = await supabase.from('cursos').select('*').eq('ativo', true);

      if (cursosResponse.error) throw cursosResponse.error;

      // Fazer pergunta para IA
      const aiResponse = await ensinoAI({
        type: 'qna',
        question,
        cursos: cursosResponse.data
      });

      return aiResponse;
    } catch (error) {
      console.error('Erro ao fazer pergunta para IA:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [pessoa, personLoading]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations: loadRecommendations,
    askQuestion
  };
};