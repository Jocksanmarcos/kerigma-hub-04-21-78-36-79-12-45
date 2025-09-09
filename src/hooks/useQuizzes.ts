import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuizQuestion {
  id: string;
  reference_id: string;
  texto_pergunta: string;
  opcoes: any; // JSON field from database
  resposta_correta: string;
  criado_em: string;
  criado_por: string | null;
}

export interface QuizFormData {
  reference_id: string;
  texto_pergunta: string;
  opcoes: Array<{
    id: string;
    texto: string;
  }>;
  resposta_correta: string;
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('biblia_quiz_perguntas')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setQuizzes((data || []) as unknown as QuizQuestion[]);
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
      toast({
        title: 'Erro ao carregar quizzes',
        description: 'Não foi possível carregar as perguntas. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (formData: QuizFormData): Promise<boolean> => {
    try {
      setSaving(true);
      
      // Validar se a resposta correta corresponde a uma opção válida
      const opcaoValida = formData.opcoes.find(opcao => opcao.id === formData.resposta_correta);
      if (!opcaoValida) {
        throw new Error('A resposta correta deve corresponder a uma das opções disponíveis');
      }

      const { error } = await supabase
        .from('biblia_quiz_perguntas')
        .insert([{
          reference_id: formData.reference_id,
          texto_pergunta: formData.texto_pergunta,
          opcoes: formData.opcoes,
          resposta_correta: formData.resposta_correta,
        }]);

      if (error) throw error;

      toast({
        title: 'Quiz criado com sucesso!',
        description: 'A pergunta foi adicionada ao banco de dados.',
      });

      await loadQuizzes();
      return true;
    } catch (error) {
      console.error('Erro ao criar quiz:', error);
      toast({
        title: 'Erro ao criar quiz',
        description: error instanceof Error ? error.message : 'Não foi possível salvar a pergunta.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateQuiz = async (id: string, formData: QuizFormData): Promise<boolean> => {
    try {
      setSaving(true);
      
      // Validar se a resposta correta corresponde a uma opção válida
      const opcaoValida = formData.opcoes.find(opcao => opcao.id === formData.resposta_correta);
      if (!opcaoValida) {
        throw new Error('A resposta correta deve corresponder a uma das opções disponíveis');
      }

      const { error } = await supabase
        .from('biblia_quiz_perguntas')
        .update({
          reference_id: formData.reference_id,
          texto_pergunta: formData.texto_pergunta,
          opcoes: formData.opcoes,
          resposta_correta: formData.resposta_correta,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Quiz atualizado com sucesso!',
        description: 'As alterações foram salvas.',
      });

      await loadQuizzes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar quiz:', error);
      toast({
        title: 'Erro ao atualizar quiz',
        description: error instanceof Error ? error.message : 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (id: string): Promise<boolean> => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('biblia_quiz_perguntas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Quiz excluído com sucesso!',
        description: 'A pergunta foi removida do banco de dados.',
      });

      await loadQuizzes();
      return true;
    } catch (error) {
      console.error('Erro ao excluir quiz:', error);
      toast({
        title: 'Erro ao excluir quiz',
        description: 'Não foi possível excluir a pergunta. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  return {
    quizzes,
    loading,
    saving,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    refreshQuizzes: loadQuizzes,
  };
}