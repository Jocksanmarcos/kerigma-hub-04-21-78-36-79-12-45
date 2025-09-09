import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from '@/components/ui/enhanced-card';
import { StatsGrid } from '@/components/ui/responsive-grid';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { Users, UserCheck, Crown, Calendar, Home } from 'lucide-react';

export const StatsCards: React.FC = () => {
  // Buscar estatísticas gerais
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [dashboardStats, familiaStats] = await Promise.all([
        supabase.rpc('obter_estatisticas_dashboard'),
        supabase.rpc('obter_estatisticas_familias')
      ]);

      return {
        dashboard: dashboardStats.data?.[0] || {
          total_membros_ativos: 0,
          total_lideres: 0,
          aniversariantes_hoje: 0,
          novos_membros_30_dias: 0
        },
        familias: familiaStats.data?.[0] || {
          total_familias: 0,
          media_membros_por_familia: 0
        }
      };
    }
  });

  const stats = [
    {
      title: 'Membros Ativos',
      value: statsData?.dashboard?.total_membros_ativos || 0,
      change: `${statsData?.dashboard?.novos_membros_30_dias || 0} novos este mês`,
      icon: Users,
      trend: (statsData?.dashboard?.novos_membros_30_dias || 0) > 0 ? 'up' as const : 'neutral' as const,
    },
    {
      title: 'Líderes',
      value: statsData?.dashboard?.total_lideres || 0,
      change: 'Liderança ativa',
      icon: Crown,
      trend: 'neutral' as const,
    },
    {
      title: 'Famílias',
      value: statsData?.familias?.total_familias || 0,
      change: `Média ${statsData?.familias?.media_membros_por_familia || 0} membros/família`,
      icon: Home,
      trend: 'neutral' as const,
    },
    {
      title: 'Aniversariantes Hoje',
      value: statsData?.dashboard?.aniversariantes_hoje || 0,
      change: 'Celebrações do dia',
      icon: Calendar,
      trend: 'neutral' as const,
    },
  ];

  if (isLoading) {
    return (
      <StatsGrid>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonLoader key={index} variant="card" />
        ))}
      </StatsGrid>
    );
  }

  return (
    <StatsGrid>
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value.toString()}
          change={stat.change}
          trend={stat.trend}
          icon={stat.icon}
          className="interactive-element"
        />
      ))}
    </StatsGrid>
  );
};