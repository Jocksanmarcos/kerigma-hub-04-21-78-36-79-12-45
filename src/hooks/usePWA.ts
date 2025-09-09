import { useState, useEffect } from 'react';
import { pwaManager, BeforeInstallPromptEvent } from '@/lib/pwa/pwa-manager';
import { useToast } from '@/hooks/use-toast';

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  notificationPermission: NotificationPermission;
  currentChurchId: string | null;
}

export const usePWA = () => {
  const { toast } = useToast();
  const [state, setState] = useState<PWAState>({
    isInstallable: pwaManager.canInstall,
    isInstalled: pwaManager.isAppInstalled,
    isOnline: pwaManager.isOnline,
    notificationPermission: 'Notification' in window ? Notification.permission : 'denied',
    currentChurchId: pwaManager.getCurrentChurchId()
  });

  useEffect(() => {
    // Monitor network status
    const removeNetworkListener = pwaManager.onNetworkChange((isOnline) => {
      setState(prev => ({ ...prev, isOnline }));
      
      if (isOnline) {
        toast({
          title: "Conexão restaurada",
          description: "Sincronizando dados offline...",
          duration: 3000
        });
      } else {
        toast({
          title: "Sem conexão",
          description: "Funcionando no modo offline",
          variant: "destructive",
          duration: 3000
        });
      }
    });

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }));
      
      toast({
        title: "App Instalado!",
        description: "Kerigma Hub foi instalado com sucesso.",
        duration: 5000
      });
    };

    // Listen for church switch
    const handleChurchSwitch = (event: CustomEvent) => {
      setState(prev => ({ 
        ...prev, 
        currentChurchId: event.detail.churchId 
      }));
      
      toast({
        title: "Igreja alterada",
        description: "Dados da igreja foram atualizados.",
        duration: 3000
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('church-switched', handleChurchSwitch as EventListener);

    return () => {
      removeNetworkListener();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('church-switched', handleChurchSwitch as EventListener);
    };
  }, [toast]);

  const promptInstall = async () => {
    try {
      const result = await pwaManager.promptInstall();
      
      if (result.outcome === 'accepted') {
        toast({
          title: "Instalação iniciada",
          description: "O app está sendo instalado no seu dispositivo.",
          duration: 5000
        });
      }
      
      setState(prev => ({ ...prev, isInstallable: false }));
      return result;
    } catch (error) {
      toast({
        title: "Erro na instalação",
        description: "Não foi possível instalar o app.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await pwaManager.requestNotificationPermission();
      setState(prev => ({ ...prev, notificationPermission: permission }));
      
      if (permission === 'granted') {
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá updates importantes da igreja.",
          duration: 5000
        });
      } else {
        toast({
          title: "Notificações negadas",
          description: "Você pode ativar nas configurações do navegador.",
          variant: "destructive"
        });
      }
      
      return permission;
    } catch (error) {
      toast({
        title: "Erro nas notificações",
        description: "Seu navegador não suporta notificações.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const switchChurch = async (churchId: string) => {
    try {
      await pwaManager.switchChurch(churchId);
      return true;
    } catch (error) {
      toast({
        title: "Erro ao trocar igreja",
        description: "Não foi possível alterar os dados da igreja.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    ...state,
    promptInstall,
    requestNotificationPermission,
    switchChurch,
    canInstall: state.isInstallable && !state.isInstalled
  };
};