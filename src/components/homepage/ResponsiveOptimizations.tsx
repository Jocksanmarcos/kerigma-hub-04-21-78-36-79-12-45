import React from "react";

// Mobile-first responsive utilities

export const MobileStack: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6 ${className}`}>
    {children}
  </div>
);

export const ResponsiveText: React.FC<{ 
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ children, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl lg:text-2xl',
    xl: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl'
  };
  
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

export const ResponsiveGrid: React.FC<{ 
  children: React.ReactNode;
  cols?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
}> = ({ children, cols = { sm: 1, md: 2, lg: 3 }, gap = 4, className = '' }) => {
  const gridClasses = `
    grid gap-${gap}
    ${cols.sm ? `grid-cols-${cols.sm}` : 'grid-cols-1'}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
  `;
  
  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  );
};

export const TouchFriendlyButton: React.FC<{ 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseClasses = 'min-h-[44px] px-6 py-3 text-center font-medium rounded-lg transition-all duration-200 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const MobileHidden: React.FC<{ 
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="hidden md:block">
    {children}
  </div>
);

export const MobileOnly: React.FC<{ 
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="block md:hidden">
    {children}
  </div>
);

export const SafeAreaPadding: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`px-4 py-safe-top pb-safe-bottom ${className}`}>
    {children}
  </div>
);

// Hook for responsive breakpoints
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('sm');
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);
  
  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl'
  };
};

// Performance optimized image component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
}> = ({ src, alt, className = '', lazy = true, priority = false }) => (
  <img
    src={src}
    alt={alt}
    className={`${className} ${lazy ? 'object-cover' : ''}`}
    loading={lazy && !priority ? 'lazy' : 'eager'}
    decoding="async"
    style={{
      willChange: 'auto'
    }}
  />
);