import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Smartphone, 
  Download, 
  Bell, 
  CheckCircle,
  X 
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAManager: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      toast({
        title: "App Instalado!",
        description: "Kerigma Hub foi instalado com sucesso.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      toast({
        title: "Instalação iniciada",
        description: "O app está sendo instalado no seu dispositivo.",
      });
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações.",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá updates importantes da igreja.",
        });
      } else {
        toast({
          title: "Notificações negadas",
          description: "Você pode ativar nas configurações do navegador.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
  };

  if (isInstalled && notificationPermission === 'granted') {
    return null; // Don't show if everything is set up
  }

  return (
    <div className="space-y-4">
      {/* Install App Prompt */}
      {isInstallable && !isInstalled && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Smartphone className="h-5 w-5" />
              Instalar App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Instale o Kerigma Hub para uma experiência completa e acesso offline.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstallClick} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsInstallable(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Depois
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Permission */}
      {notificationPermission === 'default' && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Receba avisos importantes sobre eventos, cultos e comunicados da igreja.
            </p>
            <Button onClick={requestNotificationPermission} size="sm" variant="secondary">
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {isInstalled && notificationPermission === 'granted' && (
        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                App configurado com sucesso!
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};