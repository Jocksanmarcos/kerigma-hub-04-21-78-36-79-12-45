import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveDashboardGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'pastor' | 'lider' | 'membro';
}

export const ResponsiveDashboardGrid: React.FC<ResponsiveDashboardGridProps> = ({
  children,
  className,
  variant = 'pastor'
}) => {
  const gridVariants = {
    pastor: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6',
    lider: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
    membro: 'grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6'
  };

  return (
    <div className={cn(gridVariants[variant], className)}>
      {children}
    </div>
  );
};