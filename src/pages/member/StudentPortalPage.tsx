import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  Play, 
  Download, 
  CheckCircle,
  Clock,
  Trophy,
  Star,
  FileText,
  Users
} from 'lucide-react';

const StudentPortalPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Portal do Aluno | Kerigma Hub';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Ambiente de aprendizado virtual - Cursos, lições e certificados');
    }
  }, []);

  // Mock data - em produção viria do banco
  const enrolledCourses = [
    {
      id: 1,
      title: "Fundamentos da Fé",
      instructor: "Pr. Carlos Silva",
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      nextLesson: "Lição 10: A Oração",
      category: "Discipulado",
      duration: "8 semanas",
      level: "Básico"
    },
    {
      id: 2,
      title: "Liderança Cristã",
      instructor: "Pr. Maria Santos",
      progress: 45,
      totalLessons: 16,
      completedLessons: 7,
      nextLesson: "Lição 8: Desenvolvendo Líderes",
      category: "Liderança",
      duration: "12 semanas",
      level: "Intermediário"
    },
    {
      id: 3,
      title: "História da Igreja",
      instructor: "Prof. João Oliveira",
      progress: 100,
      totalLessons: 8,
      completedLessons: 8,
      nextLesson: "Curso Concluído",
      category: "Teologia",
      duration: "6 semanas",
      level: "Básico",
      completed: true
    }
  ];

  const recentLessons = [
    {
      id: 1,
      courseTitle: "Fundamentos da Fé",
      lessonTitle: "A Salvação pela Graça",
      duration: "25 min",
      completed: true,
      date: "Hoje"
    },
    {
      id: 2,
      courseTitle: "Liderança Cristã",
      lessonTitle: "Características de um Líder",
      duration: "32 min",
      completed: true,
      date: "Ontem"
    }
  ];

  const certificates = [
    {
      id: 1,
      courseTitle: "História da Igreja",
      issueDate: "15 Nov 2024",
      certificateId: "CERT-2024-001",
      downloadable: true
    }
  ];

  const achievements = [
    { id: 1, title: "Primeiro Curso Concluído", icon: Trophy, earned: true },
    { id: 2, title: "Estudante Dedicado", icon: Star, earned: true },
    { id: 3, title: "5 Cursos Concluídos", icon: GraduationCap, earned: false }
  ];

  return (
    <AppLayout>
      <div className="space-y-6 p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Portal do Aluno
          </h1>
          <p className="text-muted-foreground">
            Continue sua jornada de aprendizado e crescimento espiritual
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Cursos */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-kerigma">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Meus Cursos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      selectedCourse === course.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted/50 hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedCourse(
                      selectedCourse === course.id ? null : course.id
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{course.title}</h3>
                          {course.completed && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Por {course.instructor}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {course.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {course.completedLessons}/{course.totalLessons} lições
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-sm font-medium text-primary">
                        {course.completed ? '✅ Concluído!' : `📚 ${course.nextLesson}`}
                      </p>
                    </div>
                    
                    {selectedCourse === course.id && (
                      <div className="mt-4 pt-4 border-t border-muted/30">
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Play className="h-4 w-4 mr-2" />
                            {course.completed ? 'Revisar' : 'Continuar'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Materiais
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <Button className="w-full" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explorar Novos Cursos
                </Button>
              </CardContent>
            </Card>

            {/* Lições Recentes */}
            <Card className="shadow-kerigma">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 border border-muted/50 rounded-lg"
                    >
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <Play className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {lesson.lessonTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.courseTitle} • {lesson.duration}
                        </p>
                      </div>
                      
                      <span className="text-xs text-muted-foreground">
                        {lesson.date}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meu Progresso */}
            <Card className="shadow-kerigma">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Meu Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">3</div>
                  <p className="text-sm text-muted-foreground">Cursos Matriculados</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-lg font-semibold text-success">1</div>
                    <p className="text-xs text-muted-foreground">Concluídos</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-primary">16</div>
                    <p className="text-xs text-muted-foreground">Lições Feitas</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  Ver Estatísticas Detalhadas
                </Button>
              </CardContent>
            </Card>

            {/* Conquistas */}
            <Card className="shadow-kerigma">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-secondary" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          achievement.earned
                            ? 'bg-secondary/10 text-secondary'
                            : 'bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        <IconComponent className={`h-4 w-4 ${
                          achievement.earned ? 'text-secondary' : 'text-muted-foreground'
                        }`} />
                        <span className="text-sm font-medium">
                          {achievement.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Certificados */}
            <Card className="shadow-kerigma">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Meus Certificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 border border-muted/50 rounded-lg"
                      >
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          {cert.courseTitle}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Emitido em {cert.issueDate}
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="h-3 w-3 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Complete um curso para receber seu certificado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentPortalPage;