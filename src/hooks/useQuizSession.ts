import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuizResult {
  acertos: number;
  total_perguntas: number;
  pontos_ganhos: number;
  novo_total_pontos: number;
  subiu_de_nivel: boolean;
  novo_nivel: string;
}

export function useQuizSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const submitQuiz = async (userAnswers: Record<string, string>) => {
    try {
      setIsLoading(true);

      // Converter respostas para o formato esperado pelo backend
      const respostas = Object.entries(userAnswers).map(([perguntaId, resposta]) => ({
        perguntaId,
        resposta
      }));

      if (respostas.length === 0) {
        throw new Error('Nenhuma resposta para enviar.');
      }

      // Chamar a edge function
      const { data: resultado, error } = await supabase.functions.invoke('processar-quiz', {
        body: respostas
      });

      if (error) {
        throw error;
      }

      // Salvar resultado e mostrar tela de resultados
      setQuizResult(resultado);
      setShowResults(true);

      // Mostrar toast de sucesso
      toast({
        title: 'Quiz concluído!',
        description: `Você ganhou ${resultado.pontos_ganhos} pontos de sabedoria!`,
      });

    } catch (error) {
      console.error('Erro ao processar o quiz:', error);
      toast({
        title: 'Erro ao processar quiz',
        description: 'Não foi possível enviar suas respostas. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizResult(null);
    setShowResults(false);
  };

  return {
    isLoading,
    quizResult,
    showResults,
    submitQuiz,
    resetQuiz,
  };
}