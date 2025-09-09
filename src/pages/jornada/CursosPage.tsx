import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, Search, Filter, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Curso {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  nivel: string;
  imagem_capa_url?: string;
  pontos_xp_recompensa: number;
  status: string;
  carga_horaria?: number;
  destaque: boolean;
}

interface ProgressoCurso {
  curso_id: string;
  percentual_progresso: number;
  total_aulas: number;
  aulas_concluidas: number;
}

export default function CursosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const { toast } = useToast();

  // Buscar cursos publicados
  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ['cursos-publicados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('status', 'publicado')
        .eq('ativo', true)
        .order('destaque', { ascending: false })
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as Curso[];
    }
  });

  // Buscar progresso do usuário
  const { data: progressos = [] } = useQuery({
    queryKey: ['meu-progresso-cursos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Buscar pessoa_id do usuário atual
      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) return [];

      // Buscar progresso de todos os cursos
      const cursosIds = cursos.map(c => c.id);
      const progressos: ProgressoCurso[] = [];

      for (const cursoId of cursosIds) {
        const { data } = await supabase
          .rpc('calcular_progresso_curso', {
            p_pessoa_id: pessoa.id,
            p_curso_id: cursoId
          });

        if (data?.[0]) {
          progressos.push({
            curso_id: cursoId,
            ...data[0]
          });
        }
      }

      return progressos;
    },
    enabled: cursos.length > 0
  });

  // Filtrar cursos
  const cursosFiltrados = cursos.filter(curso => {
    const matchSearch = curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       curso.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || curso.categoria === categoryFilter;
    const matchLevel = levelFilter === "all" || curso.nivel === levelFilter;
    
    return matchSearch && matchCategory && matchLevel;
  });

  // Função para inscrever em curso
  const inscreverCurso = async (cursoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para se inscrever em um curso.",
          variant: "destructive"
        });
        return;
      }

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) {
        toast({
          title: "Erro",
          description: "Perfil de usuário não encontrado.",
          variant: "destructive"
        });
        return;
      }

      await supabase
        .from('inscricoes_cursos')
        .insert({
          pessoa_id: pessoa.id,
          curso_id: cursoId,
          origem_inscricao: 'catalogo'
        });

      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito no curso com sucesso."
      });

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

  const getProgressoStatus = (cursoId: string) => {
    const progresso = progressos.find(p => p.curso_id === cursoId);
    if (!progresso || progresso.percentual_progresso === 0) return null;
    return progresso;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            🎓 Plataforma Legado
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra, aprenda e cresça com nossos cursos de formação espiritual e liderança cristã
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="discipulado">Discipulado</SelectItem>
                  <SelectItem value="lideranca">Liderança</SelectItem>         
                  <SelectItem value="teologia">Teologia</SelectItem>
                  <SelectItem value="vida_crista">Vida Cristã</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursosFiltrados.map((curso) => {
            const progresso = getProgressoStatus(curso.id);
            const isInscrito = !!progresso;
            const isCompleto = progresso?.percentual_progresso === 100;
            
            return (
              <Card key={curso.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Imagem do Curso */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                  {curso.imagem_capa_url ? (
                    <img 
                      src={curso.imagem_capa_url} 
                      alt={curso.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {curso.destaque && (
                      <Badge variant="default" className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                    {isCompleto && (
                      <Badge variant="default" className="bg-green-600">
                        <Trophy className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>

                  {/* XP Reward */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-primary/90 text-white">
                      +{curso.pontos_xp_recompensa} XP
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {curso.nome}
                    </CardTitle>
                  </div>
                  
                  <CardDescription className="line-clamp-3">
                    {curso.descricao || "Explore este curso completo de formação."}
                  </CardDescription>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {curso.categoria || 'General'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {curso.nivel || 'Básico'}
                    </Badge>
                    {curso.carga_horaria && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {curso.carga_horaria}h
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progresso */}
                  {progresso && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progresso.percentual_progresso}%</span>
                      </div>
                      <Progress value={progresso.percentual_progresso} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {progresso.aulas_concluidas} de {progresso.total_aulas} aulas concluídas
                      </p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2">
                    {isInscrito ? (
                      <Button asChild className="flex-1">
                        <Link to={`/jornada/cursos/${curso.id}`}>
                          {isCompleto ? 'Revisar Curso' : 'Continuar Curso'}
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          asChild
                          className="flex-1"
                        >
                          <Link to={`/jornada/cursos/${curso.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                        <Button 
                          onClick={() => inscreverCurso(curso.id)}
                          className="flex-1"
                        >
                          Inscrever-se
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {cursosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros para encontrar cursos disponíveis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}