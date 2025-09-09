import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Users, Calendar, Heart, BookOpen } from 'lucide-react';

export const AnaliseEngajamento: React.FC = () => {
  // Dados mockados para demonstração
  const dadosEngajamento = [
    {
      nome: 'Maria Silva',
      pontuacao: 92,
      tendencia: 'alta',
      atividades: {
        cultos: 4,
        celulas: 3,
        estudos: 2,
        servicos: 1
      },
      insights: [
        'Participação consistente nos cultos',
        'Líder ativa em sua célula',
        'Potencial para ministério de ensino'
      ]
    },
    {
      nome: 'João Santos',
      pontuacao: 65,
      tendencia: 'baixa',
      atividades: {
        cultos: 2,
        celulas: 0,
        estudos: 1,
        servicos: 0
      },
      insights: [
        'Frequência irregular nos cultos',
        'Não participa de célula',
        'Necessita de acompanhamento pastoral'
      ]
    },
    {
      nome: 'Ana Costa',
      pontuacao: 78,
      tendencia: 'estavel',
      atividades: {
        cultos: 3,
        celulas: 4,
        estudos: 3,
        servicos: 2
      },
      insights: [
        'Engajamento equilibrado',
        'Ativa na célula',
        'Interesse em crescimento espiritual'
      ]
    }
  ];

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'alta': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'baixa': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'alta': return 'bg-green-500';
      case 'baixa': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getPontuacaoColor = (pontuacao: number) => {
    if (pontuacao >= 80) return 'text-green-500';
    if (pontuacao >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+8% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">cultos/mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Discipulado</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">57% do total</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Análises Individuais */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Individual de Engajamento</CardTitle>
          <CardDescription>
            Insights baseados em IA sobre o engajamento de cada pessoa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dadosEngajamento.map((pessoa, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-kerigma-gradient rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{pessoa.nome}</h3>
                      <div className="flex items-center space-x-2">
                        {getTendenciaIcon(pessoa.tendencia)}
                        <span className="text-sm text-muted-foreground">
                          Tendência {pessoa.tendencia}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getPontuacaoColor(pessoa.pontuacao)}`}>
                      {pessoa.pontuacao}
                    </div>
                    <div className="text-xs text-muted-foreground">pontos</div>
                  </div>
                </div>

                {/* Barras de Atividade */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">Cultos</div>
                    <div className="mt-1">
                      <div className={`h-2 rounded-full ${getTendenciaColor('alta')}`} 
                           style={{ width: `${(pessoa.atividades.cultos / 4) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pessoa.atividades.cultos}/4
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">Células</div>
                    <div className="mt-1">
                      <div className={`h-2 rounded-full ${getTendenciaColor('alta')}`} 
                           style={{ width: `${(pessoa.atividades.celulas / 4) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pessoa.atividades.celulas}/4
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">Estudos</div>
                    <div className="mt-1">
                      <div className={`h-2 rounded-full ${getTendenciaColor('estavel')}`} 
                           style={{ width: `${(pessoa.atividades.estudos / 4) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pessoa.atividades.estudos}/4
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">Serviços</div>
                    <div className="mt-1">
                      <div className={`h-2 rounded-full ${getTendenciaColor('estavel')}`} 
                           style={{ width: `${(pessoa.atividades.servicos / 4) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pessoa.atividades.servicos}/4
                    </div>
                  </div>
                </div>

                {/* Insights da IA */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Insights Pastorais</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pessoa.insights.map((insight, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {insight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};