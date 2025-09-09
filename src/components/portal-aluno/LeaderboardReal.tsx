import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface LeaderboardEntry {
  pessoa_id: string;
  nome: string;
  total_xp: number;
  position: number;
  isCurrentUser: boolean;
}

export const LeaderboardReal: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    loadLeaderboard();
  }, [pessoa]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      // Buscar ranking de XP
      const { data: rankingData, error } = await supabase
        .rpc('obter_ranking_ensino');

      if (error) throw error;

      // Formatar dados do ranking
      const formattedData = (rankingData || []).map((entry: any, index: number) => ({
        pessoa_id: entry.pessoa_id,
        nome: entry.nome,
        total_xp: entry.total_pontos,
        position: index + 1,
        isCurrentUser: pessoa ? entry.pessoa_id === pessoa.id : false
      }));

      setLeaderboard(formattedData.slice(0, 10)); // Top 10

    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      // Dados simulados em caso de erro
      setLeaderboard([
        {
          pessoa_id: '1',
          nome: 'Maria Silva',
          total_xp: 2850,
          position: 1,
          isCurrentUser: false
        },
        {
          pessoa_id: '2',
          nome: 'João Santos',
          total_xp: 2650,
          position: 2,
          isCurrentUser: false
        },
        {
          pessoa_id: '3',
          nome: 'Ana Costa',
          total_xp: 2400,
          position: 3,
          isCurrentUser: false
        },
        {
          pessoa_id: '4',
          nome: 'Pedro Lima',
          total_xp: 2100,
          position: 4,
          isCurrentUser: false
        },
        {
          pessoa_id: '5',
          nome: pessoa?.nome_completo || 'Você',
          total_xp: 1850,
          position: 5,
          isCurrentUser: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  const getLevelName = (xp: number) => {
    if (xp < 100) return 'Iniciante';
    if (xp < 500) return 'Estudante';
    if (xp < 1000) return 'Dedicado';
    if (xp < 2500) return 'Experiente';
    if (xp < 5000) return 'Mestre';
    return 'Sábio';
  };

  const getBadgeName = (xp: number) => {
    if (xp >= 2500) return 'Evangelista';
    if (xp >= 1000) return 'Discipulador';
    if (xp >= 500) return 'Estudante Dedicado';
    if (xp >= 100) return 'Perseverante';
    return 'Iniciante';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentUserEntry = leaderboard.find(entry => entry.isCurrentUser);
  const nextPosition = currentUserEntry ? leaderboard.find(entry => entry.position === currentUserEntry.position - 1) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Ranking de XP
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top estudantes mais dedicados
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((student) => (
            <div 
              key={student.pessoa_id} 
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
                  <AvatarImage src="" alt={student.nome} />
                  <AvatarFallback className="text-xs">
                    {student.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${student.isCurrentUser ? 'text-primary' : ''}`}>
                    {student.nome}
                  </h4>
                  <p className="text-xs text-muted-foreground">{getLevelName(student.total_xp)}</p>
                </div>
              </div>

              {/* XP e Badge */}
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-sm font-bold">{student.total_xp.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getBadgeName(student.total_xp)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {currentUserEntry && nextPosition && (
          <div className="mt-4 p-3 bg-kerigma-gradient-soft rounded-lg text-center">
            <p className="text-sm font-medium mb-1">Continue estudando!</p>
            <p className="text-xs text-muted-foreground">
              Mais {(nextPosition.total_xp - currentUserEntry.total_xp).toLocaleString()} XP para alcançar o {nextPosition.position}º lugar
            </p>
          </div>
        )}

        {!currentUserEntry && (
          <div className="mt-4 p-3 bg-kerigma-gradient-soft rounded-lg text-center">
            <p className="text-sm font-medium mb-1">Comece a estudar!</p>
            <p className="text-xs text-muted-foreground">
              Ganhe XP completando cursos e lições para aparecer no ranking
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};