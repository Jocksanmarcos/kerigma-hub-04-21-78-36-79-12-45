import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LouvorCargo {
  id: string;
  nome_cargo: string;
  descricao?: string;
  cor: string;
  ativo: boolean;
  created_at: string;
}

export interface MembroCargo {
  id: string;
  membro_id: string;
  cargo_id: string;
  nivel_habilidade: 'iniciante' | 'intermediario' | 'avancado';
  ativo: boolean;
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

export function useLouvorCargos() {
  const queryClient = useQueryClient();

  // Buscar todos os cargos
  const {
    data: cargos,
    isLoading: loadingCargos,
    error: errorCargos
  } = useQuery({
    queryKey: ['louvor-cargos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('louvor_cargos')
        .select('*')
        .eq('ativo', true)
        .order('nome_cargo');

      if (error) throw error;
      return data as LouvorCargo[];
    }
  });

  // Buscar membros e seus cargos
  const {
    data: membrosCargos,
    isLoading: loadingMembrosCargos
  } = useQuery({
    queryKey: ['louvor-membros-cargos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('louvor_membros_cargos')
        .select(`
          *,
          pessoas!inner(nome_completo, email, situacao),
          louvor_cargos!inner(nome_cargo, cor)
        `)
        .eq('ativo', true)
        .eq('pessoas.situacao', 'ativo');

      if (error) throw error;
      return data as MembroCargo[];
    }
  });

  // Criar novo cargo
  const createCargo = useMutation({
    mutationFn: async (cargo: Omit<LouvorCargo, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('louvor_cargos')
        .insert([cargo])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-cargos'] });
      toast.success('Cargo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar cargo:', error);
      toast.error('Erro ao criar cargo.');
    }
  });

  // Atualizar cargo
  const updateCargo = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LouvorCargo> & { id: string }) => {
      const { data, error } = await supabase
        .from('louvor_cargos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-cargos'] });
      toast.success('Cargo atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar cargo:', error);
      toast.error('Erro ao atualizar cargo.');
    }
  });

  // Associar membro a cargo
  const associarMembroCargo = useMutation({
    mutationFn: async (dados: {
      membro_id: string;
      cargo_id: string;
      nivel_habilidade: 'iniciante' | 'intermediario' | 'avancado';
    }) => {
      const { data, error } = await supabase
        .from('louvor_membros_cargos')
        .insert([dados])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-membros-cargos'] });
      toast.success('Membro associado ao cargo!');
    },
    onError: (error) => {
      console.error('Erro ao associar membro:', error);
      toast.error('Erro ao associar membro ao cargo.');
    }
  });

  // Remover associação membro-cargo
  const removerMembroCargo = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('louvor_membros_cargos')
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-membros-cargos'] });
      toast.success('Associação removida!');
    },
    onError: (error) => {
      console.error('Erro ao remover associação:', error);
      toast.error('Erro ao remover associação.');
    }
  });

  // Buscar membros disponíveis para um cargo específico
  const getMembrosDisponiveisPorCargo = (cargoId: string) => {
    return membrosCargos?.filter(mc => mc.cargo_id === cargoId && mc.ativo) || [];
  };

  // Buscar cargos de um membro específico
  const getCargosPorMembro = (membroId: string) => {
    return membrosCargos?.filter(mc => mc.membro_id === membroId && mc.ativo) || [];
  };

  return {
    // Data
    cargos,
    membrosCargos,
    
    // Loading states
    loadingCargos,
    loadingMembrosCargos,
    creatingCargo: createCargo.isPending,
    updatingCargo: updateCargo.isPending,
    associandoMembro: associarMembroCargo.isPending,
    removendoMembro: removerMembroCargo.isPending,
    
    // Errors
    errorCargos,
    
    // Functions
    createCargo: createCargo.mutateAsync,
    updateCargo: updateCargo.mutateAsync,
    associarMembroCargo: associarMembroCargo.mutateAsync,
    removerMembroCargo: removerMembroCargo.mutateAsync,
    getMembrosDisponiveisPorCargo,
    getCargosPorMembro
  };
}