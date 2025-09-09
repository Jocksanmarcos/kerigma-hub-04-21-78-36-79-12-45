import React from 'react';
import { useUserRole, UserRole } from '@/hooks/useRole';
import { ResponsiveDashboardGrid } from '@/components/ui/responsive-dashboard-grid';
import { EnhancedCard, StatsCard, ActionCard } from '@/components/ui/enhanced-card';
import { DashboardCardSkeleton } from '@/components/ui/skeleton-loader';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Settings, 
  BarChart3,
  Heart,
  Church,
  UserCheck,
  Music
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DashboardCardData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action: () => void;
  actionText: string;
  stats?: {
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  };
}

const RoleDashboard: React.FC = () => {
  const { data: userRole, isLoading: loading } = useUserRole();

  const pastorCards: DashboardCardData[] = [
    {
      id: 'financeiro',
      title: 'Gestão Financeira',
      description: 'Controle de dízimos, ofertas e relatórios financeiros',
      icon: CreditCard,
      action: () => window.location.href = '/dashboard/financeiro',
      actionText: 'Ver Finanças',
      stats: { value: 'R$ 45.230', change: '+12%', trend: 'up' }
    },
    {
      id: 'governanca',
      title: 'Centro de Governança',
      description: 'Gestão de permissões, auditoria e segurança',
      icon: Settings,
      action: () => window.location.href = '/admin/governance',
      actionText: 'Acessar Governança'
    },
    {
      id: 'celulas',
      title: 'Células em Foco',
      description: 'Acompanhe o crescimento e saúde das células',
      icon: Users,
      action: () => window.location.href = '/admin/celulas',
      actionText: 'Ver Células',
      stats: { value: '24 ativas', change: '+3', trend: 'up' }
    },
    {
      id: 'eventos',
      title: 'Grandes Eventos',
      description: 'Planejamento e gestão de eventos da igreja',
      icon: Calendar,
      action: () => window.location.href = '/dashboard/eventos',
      actionText: 'Gerenciar Eventos'
    }
  ];

  const liderCards: DashboardCardData[] = [
    {
      id: 'celula',
      title: 'Minha Célula',
      description: 'Gerencie sua célula e acompanhe o crescimento',
      icon: Heart,
      action: () => window.location.href = '/dashboard/celula',
      actionText: 'Ver Célula',
      stats: { value: '12 membros', change: '+2', trend: 'up' }
    },
    {
      id: 'ensino',
      title: 'Materiais de Ensino',
      description: 'Acesse estudos e materiais para sua célula',
      icon: BookOpen,
      action: () => window.location.href = '/ensino',
      actionText: 'Ver Materiais'
    },
    {
      id: 'agenda',
      title: 'Minha Agenda',
      description: 'Compromissos e reuniões da célula',
      icon: Calendar,
      action: () => window.location.href = '/dashboard/agenda',
      actionText: 'Ver Agenda'
    }
  ];

  const membroCards: DashboardCardData[] = [
    {
      id: 'proximos-eventos',
      title: 'Próximos Eventos',
      description: 'Não perca os eventos da igreja',
      icon: Church,
      action: () => window.location.href = '/eventos',
      actionText: 'Ver Eventos'
    },
    {
      id: 'ensaios',
      title: 'Últimos Ensaios',
      description: 'Acompanhe os ensaios do ministério de louvor',
      icon: Music,
      action: () => window.location.href = '/dashboard/louvor',
      actionText: 'Ver Ensaios'
    }
  ];

  const getRoleCards = (): DashboardCardData[] => {
    switch (userRole) {
      case 'admin':
        return pastorCards;
      case 'moderator':
        return liderCards;
      case 'user':
      default:
        return membroCards;
    }
  };

  const getRoleVariant = (): 'pastor' | 'lider' | 'membro' => {
    switch (userRole) {
      case 'admin':
        return 'pastor';
      case 'moderator':
        return 'lider';
      case 'user':
      default:
        return 'membro';
    }
  };

  if (loading) {
    return (
      <ResponsiveDashboardGrid variant="pastor">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </ResponsiveDashboardGrid>
    );
  }

  const cards = getRoleCards();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-responsive-3xl font-bold text-foreground mb-2">
          Kerigma Hub
        </h1>
        <p className="text-responsive-lg text-muted-foreground">
          Bem-vindo ao seu painel personalizado
        </p>
      </div>

      <ResponsiveDashboardGrid variant={getRoleVariant()}>
        {cards.map((card) => (
          <div key={card.id} className="h-full">
            {card.stats ? (
              <StatsCard
                title={card.title}
                value={card.stats.value}
                change={card.stats.change}
                trend={card.stats.trend}
                icon={card.icon}
                className="h-full interactive-element"
              />
            ) : (
              <ActionCard
                title={card.title}
                description={card.description}
                actionText={card.actionText}
                onAction={card.action}
                icon={card.icon}
                variant="default"
                className="h-full"
              />
            )}
          </div>
        ))}
      </ResponsiveDashboardGrid>

      {/* Quick Stats for Pastors */}
      {userRole === 'admin' && (
        <div className="mt-8">
          <h2 className="text-responsive-xl font-semibold mb-4">KPIs Rápidos</h2>
          <ResponsiveDashboardGrid variant="pastor">
            <StatsCard
              title="Membros Ativos"
              value="342"
              change="+8 este mês"
              trend="up"
              icon={UserCheck}
            />
            <StatsCard
              title="Crescimento Células"
              value="24"
              change="+3 novas"
              trend="up"
              icon={BarChart3}
            />
            <StatsCard
              title="Frequência Cultos"
              value="89%"
              change="+5%"
              trend="up"
              icon={Church}
            />
            <StatsCard
              title="Arrecadação Mensal"
              value="R$ 45.230"
              change="+12%"
              trend="up"
              icon={CreditCard}
            />
          </ResponsiveDashboardGrid>
        </div>
      )}
    </div>
  );
};

export default RoleDashboard;