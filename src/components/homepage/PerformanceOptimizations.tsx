import React, { memo, useMemo, Suspense } from "react";

// Performance optimization utilities

// Memoized component wrapper
export const MemoizedComponent = <T extends object>(Component: React.ComponentType<T>) => {
  return memo((props: T) => <Component {...props} />);
};

// Optimized list renderer with virtualization for large lists
export const OptimizedList: React.FC<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  maxVisible?: number;
  className?: string;
}> = ({ items, renderItem, itemHeight = 200, maxVisible = 10, className = '' }) => {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: maxVisible });
  
  const visibleItems = useMemo(() => 
    items.slice(visibleRange.start, visibleRange.end),
    [items, visibleRange]
  );
  
  return (
    <div className={`overflow-auto ${className}`} style={{ maxHeight: itemHeight * maxVisible }}>
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, visibleRange.start + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Lazy loading component wrapper
export const LazyComponent: React.FC<{
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  props?: any;
}> = ({ component: Component, fallback = <div>Carregando...</div>, props = {} }) => (
  <Suspense fallback={fallback}>
    <Component {...props} />
  </Suspense>
);

// Intersection observer hook for lazy loading
export const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = React.useState(false);
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  
  React.useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );
    
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);
  
  return [setRef, isInView] as const;
};

// Debounced input hook
export const useDebouncedValue = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Resource preloader
export const preloadResource = (url: string, type: 'image' | 'script' | 'style' = 'image') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
};

// Critical resource loader
export const CriticalResourceLoader: React.FC<{
  resources: Array<{ url: string; type: 'image' | 'script' | 'style' }>;
  children: React.ReactNode;
}> = ({ resources, children }) => {
  const [loaded, setLoaded] = React.useState(false);
  
  React.useEffect(() => {
    Promise.all(
      resources.map(resource => {
        return new Promise((resolve) => {
          if (resource.type === 'image') {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Continue even if load fails
            img.src = resource.url;
          } else {
            preloadResource(resource.url, resource.type);
            resolve(true);
          }
        });
      })
    ).then(() => setLoaded(true));
  }, [resources]);
  
  return loaded ? <>{children}</> : <div>Carregando recursos...</div>;
};

// Bundle splitting component
export const AsyncComponent = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) =>
  React.lazy(importFunc);

// Memory leak prevention hook
export const useCleanup = (cleanup: () => void) => {
  React.useEffect(() => cleanup, [cleanup]);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  });
};

// Optimized image with WebP support
export const WebPImage: React.FC<{
  src: string;
  webpSrc?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}> = ({ src, webpSrc, alt, className = '', loading = 'lazy' }) => (
  <picture>
    {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
    <img 
      src={src} 
      alt={alt} 
      className={className}
      loading={loading}
      decoding="async"
    />
  </picture>
);

// Service Worker registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error));
    });
  }
};