import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Trash2,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ServiceWorkerManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Monitorar status de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar se SW já está registrado
    checkServiceWorker();
    estimateCacheSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        setSwRegistration(registration || null);
      } catch (error) {
        console.error('Erro ao verificar Service Worker:', error);
      }
    }
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta Service Workers.",
        variant: "destructive"
      });
      return;
    }

    setIsInstalling(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setSwRegistration(registration);
      
      toast({
        title: "Service Worker instalado!",
        description: "Cache offline habilitado com sucesso.",
      });

      // Aguardar instalação e ativar
      if (registration.installing) {
        registration.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === 'activated') {
            estimateCacheSize();
          }
        });
      }
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      toast({
        title: "Erro",
        description: "Erro ao instalar Service Worker.",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const unregisterServiceWorker = async () => {
    if (swRegistration) {
      try {
        await swRegistration.unregister();
        setSwRegistration(null);
        setCacheSize(0);
        
        toast({
          title: "Service Worker removido",
          description: "Cache offline foi desabilitado.",
        });
      } catch (error) {
        console.error('Erro ao remover Service Worker:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover Service Worker.",
          variant: "destructive"
        });
      }
    }
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        setCacheSize(0);
        
        toast({
          title: "Cache limpo",
          description: "Todo o cache foi removido com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar cache.",
        variant: "destructive"
      });
    }
  };

  const estimateCacheSize = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setCacheSize(estimate.usage || 0);
      } else if ('caches' in window) {
        // Fallback: estimar baseado no número de entradas
        const cacheNames = await caches.keys();
        let totalEntries = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalEntries += keys.length;
        }
        
        // Estimativa aproximada: 50KB por entrada
        setCacheSize(totalEntries * 50 * 1024);
      }
    } catch (error) {
      console.error('Erro ao estimar tamanho do cache:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const preloadCriticalResources = async () => {
    try {
      const resourcesToCache = [
        '/',
        '/dashboard',
        '/static/js/bundle.js',
        '/static/css/main.css',
        // Adicionar mais recursos críticos conforme necessário
      ];

      if ('caches' in window) {
        const cache = await caches.open('kerigma-v1');
        await cache.addAll(resourcesToCache);
        
        toast({
          title: "Recursos baixados",
          description: "Recursos críticos foram salvos para uso offline.",
        });
        
        estimateCacheSize();
      }
    } catch (error) {
      console.error('Erro ao fazer pré-cache:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar recursos para cache.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Status de conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status de Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {isOnline 
                  ? "Conectado à internet. Todos os recursos estão disponíveis."
                  : "Sem conexão. Usando recursos em cache."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Worker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Cache Offline (Service Worker)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Status: {swRegistration ? "Ativo" : "Inativo"}
              </p>
              <p className="text-sm text-muted-foreground">
                {swRegistration 
                  ? "Cache offline habilitado. A aplicação funciona offline."
                  : "Cache offline desabilitado. Instale para usar sem conexão."
                }
              </p>
            </div>
            <div className="flex gap-2">
              {swRegistration ? (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={unregisterServiceWorker}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={registerServiceWorker}
                  disabled={isInstalling}
                >
                  {isInstalling ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Instalar
                </Button>
              )}
            </div>
          </div>

          {/* Informações do cache */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Tamanho do Cache</p>
              <p className="text-lg font-semibold">{formatBytes(cacheSize)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Última Atualização</p>
              <p className="text-sm text-muted-foreground">
                {swRegistration ? "Ativo" : "N/A"}
              </p>
            </div>
          </div>

          {/* Ações do cache */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={preloadCriticalResources}
              disabled={!swRegistration}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Recursos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearCache}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={estimateCacheSize}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dicas de uso offline */}
      <Card>
        <CardHeader>
          <CardTitle>Uso Offline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              • <strong>Recursos em cache:</strong> Páginas principais, CSS e JavaScript
            </p>
            <p className="text-sm">
              • <strong>Disponível offline:</strong> Dashboard, visualização de dados em cache
            </p>
            <p className="text-sm">
              • <strong>Limitações offline:</strong> Novos dados e atualizações requerem conexão
            </p>
            <p className="text-sm">
              • <strong>Sincronização:</strong> Dados são sincronizados quando a conexão é restaurada
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};