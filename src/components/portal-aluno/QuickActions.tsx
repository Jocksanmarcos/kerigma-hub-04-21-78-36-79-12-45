import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  Download, 
  HelpCircle, 
  Video,
  PenTool,
  Clock,
  CheckCircle
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const { toast } = useToast();
  const { pessoa } = useCurrentPerson();

  const handleAction = (actionType: string, actionTitle: string) => {
    switch (actionType) {
      case 'continue':
        toast({
          title: "Redirecionando...",
          description: "Abrindo última aula estudada.",
        });
        // TODO: Implementar navegação para última aula
        break;
      case 'assignment':
        toast({
          title: "Abrindo atividade",
          description: "Carregando plano de evangelização.",
        });
        // TODO: Implementar abertura de atividade
        break;
      case 'live':
        toast({
          title: "Webinar ao vivo",
          description: "Você será notificado quando o webinar começar.",
        });
        // TODO: Implementar notificação de webinar
        break;
      case 'forum':
        toast({
          title: "Fórum de discussões",
          description: "Abrindo fórum de dúvidas.",
        });
        // TODO: Implementar navegação para fórum
        break;
      default:
        toast({
          title: actionTitle,
          description: "Funcionalidade será implementada em breve.",
        });
    }
  };

  const handleSecondaryAction = (title: string) => {
    switch (title) {
      case 'Meu Calendário':
        toast({
          title: "Calendário",
          description: "Abrindo calendário pessoal.",
        });
        break;
      case 'Downloads':
        toast({
          title: "Downloads",
          description: "Acessando material de apoio.",
        });
        break;
      case 'Suporte':
        toast({
          title: "Suporte",
          description: "Redirecionando para central de ajuda.",
        });
        break;
      default:
        toast({
          title: title,
          description: "Funcionalidade será implementada em breve.",
        });
    }
  };

  const handleExploreCourses = () => {
    toast({
      title: "Explorar Cursos",
      description: "Carregando catálogo de cursos...",
    });
    // Rolar para a seção de cursos na mesma página
    const coursesSection = document.querySelector('[data-courses-catalog]');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const quickActions = [
    {
      id: 1,
      title: 'Continuar Última Aula',
      description: 'Liderança Cristã - Módulo 3',
      icon: BookOpen,
      color: 'bg-primary text-primary-foreground',
      action: 'continue',
      urgent: false,
      timeLeft: '25 min restantes'
    },
    {
      id: 2,
      title: 'Atividade Pendente',
      description: 'Plano de Evangelização',
      icon: PenTool,
      color: 'bg-warning text-warning-foreground',
      action: 'assignment',
      urgent: true,
      deadline: 'Vence em 2 dias'
    },
    {
      id: 3,
      title: 'Webinar ao Vivo',
      description: 'Discipulado Digital - Hoje 19h',
      icon: Video,
      color: 'bg-error text-error-foreground',
      action: 'live',
      urgent: false,
      status: 'Ao vivo em 2h'
    },
    {
      id: 4,
      title: 'Tirar Dúvidas',
      description: 'Fórum de discussões',
      icon: MessageSquare,
      color: 'bg-info text-info-foreground',
      action: 'forum',
      urgent: false,
      status: '3 novas respostas'
    }
  ];

  const secondaryActions = [
    {
      title: 'Meu Calendário',
      icon: Calendar,
      description: '2 eventos hoje'
    },
    {
      title: 'Downloads',
      icon: Download,
      description: 'Material de apoio'
    },
    {
      title: 'Suporte',
      icon: HelpCircle,
      description: 'Central de ajuda'
    }
  ];

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'continue': return 'Continuar';
      case 'assignment': return 'Fazer Atividade';
      case 'live': return 'Participar';
      case 'forum': return 'Ver Discussões';
      default: return 'Acessar';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ações Principais */}
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div 
                key={action.id} 
                className="border rounded-lg p-3 hover:shadow-kerigma transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      {action.urgent && (
                        <Badge variant="destructive" className="text-xs ml-2">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {action.timeLeft || action.deadline || action.status}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={() => handleAction(action.action, action.title)}
                      >
                        {getActionLabel(action.action)}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divisor */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3 text-muted-foreground">Acesso Rápido</h4>
          
          {/* Ações Secundárias */}
          <div className="grid grid-cols-1 gap-2">
            {secondaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button 
                  key={index} 
                  variant="ghost" 
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => handleSecondaryAction(action.title)}
                >
                  <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* CTA Principal */}
        <div className="pt-4 border-t">
          <Button 
            className="w-full bg-kerigma-gradient hover:opacity-90"
            onClick={handleExploreCourses}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Explorar Novos Cursos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};