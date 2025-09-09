import { useEffect, useCallback } from 'react';
import { debounce, throttle, performanceMonitor } from '@/shared/utils/performance';

export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Preconnect para recursos externos
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);

    // Monitorar performance
    performanceMonitor.mark('page-load-start');
    
    return () => {
      performanceMonitor.mark('page-load-end');
      performanceMonitor.measure('page-load-duration', 'page-load-start', 'page-load-end');
    };
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchTerm: string, callback: (term: string) => void) => {
      callback(searchTerm);
    }, 300),
    []
  );

  const throttledScroll = useCallback(
    throttle((callback: () => void) => {
      callback();
    }, 100),
    []
  );

  return {
    debouncedSearch,
    throttledScroll,
  };
};