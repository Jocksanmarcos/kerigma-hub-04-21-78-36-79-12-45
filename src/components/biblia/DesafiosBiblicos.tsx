import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Calendar, 
  Users, 
  Zap, 
  Trophy,
  Star,
  Clock,
  BookOpen,
  Flame,
  Crown,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Desafio {
  id: string;
  nome: string;
  descricao: string;
  duracao_dias: number;
  dificuldade: string;
  faixa_etaria: string;
  tema: string;
  xp_por_capitulo: number;
  participantes?: number;
}

interface DesafioUsuario {
  id: string;
  desafio: Desafio;
  progresso: number;
  sequencia_atual: number;
  melhor_sequencia: number;
  status: string;
  data_inicio: string;
}

export function DesafiosBiblicos() {
  const [desafiosDisponiveis, setDesafiosDisponiveis] = useState<Desafio[]>([]);
  const [desafiosAtivos, setDesafiosAtivos] = useState<DesafioUsuario[]>([]);
  const [filtros, setFiltros] = useState({
    dificuldade: 'todos',
    faixa_etaria: 'todos',
    duracao: 'todos'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDesafios();
  }, []);

  const carregarDesafios = async () => {
    try {
      // Dados simulados para demonstração
      const desafiosSimulados: Desafio[] = [
        {
          id: '1',
          nome: 'Bíblia em 1 Ano',
          descricao: 'Leia toda a Bíblia em 365 dias',
          duracao_dias: 365,
          dificuldade: 'intermediario',
          faixa_etaria: 'todos',
          tema: 'completa',
          xp_por_capitulo: 15,
          participantes: 342
        },
        {
          id: '2',
          nome: 'Novo Testamento em 3 Meses',
          descricao: 'Foco nos Evangelhos e cartas apostólicas',
          duracao_dias: 90,
          dificuldade: 'iniciante',
          faixa_etaria: 'todos',
          tema: 'novo_testamento',
          xp_por_capitulo: 20,
          participantes: 128
        },
        {
          id: '3',
          nome: 'Evangelhos em 30 Dias',
          descricao: 'Conhecer a vida de Jesus',
          duracao_dias: 30,
          dificuldade: 'iniciante',
          faixa_etaria: 'jovens',
          tema: 'evangelhos',
          xp_por_capitulo: 25,
          participantes: 89
        },
        {
          id: '4',
          nome: 'Provérbios Diários',
          descricao: 'Um capítulo de sabedoria por dia',
          duracao_dias: 31,
          dificuldade: 'iniciante',
          faixa_etaria: 'todos',
          tema: 'sabedoria',
          xp_por_capitulo: 30,
          participantes: 156
        }
      ];

      setDesafiosDisponiveis(desafiosSimulados);

      // Desafios ativos do usuário
      setDesafiosAtivos([
        {
          id: '1',
          desafio: desafiosSimulados[0],
          progresso: 15,
          sequencia_atual: 5,
          melhor_sequencia: 12,
          status: 'ativo',
          data_inicio: '2024-01-01'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarDesafio = async (desafioId: string) => {
    try {
      // Simular início do desafio
      const desafio = desafiosDisponiveis.find(d => d.id === desafioId);
      if (desafio) {
        const novoDesafioUsuario: DesafioUsuario = {
          id: `user_${desafioId}`,
          desafio,
          progresso: 0,
          sequencia_atual: 0,
          melhor_sequencia: 0,
          status: 'ativo',
          data_inicio: new Date().toISOString().split('T')[0]
        };
        
        setDesafiosAtivos(prev => [...prev, novoDesafioUsuario]);
      }
    } catch (error) {
      console.error('Erro ao iniciar desafio:', error);
    }
  };

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'iniciante': return 'bg-green-100 text-green-800';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800';
      case 'avancado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDificuldadeIcon = (dificuldade: string) => {
    switch (dificuldade) {
      case 'iniciante': return <Star className="h-4 w-4" />;
      case 'intermediario': return <Target className="h-4 w-4" />;
      case 'avancado': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const desafiosFiltrados = desafiosDisponiveis.filter(desafio => {
    return (
      (filtros.dificuldade === 'todos' || desafio.dificuldade === filtros.dificuldade) &&
      (filtros.faixa_etaria === 'todos' || desafio.faixa_etaria === filtros.faixa_etaria) &&
      (filtros.duracao === 'todos' || 
        (filtros.duracao === 'curto' && desafio.duracao_dias <= 30) ||
        (filtros.duracao === 'medio' && desafio.duracao_dias > 30 && desafio.duracao_dias <= 90) ||
        (filtros.duracao === 'longo' && desafio.duracao_dias > 90))
    );
  });

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
        <h1 className="text-4xl font-bold text-primary">Desafios Bíblicos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Participe de desafios gamificados e transforme seu estudo bíblico em uma jornada emocionante.
        </p>
      </div>

      <Tabs defaultValue="ativos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ativos">Meus Desafios</TabsTrigger>
          <TabsTrigger value="disponiveis">Descobrir Novos</TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="space-y-6">
          {desafiosAtivos.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum desafio ativo</h3>
                <p className="text-muted-foreground mb-4">
                  Comece um novo desafio para gamificar seu estudo bíblico
                </p>
                <Button onClick={() => {
                  const tabElement = document.querySelector('[value="disponiveis"]') as HTMLElement;
                  tabElement?.click();
                }}>
                  Explorar Desafios
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {desafiosAtivos.map((desafioUsuario) => (
                <Card key={desafioUsuario.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-orange-500" />
                          {desafioUsuario.desafio.nome}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {desafioUsuario.desafio.descricao}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {desafioUsuario.status === 'ativo' ? 'Em Andamento' : 'Pausado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {desafioUsuario.progresso}%
                        </div>
                        <div className="text-sm text-blue-600">Progresso</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {desafioUsuario.sequencia_atual}
                        </div>
                        <div className="text-sm text-orange-600">Sequência Atual</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {desafioUsuario.melhor_sequencia}
                        </div>
                        <div className="text-sm text-green-600">Melhor Sequência</div>
                      </div>
                    </div>
                    
                    <Progress value={desafioUsuario.progresso} className="h-3" />
                    
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Continuar Estudo
                      </Button>
                      <Button variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="disponiveis" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtrar Desafios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Dificuldade</label>
                  <Select value={filtros.dificuldade} onValueChange={(value) => setFiltros({...filtros, dificuldade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Faixa Etária</label>
                  <Select value={filtros.faixa_etaria} onValueChange={(value) => setFiltros({...filtros, faixa_etaria: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="criancas">Crianças</SelectItem>
                      <SelectItem value="jovens">Jovens</SelectItem>
                      <SelectItem value="adultos">Adultos</SelectItem>
                      <SelectItem value="idosos">Idosos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Duração</label>
                  <Select value={filtros.duracao} onValueChange={(value) => setFiltros({...filtros, duracao: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="curto">Até 30 dias</SelectItem>
                      <SelectItem value="medio">31-90 dias</SelectItem>
                      <SelectItem value="longo">Mais de 90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de desafios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {desafiosFiltrados.map((desafio) => (
              <Card key={desafio.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{desafio.nome}</CardTitle>
                    <Badge className={getDificuldadeColor(desafio.dificuldade)}>
                      {getDificuldadeIcon(desafio.dificuldade)}
                      <span className="ml-1 capitalize">{desafio.dificuldade}</span>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {desafio.descricao}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{desafio.duracao_dias} dias</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{desafio.participantes} participantes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>{desafio.xp_por_capitulo} XP/capítulo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{desafio.tema}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => iniciarDesafio(desafio.id)}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Iniciar Desafio
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}