import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useApproveReservation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reservaId, motivo }: { reservaId: string; motivo?: string }) => {
      // Call the edge function to handle the approval and email sending
      const { data, error } = await supabase.functions.invoke('biblioteca-notificacoes', {
        body: {
          reserva_id: reservaId,
          acao: 'aprovar',
          motivo_recusa: null
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biblioteca-reservas"] });
      queryClient.invalidateQueries({ queryKey: ["biblioteca-notification-stats"] });
      queryClient.invalidateQueries({ queryKey: ["biblioteca-recent-notifications"] });
      toast({
        title: "Reserva aprovada",
        description: "Email de aprovação enviado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aprovar reserva",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRejectReservation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reservaId, motivo }: { reservaId: string; motivo: string }) => {
      // Call the edge function to handle the rejection and email sending
      const { data, error } = await supabase.functions.invoke('biblioteca-notificacoes', {
        body: {
          reserva_id: reservaId,
          acao: 'recusar',
          motivo_recusa: motivo
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biblioteca-reservas"] });
      queryClient.invalidateQueries({ queryKey: ["biblioteca-notification-stats"] });
      queryClient.invalidateQueries({ queryKey: ["biblioteca-recent-notifications"] });
      toast({
        title: "Reserva recusada",
        description: "Email de recusa enviado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao recusar reserva",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};