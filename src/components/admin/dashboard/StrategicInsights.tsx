import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb,
  TrendingUp,
  Award,
  Target,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'success' | 'opportunity' | 'warning';
  title: string;
  description: string;
  icon: typeof Award;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

interface StrategicInsightsProps {
  onSaveConfiguration?: () => void;
}

export const StrategicInsights: React.FC<StrategicInsightsProps> = ({ 
  onSaveConfiguration 
}) => {
  const insights: Insight[] = [
    {
      id: '1',
      type: 'success',
      title: 'Excelente Crescimento',
      description: 'O engajamento dos membros aumentou 15% este mês. Continue com as estratégias atuais.',
      icon: Award,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Oportunidade de Melhoria',
      description: 'Considere implementar mais eventos online para alcançar novos públicos.',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const metrics = [
    {
      label: 'Taxa de Crescimento Mensal',
      value: '15%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Engajamento em Eventos',
      value: '78%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Frequência Média',
      value: '2.3x/semana',
      trend: 'stable',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="border-l-4 border-l-primary/60">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {metric.label}
                    </p>
                    <p className="text-lg font-bold">{metric.value}</p>
                  </div>
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights Estratégicos */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Insights Estratégicos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análises inteligentes para otimizar a gestão da igreja
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${insight.borderColor} ${insight.bgColor}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-white/80`}>
                    <Icon className={`h-4 w-4 ${insight.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {insight.description}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      insight.type === 'success' 
                        ? 'border-green-200 text-green-700 bg-green-50'
                        : insight.type === 'opportunity'
                        ? 'border-purple-200 text-purple-700 bg-purple-50'
                        : 'border-yellow-200 text-yellow-700 bg-yellow-50'
                    }`}
                  >
                    {insight.type === 'success' ? 'Sucesso' : 
                     insight.type === 'opportunity' ? 'Oportunidade' : 'Atenção'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Próximos Passos Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Implementar sistema de feedback pós-eventos</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Criar programa de mentoria para novos membros</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Revisar estratégia de comunicação digital</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button 
              onClick={onSaveConfiguration}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};