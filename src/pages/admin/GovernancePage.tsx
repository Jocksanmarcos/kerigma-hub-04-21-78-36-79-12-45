import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GovernanceCenter } from '@/components/admin/governance/GovernanceCenter';
import { MemberSettings } from '@/components/settings/MemberSettings';
import { useNewUserRole } from '@/hooks/useNewRole';

const GovernancePage: React.FC = () => {
  const { data: userRole } = useNewUserRole();

  // Membros veem apenas configurações básicas
  if (userRole === 'membro') {
    return (
      <AppLayout>
        <MemberSettings />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Centro de Governança de Acesso</h1>
        <p className="text-muted-foreground">Controle completo de segurança e permissões da plataforma</p>
      </header>
      <GovernanceCenter />
    </AppLayout>
  );
};

export default GovernancePage;