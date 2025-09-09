import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePermission } from "@/hooks/usePermission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RequirePermissionProps {
  action: string;
  subject: string;
  resourceType?: string | null;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const DefaultFallback = () => (
  <Alert>
    <AlertDescription>
      Você não tem permissão para acessar esta seção. Se precisar, solicite acesso ao administrador.
    </AlertDescription>
  </Alert>
);

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  action,
  subject,
  resourceType = null,
  fallback,
  children,
}) => {
  // Verificação especial para louvor - usar is_sede_admin() diretamente  
  const { data: isAdmin, isLoading: loadingAdmin } = useQuery({
    queryKey: ["is-sede-admin"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return false;
      
      const { data, error } = await supabase.rpc("is_sede_admin", {
        uid: user.user.id
      });
      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 60_000,
    enabled: subject === 'louvor', // Só executar para louvor
  });

  const { data: allowed, isLoading, isError } = usePermission({ 
    action, 
    subject, 
    resourceType 
  });

  // Para louvor, usar a verificação de admin
  if (subject === 'louvor') {
    if (loadingAdmin) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      );
    }

    if (!isAdmin) {
      return <>{fallback ?? <DefaultFallback />}</>;
    }

    return <>{children}</>;
  }

  // Para outros módulos, usar o sistema padrão
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !allowed) {
    return <>{fallback ?? <DefaultFallback />}</>;
  }

  return <>{children}</>;
};

export default RequirePermission;
