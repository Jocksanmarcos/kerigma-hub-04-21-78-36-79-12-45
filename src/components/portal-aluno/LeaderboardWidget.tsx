import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

export const LeaderboardWidget: React.FC = () => {
  const leaderboard = [
    {
      id: 1,
      name: 'Maria Silva',
      xp: 2850,
      level: 'Líder em Formação',
      avatar: '/avatars/maria.jpg',
      position: 1,
      badge: 'Evangelista',
      trend: 'up'
    },
    {
      id: 2,
      name: 'João Santos',
      xp: 2650,
      level: 'Aprendiz Avançado',
      avatar: '/avatars/joao.jpg',
      position: 2,
      badge: 'Discipulador',
      trend: 'same'
    },
    {
      id: 3,
      name: 'Ana Costa',
      xp: 2400,
      level: 'Aprendiz Avançado',
      avatar: '/avatars/ana.jpg',
      position: 3,
      badge: 'Estudante Dedicado',
      trend: 'down'
    },
    {
      id: 4,
      name: 'Pedro Lima',
      xp: 2100,
      level: 'Aprendiz',
      avatar: '/avatars/pedro.jpg',
      position: 4,
      badge: 'Perseverante',
      trend: 'up'
    },
    {
      id: 5,
      name: 'Você',
      xp: 1850,
      level: 'Aprendiz',
      avatar: '/avatars/you.jpg',
      position: 5,
      badge: 'Estudante Dedicado',
      trend: 'up',
      isCurrentUser: true
    }
  ];

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-warning" />;
      case 2:
        return <Medal className="h-4 w-4 text-muted-foreground" />;
      case 3:
        return <Award className="h-4 w-4 text-warning/70" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-error rotate-180" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-muted" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Ranking Semanal
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top 5 estudantes mais dedicados
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((student) => (
            <div 
              key={student.id} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                student.isCurrentUser 
                  ? 'bg-primary/10 border border-primary/20 ring-2 ring-primary/10' 
                  : 'hover:bg-muted/50'
              }`}
            >
              {/* Posição */}
              <div className="flex items-center justify-center w-8 h-8">
                {getPositionIcon(student.position)}
              </div>

              {/* Avatar e Info */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback className="text-xs">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${student.isCurrentUser ? 'text-primary' : ''}`}>
                    {student.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{student.level}</p>
                </div>
              </div>

              {/* XP e Badge */}
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-sm font-bold">{student.xp.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
                  {getTrendIcon(student.trend)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {student.badge}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-4 p-3 bg-kerigma-gradient-soft rounded-lg text-center">
          <p className="text-sm font-medium mb-1">Continue estudando!</p>
          <p className="text-xs text-muted-foreground">
            Mais 150 XP para alcançar o 4º lugar
          </p>
        </div>
      </CardContent>
    </Card>
  );
};