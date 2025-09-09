import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck, Trophy, BookOpen, MessageSquare, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useToast } from '@/hooks/use-toast';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  created_at: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ open, onOpenChange }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { pessoa } = useCurrentPerson();
  const { toast } = useToast();

  useEffect(() => {
    if (open && pessoa) {
      loadNotifications();
    }
  }, [open, pessoa]);

  const loadNotifications = async () => {
    setLoading(true);
    
    // Dados simulados para demonstração
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        titulo: 'Bem-vindo ao Portal!',
        mensagem: 'Explore seus cursos e acompanhe seu progresso de aprendizado.',
        tipo: 'welcome',
        lida: false,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        titulo: 'Nova conquista desbloqueada!',
        mensagem: 'Você ganhou a medalha "Estudante Dedicado" por completar 5 aulas seguidas.',
        tipo: 'achievement',
        lida: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        titulo: 'Novo módulo disponível',
        mensagem: 'O módulo "Comunicação Assertiva" do curso de Liderança Cristã já está disponível.',
        tipo: 'course',
        lida: false,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        titulo: 'Parabéns!',
        mensagem: 'Você concluiu o módulo "Fundamentos Bíblicos" com 95% de aproveitamento.',
        tipo: 'completion',
        lida: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, lida: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, lida: true })));
    toast({
      title: "Sucesso!",
      description: "Todas as notificações foram marcadas como lidas.",
    });
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'achievement': return Trophy;
      case 'course': return BookOpen;
      case 'message': return MessageSquare;
      case 'deadline': return Clock;
      case 'event': return Calendar;
      case 'completion': return CheckCircle;
      default: return Bell;
    }
  };

  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case 'achievement': return 'text-warning';
      case 'course': return 'text-primary';
      case 'message': return 'text-info';
      case 'deadline': return 'text-error';
      case 'event': return 'text-success';
      case 'completion': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          <div className="space-y-3 pr-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.tipo);
                return (
                  <div 
                    key={notification.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      !notification.lida ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.lida && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${getIconColor(notification.tipo)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium text-sm ${!notification.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.titulo}
                          </h4>
                          {!notification.lida && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.mensagem}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};