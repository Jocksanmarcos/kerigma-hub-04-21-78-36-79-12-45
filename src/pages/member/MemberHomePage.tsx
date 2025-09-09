import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemberWelcomeBanner } from '@/components/member/MemberWelcomeBanner';
import { NextActivityCard } from '@/components/member/NextActivityCard';
import { QuickActionsGrid } from '@/components/member/QuickActionsGrid';
import { CommunityNews } from '@/components/member/CommunityNews';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useNewUserRole } from '@/hooks/useNewRole';

const MemberHomePage: React.FC = () => {
  const { pessoa, loading: personLoading } = useCurrentPerson();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();

  useEffect(() => {
    document.title = 'Home | Kerigma Hub';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Portal do membro - Sua casa digital na Kerigma Hub.');
    }
  }, []);

  if (personLoading || roleLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 max-w-4xl mx-auto">
        {/* Banner de Boas-vindas */}
        <MemberWelcomeBanner pessoa={pessoa} userRole={userRole} />
        
        {/* Próxima Atividade */}
        <NextActivityCard pessoa={pessoa} />
        
        {/* Ações Rápidas */}
        <QuickActionsGrid userRole={userRole} />
        
        {/* Comunicados e Novidades */}
        <CommunityNews />
      </div>
    </AppLayout>
  );
};

export default MemberHomePage;