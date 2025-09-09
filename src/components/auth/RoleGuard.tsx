import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole, UserRole, rolePermissions } from "@/hooks/useRole";
import { Shield } from "lucide-react";

interface RoleGuardProps {
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

export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  allowedRoles,
  children,
  fallback
}) => {
  const { data: userRole, isLoading } = useUserRole();
  const navigate = useNavigate();

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
    // Admin has access to everything
    if (userRole === 'admin') {
      hasAccess = true;
    } else if (requiredRole === 'moderator' && (userRole === 'moderator')) {
      hasAccess = true;
    } else if (requiredRole === 'user') {
      hasAccess = true; // All roles can access user-level content
    }
  }

  if (allowedRoles && userRole) {
    hasAccess = allowedRoles.includes(userRole as UserRole) || userRole === 'admin';
  }

  if (!hasAccess) {
    return fallback || <DefaultFallback onNavigate={() => navigate("/dashboard")} />;
  }

  return <>{children}</>;
};