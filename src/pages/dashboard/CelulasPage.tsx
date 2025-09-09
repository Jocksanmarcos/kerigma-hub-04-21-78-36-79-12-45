import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CentroComandoCelulas } from "@/components/celulas/CentroComandoCelulas";
import { DashboardLiderCelula } from "@/components/celulas/dashboards/DashboardLiderCelula";
import { useNewUserRole } from '@/hooks/useNewRole';
import { useIsLiderCelula } from '@/hooks/useIsLiderCelula';
import { Helmet } from 'react-helmet-async';

const CelulasPage: React.FC = () => {
  const { data: userRole } = useNewUserRole();
  const { data: isLiderCelula, isLoading: loadingLiderCelula } = useIsLiderCelula();

  // Se for líder de célula específico, mostrar dashboard específico
  if (userRole === 'lider' && isLiderCelula && !loadingLiderCelula) {
    return (
      <>
        <Helmet>
          <title>Minha Célula | CBN Kerigma</title>
          <meta name="description" content="Gerencie sua célula e acompanhe o crescimento dos membros" />
        </Helmet>
        <AppLayout>
          <DashboardLiderCelula />
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Células | CBN Kerigma</title>
        <meta name="description" content="Gerencie as células da igreja e acompanhe o crescimento espiritual da comunidade" />
      </Helmet>
      <AppLayout>
        <div className="w-full space-y-6 overflow-x-hidden">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Células</h1>
            <p className="text-muted-foreground">
              Gerencie as células da igreja e acompanhe o crescimento
            </p>
          </div>
          
          <CentroComandoCelulas />
        </div>
      </AppLayout>
    </>
  );
};

export default CelulasPage;