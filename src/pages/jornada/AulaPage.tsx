import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  FileDown, 
  ExternalLink,
  BookOpen,
  Trophy,
  Star,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Curso {
  id: string;
  nome: string;
  pontos_xp_recompensa: number;
}

interface Aula {
  id: string;
  curso_id: string;
  titulo_aula: string;
  ordem: number;
  tipo_conteudo: string;
  conteudo_principal?: string;
  material_extra_url?: string;
  duracao_minutos: number;
}

interface ProgressoAula {
  status: string;
  data_conclusao?: string;
  tempo_assistido_minutos: number;
}

export default function AulaPage() {
  const { courseId, aulaId } = useParams<{ courseId: string; aulaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [tempoAssistido, setTempoAssistido] = useState(0);
  const [aulaIniciada, setAulaIniciada] = useState(false);

  // Buscar dados da aula
  const { data: aula, isLoading: loadingAula } = useQuery({
    queryKey: ['aula', aulaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('id', aulaId)
        .single();

      if (error) throw error;
      return data as Aula;
    },
    enabled: !!aulaId
  });

  // Buscar dados do curso
  const { data: curso } = useQuery({
    queryKey: ['curso-aula', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('id, nome, pontos_xp_recompensa')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data as Curso;
    },
    enabled: !!courseId
  });

  // Buscar todas as aulas do curso para navegação
  const { data: todasAulas = [] } = useQuery({
    queryKey: ['aulas-navegacao', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aulas')
        .select('id, titulo_aula, ordem')
        .eq('curso_id', courseId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  // Buscar progresso do usuário nesta aula
  const { data: progressoData, isLoading: loadingProgresso } = useQuery({
    queryKey: ['progresso-aula', aulaId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) return null;

      const { data: progresso } = await supabase
        .from('progresso_alunos')
        .select('*')
        .eq('pessoa_id', pessoa.id)
        .eq('aula_id', aulaId)
        .single();

      return {
        pessoa_id: pessoa.id,
        progresso: progresso as ProgressoAula | null
      };
    },
    enabled: !!aulaId
  });

  // Mutation para concluir aula
  const concluirAulaMutation = useMutation({
    mutationFn: async () => {
      if (!progressoData?.pessoa_id || !aula) return;

      const response = await supabase.functions.invoke('processar-conclusao-aula', {
        body: {
          pessoa_id: progressoData.pessoa_id,
          aula_id: aula.id,
          curso_id: aula.curso_id,
          tempo_assistido: tempoAssistido
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progresso-aula'] });
      queryClient.invalidateQueries({ queryKey: ['inscricao-curso'] });
      
      toast({
        title: "🎉 Aula Concluída!",
        description: `Você ganhou ${data.xp_ganho_aula} XP!`
      });

      if (data.curso_completo) {
        toast({
          title: "🏆 Curso Completo!",
          description: `Parabéns! Você ganhou ${data.recompensa_curso.xp_ganho} XP adicional!`,
          duration: 5000
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao concluir aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível concluir a aula. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Timer para controlar tempo assistido
  useEffect(() => {
    if (!aulaIniciada) return;

    const interval = setInterval(() => {
      setTempoAssistido(prev => prev + 1);
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [aulaIniciada]);

  // Iniciar aula automaticamente
  useEffect(() => {
    if (aula && !aulaIniciada) {
      setAulaIniciada(true);
      if (progressoData?.progresso?.tempo_assistido_minutos) {
        setTempoAssistido(progressoData.progresso.tempo_assistido_minutos);
      }
    }
  }, [aula, aulaIniciada, progressoData]);

  if (loadingAula || loadingProgresso) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">Aula não encontrada</h1>
        <Button asChild className="mt-4">
          <Link to={`/jornada/cursos/${courseId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Curso
          </Link>
        </Button>
      </div>
    );
  }

  const aulaConcluida = progressoData?.progresso?.status === 'concluido';
  const aulaAtual = todasAulas.findIndex(a => a.id === aulaId);
  const proximaAula = todasAulas[aulaAtual + 1];
  const aulaAnterior = todasAulas[aulaAtual - 1];

  // Função para renderizar conteúdo baseado no tipo
  const renderConteudo = () => {
    switch (aula.tipo_conteudo) {
      case 'video':
        if (!aula.conteudo_principal) {
          return (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Vídeo não disponível</p>
            </div>
          );
        }

        // Detectar tipo de URL de vídeo
        const isYouTube = aula.conteudo_principal.includes('youtube.com') || aula.conteudo_principal.includes('youtu.be');
        const isVimeo = aula.conteudo_principal.includes('vimeo.com');

        if (isYouTube) {
          const videoId = aula.conteudo_principal.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
          return (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={aula.titulo_aula}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          );
        } else if (isVimeo) {
          const videoId = aula.conteudo_principal.match(/vimeo\.com\/(\d+)/)?.[1];
          return (
            <div className="aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${videoId}`}
                title={aula.titulo_aula}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          );
        } else {
          return (
            <div className="aspect-video">
              <video
                src={aula.conteudo_principal}
                title={aula.titulo_aula}
                className="w-full h-full rounded-lg"
                controls
              />
            </div>
          );
        }

      case 'texto':
        return (
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: aula.conteudo_principal || '<p>Conteúdo não disponível</p>' 
              }} 
            />
          </div>
        );

      case 'quiz':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Quiz da Aula</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de quiz em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Tipo de conteúdo não suportado: {aula.tipo_conteudo}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        
        {/* Header com Navegação */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/jornada/cursos/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Curso
              </Link>
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {curso?.nome} • Aula {aula.ordem}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aulaAnterior && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/jornada/cursos/${courseId}/aulas/${aulaAnterior.id}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {proximaAula && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/jornada/cursos/${courseId}/aulas/${proximaAula.id}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Status da Aula */}
        {aulaConcluida && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Aula Concluída!</strong> Você completou esta aula em {' '}
              {progressoData?.progresso?.data_conclusao && 
                new Date(progressoData.progresso.data_conclusao).toLocaleDateString()
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Título da Aula */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">{aula.titulo_aula}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {aula.tipo_conteudo}
                </Badge>
                {aula.duracao_minutos > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {aula.duracao_minutos} minutos
                  </div>
                )}
                <div>
                  Tempo assistido: {tempoAssistido} min
                </div>
              </div>
            </div>

            {/* Conteúdo da Aula */}
            <Card>
              <CardContent className="p-6">
                {renderConteudo()}
              </CardContent>
            </Card>

            {/* Material Extra */}
            {aula.material_extra_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Material Complementar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <a 
                      href={aula.material_extra_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Baixar Material
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progresso e Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!aulaConcluida ? (
                  <Button 
                    onClick={() => concluirAulaMutation.mutate()}
                    disabled={concluirAulaMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {concluirAulaMutation.isPending ? (
                      'Processando...'
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluir Aula
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-semibold">Aula Concluída!</p>
                    <p className="text-sm text-muted-foreground">
                      Parabéns pelo progresso!
                    </p>
                  </div>
                )}

                {proximaAula && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/jornada/cursos/${courseId}/aulas/${proximaAula.id}`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Próxima Aula
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Lista de Aulas */}
            <Card>
              <CardHeader>
                <CardTitle>Aulas do Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {todasAulas.map((aulaItem, index) => (
                  <Link
                    key={aulaItem.id}
                    to={`/jornada/cursos/${courseId}/aulas/${aulaItem.id}`}
                    className={`block p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                      aulaItem.id === aulaId ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        aulaItem.id === aulaId 
                          ? 'bg-primary text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm truncate">{aulaItem.titulo_aula}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}