import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IAPastoralCenter } from '@/components/ia-pastoral/IAPastoralCenter';

const IAPastoralPage: React.FC = () => {
  return (
    <AppLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Centro de IA Pastoral</h1>
        <p className="text-muted-foreground">Inteligência artificial para apoio pastoral e discipulado</p>
      </header>
      <IAPastoralCenter />
    </AppLayout>
  );
};

export default IAPastoralPage;