import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Eye, Settings } from 'lucide-react';
import { SecurityDashboard } from './SecurityDashboard';
import { ProfilesPermissions } from './ProfilesPermissions';
import { UsersAccess } from './UsersAccess';
import { AuditTrail } from './AuditTrail';

export const GovernanceCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Central de Governança de Acesso</h2>
            <p className="text-muted-foreground">
              Sistema RBAC (Role-Based Access Control) + ABAC (Attribute-Based Access Control) implementado conforme blueprint de auditoria
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-muted-foreground">Score de Conformidade</div>
          </div>
        </div>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="dashboard" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-surface-blue shadow-kerigma-md">
          <TabsTrigger value="dashboard" className="flex items-center space-x-3 px-6 py-4">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">Dashboard de Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center space-x-3 px-6 py-4">
            <Settings className="h-5 w-5" />
            <span className="font-semibold">Perfis & Permissões</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-3 px-6 py-4">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Usuários & Acessos</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-3 px-6 py-4">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Trilha de Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <ProfilesPermissions />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersAccess />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
};