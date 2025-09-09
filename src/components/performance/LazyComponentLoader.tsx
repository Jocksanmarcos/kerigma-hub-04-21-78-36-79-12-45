import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyComponentLoaderProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  className?: string;
  errorFallback?: React.ReactNode;
  children?: never;
}

interface ComponentWrapperProps {
  component: React.ComponentType<any>;
  props: any;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
  component: Component,
  props,
  fallback,
  errorFallback,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <ErrorBoundary fallback={errorFallback}>
          <Component {...props} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

const ComponentSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-32 w-full" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponentLoader Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center text-muted-foreground">
            <p>Erro ao carregar componente</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({
  loader,
  fallback,
  className,
  errorFallback
}) => {
  const LazyComponent = lazy(loader);

  return (
    <ComponentWrapper
      component={LazyComponent}
      props={{}}
      fallback={fallback}
      errorFallback={errorFallback}
      className={className}
    />
  );
};

// Hook para criar componentes lazy com retry
export const useLazyComponent = (
  loader: () => Promise<{ default: React.ComponentType<any> }>,
  retryCount = 3
) => {
  const loadWithRetry = async (attempt = 0): Promise<{ default: React.ComponentType<any> }> => {
    try {
      return await loader();
    } catch (error) {
      if (attempt < retryCount) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return loadWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  return lazy(() => loadWithRetry());
};

export default LazyComponentLoader;