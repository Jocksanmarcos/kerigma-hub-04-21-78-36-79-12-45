import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Users, Heart, Target, ArrowUp, ArrowDown } from 'lucide-react';

export const DashboardAnalytics: React.FC = () => {
  // Dados mockados para demonstração
  const crescimentoMensal = [
    { mes: 'Jan', membros: 120, visitantes: 45, batismos: 8 },
    { mes: 'Fev', membros: 135, visitantes: 52, batismos: 12 },
    { mes: 'Mar', membros: 142, visitantes: 38, batismos: 15 },
    { mes: 'Abr', membros: 158, visitantes: 67, batismos: 18 },
    { mes: 'Mai', membros: 174, visitantes: 71, batismos: 22 },
    { mes: 'Jun', membros: 189, visitantes: 58, batismos: 19 }
  ];

  const engajamentoPorIdade = [
    { faixa: '13-17', participacao: 85, total: 32 },
    { faixa: '18-25', participacao: 72, total: 58 },
    { faixa: '26-35', participacao: 89, total: 74 },
    { faixa: '36-50', participacao: 91, total: 96 },
    { faixa: '51+', participacao: 78, total: 43 }
  ];

  const ministeriosAtivos = [
    { name: 'Louvor', value: 24, color: '#8884d8' },
    { name: 'Ensino', value: 18, color: '#82ca9d' },
    { name: 'Acolhimento', value: 32, color: '#ffc658' },
    { name: 'Ação Social', value: 15, color: '#ff7300' },
    { name: 'Outros', value: 11, color: '#00ff87' }
  ];

  const estatisticasGerais = {
    membrosAtivos: 189,
    crescimentoMes: 8.3,
    taxaRetencao: 94.2,
    engajamentoMedio: 87.5,
    discipulandoAtivo: 67,
    novosConvertidos: 22
  };

  return (
    <div className="space-y-6">

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasGerais.membrosAtivos}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +{estatisticasGerais.crescimentoMes}% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Retenção</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasGerais.taxaRetencao}%</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +2.1% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasGerais.engajamentoMedio}%</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +5.2% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Discipulado</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasGerais.discipulandoAtivo}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +12% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasGerais.novosConvertidos}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +18% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{estatisticasGerais.crescimentoMes}%</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              Acima da meta
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crescimento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
            <CardDescription>
              Evolução de membros, visitantes e batismos nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crescimentoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="membros" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="visitantes" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="batismos" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engajamento por Faixa Etária */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento por Faixa Etária</CardTitle>
            <CardDescription>
              Percentual de participação nas atividades da igreja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engajamentoPorIdade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faixa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participacao" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Ministérios */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Ministérios</CardTitle>
            <CardDescription>
              Pessoas ativas em cada ministério da igreja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ministeriosAtivos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ministeriosAtivos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métricas Detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Retenção</CardTitle>
            <CardDescription>
              Indicadores de saúde ministerial e permanência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Frequência Cultos</span>
                <span className="text-sm">91%</span>
              </div>
              <Progress value={91} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Participação Células</span>
                <span className="text-sm">78%</span>
              </div>
              <Progress value={78} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Envolvimento Ministérios</span>
                <span className="text-sm">65%</span>
              </div>
              <Progress value={65} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Contribuição Regular</span>
                <span className="text-sm">84%</span>
              </div>
              <Progress value={84} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Crescimento Acelerado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O crescimento está 23% acima da meta mensal. Considere expandir as estruturas de discipulado.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-yellow-500" />
              <span>Atenção: Jovens</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Engajamento da faixa 18-25 anos está abaixo da média. Revisar estratégias para jovens adultos.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Heart className="h-5 w-5 text-blue-500" />
              <span>Oportunidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              67 pessoas em discipulado ativo. Momento ideal para lançar novos grupos de estudo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};