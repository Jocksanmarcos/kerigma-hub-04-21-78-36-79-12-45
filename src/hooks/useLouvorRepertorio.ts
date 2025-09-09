import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RepertorioMusica {
  id: string;
  titulo: string;
  artista?: string;
  tom?: string;
  bpm?: number;
  letra?: string;
  cifra?: string;
  link_referencia?: string;
  tags?: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export function useLouvorRepertorio() {
  const queryClient = useQueryClient();

  // Buscar todas as músicas do repertório
  const {
    data: repertorio,
    isLoading: loadingRepertorio,
    error: errorRepertorio
  } = useQuery({
    queryKey: ['louvor-repertorio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('louvor_repertorio')
        .select('*')
        .eq('ativo', true)
        .order('titulo');

      if (error) throw error;
      return data as RepertorioMusica[];
    }
  });

  // Criar nova música
  const createMusica = useMutation({
    mutationFn: async (musica: Omit<RepertorioMusica, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('louvor_repertorio')
        .insert([musica])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-repertorio'] });
      toast.success('Música adicionada ao repertório!');
    },
    onError: (error) => {
      console.error('Erro ao adicionar música:', error);
      toast.error('Erro ao adicionar música ao repertório.');
    }
  });

  // Atualizar música
  const updateMusica = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RepertorioMusica> & { id: string }) => {
      const { data, error } = await supabase
        .from('louvor_repertorio')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-repertorio'] });
      toast.success('Música atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar música:', error);
      toast.error('Erro ao atualizar música.');
    }
  });

  // Deletar música (marcar como inativa)
  const deleteMusica = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('louvor_repertorio')
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['louvor-repertorio'] });
      toast.success('Música removida do repertório!');
    },
    onError: (error) => {
      console.error('Erro ao remover música:', error);
      toast.error('Erro ao remover música.');
    }
  });

  // Buscar música por ID
  const getMusicaById = async (id: string): Promise<RepertorioMusica | null> => {
    const { data, error } = await supabase
      .from('louvor_repertorio')
      .select('*')
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error) {
      console.error('Erro ao buscar música:', error);
      return null;
    }
    return data as RepertorioMusica;
  };

  // Filtrar repertório
  const [filtroRepertorio, setFiltroRepertorio] = useState('');
  
  const repertorioFiltrado = repertorio?.filter(musica => 
    musica.titulo.toLowerCase().includes(filtroRepertorio.toLowerCase()) ||
    musica.artista?.toLowerCase().includes(filtroRepertorio.toLowerCase()) ||
    musica.tags?.some(tag => tag.toLowerCase().includes(filtroRepertorio.toLowerCase()))
  ) || [];

  return {
    // Data
    repertorio,
    repertorioFiltrado,
    
    // Loading states
    loadingRepertorio,
    creatingMusica: createMusica.isPending,
    updatingMusica: updateMusica.isPending,
    deletingMusica: deleteMusica.isPending,
    
    // Errors
    errorRepertorio,
    
    // Functions
    createMusica: createMusica.mutateAsync,
    updateMusica: updateMusica.mutateAsync,
    deleteMusica: deleteMusica.mutateAsync,
    getMusicaById,
    
    // Filters
    filtroRepertorio,
    setFiltroRepertorio
  };
}