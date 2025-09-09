import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Team {
  id: string;
  nome_equipa: string;
  ministerio_id: string;
  descricao?: string;
  lider_id?: string;
  ativo: boolean;
}

export interface TeamFunction {
  id: string;
  equipa_id: string;
  nome_funcao: string;
  descricao?: string;
  nivel_experiencia: string;
  ativo: boolean;
  competencias_requeridas?: any;
  ordem?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  pessoa_id: string;
  funcao_id: string;
  nivel_competencia: 'iniciante' | 'intermediario' | 'avancado';
  disponibilidade_semanal: string[];
  ativo: boolean;
  pessoas: {
    nome_completo: string;
    email: string;
  };
  funcoes_equipa: {
    nome_funcao: string;
    equipa_id: string;
  };
}

export interface ScheduleInvitation {
  id: string;
  plano_id: string;
  pessoa_id: string;
  funcao_id?: string;
  funcao: string;
  status_confirmacao: string;
  data_convite?: string;
  data_resposta?: string;
  observacoes?: string;
  substituido_por?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  pessoas?: {
    nome_completo: string;
    email: string;
  } | null;
}

export interface VolunteerSuggestion {
  pessoa_id: string;
  nome: string;
  nivel_competencia: string;
  ultima_vez_serviu?: string;
  dias_desde_ultimo_servico: number;
  disponivel: boolean;
  pontuacao: number;
}

export function useScheduling() {
  const queryClient = useQueryClient();

  // Buscar equipes ministeriais
  const {
    data: teams,
    isLoading: teamsLoading,
    error: teamsError
  } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipas_ministeriais')
        .select(`
          id,
          nome_equipa,
          ministerio_id,
          descricao,
          lider_id,
          ativo,
          ministerios(nome)
        `)
        .eq('ativo', true)
        .order('nome_equipa');

      if (error) throw error;
      return data as any[];
    }
  });

  // Buscar funções por equipe
  const getTeamFunctions = async (teamId: string): Promise<TeamFunction[]> => {
    const { data, error } = await supabase
      .from('funcoes_equipa')
      .select('*')
      .eq('equipa_id', teamId)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

      if (error) throw error;
      return data as TeamFunction[];
  };

  // Buscar membros por função
  const getTeamMembers = async (functionId: string): Promise<TeamMember[]> => {
    const { data, error } = await supabase
      .from('membros_equipa')
      .select(`
        *,
        pessoas(nome_completo, email),
        funcoes_equipa(nome_funcao, equipa_id)
      `)
      .eq('funcao_id', functionId)
      .eq('ativo', true);

    if (error) throw error;
    return data as TeamMember[];
  };

  // Buscar sugestões de voluntários
  const {
    mutateAsync: getVolunteerSuggestions,
    isPending: suggestionsLoading
  } = useMutation({
    mutationFn: async ({ 
      functionId, 
      serviceDate, 
      limit = 5 
    }: { 
      functionId: string; 
      serviceDate: string;
      limit?: number;
    }): Promise<VolunteerSuggestion[]> => {
      const { data, error } = await supabase
        .rpc('get_volunteer_suggestions', {
          p_funcao_id: functionId,
          p_data_servico: serviceDate,
          p_limit: limit
        });

      if (error) throw error;
      return data;
    }
  });

  // Criar convites automáticos
  const {
    mutateAsync: createAutomaticInvitations,
    isPending: invitationsLoading
  } = useMutation({
    mutationFn: async ({
      planId,
      functionId,
      quantity = 1
    }: {
      planId: string;
      functionId: string;
      quantity?: number;
    }) => {
      const { data, error } = await supabase
        .rpc('create_automatic_invitations', {
          p_plano_id: planId,
          p_funcao_id: functionId,
          p_quantidade: quantity
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-invitations'] });
      toast.success('Convites enviados com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar convites:', error);
      toast.error('Erro ao enviar convites. Tente novamente.');
    }
  });

  // Buscar convites de uma escala
  const getScheduleInvitations = async (planId: string): Promise<ScheduleInvitation[]> => {
    const { data, error } = await supabase
      .from('escalas_servico')
      .select(`
        *,
        pessoas(nome_completo, email)
      `)
      .eq('plano_id', planId)
      .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
  };

  // Responder a convite
  const {
    mutateAsync: respondToInvitation,
    isPending: responseLoading
  } = useMutation({
    mutationFn: async ({
      invitationId,
      status,
      notes
    }: {
      invitationId: string;
      status: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .rpc('respond_to_invitation', {
          p_escala_id: invitationId,
          p_status: status as any,
          p_observacoes: notes
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      toast.success('Resposta registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao responder convite:', error);
      toast.error('Erro ao responder convite. Tente novamente.');
    }
  });

  // Enviar notificações pendentes
  const {
    mutateAsync: sendPendingNotifications,
    isPending: notificationsLoading
  } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-schedule-notifications', {
        body: { type: 'send_pending' }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Notificações enviadas: ${data.details.sent} enviadas, ${data.details.failed} falharam`);
    },
    onError: (error) => {
      console.error('Erro ao enviar notificações:', error);
      toast.error('Erro ao enviar notificações. Tente novamente.');
    }
  });

  // Buscar minhas escalas (para voluntários)
  const {
    data: myInvitations,
    isLoading: myInvitationsLoading
  } = useQuery({
    queryKey: ['my-invitations'],
    queryFn: async (): Promise<ScheduleInvitation[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('escalas_servico')
        .select(`
          *,
          pessoas(nome_completo, email)
        `)
        .eq('pessoa_id', user.id)
        .order('data_convite', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });

  return {
    // Data
    teams,
    myInvitations,

    // Loading states
    teamsLoading,
    suggestionsLoading,
    invitationsLoading,
    responseLoading,
    notificationsLoading,
    myInvitationsLoading,

    // Errors
    teamsError,

    // Functions
    getTeamFunctions,
    getTeamMembers,
    getVolunteerSuggestions,
    createAutomaticInvitations,
    getScheduleInvitations,
    respondToInvitation,
    sendPendingNotifications
  };
}