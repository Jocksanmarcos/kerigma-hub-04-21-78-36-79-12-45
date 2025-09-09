import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MembroFamilia {
  pessoa_id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  tipo_vinculo: 'atual' | 'pai' | 'mae' | 'filho' | 'irmao' | 'conjuge';
  is_current_person: boolean;
}

export const useFamiliaBidirecional = (pessoaId: string) => {
  return useQuery({
    queryKey: ['familia-bidirecional', pessoaId],
    queryFn: async () => {
      if (!pessoaId) {
        return { membros: [] };
      }

      const { data, error } = await supabase.rpc('get_complete_family', {
        p_pessoa_id: pessoaId
      });

      if (error) {
        console.error('Erro ao buscar família bidirecional:', error);
        throw error;
      }

      const membros = (data || []).map((membro: any) => ({
        ...membro,
        data_nascimento: membro.data_nascimento || null
      })) as MembroFamilia[];

      return {
        membros,
        pessoa_atual: membros.find(m => m.is_current_person),
        familiares: membros.filter(m => !m.is_current_person)
      };
    },
    enabled: !!pessoaId
  });
};