import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useNewUserRole, newRolePermissions, UserRole } from "@/hooks/useNewRole";
import { useToast } from "@/hooks/use-toast";

interface NewAuthGuardProps {
  children: React.ReactNode;
}

export const NewAuthGuard: React.FC<NewAuthGuardProps> = ({ children }) => {
  const { data: userRole, isLoading } = useNewUserRole();
  const location = useLocation();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!userRole) {
    return <Navigate to="/auth" replace />;
  }

  // Extract page name from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1] || 'dashboard';
  
  // Check if user has permission to access current page
  const permissions = newRolePermissions[userRole as UserRole];
  if (!permissions?.pages.includes(currentPage)) {
    // Show toast for unauthorized access
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive"
    });
    
    // Redirect to appropriate dashboard based on role
    const redirectPath = getRoleDashboard(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

function getRoleDashboard(role: string): string {
  switch (role) {
    case 'pastor':
      return '/dashboard';
    case 'lider':
      return '/admin/celulas';
    case 'membro':
      return '/dashboard/agenda';
    default:
      return '/dashboard';
  }
}