import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface RankingUser {
  pessoa_id: string;
  nome: string;
  xp: number;
  nivel: string;
  badge_atual: string;
  posicao: number;
}

const JornadaRankingPage: React.FC = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [minhasPosicao, setMinhasPosicao] = useState<number | null>(null);
  const navigate = useNavigate();
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    document.title = 'Ranking | Jornada de Crescimento';
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      // Buscar ranking dos usuários
      const { data, error } = await supabase
        .from('aluno_stats')
        .select(`
          pessoa_id,
          xp,
          nivel,
          badge_atual,
          pessoas!inner(nome_completo)
        `)
        .order('xp', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const rankingComPosicao = data.map((item: any, index) => ({
          pessoa_id: item.pessoa_id,
          nome: item.pessoas.nome_completo,
          xp: item.xp,
          nivel: item.nivel,
          badge_atual: item.badge_atual,
          posicao: index + 1
        }));

        setRanking(rankingComPosicao);

        // Encontrar posição do usuário atual
        if (pessoa?.id) {
          const minhaPosicao = rankingComPosicao.find(
            user => user.pessoa_id === pessoa.id
          )?.posicao;
          setMinhasPosicao(minhaPosicao || null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Doutor': return 'text-purple-600';
      case 'Mestre': return 'text-blue-600';
      case 'Especialista': return 'text-green-600';
      case 'Intermediário': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPosicaoIcon = (posicao: number) => {
    if (posicao === 1) return '🥇';
    if (posicao === 2) return '🥈';
    if (posicao === 3) return '🥉';
    return `#${posicao}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jornada')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ranking da Jornada</h1>
            <p className="text-muted-foreground">
              Veja sua posição e os líderes em crescimento espiritual.
            </p>
          </div>
        </div>

        {/* Minha Posição */}
        {minhasPosicao && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sua Posição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {getPosicaoIcon(minhasPosicao)}
                </div>
                <p className="text-muted-foreground">
                  Você está na posição <strong>#{minhasPosicao}</strong> do ranking!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-muted animate-pulse rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {ranking.map((user) => (
                  <div
                    key={user.pessoa_id}
                    className={`flex items-center justify-between p-4 border rounded-md transition-colors ${
                      user.pessoa_id === pessoa?.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold w-12 text-center">
                        {getPosicaoIcon(user.posicao)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.nome}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getNivelColor(user.nivel)}>
                            {user.nivel}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {user.badge_atual}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{user.xp.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">XP</div>
                    </div>
                  </div>
                ))}
                {ranking.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário no ranking ainda.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JornadaRankingPage;