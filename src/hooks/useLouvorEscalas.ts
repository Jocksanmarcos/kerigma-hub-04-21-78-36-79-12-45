import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EscalaEvento {
  id: string;
  nome_evento: string;
  data_evento: string;
  local_evento?: string;
  setlist: string[]; // Array de IDs das músicas
  observacoes?: string;
  status: 'planejado' | 'confirmado' | 'concluido' | 'cancelado';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EscalaMembro {
  id: string;
  evento_id: string;
  membro_id: string;
  cargo_id: string;
  status: 'pendente' | 'confirmado' | 'recusado';
  observacoes?: string;
  data_resposta?: string;
  created_at: string;
  pessoas?: {
    nome_completo: string;
    email: string;
  };
  louvor_cargos?: {
    nome_cargo: string;
    cor: string;
  };
}

export interface IndisponibilidadeMembro {
  id: string;
  membro_id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  ativo: boolean;
  created_at: string;
}

export function useLouvorEscalas() {
  const queryClient = useQueryClient();

  // Buscar todos os eventos/escalas
  const {
    data: eventos,
    isLoading: loadingEventos,
    error: errorEventos
  } = useQuery({
    queryKey: ['louvor-eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escalas_eventos')
        .select('*')
        .order('data_evento', { ascending: true });

      if (error) throw error;
      return data as EscalaEvento[];
    }
  });

  // Buscar membros escalados para os eventos
  const {
    data: membrosEscalados,
    isLoading: loadingMembrosEscalados
  } = useQuery({
    queryKey: ['louvor-escalas-membros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escalas_membros')
        .select(`
          *,
          pessoas!inner(nome_completo, email),
          louvor_cargos!inner(nome_cargo, cor)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EscalaMembro[];
    }
  });

  // Buscar indisponibilidades
  const {
    data: indisponibilidades,
    isLoading: loadingIndisponibilidades
  } = useQuery({
    queryKey: ['louvor-indisponibilidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membros_indisponibilidade')
        .select(`
          *,
          pessoas!inner(nome_completo, email)
        `)
        .eq('ativo', true)
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      return data as IndisponibilidadeMembro[];
    }
  });

  // Criar novo evento
  const createEvento = useMutation({
    mutationFn: async (evento: Omit<EscalaEvento, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('escalas_eventos')
        .insert([evento])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-eventos'] });
      toast.success('Evento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento.');
    }
  });

  // Atualizar evento
  const updateEvento = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EscalaEvento> & { id: string }) => {
      const { data, error } = await supabase
        .from('escalas_eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-eventos'] });
      toast.success('Evento atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento.');
    }
  });

  // Escalar membro para evento
  const escalarMembro = useMutation({
    mutationFn: async (dados: {
      evento_id: string;
      membro_id: string;
      cargo_id: string;
      observacoes?: string;
    }) => {
      const { data, error } = await supabase
        .from('escalas_membros')
        .insert([dados])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-escalas-membros'] });
      toast.success('Membro escalado!');
    },
    onError: (error) => {
      console.error('Erro ao escalar membro:', error);
      toast.error('Erro ao escalar membro.');
    }
  });

  // Responder convite (para o próprio membro)
  const responderConvite = useMutation({
    mutationFn: async ({ 
      escalaId, 
      status, 
      observacoes 
    }: { 
      escalaId: string; 
      status: 'confirmado' | 'recusado';
      observacoes?: string;
    }) => {
      const { data, error } = await supabase
        .from('escalas_membros')
        .update({ 
          status, 
          observacoes,
          data_resposta: new Date().toISOString()
        })
        .eq('id', escalaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['louvor-escalas-membros'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-escalas'] });
      
      const mensagem = variables.status === 'confirmado' 
        ? 'Convite aceito!' 
        : 'Convite recusado.';
      toast.success(mensagem);
    },
    onError: (error) => {
      console.error('Erro ao responder convite:', error);
      toast.error('Erro ao responder convite.');
    }
  });

  // Criar indisponibilidade
  const createIndisponibilidade = useMutation({
    mutationFn: async (indisponibilidade: {
      membro_id: string;
      data_inicio: string;
      data_fim: string;
      motivo: string;
    }) => {
      const { data, error } = await supabase
        .from('membros_indisponibilidade')
        .insert([indisponibilidade])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-indisponibilidades'] });
      toast.success('Indisponibilidade registrada!');
    },
    onError: (error) => {
      console.error('Erro ao registrar indisponibilidade:', error);
      toast.error('Erro ao registrar indisponibilidade.');
    }
  });

  // Buscar escalas de um membro específico
  const getEscalasPorMembro = (membroId: string) => {
    return membrosEscalados?.filter(em => em.membro_id === membroId) || [];
  };

  // Buscar membros de um evento específico
  const getMembrosPorEvento = (eventoId: string) => {
    return membrosEscalados?.filter(em => em.evento_id === eventoId) || [];
  };

  return {
    // Data
    eventos,
    membrosEscalados,
    indisponibilidades,
    
    // Loading states
    loadingEventos,
    loadingMembrosEscalados,
    loadingIndisponibilidades,
    creatingEvento: createEvento.isPending,
    updatingEvento: updateEvento.isPending,
    escalandoMembro: escalarMembro.isPending,
    respondendoConvite: responderConvite.isPending,
    creatingIndisponibilidade: createIndisponibilidade.isPending,
    
    // Errors
    errorEventos,
    
    // Functions
    createEvento: createEvento.mutateAsync,
    updateEvento: updateEvento.mutateAsync,
    escalarMembro: escalarMembro.mutateAsync,
    responderConvite: responderConvite.mutateAsync,
    createIndisponibilidade: createIndisponibilidade.mutateAsync,
    getEscalasPorMembro,
    getMembrosPorEvento
  };
}