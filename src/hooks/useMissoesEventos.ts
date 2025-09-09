import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MissaoEvento {
  id: string;
  nome: string;
  data_evento: string;
  data_fim?: string;
  descricao?: string;
  local?: string;
  church_id: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  tipo: string;
  publico: boolean;
  created_at: string;
  church?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

export const useMissoesEventos = () => {
  return useQuery({
    queryKey: ['missoes-eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          id,
          titulo,
          data_inicio,
          data_fim,
          descricao,
          endereco,
          igreja_id,
          tipo,
          publico,
          created_at,
          igrejas:igreja_id (
            id,
            nome,
            tipo
          )
        `)
        .order('data_inicio', { ascending: false });

      if (error) {
        console.error('Erro ao buscar eventos das missões:', error);
        throw error;
      }

      return data.map(evento => ({
        id: evento.id,
        nome: evento.titulo,
        data_evento: evento.data_inicio,
        data_fim: evento.data_fim,
        descricao: evento.descricao,
        local: evento.endereco,
        church_id: evento.igreja_id,
        status: 'planejado',
        tipo: evento.tipo || 'conferencia',
        publico: evento.publico,
        created_at: evento.created_at,
        church: evento.igrejas ? {
          id: evento.igrejas.id,
          nome: evento.igrejas.nome,
          tipo: evento.igrejas.tipo
        } : undefined
      })) as MissaoEvento[];
    },
  });
};

export const useCreateEvento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventoData: {
      nome: string;
      data_evento: string;
      data_fim?: string;
      descricao?: string;
      local?: string;
      church_id: string;
      tipo: string;
      publico?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('eventos')
        .insert({
          titulo: eventoData.nome,
          data_inicio: eventoData.data_evento,
          data_fim: eventoData.data_fim,
          descricao: eventoData.descricao,
          local: eventoData.local,
          igreja_id: eventoData.church_id,
          tipo: eventoData.tipo,
          publico: eventoData.publico || true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes-eventos'] });
      toast.success('Evento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento. Tente novamente.');
    },
  });
};

export const useUpdateEvento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updateData 
    }: { 
      id: string; 
      nome?: string;
      data_evento?: string;
      data_fim?: string;
      descricao?: string;
      local?: string;
      status?: string;
      tipo?: string;
      publico?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes-eventos'] });
      toast.success('Evento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento. Tente novamente.');
    },
  });
};

export const useDeleteEvento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos')
        .update({ publico: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes-eventos'] });
      toast.success('Evento cancelado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao cancelar evento:', error);
      toast.error('Erro ao cancelar evento. Tente novamente.');
    },
  });
};