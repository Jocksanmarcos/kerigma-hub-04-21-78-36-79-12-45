import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  WifiOff,
  RefreshCw,
  Calendar,
  Users
} from 'lucide-react';
import { usePortalAluno } from '@/hooks/usePortalAluno';
import { usePWA } from '@/hooks/usePWA';

export const OfflinePortalAluno: React.FC = () => {
  const { courses, progress, loading, syncing, updateProgress, syncOfflineProgress } = usePortalAluno();
  const { isOnline } = usePWA();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Carregando dados offline...</span>
        </div>
        {/* Skeleton cards */}
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-muted rounded w-full mb-2"></div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const handleContinueCourse = async (courseId: string) => {
    // Simular continuação de curso - em um app real, isso abriria a próxima lição
    const lastProgress = progress.find(p => p.curso_id === courseId && p.progress_percent < 100);
    if (lastProgress) {
      await updateProgress(courseId, lastProgress.licao_id, Math.min(lastProgress.progress_percent + 10, 100));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com status offline */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portal do Aluno</h1>
          <p className="text-muted-foreground">
            {isOnline ? 'Dados sincronizados' : 'Modo offline ativo'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
          
          {syncing && (
            <Badge variant="default" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Sincronizando
            </Badge>
          )}
          
          {!isOnline && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={syncOfflineProgress}
              disabled={syncing}
            >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Sincronizar
            </Button>
          )}
        </div>
      </div>

      {/* Resumo de progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Meu Progresso
          </CardTitle>
          <CardDescription>
            Acompanhe seu desenvolvimento nos cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {courses.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Cursos Disponíveis
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {courses.filter(c => c.progress_percent === 100).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Cursos Concluídos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {Math.round(courses.reduce((sum, c) => sum + c.progress_percent, 0) / Math.max(courses.length, 1))}%
              </div>
              <div className="text-sm text-muted-foreground">
                Progresso Médio
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cursos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Meus Cursos</h2>
        
        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum curso encontrado</h3>
              <p className="text-muted-foreground text-center">
                {isOnline 
                  ? 'Você ainda não está matriculado em nenhum curso.'
                  : 'Dados não disponíveis offline. Conecte-se para ver seus cursos.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {course.description}
                    </CardDescription>
                  </div>
                  {course.image_url && (
                    <img 
                      src={course.image_url} 
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover ml-4"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progresso */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso do Curso</span>
                    <span className="font-medium">{course.progress_percent}%</span>
                  </div>
                  <Progress value={course.progress_percent} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{course.completed_lessons} de {course.total_lessons} lições</span>
                    <span>
                      {course.progress_percent === 100 ? (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          Concluído
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Em andamento
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleContinueCourse(course.id)}
                    className="flex-1"
                    disabled={syncing}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {course.progress_percent === 0 ? 'Iniciar Curso' : 'Continuar'}
                  </Button>
                  
                  <Button variant="outline" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações sobre modo offline */}
      {!isOnline && (
        <Card className="border-warning/20 bg-warning-soft">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-medium text-warning-foreground">Modo Offline Ativo</h3>
                <p className="text-sm text-warning-foreground/80 mt-1">
                  Você pode continuar estudando. Seu progresso será salvo localmente 
                  e sincronizado automaticamente quando a conexão for restaurada.
                </p>
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Disponível offline:</h4>
                  <ul className="text-sm space-y-1 text-warning-foreground/80">
                    <li>• Cursos baixados anteriormente</li>
                    <li>• Progresso das lições</li>
                    <li>• Agenda pessoal</li>
                    <li>• Conquistas e certificados</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};