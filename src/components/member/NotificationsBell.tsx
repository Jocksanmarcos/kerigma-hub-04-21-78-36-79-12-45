import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificacoesEscala } from '@/components/louvor/NotificacoesEscala';
import { useNotificacoesEscala } from '@/hooks/useNotificacoesEscala';

export const NotificationsBell: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const { totalNaoLidas } = useNotificacoesEscala();

  return (
    <div className="relative">
      {/* Sino de Notificações */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {totalNaoLidas > 0 && (
          <Badge 
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
          >
            {totalNaoLidas > 9 ? '9+' : totalNaoLidas}
          </Badge>
        )}
      </Button>

      {/* Painel de Notificações */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-xl border bg-background">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações de Escala
                  {totalNaoLidas > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {totalNaoLidas}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <NotificacoesEscala showHeader={false} maxItems={5} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};