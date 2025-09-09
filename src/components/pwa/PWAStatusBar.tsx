import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Bell, BellOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface PWAStatusBarProps {
  className?: string;
  showSyncButton?: boolean;
}

export const PWAStatusBar: React.FC<PWAStatusBarProps> = ({ 
  className,
  showSyncButton = true 
}) => {
  const { 
    isOnline, 
    isInstalled, 
    notificationPermission,
    requestNotificationPermission 
  } = usePWA();

  const handleNotificationRequest = async () => {
    try {
      await requestNotificationPermission();
    } catch (error) {
      console.error('Erro ao solicitar notificações:', error);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Status da Conexão */}
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Status PWA */}
      {isInstalled && (
        <Badge variant="secondary" className="flex items-center gap-1">
          📱 PWA
        </Badge>
      )}

      {/* Status das Notificações */}
      {notificationPermission === 'default' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNotificationRequest}
          className="h-8 px-2"
        >
          <BellOff className="h-4 w-4 mr-1" />
          Ativar
        </Button>
      )}

      {notificationPermission === 'granted' && (
        <Badge variant="default" className="flex items-center gap-1">
          <Bell className="h-3 w-3" />
          Push
        </Badge>
      )}

      {/* Botão de Sincronização */}
      {showSyncButton && !isOnline && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="h-8 px-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Tentar
        </Button>
      )}
    </div>
  );
};