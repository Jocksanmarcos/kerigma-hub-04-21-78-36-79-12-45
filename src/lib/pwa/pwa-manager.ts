// PWA Manager - Core functionality
import { supabase } from '@/integrations/supabase/client';

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private currentChurchId: string | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Detectar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Listener para prompt de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
    });

    // Listener para app instalado
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
    });

    // Registrar Service Worker
    this.registerServiceWorker();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Configurar background sync
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          await this.setupBackgroundSync(registration);
        }

        console.log('✅ Service Worker registrado:', registration.scope);
      } catch (error) {
        console.error('❌ Falha ao registrar Service Worker:', error);
      }
    }
  }

  private async setupBackgroundSync(registration: ServiceWorkerRegistration) {
    try {
      // Background sync não é universalmente suportado
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        // @ts-ignore - Background Sync API
        await registration.sync.register('submit-queue');
        // @ts-ignore - Background Sync API  
        await registration.sync.register('aluno-progress');
        console.log('✅ Background sync configurado');
      }
    } catch (error) {
      console.log('⚠️ Background sync não suportado:', error);
    }
  }

  async promptInstall(): Promise<{ outcome: 'accepted' | 'dismissed' }> {
    if (!this.deferredPrompt) {
      return { outcome: 'dismissed' };
    }

    await this.deferredPrompt.prompt();
    const choiceResult = await this.deferredPrompt.userChoice;

    this.deferredPrompt = null;
    return choiceResult;
  }

  get canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  get isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Multi-church isolation
  async switchChurch(churchId: string) {
    const oldChurchId = this.currentChurchId;
    this.currentChurchId = churchId;

    // Persistir no localStorage
    localStorage.setItem('kerigma_church_id', churchId);

    // Limpar caches da igreja anterior
    if (oldChurchId && oldChurchId !== churchId) {
      await this.clearChurchCaches(oldChurchId);
    }

    // Disparar evento para componentes reagirem
    window.dispatchEvent(new CustomEvent('church-switched', {
      detail: { churchId, oldChurchId }
    }));

    return true;
  }

  private async clearChurchCaches(churchId: string) {
    try {
      // Limpar caches específicos da igreja
      const cacheNames = await caches.keys();
      const churchCaches = cacheNames.filter(name => 
        name.includes(`church-${churchId}`)
      );

      await Promise.all(
        churchCaches.map(cacheName => caches.delete(cacheName))
      );

      // Limpar IndexedDB específico da igreja
      await this.clearChurchIndexedDB(churchId);

      console.log(`✅ Caches da igreja ${churchId} limpos`);
    } catch (error) {
      console.error('❌ Erro ao limpar caches da igreja:', error);
    }
  }

  private async clearChurchIndexedDB(churchId: string) {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('kerigma-offline', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offline_data'], 'readwrite');
        const store = transaction.objectStore('offline_data');
        const index = store.index('church_id');
        const deleteRequest = index.openCursor(IDBKeyRange.only(churchId));
        
        deleteRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  getCurrentChurchId(): string | null {
    return this.currentChurchId || localStorage.getItem('kerigma_church_id');
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.subscribeToChurchNotifications();
    }

    return permission;
  }

  private async subscribeToChurchNotifications() {
    const churchId = this.getCurrentChurchId();
    if (!churchId) return;

    try {
      // Implementar assinatura para tópicos específicos
      const topics = [
        `igreja:${churchId}`,
        // Adicionar outros tópicos conforme necessário
      ];

      // Aqui seria a integração com OneSignal ou FCM
      console.log('📱 Inscrito nos tópicos:', topics);
    } catch (error) {
      console.error('❌ Erro ao se inscrever em notificações:', error);
    }
  }

  // Network status
  get isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (isOnline: boolean) => void) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Singleton instance
export const pwaManager = new PWAManager();