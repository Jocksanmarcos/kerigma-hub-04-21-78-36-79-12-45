import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Users,
  Calendar,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ExecutiveDashboardProps {
  onViewReports?: () => void;
  onScheduleMeeting?: () => void;
  onViewAnalytics?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onViewReports,
  onScheduleMeeting,
  onViewAnalytics
}) => {
  const kpis = [
    {
      title: 'Membros Ativos',
      value: '847',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Eventos do Mês',
      value: '23',
      change: '+8%',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Projetos Ativos',
      value: '12',
      change: '0%',
      trend: 'stable',
      icon: Target,
      color: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Visualizar relatórios detalhados',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: onViewReports
    },
    {
      id: 'schedule',
      title: 'Agendar Reunião',
      description: 'Organizar encontros e eventos',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      action: onScheduleMeeting
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Métricas e indicadores',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      action: onViewAnalytics
    }
  ];

  const tasks = [
    {
      id: 1,
      title: 'Revisar proposta orçamentária 2024',
      status: 'high',
      category: 'Financeiro',
      dueDate: 'Hoje',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Preparar relatório de membros',
      status: 'medium',
      category: 'Administração',
      dueDate: 'Amanhã',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Planejar evento de evangelização',
      status: 'high',
      category: 'Ministério',
      dueDate: 'Esta semana',
      priority: 'high'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">high</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">medium</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Painel Executivo</h2>
              <p className="text-blue-100">Gestão inteligente e eficiente</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Administrador
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Acesso Total
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full transform -translate-x-16 translate-y-16"></div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <Badge 
                        variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                        className={kpi.trend === 'up' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {kpi.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <BarChart3 className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ferramentas essenciais para gestão eficiente
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`w-full justify-start gap-3 h-16 ${action.bgColor} border-current`}
                  onClick={action.action}
                >
                  <div className="p-2 rounded-lg bg-white/80">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Tarefas em Andamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <FileText className="h-5 w-5" />
              Tarefas em Andamento
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Acompanhe o progresso dos projetos principais
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm flex-1 pr-2">{task.title}</h4>
                  {getPriorityBadge(task.priority)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{task.category}</span>
                  <span>{task.dueDate}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};