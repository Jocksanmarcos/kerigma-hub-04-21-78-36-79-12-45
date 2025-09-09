import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  BookOpen, 
  Target, 
  Award, 
  TrendingUp,
  Star,
  Calendar,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJornadaProfile } from '@/hooks/useJornadaProfile';
import { useStudyStreak } from '@/hooks/useStudyStreak';

const JornadaPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    pontos_sabedoria, 
    nivel, 
    next_level_xp, 
    capitulos_lidos_ids, 
    loading: profileLoading 
  } = useJornadaProfile();
  
  const {
    sequenciaAtual,
    melhorSequencia,
    diasEsteMes,
    atividadesEstaSemana,
    ultimosDias,
    loading: streakLoading
  } = useStudyStreak();

  useEffect(() => {
    document.title = 'Minha Jornada | Kerigma Hub';
  }, []);

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Doutor': return 'text-purple-600 bg-purple-100';
      case 'Mestre': return 'text-blue-600 bg-blue-100';
      case 'Especialista': return 'text-green-600 bg-green-100';
      case 'Intermediário': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const progressoAtualNivel = Math.min((pontos_sabedoria / next_level_xp) * 100, 100);

  if (profileLoading || streakLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Jornada de Crescimento</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso espiritual e conquistas na palavra de Deus.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos de Sabedoria</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pontos_sabedoria.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {next_level_xp - pontos_sabedoria} para próximo nível
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sequenciaAtual}</div>
              <p className="text-xs text-muted-foreground">
                Dias consecutivos estudando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capítulos Lidos</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{capitulos_lidos_ids.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de capítulos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{diasEsteMes}</div>
              <p className="text-xs text-muted-foreground">
                Dias de estudo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progresso do Nível
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={getNivelColor(nivel)}>
                {nivel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {pontos_sabedoria} / {next_level_xp} pontos
              </span>
            </div>
            <Progress value={progressoAtualNivel} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              Continue lendo a Bíblia para evoluir seu nível!
            </p>
          </CardContent>
        </Card>

        {/* Streak Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              Sequência de Estudos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sequência Atual</span>
                  <span className="text-2xl font-bold text-orange-600">{sequenciaAtual}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Melhor Sequência</span>
                  <span className="text-lg font-semibold">{melhorSequencia}</span>
                </div>
                <Separator />
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">Esta semana: </span>
                  <span className="font-medium">{atividadesEstaSemana} dias</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Últimos 7 dias</h4>
                <div className="flex gap-1">
                  {ultimosDias.map((ativo, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                        ativo 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {ativo ? '✓' : '•'}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-1 text-xs text-muted-foreground">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
                    <div key={index} className="w-8 text-center">{dia}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => navigate('/jornada/ranking')}>
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <CardTitle className="text-lg">Ver Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Compare seu progresso com outros membros da comunidade
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/jornada/medalhas')}>
            <CardHeader className="text-center">
              <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">Minhas Medalhas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Veja todas as conquistas e reconhecimentos obtidos
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/biblia')}>
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">Continuar Leitura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Continue sua jornada de leitura bíblica e ganhe mais pontos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default JornadaPage;