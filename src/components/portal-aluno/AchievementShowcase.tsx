import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, Target, BookOpen, Users, Zap, Crown } from 'lucide-react';

export const AchievementShowcase: React.FC = () => {
  const achievements = [
    {
      id: 1,
      name: 'Primeiro Passo',
      description: 'Complete sua primeira aula',
      icon: BookOpen,
      color: 'bg-success/10 text-success',
      unlocked: true,
      unlockedAt: '2 dias atrás',
      xp: 50
    },
    {
      id: 2,
      name: 'Estudante Dedicado',
      description: 'Complete 5 aulas seguidas',
      icon: Star,
      color: 'bg-warning/10 text-warning',
      unlocked: true,
      unlockedAt: '1 dia atrás',
      xp: 150,
      rare: true
    },
    {
      id: 3,
      name: 'Evangelista',
      description: 'Complete o curso de Evangelismo',
      icon: Users,
      color: 'bg-primary/10 text-primary',
      unlocked: false,
      progress: 90,
      xp: 300
    },
    {
      id: 4,
      name: 'Líder em Formação',
      description: 'Complete 3 cursos de liderança',
      icon: Crown,
      color: 'bg-secondary/10 text-secondary',
      unlocked: false,
      progress: 33,
      xp: 500,
      rare: true
    },
    {
      id: 5,
      name: 'Maratonista',
      description: 'Estude por 30 dias seguidos',
      icon: Zap,
      color: 'bg-error/10 text-error',
      unlocked: false,
      progress: 67,
      xp: 250
    },
    {
      id: 6,
      name: 'Mestre',
      description: 'Complete 10 cursos',
      icon: Trophy,
      color: 'bg-warning/10 text-warning',
      unlocked: false,
      progress: 30,
      xp: 1000,
      legendary: true
    }
  ];

  const recentAchievements = achievements.filter(a => a.unlocked).slice(0, 2);
  const nextAchievements = achievements.filter(a => !a.unlocked && a.progress && a.progress > 50).slice(0, 2);

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
        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" />
            Conquistadas Recentemente
          </h4>
          <div className="space-y-2">
            {recentAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-kerigma-gradient-soft border border-primary/20">
                  <div className={`h-10 w-10 rounded-lg ${achievement.color} flex items-center justify-center relative`}>
                    <Icon className="h-5 w-5" />
                    {achievement.rare && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{achievement.name}</h5>
                      {achievement.rare && (
                        <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                          Raro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        +{achievement.xp} XP
                      </Badge>
                      <span className="text-xs text-muted-foreground">{achievement.unlockedAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximas Conquistas */}
        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Quase Lá!
          </h4>
          <div className="space-y-2">
            {nextAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`h-10 w-10 rounded-lg ${achievement.color} flex items-center justify-center opacity-50 relative`}>
                    <Icon className="h-5 w-5" />
                    {achievement.legendary && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-warning to-error rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm text-muted-foreground">{achievement.name}</h5>
                      {achievement.legendary && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-warning to-error text-white">
                          Lendário
                        </Badge>
                      )}
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

        {/* Botão Ver Todas */}
        <Button variant="outline" className="w-full" size="sm">
          Ver Todas as Conquistas
        </Button>
      </CardContent>
    </Card>
  );
};