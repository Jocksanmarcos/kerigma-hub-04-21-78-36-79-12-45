import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, Target, BookOpen, Users, Zap, Crown, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface Achievement {
  id: string;
  tipo_conquista: string;
  pontos_ganhos: number;
  conquistada_em: string;
  detalhes: any;
}

export const AchievementShowcaseReal: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    if (pessoa) {
      loadAchievements();
    }
  }, [pessoa]);

  const loadAchievements = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);

      // Carregar conquistas do usuário
      const { data: conquistasData, error: conquistasError } = await supabase
        .from('conquistas_ensino')
        .select('*')
        .eq('pessoa_id', pessoa.id)
        .order('conquistada_em', { ascending: false });

      if (conquistasError) throw conquistasError;
      setAchievements(conquistasData || []);

      // Calcular XP total
      const totalPoints = conquistasData?.reduce((sum, item) => sum + (item.pontos_ganhos || 0), 0) || 0;
      setTotalXP(totalPoints);

    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (tipo: string) => {
    switch (tipo) {
      case 'primeiro_curso': return BookOpen;
      case 'licao_completa': return Star;
      case 'curso_completo': return Trophy;
      case 'sequencia_estudos': return Flame;
      case 'evangelista': return Users;
      case 'lider': return Crown;
      default: return Award;
    }
  };

  const getAchievementColor = (tipo: string) => {
    switch (tipo) {
      case 'primeiro_curso': return 'bg-success/10 text-success';
      case 'licao_completa': return 'bg-warning/10 text-warning';
      case 'curso_completo': return 'bg-primary/10 text-primary';
      case 'sequencia_estudos': return 'bg-error/10 text-error';
      case 'evangelista': return 'bg-info/10 text-info';
      case 'lider': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getAchievementName = (tipo: string) => {
    switch (tipo) {
      case 'primeiro_curso': return 'Primeiro Passo';
      case 'licao_completa': return 'Estudante Dedicado';
      case 'curso_completo': return 'Finalizador';
      case 'sequencia_estudos': return 'Perseverante';
      case 'evangelista': return 'Evangelista';
      case 'lider': return 'Líder em Formação';
      default: return 'Conquista';
    }
  };

  const getAchievementDescription = (tipo: string) => {
    switch (tipo) {
      case 'primeiro_curso': return 'Iniciou seu primeiro curso';
      case 'licao_completa': return 'Completou uma lição';
      case 'curso_completo': return 'Finalizou um curso completo';
      case 'sequencia_estudos': return 'Manteve sequência de estudos';
      case 'evangelista': return 'Completou curso de evangelismo';
      case 'lider': return 'Demonstrou liderança';
      default: return 'Conquista especial';
    }
  };

  // Conquistas disponíveis (metas futuras)
  const availableAchievements = [
    {
      tipo: 'evangelista',
      name: 'Evangelista',
      description: 'Complete o curso de Evangelismo',
      icon: Users,
      color: 'bg-primary/10 text-primary',
      progress: 90,
      xp: 300
    },
    {
      tipo: 'lider',
      name: 'Líder em Formação',
      description: 'Complete 3 cursos de liderança',
      icon: Crown,
      color: 'bg-secondary/10 text-secondary',
      progress: 33,
      xp: 500
    },
    {
      tipo: 'maratonista',
      name: 'Maratonista',
      description: 'Estude por 30 dias seguidos',
      icon: Zap,
      color: 'bg-error/10 text-error',
      progress: 67,
      xp: 250
    }
  ];

  const recentAchievements = achievements.slice(0, 2);
  const nextAchievements = availableAchievements.filter(a => 
    !achievements.some(ach => ach.tipo_conquista === a.tipo) && a.progress && a.progress > 50
  ).slice(0, 2);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-10 w-10 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Conquistas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conquistas Recentes */}
        {recentAchievements.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              Conquistadas Recentemente
            </h4>
            <div className="space-y-2">
              {recentAchievements.map((achievement) => {
                const Icon = getAchievementIcon(achievement.tipo_conquista);
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-kerigma-gradient-soft border border-primary/20">
                    <div className={`h-10 w-10 rounded-lg ${getAchievementColor(achievement.tipo_conquista)} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">{getAchievementName(achievement.tipo_conquista)}</h5>
                      </div>
                      <p className="text-xs text-muted-foreground">{getAchievementDescription(achievement.tipo_conquista)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          +{achievement.pontos_ganhos} XP
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(achievement.conquistada_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Próximas Conquistas */}
        {nextAchievements.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Quase Lá!
            </h4>
            <div className="space-y-2">
              {nextAchievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className={`h-10 w-10 rounded-lg ${achievement.color} flex items-center justify-center opacity-50`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm text-muted-foreground">{achievement.name}</h5>
                      </div>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all duration-300"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="p-3 bg-kerigma-gradient-soft rounded-lg text-center">
          <p className="text-sm font-medium mb-1">Total de XP Conquistado</p>
          <p className="text-2xl font-bold text-primary">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            {achievements.length} conquista{achievements.length !== 1 ? 's' : ''} desbloqueada{achievements.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Botão Ver Todas */}
        <Button variant="outline" className="w-full" size="sm">
          Ver Todas as Conquistas
        </Button>
      </CardContent>
    </Card>
  );
};