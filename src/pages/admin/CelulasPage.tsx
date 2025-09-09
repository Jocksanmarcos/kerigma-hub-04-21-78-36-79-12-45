import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CentroComandoCelulas } from '@/components/celulas/CentroComandoCelulas';
import { Helmet } from 'react-helmet-async';

const CelulasPage = () => {
  return (
    <>
      <Helmet>
        <title>Centro de Comando de Células | CBN Kerigma</title>
        <meta name="description" content="Gestão inteligente, pastoreio estratégico e multiplicação guiada por IA para células da igreja" />
      </Helmet>
      <AppLayout>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Centro de Comando de Células</h1>
          <p className="text-muted-foreground">Gestão inteligente, pastoreio estratégico e multiplicação guiada por IA</p>
        </header>
        <CentroComandoCelulas />
      </AppLayout>
    </>
  );
};

export default CelulasPage;