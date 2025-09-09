import React, { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Star, 
  Clock, 
  Users,
  TrendingUp,
  Play,
  CheckCircle2,
  Award,
  Flame,
  Calendar,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useAlunoStats } from '@/hooks/useAlunoStats';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { QuickStudyAction } from '@/components/jornada/QuickStudyAction';

// Minimal SEO helpers
const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let link = document.querySelector("link[rel='canonical']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

interface Trilha {
  id: string;
  slug: string | null;
  titulo: string | null;
  nome: string | null;
  descricao: string | null;
  ordem: number | null;
  ativo: boolean | null;
}

interface Curso {
  id: string;
  trilha_id: string | null;
  nome: string;
  descricao: string | null;
  slug: string | null;
  categoria: string | null;
  nivel: string | null;
  carga_horaria: number | null;
}

interface Matricula {
  id: string;
  curso_id: string;
  pessoa_id: string;
  data_matricula: string;
  status: string;
  progresso_percent: number | null;
  ultima_aula_vista: string | null;
  data_ultima_atividade: string | null;
  cursos?: Curso;
}

interface UltimaAtividade {
  tipo_atividade: string;
  curso_id: string | null;
  data_atividade: string;
  curso?: {
    nome: string;
  };
}

interface ProximaEtapa {
  tipo: 'continuar_curso' | 'novo_curso' | 'estudo_biblico' | 'retomar_habito';
  titulo: string;
  descricao: string;
  acao: string;
  link: string;
  icone: React.ComponentType<any>;
  cor: string;
}

const JornadaCrescimentoPage: React.FC = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaAtividade, setUltimaAtividade] = useState<UltimaAtividade | null>(null);
  const { pessoa } = useCurrentPerson();
  const { stats, loading: statsLoading } = useAlunoStats();
  const { sequenciaAtual, melhorSequencia, diasEsteMes, ultimosDias, registrarAtividade } = useStudyStreak();

  useEffect(() => {
    document.title = 'Jornada de Crescimento | Kerigma Hub';
    setMeta('description', 'Sua jornada de crescimento espiritual: trilhas de formação, estudo bíblico e progresso pessoal.');
    setCanonical(window.location.origin + '/jornada');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!pessoa) return;
      
      setLoading(true);
      const [trilhasRes, cursosRes, matriculasRes, atividadeRes] = await Promise.all([
        supabase.from('trilhas_formacao').select('id, slug, titulo, nome, descricao, ordem, ativo').order('ordem', { ascending: true }),
        supabase.from('cursos').select('id, trilha_id, nome, descricao, slug, categoria, nivel, carga_horaria').eq('ativo', true).order('ordem', { ascending: true }),
        supabase.from('matriculas')
          .select(`
            id,
            curso_id,
            pessoa_id,
            data_matricula,
            status,
            progresso_percent,
            ultima_aula_vista,
            data_ultima_atividade,
            cursos(id, nome, descricao, categoria, nivel, carga_horaria)
          `)
          .eq('pessoa_id', pessoa.id)
          .eq('status', 'cursando')
          .order('data_ultima_atividade', { ascending: false }),
        supabase.from('atividades_estudo')
          .select(`
            tipo_atividade,
            curso_id,
            data_atividade,
            cursos(nome)
          `)
          .eq('pessoa_id', pessoa.id)
          .order('data_atividade', { ascending: false })
          .limit(1)
      ]);

      if (!trilhasRes.error && trilhasRes.data) setTrilhas(trilhasRes.data as any);
      if (!cursosRes.error && cursosRes.data) setCursos(cursosRes.data as any);
      if (!matriculasRes.error && matriculasRes.data) setMatriculas(matriculasRes.data as any);
      if (!atividadeRes.error && atividadeRes.data?.[0]) {
        setUltimaAtividade(atividadeRes.data[0] as any);
      }
      setLoading(false);
    };
    fetchData();
  }, [pessoa]);

  // Calcular progresso até próximo nível
  const progressToNextLevel = stats ? Math.min((stats.xp / stats.next_level_xp) * 100, 100) : 0;

  // Lógica inteligente para próxima etapa
  const proximaEtapa: ProximaEtapa = useMemo(() => {
    const hoje = new Date();
    const ultimaAtividadeData = ultimaAtividade ? new Date(ultimaAtividade.data_atividade) : null;
    const diasSemAtividade = ultimaAtividadeData ? 
      Math.floor((hoje.getTime() - ultimaAtividadeData.getTime()) / (1000 * 60 * 60 * 24)) : 999;

    // Se tem sequência ativa mas não estudou hoje
    if (sequenciaAtual > 0 && diasSemAtividade >= 1) {
      return {
        tipo: 'retomar_habito',
        titulo: `Mantenha sua sequência de ${sequenciaAtual} dias!`,
        descricao: 'Não perca sua sequência de estudos, continue hoje mesmo',
        acao: 'Continuar Estudo',
        link: '/jornada/biblia',
        icone: Flame,
        cor: 'text-orange-600'
      };
    }

    // Se tem curso em andamento (priorizar matrículas ativas)
    if (matriculas.length > 0 && matriculas[0].cursos) {
      return {
        tipo: 'continuar_curso',
        titulo: `Continue: ${matriculas[0].cursos.nome}`,
        descricao: 'Você tem um curso em andamento, continue seus estudos',
        acao: 'Continuar Curso',
        link: matriculas[0].ultima_aula_vista 
          ? `/cursos/${matriculas[0].curso_id}/aula/${matriculas[0].ultima_aula_vista}`
          : `/cursos/${matriculas[0].curso_id}`,
        icone: Play,
        cor: 'text-blue-600'
      };
    }

    // Se tem curso em andamento pela última atividade
    if (ultimaAtividade?.curso_id && ultimaAtividade.curso) {
      return {
        tipo: 'continuar_curso',
        titulo: `Continue: ${ultimaAtividade.curso.nome}`,
        descricao: 'Você estava progredindo bem neste curso',
        acao: 'Continuar Curso',
        link: `/cursos?curso=${ultimaAtividade.curso_id}`,
        icone: Play,
        cor: 'text-blue-600'
      };
    }

    // Se nunca estudou ou faz muito tempo
    if (diasSemAtividade > 7) {
      return {
        tipo: 'novo_curso',
        titulo: 'Comece sua jornada de crescimento',
        descricao: 'Explore nossos cursos e trilhas de formação',
        acao: 'Ver Cursos',
        link: '/portal-aluno',
        icone: BookOpen,
        cor: 'text-green-600'
      };
    }

    // Padrão: estudo bíblico
    return {
      tipo: 'estudo_biblico',
      titulo: 'Continue seu estudo bíblico',
      descricao: 'Explore as Escrituras com nosso leitor inteligente',
      acao: 'Ler Bíblia',
      link: '/jornada/biblia',
      icone: BookOpen,
      cor: 'text-purple-600'
    };
  }, [ultimaAtividade, sequenciaAtual, diasEsteMes, matriculas]);
  
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Jornada de Crescimento</h1>
          <p className="text-muted-foreground">
            Sua jornada de crescimento espiritual unificada: cursos, estudo bíblico e conquistas.
          </p>
        </div>

        {/* Card de Progresso Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Seu Progresso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats?.nivel || 'Aprendiz'}</div>
                  <div className="text-sm text-muted-foreground">Nível Atual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats?.xp || 0}</div>
                  <div className="text-sm text-muted-foreground">XP Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats?.badge_atual || 'Estudante Dedicado'}</div>
                  <div className="text-sm text-muted-foreground">Badge Atual</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso para o próximo nível</span>
                  <span>{stats?.xp || 0} / {stats?.next_level_xp || 2000} XP</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Card de Streak */}
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/5 border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                Sequência de Estudos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{sequenciaAtual}</div>
                <div className="text-sm text-muted-foreground">Dias consecutivos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-muted-foreground">{melhorSequencia}</div>
                <div className="text-xs text-muted-foreground">Melhor sequência</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Últimos 7 dias</div>
                <div className="flex gap-1 justify-center">
                  {ultimosDias.map((ativo, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        ativo 
                          ? 'bg-orange-600 border-orange-600 text-white' 
                          : 'border-muted bg-muted/50'
                      }`}
                    >
                      {ativo ? <CheckCircle2 className="h-3 w-3" /> : null}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Dinâmico "Sua Próxima Etapa" */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Sua Próxima Etapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-muted ${proximaEtapa.cor}`}>
                  <proximaEtapa.icone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{proximaEtapa.titulo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {proximaEtapa.descricao}
                  </p>
                </div>
              </div>
              <Button asChild className="flex items-center gap-2">
                <Link to={proximaEtapa.link}>
                  {proximaEtapa.acao}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Informação adicional sobre atividade recente */}
            {ultimaAtividade && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Última atividade: {new Date(ultimaAtividade.data_atividade).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção Minhas Trilhas de Aprendizagem (E-learning) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Minhas Trilhas de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-32 bg-muted animate-pulse rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
                  ))}
                </div>
              </div>
            ) : matriculas.length > 0 ? (
              <>
                {/* Card de Destaque - Continuar Curso */}
                {matriculas[0] && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Play className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Continuar: {matriculas[0].cursos?.nome}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {matriculas[0].cursos?.categoria} • {matriculas[0].cursos?.nivel}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${matriculas[0].progresso_percent || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {matriculas[0].progresso_percent || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button asChild size="lg">
                        <Link 
                          to={matriculas[0].ultima_aula_vista 
                            ? `/cursos/${matriculas[0].curso_id}/aula/${matriculas[0].ultima_aula_vista}`
                            : `/cursos/${matriculas[0].curso_id}`
                          }
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continuar
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de Outros Cursos */}
                {matriculas.length > 1 && (
                  <div>
                    <h4 className="font-medium mb-3">Meus Outros Cursos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matriculas.slice(1).map((matricula) => (
                        <div key={matricula.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">{matricula.cursos?.nome}</h5>
                            <Badge variant="outline" className="text-xs">
                              {matricula.progresso_percent || 0}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {matricula.cursos?.categoria}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full" 
                                style={{ width: `${matricula.progresso_percent || 0}%` }}
                              />
                            </div>
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/cursos/${matricula.curso_id}`}>
                                Acessar
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botão Explorar Cursos */}
                <div className="pt-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/portal-aluno">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Explorar Todos os Cursos
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              /* Estado vazio - sem cursos matriculados */
              <div className="text-center py-8">
                <div className="mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-lg mb-2">Comece sua jornada de aprendizado</h3>
                  <p className="text-muted-foreground">
                    Explore nossos cursos e trilhas de formação espiritual
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/portal-aluno">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver Cursos Disponíveis
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/jornada/trilhas">
                      Ver Trilhas de Formação
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seção Trilhas de Formação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Trilhas de Formação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {trilhas.filter(t => t.ativo !== false).slice(0, 3).map((trilha) => (
                    <div key={trilha.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{trilha.nome || trilha.titulo}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {trilha.descricao || 'Trilha de formação espiritual'}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/jornada/trilhas#${trilha.slug}`}>
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/jornada/trilhas">
                      Ver Todas as Trilhas
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção Estudo Diário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Estudo Diário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/jornada/biblia/livros">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-medium">Leitura Bíblica</h4>
                      <p className="text-xs text-muted-foreground">Explore as Escrituras</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/jornada/desafios">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <h4 className="font-medium">Desafios</h4>
                      <p className="text-xs text-muted-foreground">Gamificação</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/jornada/biblia">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Dashboard Bíblico
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/jornada/planos-leitura">
                    <Clock className="h-4 w-4 mr-2" />
                    Planos de Leitura
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção Meu Desempenho */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Meu Desempenho
              </CardTitle>
              <QuickStudyAction />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-md">
                <div className="text-2xl font-bold text-green-600">{diasEsteMes}</div>
                <div className="text-sm text-muted-foreground">Dias estudados este mês</div>
              </div>
              <div className="text-center p-4 border rounded-md">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium">Ranking</h4>
                <p className="text-sm text-muted-foreground">Veja sua posição</p>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link to="/jornada/ranking">Ver Ranking</Link>
                </Button>
              </div>
              <div className="text-center p-4 border rounded-md">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <h4 className="font-medium">Medalhas</h4>
                <p className="text-sm text-muted-foreground">Suas conquistas</p>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link to="/jornada/medalhas">Ver Medalhas</Link>
                </Button>
              </div>
              <div className="text-center p-4 border rounded-md">
                <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium">Progresso</h4>
                <p className="text-sm text-muted-foreground">Acompanhe evolução</p>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link to="/jornada/progresso">Ver Progresso</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JSON-LD para SEO */}
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'Jornada de Crescimento',
            description: 'Plataforma unificada de crescimento espiritual com cursos e estudo bíblico',
            url: `${window.location.origin}/jornada`,
            educationalCredentialAwarded: 'Certificados de Conclusão',
            hasEducationalUse: ['Estudo Bíblico', 'Formação Espiritual', 'Discipulado'],
          })}
        </script>
      </div>
    </AppLayout>
  );
};

export default JornadaCrescimentoPage;