// Barrel exports for utilities
export * from '@/lib/utils';
export * from './performance';
export * from '@/utils/auditFinanceiro';
export * from '@/utils/errorReporting';
export * from '@/utils/uploadManager';

// Bundle optimization utilities (avoid conflicts)
export { 
  addResourceHints,
  inlineCriticalCSS,
  preloadModule,
  analyzeBundleSize,
  registerServiceWorker,
  initializeBundleOptimizations
} from './bundleOptimization';