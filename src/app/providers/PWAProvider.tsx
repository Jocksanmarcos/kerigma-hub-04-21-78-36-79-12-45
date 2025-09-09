import React, { createContext, useContext, useEffect, useState } from 'react';
import { pwaManager } from '@/lib/pwa/pwa-manager';
import { offlineDB } from '@/lib/pwa/offline-db';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  currentChurchId: string | null;
  switchChurch: (churchId: string) => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(pwaManager.isAppInstalled);
  const [canInstall, setCanInstall] = useState(pwaManager.canInstall);
  const [currentChurchId, setCurrentChurchId] = useState(pwaManager.getCurrentChurchId());
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Initialize offline database
    offlineDB.init();

    // Monitor network status
    const removeNetworkListener = pwaManager.onNetworkChange(setIsOnline);

    // Listen for install prompt
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
      // Show install prompt after a delay
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setShowInstallPrompt(false);
    };

    // Listen for church switch
    const handleChurchSwitch = (event: CustomEvent) => {
      setCurrentChurchId(event.detail.churchId);
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
  }, []);

  const switchChurch = async (churchId: string) => {
    await pwaManager.switchChurch(churchId);
  };

  const contextValue: PWAContextType = {
    isOnline,
    isInstalled,
    canInstall,
    currentChurchId,
    switchChurch
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      <OfflineIndicator />
      {showInstallPrompt && canInstall && !isInstalled && <PWAInstallPrompt />}
    </PWAContext.Provider>
  );
};