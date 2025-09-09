import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Trophy, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  Clock,
  User,
  Star,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  created_at: string;
}

export const NotificationFeedReal: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    if (pessoa) {
      loadNotifications();
    }
  }, [pessoa]);

  const loadNotifications = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);

      // Carregar notificações do ensino
      const { data: ensinoNotifications, error: ensinoError } = await supabase
        .from('notificacoes_ensino')
        .select('*')
        .eq('destinatario_id', pessoa.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ensinoError && ensinoError.code !== 'PGRST116') {
        console.error('Erro ao carregar notificações de ensino:', ensinoError);
      }

      // Carregar notificações gerais do usuário
      const { data: userNotifications, error: userError } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', pessoa.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (userError && userError.code !== 'PGRST116') {
        console.error('Erro ao carregar notificações do usuário:', userError);
      }

      // Combinar e formatar notificações
      const combinedNotifications: Notification[] = [
        ...(ensinoNotifications || []).map(n => ({
          id: n.id,
          titulo: n.titulo,
          mensagem: n.mensagem,
          tipo: n.tipo,
          lida: n.lida || false,
          created_at: n.created_at
        })),
        ...(userNotifications || []).map(n => ({
          id: n.id,
          titulo: n.title,
          mensagem: n.message,
          tipo: n.type,
          lida: n.read || false,
          created_at: n.created_at
        }))
      ];

      // Ordenar por data
      combinedNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(combinedNotifications.slice(0, 15));

    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      // Dados simulados em caso de erro
      setNotifications([
        {
          id: '1',
          titulo: 'Nova conquista desbloqueada!',
          mensagem: 'Você ganhou a medalha "Estudante Dedicado" por completar 5 aulas seguidas.',
          tipo: 'achievement',
          lida: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          titulo: 'Novo módulo disponível',
          mensagem: 'O módulo "Comunicação Assertiva" do curso de Liderança Cristã já está disponível.',
          tipo: 'course',
          lida: false,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          titulo: 'Parabéns!',
          mensagem: 'Você concluiu o módulo "Fundamentos Bíblicos" com 95% de aproveitamento.',
          tipo: 'completion',
          lida: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Tenta atualizar na tabela de notificações do ensino
      await supabase
        .from('notificacoes_ensino')
        .update({ lida: true, data_leitura: new Date().toISOString() })
        .eq('id', notificationId);

      // Tenta atualizar na tabela de notificações do usuário
      await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      // Atualizar estado local
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, lida: true } : notif
      ));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
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

  const getNotificationStyle = (notification: Notification) => {
    if (!notification.lida) {
      return 'border-l-4 border-l-primary bg-primary/5';
    }
    return 'border-l-4 border-l-transparent';
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

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
          <p className="text-muted-foreground">
            Você está em dia! Quando houver novidades, elas aparecerão aqui.
          </p>
        </div>
      ) : (
        notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.tipo);
          return (
            <div 
              key={notification.id} 
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-kerigma cursor-pointer ${getNotificationStyle(notification)}`}
              onClick={() => !notification.lida && markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                {/* Ícone */}
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${getIconColor(notification.tipo)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${!notification.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.titulo}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.mensagem}
                      </p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-2 ml-2">
                      {!notification.lida && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Botão Ver Todas */}
      {notifications.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            Ver todas as notificações
          </Button>
        </div>
      )}
    </div>
  );
};