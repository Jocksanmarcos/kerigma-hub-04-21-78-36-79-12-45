import * as Sentry from '@sentry/react';

// Configuração do Sentry
export const initErrorReporting = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

// Capturar erro personalizado
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error captured:', error, context);
  }
};

// Capturar mensagem personalizada
export const captureMessage = (
  message: string, 
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) => {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureMessage(message, level);
    });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
};

// Definir contexto do usuário
export const setUserContext = (user: {
  id: string;
  email?: string;
  name?: string;
}) => {
  if (import.meta.env.PROD) {
    Sentry.setUser(user);
  }
};

// Limpar contexto do usuário
export const clearUserContext = () => {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
};

// Error Boundary Component
export const ErrorBoundary = Sentry.withErrorBoundary;

// Hook para capturar erros em componentes
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: { componentStack: string }) => {
    captureError(error, { 
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    });
  };
};

// Performance monitoring simplificado
export const trackPerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`Performance [${name}]: ${end - start}ms`);
    });
  } else {
    const end = performance.now();
    console.log(`Performance [${name}]: ${end - start}ms`);
    return result;
  }
};