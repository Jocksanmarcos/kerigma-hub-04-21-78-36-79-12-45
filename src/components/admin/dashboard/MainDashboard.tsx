import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp,
  Settings,
  Heart,
  Building2,
  Zap
} from 'lucide-react';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { ActivityFeed } from './ActivityFeed';
import { StrategicInsights } from './StrategicInsights';
import { AccessibilitySettings } from '@/components/admin/accessibility/AccessibilitySettings';
import { YoungUserTheme } from '@/components/admin/accessibility/YoungUserTheme';
import { ProfessionalTheme } from '@/components/admin/accessibility/ProfessionalTheme';
import { useToast } from '@/hooks/use-toast';

interface MainDashboardProps {
  userProfile?: 'admin' | 'young' | 'professional' | 'default';
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ 
  userProfile = 'admin' 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Quick Stats
  const quickStats = [
    {
      title: 'Membros Ativos',
      value: '847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Eventos Hoje',
      value: '3',
      change: '+1',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Projetos Ativos',
      value: '12',
      change: '0%',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Crescimento Mensal',
      value: '15%',
      change: '+3%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const handleSocialShare = (platform: string, content: string) => {
    toast({
      title: "Compartilhamento Iniciado",
      description: `Abrindo ${platform} para compartilhar: "${content}"`
    });
  };

  const handleGamificationAction = (action: string) => {
    toast({
      title: "Ação de Gamificação",
      description: `Executando ação: ${action}`
    });
  };

  const handleReportsAction = () => {
    toast({
      title: "Relatórios",
      description: "Abrindo painel de relatórios detalhados..."
    });
  };

  const handleScheduleAction = () => {
    toast({
      title: "Agendar Reunião",
      description: "Abrindo calendário para agendamento..."
    });
  };

  const handleAnalyticsAction = () => {
    toast({
      title: "Analytics",
      description: "Carregando métricas e indicadores..."
    });
  };

  const renderProfileSpecificContent = () => {
    switch (userProfile) {
      case 'young':
        return (
          <YoungUserTheme 
            onShareToSocial={handleSocialShare}
            onGamificationAction={handleGamificationAction}
          />
        );
      case 'professional':
        return (
          <ProfessionalTheme
            onViewReports={handleReportsAction}
            onScheduleMeeting={handleScheduleAction}
            onViewAnalytics={handleAnalyticsAction}
          />
        );
      case 'admin':
        return (
          <div className="space-y-6">
            <ExecutiveDashboard 
              onViewReports={handleReportsAction}
              onScheduleMeeting={handleScheduleAction}
              onViewAnalytics={handleAnalyticsAction}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <ActivityFeed onViewAllEvents={() => handleGamificationAction('view_events')} />
              <StrategicInsights />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <ActivityFeed onViewAllEvents={() => handleGamificationAction('view_events')} />
            <StrategicInsights />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Principal</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema de gestão da Igreja Evangélica Kerigma
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Perfil: {userProfile === 'admin' ? 'Administrador' : 
                   userProfile === 'young' ? 'Jovem' : 
                   userProfile === 'professional' ? 'Profissional' : 'Padrão'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <Badge 
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Atividades
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Acessibilidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderProfileSpecificContent()}
        </TabsContent>

        <TabsContent value="activities">
          <div className="grid gap-6 md:grid-cols-2">
            <ActivityFeed onViewAllEvents={() => handleGamificationAction('view_events')} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Engajamento Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Participação em Cultos</span>
                    <Badge>85%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Células/Grupos</span>
                    <Badge>67%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eventos Especiais</span>
                    <Badge>92%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Atividades Online</span>
                    <Badge>43%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility">
          <AccessibilitySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};