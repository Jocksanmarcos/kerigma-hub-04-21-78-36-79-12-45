import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Target, Star, ChevronRight } from 'lucide-react';

interface UserProgressProps {
  userProfile: any;
}

export const UserProgress: React.FC<UserProgressProps> = ({ userProfile }) => {
  const progressToNextLevel = ((userProfile?.xp || 0) / (userProfile?.nextLevelXP || 1)) * 100;

  const currentCourses = [
    {
      id: 1,
      name: 'Fundamentos da Fé Cristã',
      progress: 75,
      nextLesson: 'Aula 8: A Salvação em Cristo',
      timeLeft: '2h 30min',
      category: 'Discipulado'
    },
    {
      id: 2,
      name: 'Liderança Cristã Eficaz',
      progress: 45,
      nextLesson: 'Aula 4: Comunicação e Feedback',
      timeLeft: '1h 45min',
      category: 'Liderança'
    },
    {
      id: 3,
      name: 'Evangelismo Pessoal',
      progress: 90,
      nextLesson: 'Aula Final: Prática Evangelística',
      timeLeft: '45min',
      category: 'Evangelismo'
    }
  ];

  const milestones = [
    { name: 'Primeiro Curso', completed: true, xp: 100 },
    { name: 'Estudante Dedicado', completed: true, xp: 250 },
    { name: 'Evangelista', completed: false, xp: 500 },
    { name: 'Líder em Formação', completed: false, xp: 1000 }
  ];

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
                {userProfile?.nivel?.charAt(0) || 'A'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full">
                Lv. 3
              </div>
            </div>
            <h3 className="font-semibold mt-2">{userProfile?.nivel}</h3>
            <p className="text-sm text-muted-foreground">
              {userProfile?.xp} / {userProfile?.nextLevelXP} XP
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Progresso</span>
              <span className="font-semibold">{Math.round(progressToNextLevel)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
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
          <div className="space-y-4">
            {currentCourses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:shadow-kerigma transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{course.name}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {course.category}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progresso</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                
                <div className="mt-3 flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Próxima: {course.nextLesson}
                  </span>
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="h-3 w-3" />
                    <span>{course.timeLeft}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};