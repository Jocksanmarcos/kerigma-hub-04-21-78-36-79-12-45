import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSuperAdminBootstrap() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const bootstrapSuperAdmin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bootstrap-super-admin');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Super Admin configurado",
        description: "Acesso total habilitado com sucesso!",
      });

      // Refresh the page to reload permissions
      window.location.reload();
      
      return data;
    } catch (error) {
      console.error('Bootstrap error:', error);
      toast({
        title: "Erro no bootstrap",
        description: "Falha ao configurar super admin. Verifique o console.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { bootstrapSuperAdmin, isLoading };
}