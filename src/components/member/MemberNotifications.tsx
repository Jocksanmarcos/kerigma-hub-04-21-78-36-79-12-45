import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Calendar, 
  Heart, 
  BookOpen, 
  Users,
  X,
  CheckCircle 
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'announcement' | 'course' | 'cell' | 'contribution';
  isRead: boolean;
  timestamp: Date;
  actionUrl?: string;
}

export const MemberNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Novo Evento: Retiro de Jovens',
      message: 'Inscrições abertas para o retiro de 15-17 de dezembro',
      type: 'event',
      isRead: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      actionUrl: '/membro/vida-comunidade'
    },
    {
      id: '2',
      title: 'Nova Lição Disponível',
      message: 'Lição 10: "A Oração" do curso Fundamentos da Fé',
      type: 'course',
      isRead: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      actionUrl: '/membro/portal-aluno'
    },
    {
      id: '3',
      title: 'Comunicado da Liderança',
      message: 'Importante: Nova série de ensino começará no domingo',
      type: 'announcement',
      isRead: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event': return Calendar;
      case 'course': return BookOpen;
      case 'cell': return Users;
      case 'contribution': return Heart;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'event': return 'text-primary';
      case 'course': return 'text-secondary';
      case 'cell': return 'text-primary';
      case 'contribution': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="secondary"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-secondary text-white border-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {showNotifications && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-xl border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      !notification.isRead 
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                        : 'bg-muted/30 border-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full bg-muted/50 ${iconColor}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {notifications.length > 0 && (
              <div className="pt-2 border-t border-muted/30">
                <Button variant="outline" size="sm" className="w-full">
                  Ver todas as notificações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};