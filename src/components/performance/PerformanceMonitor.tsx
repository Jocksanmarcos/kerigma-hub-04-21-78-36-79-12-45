import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Zap, 
  Download, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  memoryUsage: number;
  connectionType: string;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Monitorar conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Coletar métricas de performance
    const collectMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
        const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

        let memoryUsage = 0;
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        }

        const connectionInfo = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        setMetrics({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint,
          firstContentfulPaint,
          totalBlockingTime: 0, // Seria calculado com APIs mais avançadas
          cumulativeLayoutShift: 0, // Seria calculado com LayoutShift API
          memoryUsage,
          connectionType: connectionInfo?.effectiveType || 'unknown'
        });
      }
    };

    // Aguardar carregamento completo
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('load', collectMetrics);
    };
  }, []);

  const getPerformanceScore = (metric: number, thresholds: [number, number]) => {
    if (metric <= thresholds[0]) return { score: 'good', color: 'bg-green-500' };
    if (metric <= thresholds[1]) return { score: 'needs-improvement', color: 'bg-yellow-500' };
    return { score: 'poor', color: 'bg-red-500' };
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${time.toFixed(0)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getConnectionBadge = () => {
    if (!isOnline) {
      return <Badge variant="destructive">Offline</Badge>;
    }
    
    switch (metrics?.connectionType) {
      case 'slow-2g':
        return <Badge variant="destructive">2G Lento</Badge>;
      case '2g':
        return <Badge variant="destructive">2G</Badge>;
      case '3g':
        return <Badge variant="secondary">3G</Badge>;
      case '4g':
        return <Badge variant="default">4G</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Monitor de Performance
          </CardTitle>
          <CardDescription>Coletando métricas...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Métricas de Carregamento
          </CardTitle>
          <CardDescription>Tempos de carregamento da página</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tempo Total de Carregamento</span>
              <span className="text-sm">{formatTime(metrics.loadTime)}</span>
            </div>
            <Progress 
              value={Math.min((metrics.loadTime / 3000) * 100, 100)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">DOM Content Loaded</span>
              <span className="text-sm">{formatTime(metrics.domContentLoaded)}</span>
            </div>
            <Progress 
              value={Math.min((metrics.domContentLoaded / 2000) * 100, 100)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">First Contentful Paint</span>
              <span className="text-sm">{formatTime(metrics.firstContentfulPaint)}</span>
            </div>
            <Progress 
              value={Math.min((metrics.firstContentfulPaint / 1800) * 100, 100)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
          <CardDescription>Informações sobre conexão e recursos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status da Conexão</span>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              {getConnectionBadge()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uso de Memória JS</span>
              <span className="text-sm">{metrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={metrics.memoryUsage} 
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {metrics.loadTime < 3000 ? '✓' : '⚠'}
              </div>
              <div className="text-xs text-muted-foreground">
                Performance Geral
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {formatTime(metrics.firstContentfulPaint)}
              </div>
              <div className="text-xs text-muted-foreground">
                FCP
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;