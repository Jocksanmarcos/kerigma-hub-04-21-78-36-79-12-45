import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ContentManagement } from '@/components/admin/content/ContentManagement';
import { NewRoleGuard } from '@/components/auth/NewRoleGuard';

const ContentManagementPage: React.FC = () => {
  return (
    <NewRoleGuard requiredRole="pastor">
      <AppLayout>
        <ContentManagement />
      </AppLayout>
    </NewRoleGuard>
  );
};

export default ContentManagementPage;