import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardStats } from '@/components/portal-aluno/DashboardStats';
import { UserProgressReal } from '@/components/portal-aluno/UserProgressReal';
import { NotificationFeedReal } from '@/components/portal-aluno/NotificationFeedReal';
import { CoursesCatalog } from '@/components/portal-aluno/CoursesCatalog';
import { LeaderboardReal } from '@/components/portal-aluno/LeaderboardReal';
import { AchievementShowcaseReal } from '@/components/portal-aluno/AchievementShowcaseReal';
import { StudyStreak } from '@/components/portal-aluno/StudyStreak';
import { QuickActions } from '@/components/portal-aluno/QuickActions';
import { AIRecommendations } from '@/components/portal-aluno/AIRecommendations';
import { PersonalAgenda } from '@/components/portal-aluno/PersonalAgenda';
import { NotificationModal } from '@/components/portal-aluno/NotificationModal';
import { AgendaModal } from '@/components/portal-aluno/AgendaModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, BookOpen, Trophy, Zap, Target, Bell } from 'lucide-react';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useAlunoStats } from '@/hooks/useAlunoStats';

const PortalAlunoPage: React.FC = () => {
  const { toast } = useToast();
  const { pessoa, loading: personLoading, error: personError } = useCurrentPerson();
  const { stats, loading: statsLoading } = useAlunoStats();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  useEffect(() => {
    document.title = 'Portal do Aluno | Kerigma Hub EAD';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Portal do Aluno gamificado - Acompanhe seu progresso, conquistas e continue sua jornada de aprendizado no Kerigma Hub.');
    }
  }, []);

  // Mostrar erro se houver problema na autenticação
  useEffect(() => {
    if (personError) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para acessar o portal do aluno.",
        variant: "destructive"
      });
    }
  }, [personError, toast]);

  const loading = personLoading || statsLoading;
  
  // Combinar dados da pessoa com stats
  const userProfile = pessoa && stats ? {
    ...pessoa,
    ...stats
  } : null;

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header com boas-vindas */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-primary/20">
              <AvatarImage src={userProfile?.foto_url} alt={userProfile?.nome_completo} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {userProfile?.nome_completo?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Olá, {userProfile?.nome_completo?.split(' ')[0] || 'Aluno'}! 👋
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  {userProfile?.nivel}
                </Badge>
                <Badge variant="outline">
                  <Zap className="h-3 w-3 mr-1" />
                  {userProfile?.xp} XP
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowNotifications(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAgenda(true)}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Agenda
            </Button>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Coluna principal (esquerda) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Estatísticas do Dashboard */}
            <DashboardStats userProfile={userProfile} />
            
            {/* Progresso do Usuário */}
            <UserProgressReal userProfile={userProfile} />
            
            {/* Catálogo de Cursos */}
            <div data-courses-catalog>
              <CoursesCatalog />
            </div>
            
            {/* Feed de Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Últimas Atualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationFeedReal />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar direita */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <QuickActions />
            
            {/* Agenda Pessoal */}
            <PersonalAgenda />
            
            {/* IA de Recomendações */}
            <AIRecommendations />
            
            {/* Sequência de Estudos */}
            <StudyStreak />
            
            {/* Ranking */}
            <LeaderboardReal />
            
            {/* Conquistas em Destaque */}
            <AchievementShowcaseReal />
          </div>
        </div>
      </div>

      {/* Modals */}
      <NotificationModal open={showNotifications} onOpenChange={setShowNotifications} />
      <AgendaModal open={showAgenda} onOpenChange={setShowAgenda} />
    </AppLayout>
  );
};

export default PortalAlunoPage;