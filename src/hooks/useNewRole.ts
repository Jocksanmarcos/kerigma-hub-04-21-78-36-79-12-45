import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'pastor' | 'lider' | 'membro';

export function useNewUserRole() {
  const [data, setData] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        const userResponse = await supabase.auth.getUser();
        const user = userResponse.data?.user;
        
        if (!user) {
          if (mounted) {
            setData(null);
            setIsLoading(false);
          }
          return;
        }
        
        // Usar a nova função que combina user_roles e papel_lideranca
        const { data: combinedRole, error } = await supabase
          .rpc('get_combined_user_role');
        
        // Checar se usuário é admin de sede no banco (força papel pastor)
        let isSedeAdmin = false;
        try {
          const { data: sedeAdminData } = await supabase.rpc('is_sede_admin', { uid: user.id });
          isSedeAdmin = Boolean(sedeAdminData);
        } catch (e) {
          // Ignorar erro silenciosamente; seguir com fallback abaixo
        }
        
        // Fallback: se for o e-mail do administrador padrão, considere 'pastor'
        const isBootstrapAdmin = user.email?.toLowerCase() === 'admin@cbnkerigma.org.br';
        
        if (mounted) {
          if (error) {
            console.warn("Error fetching combined user role:", error);
            setData((isSedeAdmin || isBootstrapAdmin) ? 'pastor' as UserRole : 'membro' as UserRole);
          } else {
            const role = (isSedeAdmin || isBootstrapAdmin)
              ? 'pastor' as UserRole
              : ((combinedRole as UserRole) || 'membro' as UserRole);
            setData(role);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Error in useNewUserRole:", err);
        if (mounted) {
          setError(err as Error);
          setData('membro' as UserRole);
          setIsLoading(false);
        }
      }
    };

    fetchUserRole();

    // Listen for auth changes
    const authSubscription = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => {
      mounted = false;
      authSubscription.data.subscription.unsubscribe();
    };
  }, []);

  return { data, isLoading, error };
}

export function useHasNewRole(role: UserRole): boolean {
  const { data: userRole } = useNewUserRole();
  
  if (userRole === 'pastor') return true;
  if (userRole === 'lider' && (role === 'lider' || role === 'membro')) return true;
  if (userRole === 'membro' && role === 'membro') return true;
  
  return false;
}

export const newRolePermissions: Record<UserRole, { name: string; pages: string[] }> = {
  pastor: {
    name: 'Pastor',
    pages: ['dashboard', 'pessoas', 'celulas', 'ensino', 'agenda', 'cultos', 'eventos', 'financeiro', 'patrimonio', 'escalas', 'louvor', 'aconselhamento', 'analytics', 'content', 'ia-pastoral']
  },
  lider: {
    name: 'Líder', 
    pages: ['dashboard', 'celulas', 'ensino', 'agenda', 'eventos', 'escalas', 'analytics', 'recepcao']
  },
  membro: {
    name: 'Membro',
    pages: ['dashboard', 'agenda', 'eventos', 'ensino', 'aconselhamento', 'membro']
  }
};