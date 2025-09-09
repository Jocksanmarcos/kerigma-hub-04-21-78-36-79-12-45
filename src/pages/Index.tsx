import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import RoleDashboard from '@/components/dashboard/RoleDashboard';

const Index = () => {
  return (
    <AppLayout>
      <div className="content-focus space-y-8 py-6">
        <RoleDashboard />
      </div>
    </AppLayout>
  );
};

export default Index;
