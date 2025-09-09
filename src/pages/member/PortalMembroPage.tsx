import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, GraduationCap, Heart, Bell, Calendar, BookOpen, MessageCircle } from 'lucide-react';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useNavigate } from 'react-router-dom';
import { PWAManager } from '@/components/pwa/PWAManager';
import { MemberNotifications } from '@/components/member/MemberNotifications';

const PortalMembroPage: React.FC = () => {
  const { pessoa, loading } = useCurrentPerson();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Portal do Membro | Kerigma Hub';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Portal do Membro - Sua casa digital na Kerigma Hub. Acompanhe atividades, participe da comunidade e cresça em sua jornada.');
    }
  }, []);

  const quickActions = [
    {
      icon: Heart,
      title: 'Contribuir',
      description: 'Fazer doações',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200',
      action: () => navigate('/semear')
    },
    {
      icon: Heart,
      title: 'Mural da Generosidade',
      description: 'Doar e pedir ajuda',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
      action: () => navigate('/mural-da-generosidade')
    },
    {
      icon: Calendar,
      title: 'Agenda',
      description: 'Eventos da igreja',
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20',
      borderColor: 'border-primary/20',
      action: () => navigate('/agenda')
    },
    {
      icon: Users,
      title: 'Minha Célula',
      description: 'Grupo pequeno',
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20',
      borderColor: 'border-primary/20',
      action: () => navigate('/membro/comunidade')
    },
    {
      icon: GraduationCap,
      title: 'Portal do Aluno',
      description: 'Cursos e ensino',
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20',
      borderColor: 'border-primary/20',
      action: () => navigate('/membro/portal-aluno')
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header com notificações */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portal do Membro</h1>
            <p className="text-sm text-muted-foreground">Sua casa digital na igreja</p>
          </div>
          <MemberNotifications />
        </div>

        {/* PWA Manager */}
        <PWAManager />

        {/* Card de Boas-Vindas */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-4 ring-primary/20">
                <AvatarImage src={pessoa?.foto_url} alt={pessoa?.nome_completo} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {pessoa?.nome_completo?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  Olá, {pessoa?.nome_completo?.split(' ')[0] || 'Membro'}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  "Porque eu sei os planos que tenho para vocês", declara o Senhor.
                </p>
                <Badge variant="secondary" className="mt-2">
                  Jeremias 29:11
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próxima Atividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Próxima Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-semibold">Reunião de Célula</h3>
                <p className="text-sm text-muted-foreground">Quinta-feira, 19:30</p>
                <p className="text-sm text-muted-foreground">Casa do Líder João</p>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${action.borderColor} ${action.bgColor}`}
                onClick={action.action}
              >
                <CardContent className="p-4 text-center">
                  <action.icon className={`h-8 w-8 mx-auto mb-2 ${action.color}`} />
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comunicados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Comunicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Culto Especial de Ação de Graças</h4>
                  <p className="text-sm text-muted-foreground">
                    Domingo próximo teremos um culto especial com testemunhos e gratidão.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Novo Curso: Fundamentos da Fé</h4>
                  <p className="text-sm text-muted-foreground">
                    Inscrições abertas para o curso de discipulado básico.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Ontem</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PortalMembroPage;