import React from 'react';
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
  Star
} from 'lucide-react';

export const NotificationFeed: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'achievement',
      title: 'Nova conquista desbloqueada!',
      description: 'Você ganhou a medalha "Estudante Dedicado" por completar 5 aulas seguidas.',
      icon: Trophy,
      iconColor: 'text-warning',
      timestamp: '2 horas atrás',
      read: false
    },
    {
      id: 2,
      type: 'course',
      title: 'Novo módulo disponível',
      description: 'O módulo "Comunicação Assertiva" do curso de Liderança Cristã já está disponível.',
      icon: BookOpen,
      iconColor: 'text-primary',
      timestamp: '5 horas atrás',
      read: false
    },
    {
      id: 3,
      type: 'message',
      title: 'Mensagem do tutor',
      description: 'Pastor João comentou na sua atividade do curso de Evangelismo Pessoal.',
      icon: MessageSquare,
      iconColor: 'text-info',
      timestamp: '1 dia atrás',
      read: true,
      avatar: '/avatars/pastor-joao.jpg'
    },
    {
      id: 4,
      type: 'deadline',
      title: 'Prazo se aproximando',
      description: 'A atividade "Plano de Evangelização" vence em 2 dias.',
      icon: Clock,
      iconColor: 'text-error',
      timestamp: '1 dia atrás',
      read: true,
      urgent: true
    },
    {
      id: 5,
      type: 'event',
      title: 'Evento ao vivo',
      description: 'Webinar "Discipulado na Era Digital" acontece amanhã às 19h.',
      icon: Calendar,
      iconColor: 'text-success',
      timestamp: '2 dias atrás',
      read: true
    },
    {
      id: 6,
      type: 'completion',
      title: 'Parabéns!',
      description: 'Você concluiu o módulo "Fundamentos Bíblicos" com 95% de aproveitamento.',
      icon: CheckCircle,
      iconColor: 'text-success',
      timestamp: '3 dias atrás',
      read: true
    }
  ];

  const getNotificationStyle = (notification: any) => {
    if (notification.urgent) {
      return 'border-l-4 border-l-error bg-error/5';
    }
    if (!notification.read) {
      return 'border-l-4 border-l-primary bg-primary/5';
    }
    return 'border-l-4 border-l-transparent';
  };

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const Icon = notification.icon;
        return (
          <div 
            key={notification.id} 
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-kerigma ${getNotificationStyle(notification)}`}
          >
            <div className="flex items-start gap-3">
              {/* Ícone ou Avatar */}
              <div className="flex-shrink-0">
                {notification.avatar ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notification.avatar} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${notification.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.description}
                    </p>
                  </div>
                  
                  {/* Badges e Status */}
                  <div className="flex items-center gap-2 ml-2">
                    {notification.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                    )}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Timestamp e Ações */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {notification.timestamp}
                  </span>
                  
                  {notification.type === 'message' && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      Responder
                    </Button>
                  )}
                  {notification.type === 'course' && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      Acessar
                    </Button>
                  )}
                  {notification.type === 'deadline' && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver Atividade
                    </Button>
                  )}
                  {notification.type === 'event' && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      Inscrever-se
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Botão Ver Todas */}
      <div className="text-center pt-4">
        <Button variant="outline" size="sm">
          Ver todas as notificações
        </Button>
      </div>
    </div>
  );
};