import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useBibliotecaStats } from '@/hooks/useBibliotecaStats';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BibliotecaStats = () => {
  const { data: stats, isLoading } = useBibliotecaStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total de Livros',
      value: stats.totalLivros.toString(),
      description: 'Acervo completo',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Livros Disponíveis',
      value: stats.livrosDisponiveis.toString(),
      description: 'Prontos para empréstimo',
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      title: 'Empréstimos Ativos',
      value: stats.emprestimosAtivos.toString(),
      description: 'Livros emprestados',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Empréstimos Atrasados',
      value: stats.emprestimosAtrasados.toString(),
      description: 'Precisam de atenção',
      icon: AlertTriangle,
      color: stats.emprestimosAtrasados > 0 ? 'text-red-600' : 'text-gray-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorias mais populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Categorias Mais Populares
            </CardTitle>
            <CardDescription>
              Categorias com mais livros no acervo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoriasMaisPopulares.map((categoria, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="font-medium">{categoria.categoria}</span>
                  </div>
                  <Badge variant="secondary">
                    {categoria.count} livros
                  </Badge>
                </div>
              ))}
              {stats.categoriasMaisPopulares.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimos empréstimos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Empréstimos Recentes
            </CardTitle>
            <CardDescription>
              Últimos livros emprestados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ultimosEmprestimos.map((loan) => (
                <div key={loan.id} className="flex items-center gap-4">
                  <div className="w-10 h-14 bg-muted rounded-sm flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{loan.book.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.book.author && `${loan.book.author} • `}
                      Emprestado em {format(new Date(loan.loan_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    {loan.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Vence em {format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {stats.ultimosEmprestimos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum empréstimo encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BibliotecaStats;