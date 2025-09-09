import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buscarNotificacoesEscala, responderConvocacao, marcarNotificacaoComoLida } from '@/services/escalas-resposta';
import { toast } from 'sonner';

export function useNotificacoesEscala() {
  const queryClient = useQueryClient();

  // Buscar notificações pendentes
  const {
    data: notificacoes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notificacoes-escala'],
    queryFn: buscarNotificacoesEscala,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    refetchOnWindowFocus: true,
  });

  // Mutation para responder convocação
  const responderMutation = useMutation({
    mutationFn: responderConvocacao,
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(response.message);
        
        // Marcar notificação como lida se fornecida
        if (variables.notificacao_id) {
          marcarComoLidaMutation.mutate(variables.notificacao_id);
        }
        
        // Refetch notificações para atualizar a lista
        refetch();
      } else {
        toast.error(response.error || 'Erro ao processar resposta');
      }
    },
    onError: (error) => {
      console.error('Erro ao responder convocação:', error);
      toast.error('Erro ao processar resposta da convocação');
    },
  });

  // Mutation para marcar como lida
  const marcarComoLidaMutation = useMutation({
    mutationFn: marcarNotificacaoComoLida,
    onSuccess: () => {
      // Invalidar cache para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['notificacoes-escala'] });
    },
    onError: (error) => {
      console.error('Erro ao marcar notificação como lida:', error);
    },
  });

  // Função para aceitar convocação
  const aceitarConvocacao = (escala_membro_id: string, notificacao_id?: string) => {
    responderMutation.mutate({
      escala_membro_id,
      resposta: 'confirmado',
      notificacao_id,
    });
  };

  // Função para recusar convocação
  const recusarConvocacao = (escala_membro_id: string, notificacao_id?: string) => {
    responderMutation.mutate({
      escala_membro_id,
      resposta: 'recusado',
      notificacao_id,
    });
  };

  // Função para marcar notificação como lida
  const marcarComoLida = (notificacao_id: string) => {
    marcarComoLidaMutation.mutate(notificacao_id);
  };

  // Calcular total de notificações não lidas
  const totalNaoLidas = notificacoes.length;

  return {
    // Dados
    notificacoes,
    totalNaoLidas,
    
    // Estados
    isLoading,
    error,
    isRespondendo: responderMutation.isPending,
    
    // Ações
    aceitarConvocacao,
    recusarConvocacao,
    marcarComoLida,
    refetch,
  };
}