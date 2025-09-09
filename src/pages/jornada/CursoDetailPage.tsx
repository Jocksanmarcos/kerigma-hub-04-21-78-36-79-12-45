import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  PlayCircle, 
  CheckCircle2, 
  Lock,
  ArrowLeft,
  Star,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Curso {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  nivel: string;
  imagem_capa_url?: string;
  pontos_xp_recompensa: number;
  carga_horaria?: number;
  destaque: boolean;
}

interface Aula {
  id: string;
  titulo_aula: string;
  ordem: number;
  tipo_conteudo: string;
  duracao_minutos: number;
  disponivel_apos_data?: string;
}

interface ProgressoAula {
  aula_id: string;
  status: string;
  data_conclusao?: string;
}

export default function CursoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Buscar dados do curso
  const { data: curso, isLoading: loadingCurso } = useQuery({
    queryKey: ['curso', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Curso;
    },
    enabled: !!id
  });

  // Buscar aulas do curso
  const { data: aulas = [], isLoading: loadingAulas } = useQuery({
    queryKey: ['aulas-curso', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('curso_id', id)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as Aula[];
    },
    enabled: !!id
  });

  // Verificar se usuário está inscrito e buscar progresso
  const { data: inscricaoData, isLoading: loadingInscricao } = useQuery({
    queryKey: ['inscricao-curso', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) return null;

      // Verificar inscrição
      const { data: inscricao } = await supabase
        .from('inscricoes_cursos')
        .select('*')
        .eq('pessoa_id', pessoa.id)
        .eq('curso_id', id)
        .single();

      // Buscar progresso das aulas
      const { data: progressos = [] } = await supabase
        .from('progresso_alunos')
        .select('aula_id, status, data_conclusao')
        .eq('pessoa_id', pessoa.id)
        .in('aula_id', aulas.map(a => a.id));

      // Calcular progresso geral
      let progressoGeral = null;
      if (aulas.length > 0) {
        const { data } = await supabase
          .rpc('calcular_progresso_curso', {
            p_pessoa_id: pessoa.id,
            p_curso_id: id
          });
        progressoGeral = data?.[0];
      }

      return {
        pessoa_id: pessoa.id,
        inscrito: !!inscricao,
        progressos: progressos as ProgressoAula[],
        progresso_geral: progressoGeral
      };
    },
    enabled: !!id && aulas.length > 0
  });

  // Função para inscrever no curso
  const inscreverCurso = async () => {
    if (!inscricaoData?.pessoa_id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para se inscrever.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('inscricoes_cursos')
        .insert({
          pessoa_id: inscricaoData.pessoa_id,
          curso_id: id!,
          origem_inscricao: 'detalhes_curso'
        });

      if (error) throw error;

      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito no curso com sucesso."
      });

      // Recarregar dados
      window.location.reload();

    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Já inscrito",
          description: "Você já está inscrito neste curso.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro na inscrição",
          description: "Ocorreu um erro ao processar sua inscrição.",
          variant: "destructive"
        });
      }
    }
  };

  // Verificar se aula está disponível
  const aulaDisponivel = (aula: Aula, index: number) => {
    if (index === 0) return true; // Primeira aula sempre disponível
    
    // Verificar se aula anterior foi concluída
    const aulaAnterior = aulas[index - 1];
    const progressoAnterior = inscricaoData?.progressos.find(p => p.aula_id === aulaAnterior.id);
    return progressoAnterior?.status === 'concluido';
  };

  // Obter status da aula
  const getStatusAula = (aulaId: string) => {
    const progresso = inscricaoData?.progressos.find(p => p.aula_id === aulaId);
    return progresso?.status || 'nao_iniciado';
  };

  if (loadingCurso || loadingAulas || loadingInscricao) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">Curso não encontrado</h1>
        <Button asChild className="mt-4">
          <Link to="/jornada/cursos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Cursos
          </Link>
        </Button>
      </div>
    );
  }

  const aulasConcluidas = inscricaoData?.progressos.filter(p => p.status === 'concluido').length || 0;
  const percentualProgresso = inscricaoData?.progresso_geral?.percentual_progresso || 0;
  const isCompleto = percentualProgresso === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/jornada/cursos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        {/* Banner do Curso */}
        <Card className="overflow-hidden">
          <div className="md:flex">
            {/* Imagem */}
            <div className="md:w-1/3 aspect-video md:aspect-square bg-gradient-to-br from-primary/10 to-primary/5 relative">
              {curso.imagem_capa_url ? (
                <img 
                  src={curso.imagem_capa_url} 
                  alt={curso.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-primary/30" />
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="md:w-2/3 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {curso.destaque && (
                    <Badge className="bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                  {isCompleto && (
                    <Badge className="bg-green-600">
                      <Trophy className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    +{curso.pontos_xp_recompensa} XP
                  </Badge>
                </div>
                
                <h1 className="text-3xl font-bold text-primary">{curso.nome}</h1>
                <p className="text-lg text-muted-foreground">{curso.descricao}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {curso.categoria}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {curso.nivel}
                </div>
                {curso.carga_horaria && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {curso.carga_horaria} horas
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  {aulas.length} aulas
                </div>
              </div>

              {/* Progresso se inscrito */}
              {inscricaoData?.inscrito && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Seu Progresso</span>
                    <span>{percentualProgresso}%</span>
                  </div>
                  <Progress value={percentualProgresso} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {aulasConcluidas} de {aulas.length} aulas concluídas
                  </p>
                </div>
              )}

              {/* Botão de Ação */}
              <div>
                {inscricaoData?.inscrito ? (
                  <Button size="lg" asChild>
                    <Link to={`/jornada/cursos/${id}/aulas/${aulas[0]?.id}`}>
                      {isCompleto ? 'Revisar Curso' : 'Continuar Curso'}
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" onClick={inscreverCurso}>
                    Inscrever-se no Curso
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Lista de Aulas */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Curso</CardTitle>
            <CardDescription>
              {aulas.length} aulas • {aulas.reduce((acc, aula) => acc + (aula.duracao_minutos || 0), 0)} minutos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {aulas.map((aula, index) => {
              const status = getStatusAula(aula.id);
              const disponivel = aulaDisponivel(aula, index);
              const concluida = status === 'concluido';
              
              return (
                <div
                  key={aula.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    disponivel && inscricaoData?.inscrito 
                      ? 'hover:bg-muted/50 cursor-pointer' 
                      : 'opacity-60'
                  } ${concluida ? 'bg-green-50 border-green-200' : 'bg-background'}`}
                >
                  {/* Ícone de Status */}
                  <div className="flex-shrink-0">
                    {concluida ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : disponivel && inscricaoData?.inscrito ? (
                      <PlayCircle className="h-6 w-6 text-primary" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Informações da Aula */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {index + 1}. {aula.titulo_aula}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="capitalize">{aula.tipo_conteudo}</span>
                      {aula.duracao_minutos > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {aula.duracao_minutos} min
                        </span>
                      )}
                      {concluida && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Concluída
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Botão de Acesso */}
                  {disponivel && inscricaoData?.inscrito && (
                    <Button 
                      variant={concluida ? "outline" : "default"}
                      size="sm"
                      asChild
                    >
                      <Link to={`/jornada/cursos/${id}/aulas/${aula.id}`}>
                        {concluida ? 'Revisar' : 'Assistir'}
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}

            {aulas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Este curso ainda não possui aulas disponíveis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}