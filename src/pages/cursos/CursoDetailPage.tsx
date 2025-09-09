import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { ConcluirCursoButton } from '@/components/jornada/ConcluirCursoButton';

interface Curso {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  nivel: string | null;
  carga_horaria: number | null;
  ativo: boolean;
}

interface Matricula {
  id: string;
  frequencia_percentual: number | null;
  status: string;
}

interface Aula {
  id: string;
  titulo: string;
  ordem: number;
  concluida?: boolean;
}

const CursoDetailPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const { pessoa } = useCurrentPerson();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [matricula, setMatricula] = useState<Matricula | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cursoId && pessoa) {
      loadCursoData();
    }
  }, [cursoId, pessoa]);

  const loadCursoData = async () => {
    if (!cursoId || !pessoa) return;

    try {
      // Carregar dados do curso
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', cursoId)
        .single();

      if (cursoError) throw cursoError;
      setCurso(cursoData);

      // Carregar matrícula do usuário
      const { data: matriculaData } = await supabase
        .from('matriculas')
        .select('*')
        .eq('curso_id', cursoId)
        .eq('pessoa_id', pessoa.id)
        .single();

      setMatricula(matriculaData);

      // Simular aulas do curso (em produção viria de uma tabela real)
      const aulasSimuladas: Aula[] = [
        { id: '1', titulo: 'Introdução ao Curso', ordem: 1 },
        { id: '2', titulo: 'Fundamentos Bíblicos', ordem: 2 },
        { id: '3', titulo: 'Aplicação Prática', ordem: 3 },
        { id: '4', titulo: 'Exercícios e Reflexões', ordem: 4 },
        { id: '5', titulo: 'Conclusão e Próximos Passos', ordem: 5 }
      ];
      
      setAulas(aulasSimuladas);

    } catch (error) {
      console.error('Erro ao carregar curso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!curso) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
          <Button asChild>
            <Link to="/cursos">Voltar aos Cursos</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const progresso = matricula?.frequencia_percentual || 0;
  const aulasAssistidas = Math.floor((progresso / 100) * aulas.length);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/cursos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Cursos
            </Link>
          </Button>
        </div>

        {/* Informações do Curso */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{curso.categoria}</Badge>
                  <Badge variant="secondary">{curso.nivel}</Badge>
                </div>
                <CardTitle className="text-2xl">{curso.nome}</CardTitle>
                <p className="text-muted-foreground">{curso.descricao}</p>
              </div>
              {matricula && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{progresso}%</div>
                  <div className="text-sm text-muted-foreground">Concluído</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{curso.carga_horaria || 8} horas</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{aulas.length} aulas</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>42 alunos matriculados</span>
              </div>
            </div>

            {matricula && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso no curso</span>
                  <span>{aulasAssistidas}/{aulas.length} aulas</span>
                </div>
                <Progress value={progresso} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Aulas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aulas.map((aula, index) => {
                  const concluida = index < aulasAssistidas;
                  const proximaAula = index === aulasAssistidas;
                  
                  return (
                    <div
                      key={aula.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg ${
                        proximaAula 
                          ? 'border-primary bg-primary/5' 
                          : concluida 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-muted'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {concluida ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : proximaAula ? (
                          <Play className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{aula.titulo}</h4>
                        <p className="text-sm text-muted-foreground">
                          Aula {aula.ordem} • 15 min
                        </p>
                      </div>
                      
                      {matricula && (proximaAula || concluida) && (
                        <Button asChild size="sm" variant={proximaAula ? "default" : "ghost"}>
                          <Link to={`/cursos/${cursoId}/aula/${aula.id}`}>
                            {concluida ? 'Revisar' : 'Assistir'}
                          </Link>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de Ações */}
          <div className="space-y-6">
            {!matricula ? (
              <Card>
                <CardHeader>
                  <CardTitle>Matricule-se no Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Acesse todo o conteúdo e acompanhe seu progresso.
                  </p>
                  <Button className="w-full" size="lg">
                    Fazer Matrícula
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {progresso >= 100 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Curso Concluído!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Parabéns! Você concluiu todas as aulas.
                      </p>
                      <ConcluirCursoButton 
                        cursoId={curso.id}
                        cursoNome={curso.nome}
                        className="w-full"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Continue seus estudos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Você está na aula {aulasAssistidas + 1} de {aulas.length}.
                      </p>
                      {aulas[aulasAssistidas] && (
                        <Button asChild className="w-full" size="lg">
                          <Link to={`/cursos/${cursoId}/aula/${aulas[aulasAssistidas].id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Continuar
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avaliação</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alunos</span>
                  <span className="font-medium">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de conclusão</span>
                  <span className="font-medium">89%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CursoDetailPage;