import React from 'react';
import { NewAuthGuard } from './NewAuthGuard';
import { NewRoleGuard } from './NewRoleGuard';
import { UserRole } from '@/hooks/useNewRole';

/**
 * Higher-order component that provides authentication and role-based protection
 * Similar to Next.js middleware but for React components
 */
export function withAuth<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options?: {
    requiredRole?: UserRole;
    allowedRoles?: UserRole[];
    requireAuth?: boolean;
  }
) {
  const { requiredRole, allowedRoles, requireAuth = true } = options || {};

  const WrappedComponent = (props: T) => {
    // If no auth required, render component directly
    if (!requireAuth) {
      return <Component {...props} />;
    }

    // Auth required - wrap with AuthGuard
    const AuthProtectedComponent = (
      <NewAuthGuard>
        <Component {...props} />
      </NewAuthGuard>
    );

    // If no role requirements, return auth-protected component
    if (!requiredRole && !allowedRoles) {
      return AuthProtectedComponent;
    }

    // Wrap with role guard for role-based protection
    return (
      <NewAuthGuard>
        <NewRoleGuard requiredRole={requiredRole} allowedRoles={allowedRoles}>
          <Component {...props} />
        </NewRoleGuard>
      </NewAuthGuard>
    );
  };

  // Preserve component name for debugging
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Route-level auth protection
 * Use this to protect entire routes
 */
export function protectRoute<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  role?: UserRole
) {
  return withAuth(Component, { requiredRole: role });
}

// Export convenience functions for specific roles
export const withPastorAuth = <T extends Record<string, any>>(Component: React.ComponentType<T>) =>
  withAuth(Component, { requiredRole: 'pastor' });

export const withLiderAuth = <T extends Record<string, any>>(Component: React.ComponentType<T>) =>
  withAuth(Component, { allowedRoles: ['pastor', 'lider'] });

export const withMembroAuth = <T extends Record<string, any>>(Component: React.ComponentType<T>) =>
  withAuth(Component, { requireAuth: true });