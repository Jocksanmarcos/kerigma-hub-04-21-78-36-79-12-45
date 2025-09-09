import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react';
import { useStudyStreak } from '@/hooks/useStudyStreak';

export const StudyStreak: React.FC = () => {
  const { 
    sequenciaAtual: currentStreak, 
    melhorSequencia: bestStreak, 
    diasEsteMes,
    atividadesEstaSemana: completedThisWeek,
    ultimosDias: last7Days,
    loading,
    error,
    registrarAtividade
  } = useStudyStreak();

  const weeklyGoal = 5; // dias por semana
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-warning" />
            Sequência de Estudos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Skeleton className="w-20 h-20 rounded-full mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto mt-2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length: 7}).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-warning" />
            Sequência de Estudos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados de sequência</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (completedThisWeek / weeklyGoal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-warning" />
          Sequência de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sequência Atual */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-warning to-error flex items-center justify-center text-white">
              <Flame className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-2 bg-card border rounded-full px-2 py-1">
              <span className="text-lg font-bold text-warning">{currentStreak}</span>
            </div>
          </div>
          <h3 className="font-semibold mt-2">Dias seguidos</h3>
          <p className="text-sm text-muted-foreground">
            Continue assim! 🔥
          </p>
        </div>

        {/* Calendário da Semana */}
        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Esta Semana
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {last7Days.map((studied, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {weekDays[index]}
                </div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    studied 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meta Semanal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Meta Semanal
            </h4>
            <Badge variant={completedThisWeek >= weeklyGoal ? "default" : "secondary"}>
              {completedThisWeek}/{weeklyGoal} dias
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Progresso</span>
              <span className="font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  completedThisWeek >= weeklyGoal 
                    ? 'bg-success' 
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="text-lg font-bold">{bestStreak}</div>
            <div className="text-xs text-muted-foreground">Melhor sequência</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold">{diasEsteMes}</div>
            <div className="text-xs text-muted-foreground">Dias este mês</div>
          </div>
        </div>

        {/* Motivação */}
        <div className="p-3 bg-kerigma-gradient-soft rounded-lg text-center">
          {completedThisWeek >= weeklyGoal ? (
            <>
              <p className="text-sm font-medium text-success mb-1">
                🎉 Meta alcançada!
              </p>
              <p className="text-xs text-muted-foreground">
                Você completou sua meta semanal. Continue assim!
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium mb-1">
                {weeklyGoal - completedThisWeek === 1 ? 'Falta apenas 1 dia!' : `Faltam ${weeklyGoal - completedThisWeek} dias`}
              </p>
              <p className="text-xs text-muted-foreground">
                Você está quase lá! Continue estudando.
              </p>
            </>
          )}
        </div>

        {/* Botão de Ação */}
        <Button className="w-full bg-gradient-to-r from-warning to-error hover:from-warning/90 hover:to-error/90">
          <Flame className="h-4 w-4 mr-2" />
          Continuar Estudando
        </Button>
      </CardContent>
    </Card>
  );
};