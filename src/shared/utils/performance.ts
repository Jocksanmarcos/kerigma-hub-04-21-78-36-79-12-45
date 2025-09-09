// Performance optimization utilities

// Lazy loading helper
export const lazyImport = <T extends Record<string, any>>(
  factory: () => Promise<T>,
  name: keyof T
) =>
  Object.create(null, {
    [name]: {
      configurable: true,
      get() {
        return factory().then((module) => module[name]);
      },
    },
  });

// Debounce function for search and input optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
}

// Bundle size analyzer helper
export function measureBundleSize(name: string) {
  return {
    start: () => console.time(`Bundle ${name}`),
    end: () => console.timeEnd(`Bundle ${name}`),
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  mark(name: string): void {
    this.metrics.set(name, performance.now());
    performance.mark(name);
  }
  
  measure(name: string, startMark: string, endMark?: string): number {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }
    
    const entries = performance.getEntriesByName(name, 'measure');
    const lastEntry = entries[entries.length - 1];
    return lastEntry ? lastEntry.duration : 0;
  }
  
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }
  
  clearMetrics(): void {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
  
  reportVitals(): void {
    // Basic performance reporting
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      console.log('Performance Metrics:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalPageLoad: navigation.loadEventEnd - navigation.fetchStart,
      });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();