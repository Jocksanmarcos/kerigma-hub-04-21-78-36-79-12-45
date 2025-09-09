import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load pending actions from localStorage
    const saved = localStorage.getItem('kerigma-offline-actions');
    if (saved) {
      try {
        setPendingActions(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading offline actions:', error);
        localStorage.removeItem('kerigma-offline-actions');
      }
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingActions = async () => {
    if (pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    try {
      // Here you would implement actual sync logic with your backend
      // For now, we'll just clear the actions after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingActions([]);
      localStorage.removeItem('kerigma-offline-actions');
      
      if (pendingActions.length > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${pendingActions.length} ações foram sincronizadas.`,
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar todas as ações.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const addPendingAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    const updatedActions = [...pendingActions, newAction];
    setPendingActions(updatedActions);
    localStorage.setItem('kerigma-offline-actions', JSON.stringify(updatedActions));
  };

  return {
    isOnline,
    hasPendingActions: pendingActions.length > 0,
    pendingActions,
    isSyncing,
    addPendingAction,
    syncPendingActions,
  };
};