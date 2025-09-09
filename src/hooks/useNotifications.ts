import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationLog {
  id: string;
  reserva_id: string;
  tipo_notificacao: string;
  email_destinatario: string;
  status_envio: string;
  motivo_recusa?: string;
  erro_detalhes?: string;
  metadata?: any;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  enviados: number;
  erros: number;
  porTipo: Record<string, number>;
}

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ["biblioteca-notification-stats"],
    queryFn: async (): Promise<NotificationStats> => {
      const { data, error } = await supabase
        .from("biblioteca_notificacoes_log")
        .select("tipo_notificacao, status_envio");

      if (error) throw error;

      const total = data.length;
      const enviados = data.filter(item => item.status_envio === 'enviado').length;
      const erros = data.filter(item => item.status_envio === 'erro').length;
      
      const porTipo = data.reduce((acc, item) => {
        acc[item.tipo_notificacao] = (acc[item.tipo_notificacao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        enviados,
        erros,
        porTipo
      };
    },
  });
};

export const useRecentNotifications = () => {
  return useQuery({
    queryKey: ["biblioteca-recent-notifications"],
    queryFn: async (): Promise<NotificationLog[]> => {
      const { data, error } = await supabase
        .from("biblioteca_notificacoes_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as NotificationLog[];
    },
  });
};