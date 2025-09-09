import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const { canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!canInstall || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await promptInstall();
    } catch (error) {
      console.error('Erro ao instalar:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Salvar no localStorage para não mostrar novamente na sessão
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <Card className="border-primary/20 bg-primary-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Smartphone className="h-5 w-5" />
            Instalar App
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Instale o Kerigma Hub para uma experiência completa com acesso offline,
          notificações e melhor performance.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleInstall} size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Instalar Agora
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDismiss}
          >
            Depois
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};