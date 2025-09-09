import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useImpersonation() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalSession, setOriginalSession] = useState<any>(null);
  const { toast } = useToast();

  const startImpersonation = async (targetUserId: string, userName: string) => {
    try {
      setIsImpersonating(true);
      
      // Salvar sessão atual
      const { data: currentSession } = await supabase.auth.getSession();
      setOriginalSession(currentSession.session);
      
      // Criar uma nova sessão para o usuário alvo
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { target_user_id: targetUserId }
      });
      
      if (error) {
        throw error;
      }

      if (data?.access_token) {
        // Definir a nova sessão
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });

        // Armazenar informação de impersonação no localStorage
        localStorage.setItem('impersonation_data', JSON.stringify({
          original_user_id: currentSession.session?.user?.id,
          target_user_id: targetUserId,
          target_user_name: userName,
          started_at: new Date().toISOString()
        }));

        toast({
          title: "Impersonação iniciada",
          description: `Agora você está assumindo a sessão de ${userName}`,
        });

        // Recarregar a página para aplicar a nova sessão
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Erro ao assumir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível assumir a sessão do usuário",
        variant: "destructive"
      });
      setIsImpersonating(false);
    }
  };

  const stopImpersonation = async () => {
    try {
      const impersonationData = localStorage.getItem('impersonation_data');
      if (!impersonationData) return;

      // Remover dados de impersonação
      localStorage.removeItem('impersonation_data');
      
      // Fazer logout da sessão atual
      await supabase.auth.signOut();
      
      toast({
        title: "Impersonação encerrada",
        description: "Voltando à sua sessão original",
      });

      // Redirecionar para login
      window.location.href = '/auth';
      
    } catch (error) {
      console.error('Erro ao encerrar impersonação:', error);
      toast({
        title: "Erro",
        description: "Erro ao encerrar impersonação",
        variant: "destructive"
      });
    }
  };

  const getImpersonationData = () => {
    const data = localStorage.getItem('impersonation_data');
    return data ? JSON.parse(data) : null;
  };

  const checkIsImpersonating = () => {
    return !!localStorage.getItem('impersonation_data');
  };

  const clearImpersonationData = () => {
    localStorage.removeItem('impersonation_data');
    setIsImpersonating(false);
  };

  return {
    isImpersonating,
    startImpersonation,
    stopImpersonation,
    getImpersonationData,
    checkIsImpersonating,
    clearImpersonationData
  };
}