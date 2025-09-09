import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Agendamento {
  id: string;
  solicitante_id: string;
  conselheiro_id: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  titulo: string;
  link_meet?: string;
  google_event_id?: string;
  status: 'solicitado' | 'agendado' | 'recusado' | 'cancelado' | 'realizado';
  created_at: string;
  updated_at: string;
  motivo_recusa?: string;
  observacoes?: string;
  solicitante?: {
    nome_completo: string;
    email: string;
  };
  conselheiro?: {
    nome_completo: string;
    email: string;
  };
}

export interface ConselheiroPessoa {
  id: string;
  user_id: string;
  nome_completo: string;
  email: string;
}

export function useAgendamentos() {
  const queryClient = useQueryClient();

  // Buscar agendamentos do usuário
  const {
    data: agendamentos,
    isLoading: agendamentosLoading,
    error: agendamentosError,
    refetch: refetchAgendamentos
  } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: async (): Promise<Agendamento[]> => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          solicitante:pessoas!solicitante_id(nome_completo, email),
          conselheiro:pessoas!conselheiro_id(nome_completo, email)
        `)
        .order('data_hora_inicio', { ascending: true });

      if (error) throw error;
      return data as any[];
    }
  });

  // Buscar pessoas que podem ser conselheiros (pastores, líderes)
  const {
    data: conselheiros,
    isLoading: conselheirosLoading
  } = useQuery({
    queryKey: ['conselheiros'],
    queryFn: async (): Promise<ConselheiroPessoa[]> => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, user_id, nome_completo, email')
        .eq('situacao', 'ativo')
        .in('tipo_pessoa', ['pastor', 'lider', 'membro'])
        .not('user_id', 'is', null)
        .order('nome_completo');

      if (error) throw error;
      return data as any[];
    }
  });

  // Buscar pessoas que podem solicitar aconselhamento
  const {
    data: membros,
    isLoading: membrosLoading
  } = useQuery({
    queryKey: ['membros'],
    queryFn: async (): Promise<ConselheiroPessoa[]> => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, user_id, nome_completo, email')
        .eq('situacao', 'ativo')
        .not('user_id', 'is', null)
        .order('nome_completo');

      if (error) throw error;
      return data as any[];
    }
  });

  // Solicitar agendamento
  const {
    mutateAsync: solicitarAgendamento,
    isPending: solicitandoAgendamento
  } = useMutation({
    mutationFn: async (dados: {
      conselheiro_id: string;
      data_hora_inicio: string;
      titulo: string;
      observacoes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('solicitar-agendamento', {
        body: dados
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast.success('Solicitação enviada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao solicitar agendamento:', error);
      toast.error(error.message || 'Erro ao solicitar agendamento');
    }
  });

  // Gerenciar agendamento (aprovar, recusar, cancelar, etc.)
  const {
    mutateAsync: gerenciarAgendamento,
    isPending: gerenciandoAgendamento
  } = useMutation({
    mutationFn: async (dados: {
      acao: 'aprovar' | 'recusar' | 'cancelar' | 'aprovar_direto';
      agendamento_id?: string;
      payload?: any;
      motivo_recusa?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('gerenciar-agendamento', {
        body: dados
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      
      const actionMessages = {
        aprovar: 'Agendamento aprovado com sucesso!',
        recusar: 'Agendamento recusado!',
        cancelar: 'Agendamento cancelado!',
        aprovar_direto: 'Agendamento criado e aprovado com sucesso!'
      };
      
      toast.success(actionMessages[variables.acao]);
    },
    onError: (error: any) => {
      console.error('Erro ao gerenciar agendamento:', error);
      toast.error(error.message || 'Erro ao gerenciar agendamento');
    }
  });

  // Get current user type
  const {
    data: currentUser,
    isLoading: currentUserLoading
  } = useQuery({
    queryKey: ['current-user-person'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('pessoas')
        .select('id, user_id, nome_completo, email, tipo_pessoa')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const isConselheiro = currentUser?.tipo_pessoa === 'pastor' || currentUser?.tipo_pessoa === 'lider';

  return {
    // Data
    agendamentos,
    conselheiros,
    membros,
    currentUser,
    isConselheiro,

    // Loading states
    agendamentosLoading,
    conselheirosLoading,
    membrosLoading,
    currentUserLoading,
    solicitandoAgendamento,
    gerenciandoAgendamento,

    // Errors
    agendamentosError,

    // Functions
    solicitarAgendamento,
    gerenciarAgendamento,
    refetchAgendamentos
  };
}