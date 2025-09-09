import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Award, TrendingUp, Target, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  userProfile: any;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ userProfile }) => {
  const stats = [
    {
      title: 'Cursos Matriculados',
      value: '3',
      icon: BookOpen,
      description: '2 em andamento',
      color: 'bg-primary/10 text-primary',
      trend: '+1 este mês'
    },
    {
      title: 'Horas de Estudo',
      value: '42h',
      icon: Clock,
      description: '8h esta semana',
      color: 'bg-secondary/10 text-secondary',
      trend: '+12h este mês'
    },
    {
      title: 'Conquistas',
      value: '12',
      icon: Award,
      description: '3 este mês',
      color: 'bg-warning/10 text-warning',
      trend: '+3 conquistas'
    },
    {
      title: 'Taxa de Conclusão',
      value: '89%',
      icon: TrendingUp,
      description: 'Acima da média',
      color: 'bg-success/10 text-success',
      trend: '+5% no mês'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-kerigma-md transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};