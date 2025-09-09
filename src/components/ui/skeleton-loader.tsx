import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'dashboard';
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = 'text',
  lines = 1
}) => {
  const baseClasses = 'skeleton-pulse rounded-kerigma';

  const variants = {
    card: 'h-32 w-full',
    text: 'h-4 w-full',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24',
    dashboard: 'h-48 w-full'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variants.text,
              index === lines - 1 && 'w-3/4' // Last line shorter
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, variants[variant], className)} />
  );
};

// Composed skeleton components
export const DashboardCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-card p-6 rounded-kerigma shadow-kerigma border', className)}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" className="w-1/3" />
        <SkeletonLoader variant="avatar" className="w-6 h-6" />
      </div>
      <SkeletonLoader variant="text" className="w-1/2 h-8" />
      <SkeletonLoader variant="text" className="w-1/4" />
    </div>
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 3, 
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <SkeletonLoader variant="text" className="w-1/4 h-5" />
        <SkeletonLoader variant="button" className="w-full h-11" />
      </div>
    ))}
    <div className="flex gap-4 pt-4">
      <SkeletonLoader variant="button" className="w-24" />
      <SkeletonLoader variant="button" className="w-20" />
    </div>
  </div>
);