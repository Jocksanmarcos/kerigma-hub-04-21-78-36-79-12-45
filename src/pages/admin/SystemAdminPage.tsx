import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Zap, Shield, Settings, TrendingUp } from 'lucide-react';
import BackupManager from '@/components/backup/BackupManager';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import NotificationSettings from '@/components/notifications/NotificationSettings';

const SystemAdminPage: React.FC = () => {
  const [systemStatus] = useState({
    overall: 'healthy',
    uptime: '99.9%',
    lastBackup: '2 horas atrás',
    activeUsers: 245,
    performance: 'excellent'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Administração do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie backup, performance, notificações e monitoramento do sistema
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          {getStatusIcon(systemStatus.overall)}
          Sistema {systemStatus.overall === 'healthy' ? 'Saudável' : 'Com problemas'}
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.uptime}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.lastBackup}</div>
            <p className="text-xs text-muted-foreground">Automático diário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemStatus.performance)}`}>
              {systemStatus.performance === 'excellent' ? 'Excelente' : 'Normal'}
            </div>
            <p className="text-xs text-muted-foreground">Tempo de resposta médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert para produção */}
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema em Desenvolvimento:</strong> Algumas funcionalidades estão em modo de simulação. 
          Configure o Sentry DSN para monitoramento completo em produção.
        </AlertDescription>
      </Alert>

      {/* Tabs com funcionalidades */}
      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup">Backup & Segurança</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          <BackupManager />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default SystemAdminPage;