import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificacaoLog {
  id: string;
  reserva_id: string;
  tipo_notificacao: 'confirmacao' | 'aprovacao' | 'recusa' | 'lembrete_retirada' | 'lembrete_devolucao' | 'erro';
  email_destinatario: string;
  status_envio: 'pendente' | 'enviado' | 'erro' | 'bounce';
  data_envio: string;
  motivo_recusa?: string;
  erro_detalhes?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useBibliotecaNotificacoes = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const enviarNotificacaoAprovacao = async (reservaId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('biblioteca-notificacoes', {
        body: {
          reserva_id: reservaId,
          acao: 'aprovar'
        }
      });

      if (error) throw error;

      toast({
        title: 'Notificação enviada',
        description: 'Email de aprovação enviado com sucesso!'
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar notificação',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const enviarNotificacaoRecusa = async (reservaId: string, motivoRecusa?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('biblioteca-notificacoes', {
        body: {
          reserva_id: reservaId,
          acao: 'recusar',
          motivo_recusa: motivoRecusa
        }
      });

      if (error) throw error;

      toast({
        title: 'Notificação enviada',
        description: 'Email de recusa enviado com sucesso!'
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar notificação',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buscarHistoricoNotificacoes = async (reservaId: string): Promise<NotificacaoLog[]> => {
    try {
      const { data, error } = await supabase
        .from('biblioteca_notificacoes_log')
        .select('*')
        .eq('reserva_id', reservaId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as NotificacaoLog[];
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar histórico',
        description: error.message,
        variant: 'destructive'
      });
      return [];
    }
  };

  const buscarEstatisticasNotificacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('biblioteca_notificacoes_log')
        .select('tipo_notificacao, status_envio, created_at');

      if (error) throw error;

      const estatisticas = {
        total: data?.length || 0,
        enviados: data?.filter(n => n.status_envio === 'enviado').length || 0,
        erros: data?.filter(n => n.status_envio === 'erro').length || 0,
        porTipo: data?.reduce((acc, n) => {
          acc[n.tipo_notificacao] = (acc[n.tipo_notificacao] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };

      return estatisticas;
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar estatísticas',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    loading,
    enviarNotificacaoAprovacao,
    enviarNotificacaoRecusa,
    buscarHistoricoNotificacoes,
    buscarEstatisticasNotificacoes
  };
};