import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown,
  Flame,
  BookOpen,
  Users,
  Award,
  Calendar,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RankingUsuario {
  id: string;
  nome: string;
  foto_url?: string;
  pontos_xp: number;
  versiculos_lidos: number;
  sequencia_dias: number;
  posicao: number;
  nivel: number;
  conquistas: string[];
}

interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  desbloqueado: boolean;
}

export function RankingBiblico() {
  const [rankingGeral, setRankingGeral] = useState<RankingUsuario[]>([]);
  const [rankingSemanal, setRankingSemanal] = useState<RankingUsuario[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [usuarioAtual, setUsuarioAtual] = useState<RankingUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRankings();
  }, []);

  const carregarRankings = async () => {
    try {
      // Dados simulados para demonstração
      const usuariosSimulados: RankingUsuario[] = [
        {
          id: '1',
          nome: 'João Silva',
          foto_url: undefined,
          pontos_xp: 15680,
          versiculos_lidos: 2340,
          sequencia_dias: 45,
          posicao: 1,
          nivel: 12,
          conquistas: ['primeiro_lugar', 'leitor_constante', 'especialista_salmos']
        },
        {
          id: '2',
          nome: 'Maria Santos',
          foto_url: undefined,
          pontos_xp: 14230,
          versiculos_lidos: 2125,
          sequencia_dias: 38,
          posicao: 2,
          nivel: 11,
          conquistas: ['segundo_lugar', 'evangelhos_completos']
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          foto_url: undefined,
          pontos_xp: 12890,
          versiculos_lidos: 1987,
          sequencia_dias: 32,
          posicao: 3,
          nivel: 10,
          conquistas: ['terceiro_lugar', 'antigo_testamento']
        },
        // Mais usuários...
        ...Array.from({ length: 7 }, (_, i) => ({
          id: (i + 4).toString(),
          nome: `Usuário ${i + 4}`,
          foto_url: undefined,
          pontos_xp: Math.floor(Math.random() * 10000) + 5000,
          versiculos_lidos: Math.floor(Math.random() * 1500) + 500,
          sequencia_dias: Math.floor(Math.random() * 30) + 5,
          posicao: i + 4,
          nivel: Math.floor(Math.random() * 8) + 5,
          conquistas: ['leitor_iniciante']
        }))
      ];

      setRankingGeral(usuariosSimulados);
      setRankingSemanal(usuariosSimulados.slice().sort(() => Math.random() - 0.5));
      
      // Simular usuário atual
      setUsuarioAtual({
        id: 'current',
        nome: 'Você',
        pontos_xp: 8450,
        versiculos_lidos: 1234,
        sequencia_dias: 12,
        posicao: 15,
        nivel: 8,
        conquistas: ['primeiro_capitulo', 'leitor_iniciante']
      });

      // Conquistas disponíveis
      setConquistas([
        {
          id: 'primeiro_capitulo',
          nome: 'Primeiro Passo',
          descricao: 'Leu seu primeiro capítulo',
          icone: '📖',
          cor: 'bg-green-100 text-green-800',
          desbloqueado: true
        },
        {
          id: 'leitor_iniciante',
          nome: 'Leitor Iniciante',
          descricao: 'Leu 100 versículos',
          icone: '⭐',
          cor: 'bg-blue-100 text-blue-800',
          desbloqueado: true
        },
        {
          id: 'sequencia_7',
          nome: 'Uma Semana',
          descricao: '7 dias consecutivos de leitura',
          icone: '🔥',
          cor: 'bg-orange-100 text-orange-800',
          desbloqueado: false
        },
        {
          id: 'evangelhos_completos',
          nome: 'Evangelista',
          descricao: 'Completou todos os Evangelhos',
          icone: '✝️',
          cor: 'bg-purple-100 text-purple-800',
          desbloqueado: false
        },
        {
          id: 'primeiro_lugar',
          nome: 'Campeão',
          descricao: 'Alcançou o 1º lugar no ranking',
          icone: '👑',
          cor: 'bg-yellow-100 text-yellow-800',
          desbloqueado: false
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{posicao}</span>;
    }
  };

  const getPosicaoColor = (posicao: number) => {
    switch (posicao) {
      case 1: return 'border-l-yellow-500 bg-yellow-50';
      case 2: return 'border-l-gray-400 bg-gray-50';
      case 3: return 'border-l-amber-600 bg-amber-50';
      default: return 'border-l-blue-500';
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
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Ranking Bíblico</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Veja como você se compara com outros leitores da Bíblia e celebre suas conquistas.
        </p>
      </div>

      {/* Sua Posição */}
      {usuarioAtual && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sua Posição Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">#{usuarioAtual.posicao}</div>
                <div className="text-sm text-muted-foreground">Posição Geral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{usuarioAtual.pontos_xp.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Pontos XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{usuarioAtual.versiculos_lidos.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Versículos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{usuarioAtual.sequencia_dias}</div>
                <div className="text-sm text-muted-foreground">Dias Seguidos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Ranking Geral</TabsTrigger>
          <TabsTrigger value="semanal">Esta Semana</TabsTrigger>
          <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          {rankingGeral.map((usuario) => (
            <Card key={usuario.id} className={`border-l-4 ${getPosicaoColor(usuario.posicao)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getPosicaoIcon(usuario.posicao)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={usuario.foto_url} />
                      <AvatarFallback>
                        {usuario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h4 className="font-semibold">{usuario.nome}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">Nível {usuario.nivel}</Badge>
                        <span>•</span>
                        <Flame className="h-4 w-4" />
                        <span>{usuario.sequencia_dias} dias</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {usuario.pontos_xp.toLocaleString()} XP
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {usuario.versiculos_lidos.toLocaleString()} versículos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="semanal" className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Ranking Semanal</h3>
            <p className="text-muted-foreground">
              Baseado na atividade dos últimos 7 dias
            </p>
          </div>
          
          {rankingSemanal.slice(0, 10).map((usuario, index) => (
            <Card key={usuario.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={usuario.foto_url} />
                      <AvatarFallback className="text-xs">
                        {usuario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h4 className="font-medium">{usuario.nome}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Esta semana</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      +{Math.floor(usuario.pontos_xp * 0.1)} XP
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.floor(usuario.versiculos_lidos * 0.05)} versículos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="conquistas" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Suas Conquistas</h3>
            <p className="text-muted-foreground">
              Desbloqueie medalhas conforme progride em seu estudo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conquistas.map((conquista) => (
              <Card 
                key={conquista.id} 
                className={`${conquista.desbloqueado ? '' : 'opacity-50'} hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">
                    {conquista.desbloqueado ? conquista.icone : '🔒'}
                  </div>
                  <h4 className="font-semibold mb-2">{conquista.nome}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {conquista.descricao}
                  </p>
                  <Badge 
                    className={conquista.desbloqueado ? conquista.cor : 'bg-gray-100 text-gray-600'}
                  >
                    {conquista.desbloqueado ? 'Desbloqueado' : 'Bloqueado'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}