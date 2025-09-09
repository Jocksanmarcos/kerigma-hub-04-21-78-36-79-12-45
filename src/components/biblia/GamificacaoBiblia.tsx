import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Target, Star, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProgressoUsuario {
  sequencia_dias: number;
  pontos_xp: number;
  total_versiculos_lidos: number;
  preferencias: any;
}

export const GamificacaoBiblia: React.FC = () => {
  const [progresso, setProgresso] = useState<ProgressoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [pessoa, setPessoa] = useState<any>(null);

  useEffect(() => {
    carregarProgresso();
  }, []);

  const carregarProgresso = async () => {
    try {
      // Buscar dados da pessoa atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pessoaData } = await supabase
        .from('pessoas')
        .select('id, nome_completo')
        .eq('user_id', user.id)
        .single();

      if (!pessoaData) return;

      setPessoa(pessoaData);

      // Buscar ou criar progresso
      let { data: progressoData } = await supabase
        .from('estudo_biblico_progresso')
        .select('*')
        .eq('pessoa_id', pessoaData.id)
        .single();

      if (!progressoData) {
        // Criar progresso inicial
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
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNivel = (pontos: number) => {
    if (pontos < 100) return { nivel: 1, nome: 'Iniciante' };
    if (pontos < 500) return { nivel: 2, nome: 'Estudante' };
    if (pontos < 1000) return { nivel: 3, nome: 'Dedicado' };
    if (pontos < 2500) return { nivel: 4, nome: 'Experiente' };
    if (pontos < 5000) return { nivel: 5, nome: 'Mestre' };
    return { nivel: 6, nome: 'Sábio' };
  };

  const proximoNivel = (pontos: number) => {
    const niveis = [100, 500, 1000, 2500, 5000, 10000];
    return niveis.find(n => n > pontos) || 10000;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-muted rounded"></div>
          </CardContent>
        </Card>
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
  const pontosProximoNivel = proximoNivel(progresso.pontos_xp);
  const progressoNivel = ((progresso.pontos_xp % 100) / 100) * 100;

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progresso.sequencia_dias}</p>
                <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progresso.pontos_xp}</p>
                <p className="text-sm text-muted-foreground">Pontos XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progresso.total_versiculos_lidos || 0}</p>
                <p className="text-sm text-muted-foreground">Versículos Lidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nível e Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Seu Nível de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{nivelInfo.nome}</h3>
              <p className="text-sm text-muted-foreground">Nível {nivelInfo.nivel}</p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {progresso.pontos_xp} XP
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{progresso.pontos_xp} / {pontosProximoNivel}</span>
            </div>
            <Progress 
              value={progressoNivel} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Medalhas e Conquistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg border ${progresso.sequencia_dias >= 7 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
              <Calendar className={`h-8 w-8 mx-auto mb-2 ${progresso.sequencia_dias >= 7 ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">7 Dias</p>
              <p className="text-xs text-muted-foreground">Consistente</p>
            </div>

            <div className={`text-center p-4 rounded-lg border ${progresso.sequencia_dias >= 30 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
              <Flame className={`h-8 w-8 mx-auto mb-2 ${progresso.sequencia_dias >= 30 ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">30 Dias</p>
              <p className="text-xs text-muted-foreground">Dedicado</p>
            </div>

            <div className={`text-center p-4 rounded-lg border ${progresso.pontos_xp >= 500 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
              <Star className={`h-8 w-8 mx-auto mb-2 ${progresso.pontos_xp >= 500 ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">500 XP</p>
              <p className="text-xs text-muted-foreground">Estudioso</p>
            </div>

            <div className={`text-center p-4 rounded-lg border ${(progresso.total_versiculos_lidos || 0) >= 100 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
              <BookOpen className={`h-8 w-8 mx-auto mb-2 ${(progresso.total_versiculos_lidos || 0) >= 100 ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">100 Versículos</p>
              <p className="text-xs text-muted-foreground">Leitor</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};