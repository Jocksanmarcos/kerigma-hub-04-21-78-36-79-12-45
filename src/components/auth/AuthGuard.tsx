import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole, rolePermissions, UserRole } from "@/hooks/useRole";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { data: userRole, isLoading } = useUserRole();
  const location = useLocation();

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
  const permissions = rolePermissions[userRole as UserRole];
  if (!permissions?.pages.includes(currentPage)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = getRoleDashboard(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

function getRoleDashboard(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'moderator':
      return '/dashboard';
    case 'user':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}