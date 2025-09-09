import { supabase } from "@/integrations/supabase/client";

export interface ResponderConvocacaoParams {
  escala_membro_id: string;
  resposta: 'confirmado' | 'recusado';
  notificacao_id?: string;
}

export interface ResponderConvocacaoResponse {
  success: boolean;
  message: string;
  data?: {
    escala_membro_id: string;
    status: string;
    evento: string;
    cargo: string;
  };
  error?: string;
  details?: string;
}

/**
 * Responde a uma convocação de escala (aceita ou recusa)
 */
export async function responderConvocacao(params: ResponderConvocacaoParams): Promise<ResponderConvocacaoResponse> {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    // Chamar a Edge Function
    const { data, error } = await supabase.functions.invoke('responder-convocacao', {
      body: params,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Erro ao chamar função responder-convocacao:', error);
      throw new Error(error.message || 'Erro ao processar resposta');
    }

    return data as ResponderConvocacaoResponse;
  } catch (error) {
    console.error('Erro em responderConvocacao:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Falha ao processar resposta da convocação'
    };
  }
}

/**
 * Busca notificações de escala pendentes para o usuário atual
 */
export async function buscarNotificacoesEscala() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('notificacoes_escala')
      .select(`
        id,
        escala_membro_id,
        tipo,
        titulo,
        mensagem,
        status,
        lida_em,
        created_at,
        escalas_membros!inner(
          id,
          status,
          membro_id,
          escalas_eventos!inner(nome_evento, data_evento),
          louvor_cargos!inner(nome_cargo)
        )
      `)
      .eq('escalas_membros.membro_id', user.id)
      .eq('status', 'enviada')
      .is('lida_em', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro em buscarNotificacoesEscala:', error);
    throw error;
  }
}

/**
 * Marca uma notificação como lida
 */
export async function marcarNotificacaoComoLida(notificacaoId: string) {
  try {
    const { error } = await supabase
      .from('notificacoes_escala')
      .update({ 
        status: 'lida',
        lida_em: new Date().toISOString()
      })
      .eq('id', notificacaoId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro em marcarNotificacaoComoLida:', error);
    throw error;
  }
}