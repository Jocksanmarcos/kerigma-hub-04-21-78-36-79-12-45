// Bundle optimization utilities for Vite

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string): void => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  // Avoid duplicate preloads
  const existing = document.querySelector(`link[href="${href}"]`);
  if (!existing) {
    document.head.appendChild(link);
  }
};

// Lazy import with better error handling
export const lazyImport = <T extends Record<string, any>>(
  factory: () => Promise<T>,
  name: keyof T,
  retryCount = 3
) => {
  const loadWithRetry = async (attempt = 0): Promise<T[keyof T]> => {
    try {
      const module = await factory();
      return module[name];
    } catch (error) {
      if (attempt < retryCount) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return loadWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  return Object.create(null, {
    [name]: {
      configurable: true,
      get() {
        return loadWithRetry();
      },
    },
  });
};

// Resource hints for better loading
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;

  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    
    if (!document.querySelector(`link[href="${domain}"]`)) {
      document.head.appendChild(link);
    }
  });

  // DNS prefetch for other domains
  const dnsPrefetchDomains = [
    'https://api.supabase.co',
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    
    if (!document.querySelector(`link[href="${domain}"][rel="dns-prefetch"]`)) {
      document.head.appendChild(link);
    }
  });
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css: string) => {
  if (typeof window === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  
  // Insert before other stylesheets
  const firstLink = document.querySelector('link[rel="stylesheet"]');
  if (firstLink) {
    document.head.insertBefore(style, firstLink);
  } else {
    document.head.appendChild(style);
  }
};

// Module preloading for better code splitting
export const preloadModule = (moduleId: string) => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = moduleId;
  
  if (!document.querySelector(`link[href="${moduleId}"][rel="modulepreload"]`)) {
    document.head.appendChild(link);
  }
};

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        console.log('Bundle Analysis:', {
          totalLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
          resourcesLoaded: performance.getEntriesByType('resource').length
        });
      }
    });
  });

  observer.observe({ entryTypes: ['navigation'] });
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Update available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, prompt user to reload
              if (confirm('Nova versão disponível. Recarregar página?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};

// Initialize optimizations
export const initializeBundleOptimizations = () => {
  addResourceHints();
  analyzeBundleSize();
  registerServiceWorker();
};