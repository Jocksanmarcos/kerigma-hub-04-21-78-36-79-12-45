import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Star, Calendar, BookOpen, Target, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProgressoUsuario {
  sequencia_dias: number;
  pontos_xp: number;
  total_versiculos_lidos: number;
  preferencias: any;
  ultimo_versiculo_lido_id?: string;
}

interface Medalha {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  conquistada: boolean;
  progresso?: number;
  meta?: number;
}

export const PainelProgressoBiblico: React.FC = () => {
  const [progresso, setProgresso] = useState<ProgressoUsuario | null>(null);
  const [medalhas, setMedalhas] = useState<Medalha[]>([]);
  const [ranking, setRanking] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pessoaData } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoaData) return;

      // Buscar progresso
      let { data: progressoData } = await supabase
        .from('estudo_biblico_progresso')
        .select('*')
        .eq('pessoa_id', pessoaData.id)
        .single();

      if (!progressoData) {
        const { data: novoProgresso } = await supabase
          .from('estudo_biblico_progresso')
          .insert({
            pessoa_id: pessoaData.id,
            sequencia_dias: 0,
            pontos_xp: 0,
            total_versiculos_lidos: 0,
            preferencias: {}
          })
          .select()
          .single();

        progressoData = novoProgresso;
      }

      setProgresso(progressoData);
      await carregarMedalhas(progressoData);
      await carregarRanking(pessoaData.id);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarMedalhas = async (progresso: ProgressoUsuario) => {
    const medalhasDefinidas: Medalha[] = [
      {
        id: 'primeira_leitura',
        nome: 'Primeiro Passo',
        descricao: 'Primeira leitura bíblica',
        icone: '📖',
        conquistada: progresso.total_versiculos_lidos > 0
      },
      {
        id: 'sequencia_7',
        nome: 'Dedicado',
        descricao: '7 dias consecutivos',
        icone: '🔥',
        conquistada: progresso.sequencia_dias >= 7,
        progresso: progresso.sequencia_dias,
        meta: 7
      },
      {
        id: 'sequencia_30',
        nome: 'Constante',
        descricao: '30 dias consecutivos',
        icone: '💪',
        conquistada: progresso.sequencia_dias >= 30,
        progresso: progresso.sequencia_dias,
        meta: 30
      },
      {
        id: 'pontos_500',
        nome: 'Estudioso',
        descricao: '500 pontos XP',
        icone: '⭐',
        conquistada: progresso.pontos_xp >= 500,
        progresso: progresso.pontos_xp,
        meta: 500
      },
      {
        id: 'versiculos_100',
        nome: 'Leitor',
        descricao: '100 versículos lidos',
        icone: '📚',
        conquistada: progresso.total_versiculos_lidos >= 100,
        progresso: progresso.total_versiculos_lidos,
        meta: 100
      },
      {
        id: 'versiculos_1000',
        nome: 'Especialista',
        descricao: '1000 versículos lidos',
        icone: '🎓',
        conquistada: progresso.total_versiculos_lidos >= 1000,
        progresso: progresso.total_versiculos_lidos,
        meta: 1000
      }
    ];

    setMedalhas(medalhasDefinidas);
  };

  const carregarRanking = async (pessoaId: string) => {
    const { data } = await supabase
      .rpc('obter_ranking_ensino')
      .select('pessoa_id, total_pontos')
      .order('total_pontos', { ascending: false });

    if (data) {
      const posicao = data.findIndex(item => item.pessoa_id === pessoaId) + 1;
      setRanking(posicao > 0 ? posicao : null);
    }
  };

  const getNivel = (pontos: number) => {
    if (pontos < 100) return { nivel: 1, nome: 'Iniciante', cor: 'text-slate-600' };
    if (pontos < 500) return { nivel: 2, nome: 'Estudante', cor: 'text-blue-600' };
    if (pontos < 1000) return { nivel: 3, nome: 'Dedicado', cor: 'text-green-600' };
    if (pontos < 2500) return { nivel: 4, nome: 'Experiente', cor: 'text-orange-600' };
    if (pontos < 5000) return { nivel: 5, nome: 'Mestre', cor: 'text-purple-600' };
    return { nivel: 6, nome: 'Sábio', cor: 'text-amber-600' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!progresso) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Faça login para ver seu progresso bíblico</p>
        </CardContent>
      </Card>
    );
  }

  const nivelInfo = getNivel(progresso.pontos_xp);
  const proximoNivel = [100, 500, 1000, 2500, 5000, 10000].find(n => n > progresso.pontos_xp) || 10000;
  const progressoNivel = ((progresso.pontos_xp % 100) / 100) * 100;
  const medalhasConquistadas = medalhas.filter(m => m.conquistada).length;

  return (
    <div className="space-y-6">
      {/* Header com resumo principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{progresso.pontos_xp} XP</h3>
                <p className={`text-sm font-medium ${nivelInfo.cor}`}>
                  {nivelInfo.nome} • Nível {nivelInfo.nivel}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para o próximo nível</span>
                <span>{progresso.pontos_xp} / {proximoNivel}</span>
              </div>
              <Progress value={progressoNivel} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progresso.sequencia_dias}</p>
                <p className="text-sm text-muted-foreground">Dias seguidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progresso.total_versiculos_lidos || 0}</p>
                <p className="text-sm text-muted-foreground">Versículos lidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking e Medalhas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Seu Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              {ranking ? (
                <>
                  <div className="text-4xl font-bold text-primary mb-2">#{ranking}</div>
                  <p className="text-muted-foreground">Posição no ranking geral</p>
                  <Badge variant="secondary" className="mt-2">
                    {medalhasConquistadas} medalhas conquistadas
                  </Badge>
                </>
              ) : (
                <div className="text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Continue estudando para aparecer no ranking!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medalhas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {medalhas.slice(0, 4).map((medalha) => (
                <div 
                  key={medalha.id}
                  className={`text-center p-3 rounded-lg border transition-colors ${
                    medalha.conquistada 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="text-2xl mb-1">{medalha.icone}</div>
                  <p className="text-xs font-medium">{medalha.nome}</p>
                  {!medalha.conquistada && medalha.progresso !== undefined && medalha.meta && (
                    <div className="mt-2">
                      <Progress 
                        value={(medalha.progresso / medalha.meta) * 100} 
                        className="h-1" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {medalha.progresso}/{medalha.meta}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {medalhas.length > 4 && (
              <Button variant="outline" className="w-full mt-4" size="sm">
                Ver todas as conquistas
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meta Diária */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Meta de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Continue sua sequência de leitura</p>
              <p className="text-sm text-muted-foreground">
                Você está em uma sequência de {progresso.sequencia_dias} dias!
              </p>
            </div>
            <Button>
              Ler hoje
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};