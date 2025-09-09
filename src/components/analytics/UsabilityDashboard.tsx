import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  Users, 
  MousePointer, 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download
} from 'lucide-react';
import { useUsabilityAnalytics } from '@/hooks/useUsabilityAnalytics';

interface UsabilityDashboardProps {
  onExportData?: () => void;
}

export const UsabilityDashboard: React.FC<UsabilityDashboardProps> = ({
  onExportData
}) => {
  const { metrics } = useUsabilityAnalytics();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Processar dados para gráficos
  const processPageViewsData = () => {
    return Object.entries(metrics.pageViews).map(([page, views]) => ({
      page: page.replace('/', '') || 'Home',
      views,
      avgTime: Math.round((metrics.timeOnPage[page]?.reduce((a, b) => a + b, 0) || 0) / (metrics.timeOnPage[page]?.length || 1))
    }));
  };

  const processErrorClicksData = () => {
    return Object.entries(metrics.errorClicks).map(([element, clicks]) => ({
      element: element.substring(0, 20) + '...',
      clicks,
      severity: clicks > 10 ? 'high' : clicks > 5 ? 'medium' : 'low'
    }));
  };

  const calculateAverageRating = (module: string) => {
    const ratings = metrics.feedbackRatings[module] || [];
    return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  };

  const getTopIssues = () => {
    const issues = [];
    
    // Páginas com alta taxa de rejeição (tempo < 30s)
    Object.entries(metrics.timeOnPage).forEach(([page, times]) => {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime < 30 && times.length > 5) {
        issues.push({
          type: 'bounce_rate',
          page,
          severity: 'high',
          description: `Alta taxa de rejeição em ${page}`,
          metric: `${Math.round(avgTime)}s tempo médio`
        });
      }
    });

    // Elementos com muitos erros
    Object.entries(metrics.errorClicks).forEach(([element, clicks]) => {
      if (clicks > 5) {
        issues.push({
          type: 'error_clicks',
          element,
          severity: clicks > 10 ? 'high' : 'medium',
          description: `Muitos cliques incorretos em ${element}`,
          metric: `${clicks} cliques`
        });
      }
    });

    return issues.slice(0, 5);
  };

  const userProfileColors = {
    jovem: '#e879f9',
    adulto: '#3b82f6',
    idoso: '#10b981',
    auto: '#6b7280'
  };

  const pageViewsData = processPageViewsData();
  const errorClicksData = processErrorClicksData();
  const topIssues = getTopIssues();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard de Usabilidade</h2>
          <p className="text-muted-foreground">
            Análise de comportamento do usuário e métricas de experiência
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportData} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Métricas Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Páginas Visitadas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics.pageViews).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de visualizações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                Object.values(metrics.timeOnPage)
                  .flat()
                  .reduce((a, b) => a + b, 0) / Math.max(Object.values(metrics.timeOnPage).flat().length, 1)
              )}s
            </div>
            <p className="text-xs text-muted-foreground">
              Por página
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques Incorretos</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics.errorClicks).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de erros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfil de Usuário</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: userProfileColors[metrics.userProfile] }}
              />
              <span className="text-sm font-medium capitalize">
                {metrics.userProfile}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Configuração ativa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Problemas Principais */}
      {topIssues.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Problemas Identificados
            </CardTitle>
            <CardDescription>
              Questões que precisam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topIssues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={issue.severity === 'high' ? 'destructive' : 'secondary'}
                    >
                      {issue.severity === 'high' ? 'Alto' : 'Médio'}
                    </Badge>
                    <div>
                      <div className="font-medium">{issue.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {issue.metric}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Investigar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análises Detalhadas */}
      <Tabs defaultValue="pageviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pageviews">Páginas</TabsTrigger>
          <TabsTrigger value="errors">Erros</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="pageviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações por Página</CardTitle>
              <CardDescription>
                Páginas mais visitadas e tempo médio de permanência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tempo por Página</CardTitle>
              <CardDescription>
                Tempo médio de permanência em segundos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pageViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cliques Incorretos por Elemento</CardTitle>
              <CardDescription>
                Elementos que recebem cliques incorretos frequentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorClicksData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="element" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(metrics.feedbackRatings).map(([module, ratings]) => (
              <Card key={module}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{module}</CardTitle>
                  <CardDescription>
                    {ratings.length} avaliações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold">
                      {calculateAverageRating(module).toFixed(1)}
                    </div>
                    <div className="flex-1">
                      <Progress 
                        value={(calculateAverageRating(module) / 5) * 100}
                        className="h-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        de 5.0 estrelas
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recursos de Acessibilidade</CardTitle>
                <CardDescription>
                  Funcionalidades utilizadas pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.accessibilityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="capitalize">{feature.replace('_', ' ')}</span>
                    </div>
                  ))}
                  {metrics.accessibilityFeatures.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Nenhum recurso de acessibilidade ativo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Perfil do Usuário</CardTitle>
                <CardDescription>
                  Configuração atual de acessibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Tipo de usuário:</span>
                    <Badge 
                      style={{ 
                        backgroundColor: userProfileColors[metrics.userProfile],
                        color: 'white'
                      }}
                    >
                      {metrics.userProfile}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Última atualização: {new Date(metrics.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};