import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNewUserRole, UserRole, newRolePermissions } from "@/hooks/useNewRole";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewRoleGuardProps {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Alert className="max-w-md">
      <Shield className="h-4 w-4" />
      <AlertDescription className="space-y-4">
        <p>Você não tem permissão para acessar esta seção.</p>
        <Button onClick={onNavigate} className="w-full">
          Voltar ao Dashboard
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

export const NewRoleGuard: React.FC<NewRoleGuardProps> = ({
  requiredRole,
  allowedRoles,
  children,
  fallback
}) => {
  const { data: userRole, isLoading } = useNewUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando permissões...</div>
      </div>
    );
  }

  if (!userRole) {
    return fallback || <DefaultFallback onNavigate={() => navigate("/dashboard")} />;
  }

  // Check if user has required role
  let hasAccess = false;

  if (requiredRole) {
    // Pastor has access to everything
    if (userRole === 'pastor') {
      hasAccess = true;
    } else if (requiredRole === 'lider' && (userRole === 'lider')) {
      hasAccess = true;
    } else if (requiredRole === 'membro') {
      hasAccess = true; // All roles can access membro-level content
    }
  }

  if (allowedRoles && userRole) {
    hasAccess = allowedRoles.includes(userRole as UserRole) || userRole === 'pastor';
  }

  if (!hasAccess) {
    // Show toast for unauthorized access
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive"
    });
    
    return fallback || <DefaultFallback onNavigate={() => navigate("/dashboard")} />;
  }

  return <>{children}</>;
};