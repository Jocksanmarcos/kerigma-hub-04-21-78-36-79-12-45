import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLoader } from './PageLoader';

// Lazy load heavy components
export const LazyDashboard = lazy(() => import('@/pages/dashboard/DashboardPage'));
export const LazyFinanceiro = lazy(() => import('@/pages/dashboard/FinanceiroPage'));
// export const LazyPessoas = lazy(() => import('@/pages/dashboard/PessoasPage')); // Removed
export const LazyEventos = lazy(() => import('@/pages/dashboard/EventosPage'));
export const LazyEnsino = lazy(() => import('@/pages/ensino/CentroEnsinoPage'));
export const LazyAgenda = lazy(() => import('@/pages/dashboard/AgendaPage'));
export const LazyPatrimonio = lazy(() => import('@/pages/dashboard/PatrimonioPage'));

// Heavy components that should be code-split
export const LazyPerformanceMonitor = lazy(() => import('./PerformanceMonitor'));
export const LazyAnalytics = lazy(() => 
  import('@/components/analytics/UsabilityDashboard').then(module => ({ 
    default: (module as any).default || (module as any).UsabilityDashboard || module 
  }))
);
export const LazyBackupDashboard = lazy(() => 
  import('@/components/backup/BackupDashboard').then(module => ({ 
    default: (module as any).default || (module as any).BackupDashboard || module 
  }))
);
export const LazyGovernanceCenter = lazy(() => 
  import('@/components/admin/governance/GovernanceCenter').then(module => ({ 
    default: (module as any).default || (module as any).GovernanceCenter || module 
  }))
);
export const LazyCreativeStudio = lazy(() => 
  import('@/components/creative-studio/CreativeStudio').then(module => ({ 
    default: (module as any).default || (module as any).CreativeStudio || module 
  }))
);
export const LazyIAPastoralCenter = lazy(() => 
  import('@/components/ia-pastoral/IAPastoralCenter').then(module => ({ 
    default: (module as any).default || (module as any).IAPastoralCenter || module 
  }))
);
export const LazyLeitorBiblico = lazy(() => 
  import('@/components/biblia/LeitorBiblico').then(module => ({ 
    default: (module as any).default || (module as any).LeitorBiblico || module 
  }))
);

// Public pages
export const LazyPublicHome = lazy(() => import('@/pages/public/PublicHomePage'));
export const LazyPublicEvento = lazy(() => import('@/pages/public/PublicEventoPage'));
export const LazyPublicEnsino = lazy(() => import('@/pages/public/PublicEnsinoPage'));
export const LazyPublicContato = lazy(() => import('@/pages/public/PublicContatoPageDynamic'));
export const LazyPublicSemear = lazy(() => import('@/pages/public/SemearTransformarPage'));
export const LazyPublicGaleria = lazy(() => import('@/pages/public/PublicGaleriaPageDynamic'));

// Loading skeletons for different page types - Otimizados
export const DashboardSkeleton = () => <PageLoader type="dashboard" />;

export const TableSkeleton = () => <PageLoader type="list" />;

export const FormSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

// Wrapper component for consistent loading states
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: 'dashboard' | 'table' | 'form' | 'card';
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback, 
  type = 'dashboard' 
}) => {
  const getDefaultFallback = () => {
    switch (type) {
      case 'table':
        return <TableSkeleton />;
      case 'form':
        return <FormSkeleton />;
      case 'card':
        return <CardSkeleton />;
      default:
        return <DashboardSkeleton />;
    }
  };

  return (
    <Suspense fallback={fallback || getDefaultFallback()}>
      {children}
    </Suspense>
  );
};

export default LazyWrapper;