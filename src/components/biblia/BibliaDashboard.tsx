import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Calendar,
  Flame,
  Star,
  Clock,
  ChevronRight,
  Play,
  BookmarkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProgressoUsuario {
  pontos_xp: number;
  total_versiculos_lidos: number;
  sequencia_dias: number;
  ultimo_livro?: string;
  ultimo_capitulo?: number;
}

interface DesafioAtivo {
  id: string;
  nome: string;
  progresso: number;
  duracao_dias: number;
  dias_restantes: number;
}

export function BibliaDashboard() {
  const navigate = useNavigate();
  const [progresso, setProgresso] = useState<ProgressoUsuario | null>(null);
  const [desafiosAtivos, setDesafiosAtivos] = useState<DesafioAtivo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    try {
      // Buscar progresso do usuário
      const { data: stats } = await supabase.rpc('obter_estatisticas_biblia');
      if (stats && stats.length > 0) {
        setProgresso({
          pontos_xp: stats[0].total_pontos || 0,
          total_versiculos_lidos: stats[0].versiculos_lidos || 0,
          sequencia_dias: stats[0].sequencia_atual || 0,
          ultimo_livro: 'Gênesis',
          ultimo_capitulo: 1
        });
      }

      // Buscar desafios ativos (simulado)
      setDesafiosAtivos([
        {
          id: '1',
          nome: 'Bíblia em 1 Ano',
          progresso: 15,
          duracao_dias: 365,
          dias_restantes: 320
        },
        {
          id: '2',
          nome: 'Evangelhos em 30 Dias',
          progresso: 60,
          duracao_dias: 30,
          dias_restantes: 12
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header com boas-vindas */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          Bem-vindo ao Estudo Bíblico
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Continue sua jornada espiritual com ferramentas inteligentes para estudo, desafios gamificados e progresso personalizado.
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {progresso?.pontos_xp || 0}
            </p>
            <p className="text-sm text-blue-600">Pontos XP</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {progresso?.total_versiculos_lidos || 0}
            </p>
            <p className="text-sm text-green-600">Versículos Lidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {progresso?.sequencia_dias || 0}
            </p>
            <p className="text-sm text-orange-600">Dias Consecutivos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700">
              #12
            </p>
            <p className="text-sm text-purple-600">Posição no Ranking</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retomar Leitura */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Retomar Leitura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">
                {progresso?.ultimo_livro || 'Gênesis'} {progresso?.ultimo_capitulo || 1}
              </h3>
              <p className="text-muted-foreground">
                Continue de onde parou
              </p>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/jornada/biblia/estudo')}
            >
              Continuar Lendo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Progresso Visual */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Seu Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Antigo Testamento</span>
                <span>2%</span>
              </div>
              <Progress value={2} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>Novo Testamento</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/jornada/biblia/progresso')}
              >
                Ver Progresso Detalhado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desafios Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Desafios Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {desafiosAtivos.map((desafio) => (
              <Card key={desafio.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{desafio.nome}</h4>
                    <Badge variant="secondary">
                      {desafio.dias_restantes} dias
                    </Badge>
                  </div>
                  <Progress value={desafio.progresso} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {desafio.progresso}% completo
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/jornada/desafios')}
            >
              Ver Todos os Desafios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acesso Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center gap-2"
          onClick={() => navigate('/jornada/consulta')}
        >
          <BookmarkIcon className="h-6 w-6" />
          <span className="text-sm">Consulta Rápida</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex flex-col items-center gap-2"
          onClick={() => navigate('/jornada/planos-leitura')}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm">Planos de Leitura</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex flex-col items-center gap-2"
          onClick={() => navigate('/jornada/ranking')}
        >
          <Trophy className="h-6 w-6" />
          <span className="text-sm">Ranking</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex flex-col items-center gap-2"
          onClick={() => navigate('/jornada/lembretes')}
        >
          <Clock className="h-6 w-6" />
          <span className="text-sm">Lembretes</span>
        </Button>
      </div>

      {/* Recomendados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Recomendados para Você
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Salmos de Conforto</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  30 dias de salmos inspiradores
                </p>
                <Button size="sm" variant="outline">
                  Começar
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Provérbios Diários</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Um capítulo de sabedoria por dia
                </p>
                <Button size="sm" variant="outline">
                  Começar
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Cartas de Paulo</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Estudos das epístolas paulinas
                </p>
                <Button size="sm" variant="outline">
                  Começar
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}