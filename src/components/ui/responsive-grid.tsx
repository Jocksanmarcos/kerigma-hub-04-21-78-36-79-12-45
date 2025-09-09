import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number | string;
  minItemWidth?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  columns = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 6,
  minItemWidth,
}) => {
  // Auto-fit grid if minItemWidth is provided
  if (minItemWidth) {
    return (
      <div 
        className={cn('grid', `gap-${gap}`, className)}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
        }}
      >
        {children}
      </div>
    );
  }

  // Responsive grid with defined breakpoints
  const gridClasses = cn(
    'grid',
    `gap-${gap}`,
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    columns['2xl'] && `2xl:grid-cols-${columns['2xl']}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Predefined responsive grid layouts
export const StatsGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <ResponsiveGrid
    columns={{ default: 1, sm: 2, lg: 3, xl: 4 }}
    gap={6}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);

export const CardsGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <ResponsiveGrid
    columns={{ default: 1, md: 2, xl: 3 }}
    gap={6}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);

export const DashboardGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <ResponsiveGrid
    columns={{ default: 1, lg: 2, xl: 3 }}
    gap={8}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);

export const AutoFitGrid: React.FC<{ 
  children: React.ReactNode; 
  minItemWidth?: string; 
  className?: string;
  gap?: number;
}> = ({ 
  children, 
  minItemWidth = '280px', 
  className,
  gap = 6
}) => (
  <ResponsiveGrid
    minItemWidth={minItemWidth}
    gap={gap}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);