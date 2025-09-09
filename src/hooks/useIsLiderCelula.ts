import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIsLiderCelula = () => {
  return useQuery({
    queryKey: ["is-lider-celula"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_lider_celula');
      
      if (error) {
        console.error('Erro ao verificar se é líder de célula:', error);
        return false;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};