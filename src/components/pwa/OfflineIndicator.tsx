import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const [wasPreviouslyOffline, setWasPreviouslyOffline] = React.useState(false);
  const [showReconnectedMessage, setShowReconnectedMessage] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setWasPreviouslyOffline(true);
    } else if (wasPreviouslyOffline && isOnline) {
      setShowReconnectedMessage(true);
      const timer = setTimeout(() => {
        setShowReconnectedMessage(false);
        setWasPreviouslyOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasPreviouslyOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 flex justify-center"
        >
          <Card className="bg-destructive text-destructive-foreground shadow-lg">
            <div className="flex items-center gap-3 p-3">
              <WifiOff className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Sem conexão</p>
                <p className="text-xs opacity-90">
                  Funcionando no modo offline
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Tentar
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {showReconnectedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 flex justify-center"
        >
          <Card className="bg-success text-success-foreground shadow-lg">
            <div className="flex items-center gap-3 p-3">
              <CheckCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Conexão restaurada</p>
                <p className="text-xs opacity-90">
                  Sincronizando dados...
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};