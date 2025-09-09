import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics';

const AnalyticsPage = () => {
  return (
    <AppLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Analytics</h1>
        <p className="text-muted-foreground">Métricas e insights sobre o crescimento da igreja</p>
      </header>
      <DashboardAnalytics />
    </AppLayout>
  );
};

export default AnalyticsPage;