import React from 'react';
import { Bell, Settings, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
// import { useNotifications } from '@/hooks/useNotifications'; // Temporariamente desabilitado
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationCenter: React.FC = () => {
  // Dados temporários para demonstração
  const notifications: any[] = [];
  const unreadCount = 0;
  const markAsRead = () => {};
  const markAllAsRead = () => {};
  const loading = false;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return '📅';
      case 'teaching':
        return '📚';
      case 'cell':
        return '🏠';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-500';
      case 'teaching':
        return 'bg-green-500';
      case 'cell':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="p-0">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                      !notification.read ? 'bg-accent/50' : ''
                    }`}
                    onClick={() => markAsRead()}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                          <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;