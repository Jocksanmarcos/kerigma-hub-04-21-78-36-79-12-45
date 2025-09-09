import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Target, Star, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface CourseProgress {
  id: string;
  curso_id: string;
  status: string;
  frequencia_percentual: number | null;
  curso: {
    nome: string;
    categoria: string;
    carga_horaria: number;
  };
}

interface UserProgressRealProps {
  userProfile: any;
}

export const UserProgressReal: React.FC<UserProgressRealProps> = ({ userProfile }) => {
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [conquistas, setConquistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    if (pessoa) {
      loadProgressData();
    }
  }, [pessoa]);

  const loadProgressData = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);

      // Carregar progresso dos cursos
      const { data: matriculas, error: matriculasError } = await supabase
        .from('matriculas')
        .select(`
          id,
          curso_id,
          status,
          frequencia_percentual,
          cursos (
            nome,
            categoria,
            carga_horaria
          )
        `)
        .eq('pessoa_id', pessoa.id)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false });

      if (matriculasError) throw matriculasError;
      setCoursesProgress(matriculas as any || []);

      // Carregar XP total
      const { data: xpData, error: xpError } = await supabase
        .from('conquistas_ensino')
        .select('pontos_ganhos')
        .eq('pessoa_id', pessoa.id);

      if (xpError) throw xpError;
      const totalPoints = xpData?.reduce((sum, item) => sum + (item.pontos_ganhos || 0), 0) || 0;
      setTotalXP(totalPoints);

      // Carregar conquistas recentes
      const { data: conquistasData, error: conquistasError } = await supabase
        .from('conquistas_ensino')
        .select('*')
        .eq('pessoa_id', pessoa.id)
        .order('conquistada_em', { ascending: false })
        .limit(5);

      if (conquistasError) throw conquistasError;
      setConquistas(conquistasData || []);

    } catch (error) {
      console.error('Erro ao carregar dados de progresso:', error);
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

  const nivelInfo = getNivel(totalXP);
  const pontosProximoNivel = proximoNivel(totalXP);
  const progressoNivel = ((totalXP % 100) / 100) * 100;

  const milestones = [
    { name: 'Primeiro Curso', completed: totalXP >= 100, xp: 100 },
    { name: 'Estudante Dedicado', completed: totalXP >= 250, xp: 250 },
    { name: 'Evangelista', completed: totalXP >= 500, xp: 500 },
    { name: 'Líder em Formação', completed: totalXP >= 1000, xp: 1000 }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 bg-muted rounded-full mx-auto"></div>
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Progresso de Nível */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Progressão de Nível
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-kerigma-gradient flex items-center justify-center text-white font-bold text-xl">
                {nivelInfo.nome.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full">
                Lv. {nivelInfo.nivel}
              </div>
            </div>
            <h3 className="font-semibold mt-2">{nivelInfo.nome}</h3>
            <p className="text-sm text-muted-foreground">
              {totalXP} / {pontosProximoNivel} XP
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Progresso</span>
              <span className="font-semibold">{Math.round(progressoNivel)}%</span>
            </div>
            <Progress value={progressoNivel} className="h-3" />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Marcos Próximos</h4>
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-success' : 'bg-muted'}`} />
                <span className={milestone.completed ? 'text-muted-foreground line-through' : ''}>
                  {milestone.name}
                </span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {milestone.xp} XP
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cursos em Andamento */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Meus Cursos em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesProgress.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum curso em andamento</h3>
              <p className="text-muted-foreground mb-4">
                Inscreva-se em um curso para começar sua jornada de aprendizado.
              </p>
              <Button>
                Explorar Cursos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {coursesProgress.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-kerigma transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{course.curso?.nome}</h4>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {course.curso?.categoria}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Progresso</span>
                      <span className="font-semibold">{Math.round(course.frequencia_percentual || 0)}%</span>
                    </div>
                    <Progress value={course.frequencia_percentual || 0} className="h-2" />
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Status: {course.status}
                    </span>
                    <div className="flex items-center gap-1 text-primary">
                      <Clock className="h-3 w-3" />
                      <span>{course.curso?.carga_horaria}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};