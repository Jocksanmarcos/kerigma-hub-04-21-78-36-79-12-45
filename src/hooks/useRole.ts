import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'moderator' | 'user';

export function useUserRole() {
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
        
        // Simple fetch approach to avoid type issues
        const response = await fetch(`https://vsanvmekqtfkbgmrjwoo.supabase.co/rest/v1/user_roles?user_id=eq.${user.id}&active=eq.true&select=role`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYW52bWVrcXRma2JnbXJqd29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU0OTUsImV4cCI6MjA2OTEwMTQ5NX0.eJqJcO-lOng2-1OwMhXAOXTYRF1hAsRo7NrkFT34ob8',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn("Error fetching user role:", response.statusText);
          if (mounted) {
            setData('user' as UserRole);
            setIsLoading(false);
          }
          return;
        }
        
        const roleData = await response.json();
        
        if (mounted) {
          setData((roleData[0]?.role as UserRole) || 'user');
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Error in useUserRole:", err);
        if (mounted) {
          setError(err as Error);
          setData('user' as UserRole);
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

export function useHasRole(role: UserRole): boolean {
  const { data: userRole } = useUserRole();
  
  if (userRole === 'admin') return true;
  if (userRole === 'moderator' && (role === 'moderator' || role === 'user')) return true;
  if (userRole === 'user' && role === 'user') return true;
  
  return false;
}

export const rolePermissions: Record<UserRole, { name: string; pages: string[] }> = {
  admin: {
    name: 'Pastor',
    pages: ['dashboard', 'pessoas', 'celulas', 'ensino', 'agenda', 'cultos', 'eventos', 'financeiro', 'patrimonio', 'governanca', 'configuracoes']
  },
  moderator: {
    name: 'Líder', 
    pages: ['dashboard', 'celulas', 'ensino', 'agenda', 'eventos']
  },
  user: {
    name: 'Membro',
    pages: ['dashboard', 'agenda', 'eventos', 'ensino']
  }
};