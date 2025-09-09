import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Calendar, 
  Users, 
  GraduationCap,
  Wallet,
  MessageSquare,
  BookOpen,
  Church
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsGridProps {
  userRole?: string;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ userRole }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Contribuir',
      description: 'Dízimos e Ofertas',
      icon: Heart,
      color: 'bg-red-500/10 text-red-600 border-red-500/20',
      onClick: () => navigate('/semear'),
      show: true
    },
    {
      title: 'Agenda',
      description: 'Eventos e Cultos',
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      onClick: () => navigate('/dashboard/agenda'),
      show: true
    },
    {
      title: 'Minha Célula',
      description: 'Vida em Comunidade',
      icon: Users,
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      onClick: () => navigate('/dashboard/celulas'),
      show: true
    },
    {
      title: 'Portal do Aluno',
      description: 'Cursos e Ensino',
      icon: GraduationCap,
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      onClick: () => navigate('/portal-aluno'),
      show: true
    },
    {
      title: 'Biblioteca',
      description: 'Livros e Recursos',
      icon: BookOpen,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      onClick: () => navigate('/dashboard/biblioteca'),
      show: true
    },
    {
      title: 'Aconselhamento',
      description: 'Apoio Pastoral',
      icon: MessageSquare,
      color: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
      onClick: () => navigate('/dashboard/aconselhamento'),
      show: true
    },
    {
      title: 'Contribuições',
      description: 'Meu Histórico',
      icon: Wallet,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      onClick: () => navigate('/dashboard/financeiro'),
      show: userRole === 'pastor'
    },
    {
      title: 'Ministérios',
      description: 'Servir na Igreja',
      icon: Church,
      color: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
      onClick: () => navigate('/dashboard/escalas'),
      show: userRole === 'pastor' || userRole === 'lider'
    }
  ];

  const visibleActions = actions.filter(action => action.show);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        Ações Rápidas
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {visibleActions.map((action, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer hover:shadow-md transition-all duration-200 border ${action.color}`}
            onClick={action.onClick}
          >
            <CardContent className="p-4 text-center space-y-3">
              <div className="flex justify-center">
                <action.icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};