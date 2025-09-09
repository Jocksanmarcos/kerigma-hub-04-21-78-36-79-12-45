import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { email, password }
      });
      
      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Senha redefinida!",
        description: data.message,
      });

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro ao redefinir senha",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Função específica para o usuário solicitado
  const resetJocksanPassword = () => {
    return resetPassword('jocksan.marcos@gmail.com', 'Luckas@2025');
  };

  return { resetPassword, resetJocksanPassword, isLoading };
}