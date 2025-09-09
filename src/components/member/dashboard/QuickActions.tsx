import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Calendar, 
  Users, 
  GraduationCap,
  DollarSign,
  MessageCircle,
  BookOpen,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  userRole?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
      const navigate = useNavigate();

      const quickActions = [
        {
          icon: DollarSign,
          title: 'Contribuir',
          description: 'Fazer uma oferta',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10 hover:bg-secondary/20',
          borderColor: 'border-secondary/20',
          action: () => navigate('/semear')
        },
        {
          icon: Calendar,
          title: 'Agenda',
          description: 'Próximos eventos',
          color: 'text-primary',
          bgColor: 'bg-primary/10 hover:bg-primary/20',
          borderColor: 'border-primary/20',
          action: () => navigate('/membro/comunidade')
        },
        {
          icon: Users,
          title: 'Minha Célula',
          description: 'Vida em comunidade',
          color: 'text-primary',
          bgColor: 'bg-primary/10 hover:bg-primary/20',
          borderColor: 'border-primary/20',
          action: () => navigate('/membro/comunidade')
        },
        {
          icon: GraduationCap,
          title: 'Portal do Aluno',
          description: 'Cursos e ensino',
          color: 'text-primary',
          bgColor: 'bg-primary/10 hover:bg-primary/20',
          borderColor: 'border-primary/20',
          action: () => navigate('/membro/portal-aluno')
        },
        {
          icon: Bell,
          title: 'Comunicados',
          description: 'Notícias importantes',
          color: 'text-primary',
          bgColor: 'bg-primary/10 hover:bg-primary/20',
          borderColor: 'border-primary/20',
          action: () => navigate('/membro/comunidade')
        },
        {
          icon: BookOpen,
          title: 'Inscrições',
          description: 'Meus eventos e cursos',
          color: 'text-primary',
          bgColor: 'bg-primary/10 hover:bg-primary/20',
          borderColor: 'border-primary/20',
          action: () => navigate('/membro/comunidade')
        },
        {
          icon: Heart,
          title: 'Aconselhamento',
          description: 'Cuidado pastoral',
          color: 'text-primary',
          bgColor: 'bg-primary/10 hover:bg-primary/20',
          borderColor: 'border-primary/20',
          action: () => navigate('/aconselhamento')
        },
        {
          icon: MessageCircle,
          title: 'Suporte',
          description: 'Precisa de ajuda?',
          color: 'text-primary',
          bgColor: 'bg-primary/10 hover:bg-primary/20',
          borderColor: 'border-primary/20',
          action: () => navigate('/suporte')
        }
      ];

  return (
    <Card className="shadow-kerigma">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Atalhos Rápidos</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <Button
                key={index}
                variant="outline"
                className={`
                  h-20 flex-col gap-1 p-3 transition-all duration-200
                  ${action.bgColor} ${action.borderColor}
                  hover:shadow-kerigma-md hover:scale-105
                `}
                onClick={action.action}
              >
                <IconComponent className={`h-6 w-6 ${action.color}`} />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.title}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};