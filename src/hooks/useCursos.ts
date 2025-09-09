import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Curso {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  nivel?: string;
  imagem_capa_url?: string;
  pontos_xp_recompensa: number;
  medalha_id_recompensa?: string;
  status: string;
  carga_horaria?: number;
  destaque: boolean;
  trilha_id?: string;
  ordem?: number;
  ativo: boolean;
}

export interface Aula {
  id: string;
  curso_id: string;
  titulo_aula: string;
  ordem: number;
  tipo_conteudo: 'video' | 'texto' | 'quiz';
  conteudo_principal?: string;
  material_extra_url?: string;
  duracao_minutos: number;
}

export interface ProgressoCurso {
  total_aulas: number;
  aulas_concluidas: number;
  percentual_progresso: number;
}

export interface InscricaoCurso {
  pessoa_id: string;
  curso_id: string;
  data_inscricao: string;
  origem_inscricao: string;
}

export const useCursos = () => {
  return useQuery({
    queryKey: ['cursos-publicados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('status', 'publicado')
        .eq('ativo', true)
        .order('destaque', { ascending: false })
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as Curso[];
    }
  });
};

export const useCurso = (id: string) => {
  return useQuery({
    queryKey: ['curso', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Curso;
    },
    enabled: !!id
  });
};

export const useAulasCurso = (cursoId: string) => {
  return useQuery({
    queryKey: ['aulas-curso', cursoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('curso_id', cursoId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as Aula[];
    },
    enabled: !!cursoId
  });
};

export const useProgressoCurso = (cursoId: string) => {
  return useQuery({
    queryKey: ['progresso-curso', cursoId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) return null;

      const { data } = await supabase
        .rpc('calcular_progresso_curso', {
          p_pessoa_id: pessoa.id,
          p_curso_id: cursoId
        });

      return data?.[0] as ProgressoCurso | null;
    },
    enabled: !!cursoId
  });
};

export const useInscricaoCurso = ({ showToast = false }: { showToast?: boolean } = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cursoId, origemInscricao = 'manual' }: { 
      cursoId: string; 
      origemInscricao?: string 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) throw new Error('Perfil de usuário não encontrado');

      const { data, error } = await supabase
        .from('inscricoes_cursos')
        .insert({
          pessoa_id: pessoa.id,
          curso_id: cursoId,
          origem_inscricao: origemInscricao
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (showToast) {
        toast({
          title: "Inscrição realizada!",
          description: "Você foi inscrito no curso com sucesso."
        });
      }
      queryClient.invalidateQueries({ queryKey: ['inscricoes-usuario'] });
      queryClient.invalidateQueries({ queryKey: ['progresso-curso'] });
    },
    onError: (error: any) => {
      if (showToast) {
        if (error.code === '23505') {
          toast({
            title: "Já inscrito",
            description: "Você já está inscrito neste curso.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro na inscrição",
            description: error.message || "Ocorreu um erro ao processar sua inscrição.",
            variant: "destructive"
          });
        }
      }
    }
  });
};

export const useConcluirAula = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      aulaId,
      cursoId,
      tempoAssistido = 0,
      pontuacaoQuiz
    }: {
      aulaId: string;
      cursoId: string;
      tempoAssistido?: number;
      pontuacaoQuiz?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) throw new Error('Perfil de usuário não encontrado');

      const response = await supabase.functions.invoke('processar-conclusao-aula', {
        body: {
          pessoa_id: pessoa.id,
          aula_id: aulaId,
          curso_id: cursoId,
          tempo_assistido: tempoAssistido,
          pontuacao_quiz: pontuacaoQuiz
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progresso-aula'] });
      queryClient.invalidateQueries({ queryKey: ['progresso-curso'] });
      queryClient.invalidateQueries({ queryKey: ['inscricao-curso'] });
      
      toast({
        title: "🎉 Aula Concluída!",
        description: `Você ganhou ${data.xp_ganho_aula} XP!`
      });

      if (data.curso_completo) {
        toast({
          title: "🏆 Curso Completo!",
          description: `Parabéns! Você ganhou ${data.recompensa_curso.xp_ganho} XP adicional!`,
          duration: 5000
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao concluir aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível concluir a aula. Tente novamente.",
        variant: "destructive"
      });
    }
  });
};