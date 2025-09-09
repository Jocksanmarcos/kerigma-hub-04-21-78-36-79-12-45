import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemberWelcomeBanner } from '@/components/member/dashboard/MemberWelcomeBanner';
import { NextActivitiesCards } from '@/components/member/dashboard/NextActivitiesCards';
import { QuickActions } from '@/components/member/dashboard/QuickActions';
import { CommunityFeed } from '@/components/member/dashboard/CommunityFeed';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useNewUserRole } from '@/hooks/useNewRole';

const MemberDashboardPage: React.FC = () => {
  const { pessoa, loading: personLoading } = useCurrentPerson();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();

  useEffect(() => {
    document.title = 'Home | Kerigma Hub';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Sua casa digital na Kerigma Hub - Dashboard do membro');
    }
  }, []);

  if (personLoading || roleLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="h-40 bg-muted rounded-lg"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 max-w-6xl mx-auto">
        {/* Banner Principal de Boas-vindas */}
        <MemberWelcomeBanner pessoa={pessoa} userRole={userRole} />
        
        {/* Cards de Próximas Atividades */}
        <NextActivitiesCards pessoa={pessoa} />
        
        {/* Atalhos Rápidos */}
        <QuickActions userRole={userRole} />
        
        {/* Feed da Comunidade */}
        <CommunityFeed />
      </div>
    </AppLayout>
  );
};

export default MemberDashboardPage;