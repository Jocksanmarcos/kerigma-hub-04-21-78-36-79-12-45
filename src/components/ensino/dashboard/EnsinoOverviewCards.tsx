import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

interface Props {
  matriculasAtivas?: number;
  cursosDisponiveis?: number;
  certificadosObtidos?: number;
  horasEstudadas?: number;
  progressoGeral?: number;
  proximasAulas?: number;
}

const EnsinoOverviewCards: React.FC<Props> = ({
  matriculasAtivas = 0,
  cursosDisponiveis = 0,
  certificadosObtidos = 0,
  horasEstudadas = 0,
  progressoGeral = 0,
  proximasAulas = 0
}) => {
  const cards = [
    {
      title: 'Matrículas Ativas',
      value: matriculasAtivas,
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Cursos Disponíveis',
      value: cursosDisponiveis,
      icon: GraduationCap,
      color: 'text-green-600',
    },
    {
      title: 'Certificados Obtidos',
      value: certificadosObtidos,
      icon: Trophy,
      color: 'text-yellow-600',
    },
    {
      title: 'Horas de Estudo',
      value: `${horasEstudadas}h`,
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: 'Progresso Geral',
      value: `${progressoGeral}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      extra: (
        <div className="mt-2">
          <Progress value={progressoGeral} className="h-2" />
        </div>
      ),
    },
    {
      title: 'Próximas Aulas',
      value: proximasAulas,
      icon: Users,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map(({ title, value, icon: Icon, color, extra }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {extra}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnsinoOverviewCards;