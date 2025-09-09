import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Clock, BookOpen, PlayCircle, CheckCircle } from 'lucide-react';

interface PlanoDeLeitura {
  id: string;
  titulo: string;
  descricao: string;
  duracao_dias: number;
  categoria: string;
  progresso?: number;
  iniciado?: boolean;
  concluido?: boolean;
}

const planosDisponiveis: PlanoDeLeitura[] = [
  {
    id: '1',
    titulo: 'A Vida de Cristo em 40 Dias',
    descricao: 'Acompanhe a jornada de Jesus desde o nascimento até a ressurreição',
    duracao_dias: 40,
    categoria: 'Evangelhos',
  },
  {
    id: '2',
    titulo: 'Sabedoria de Provérbios',
    descricao: 'Um provérbio por dia para aplicar na vida prática',
    duracao_dias: 31,
    categoria: 'Sabedoria',
  },
  {
    id: '3',
    titulo: 'Salmos de Louvor',
    descricao: 'Fortaleça sua vida devocional com os salmos mais conhecidos',
    duracao_dias: 21,
    categoria: 'Adoração',
  },
  {
    id: '4',
    titulo: 'Cartas de Paulo',
    descricao: 'Estude as principais epístolas paulinas',
    duracao_dias: 60,
    categoria: 'Doutrina',
  },
  {
    id: '5',
    titulo: 'Histórias do Antigo Testamento',
    descricao: 'Grandes narrativas que ensinam sobre fé e obediência',
    duracao_dias: 50,
    categoria: 'História',
  },
  {
    id: '6',
    titulo: 'Profetas e Esperança',
    descricao: 'Compreenda as profecias e promessas de Deus',
    duracao_dias: 35,
    categoria: 'Profecias',
  },
];

export const PlanosDeLeitura: React.FC = () => {
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null);
  const [planosAtivos, setPlanosAtivos] = useState<string[]>(['1']); // Simular plano ativo

  const iniciarPlano = (planoId: string) => {
    setPlanosAtivos([...planosAtivos, planoId]);
    setPlanoSelecionado(null);
  };

  const getProgressoPlano = (planoId: string) => {
    // Simular progresso (em um app real, viria do backend)
    if (planoId === '1') return 65;
    return 0;
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Evangelhos': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Sabedoria': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Adoração': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Doutrina': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'História': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Profecias': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Planos Ativos */}
      {planosAtivos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            Meus Planos Ativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planosDisponiveis
              .filter(plano => planosAtivos.includes(plano.id))
              .map((plano) => {
                const progresso = getProgressoPlano(plano.id);
                return (
                  <Card key={plano.id} className="border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plano.titulo}</CardTitle>
                          <Badge className={getCategoriaColor(plano.categoria)}>
                            {plano.categoria}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{progresso}%</p>
                          <p className="text-xs text-muted-foreground">concluído</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Progress value={progresso} className="h-2" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Dia {Math.ceil((progresso / 100) * plano.duracao_dias)} de {plano.duracao_dias}
                        </div>
                        <Button size="sm">Continuar Leitura</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Planos Disponíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planosDisponiveis
            .filter(plano => !planosAtivos.includes(plano.id))
            .map((plano) => (
              <Card key={plano.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <Badge className={getCategoriaColor(plano.categoria)}>
                      {plano.categoria}
                    </Badge>
                    <CardTitle className="text-lg">{plano.titulo}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plano.descricao}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {plano.duracao_dias} dias
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      Plano Temático
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => iniciarPlano(plano.id)}
                    className="w-full"
                    size="sm"
                  >
                    Iniciar Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Em Breve */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Mais Planos em Breve</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Estamos preparando novos planos de leitura temáticos para enriquecer 
            ainda mais sua jornada de estudo bíblico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};