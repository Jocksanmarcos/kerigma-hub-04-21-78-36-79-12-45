import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Heart, 
  Bell, 
  FileText,
  MapPin,
  Clock
} from 'lucide-react';

const CommunityLifePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Vida em Comunidade | Kerigma Hub';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Participe da vida em comunidade - Eventos, célula, contribuições e comunicados');
    }
  }, []);

  // Mock data - em produção viria do banco
  const upcomingEvents = [
    {
      id: 1,
      title: "Retiro de Jovens",
      date: "15-17 Dez",
      time: "18:00",
      location: "Sítio Recanto",
      type: "Evento Especial",
      canRegister: true
    },
    {
      id: 2,
      title: "Culto de Gratidão",
      date: "22 Dez",
      time: "09:00",
      location: "Templo Principal",
      type: "Culto",
      canRegister: false
    }
  ];

  const cellInfo = {
    name: "Célula Família Santos",
    leader: "Pr. João Santos",
    nextMeeting: "Quinta, 19:30",
    location: "Rua das Flores, 123",
    members: 12,
    hasAnnouncements: true
  };

  const announcements = [
    {
      id: 1,
      title: "Nova Série: Viver com Propósito",
      preview: "A partir de domingo, uma nova jornada de descobertas...",
      author: "Pastor Carlos",
      date: "Hoje",
      priority: "alta"
    },
    {
      id: 2,
      title: "Campanha de Natal - Famílias em Necessidade",
      preview: "Vamos abençoar famílias da nossa comunidade...",
      author: "Ministério Social",
      date: "Ontem",
      priority: "média"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6 p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Vida em Comunidade
          </h1>
          <p className="text-muted-foreground">
            Conecte-se, participe e cresça junto com nossa família
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agenda da Igreja */}
          <Card className="lg:col-span-2 shadow-kerigma">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Agenda da Igreja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-muted/50 rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{event.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  {event.canRegister && (
                    <Button variant="outline" size="sm">
                      Inscrever-se
                    </Button>
                  )}
                </div>
              ))}
              
              <Button className="w-full mt-4" variant="outline">
                Ver Agenda Completa
              </Button>
            </CardContent>
          </Card>

          {/* Minha Célula */}
          <Card className="shadow-kerigma">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Minha Célula
                {cellInfo.hasAnnouncements && (
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                    Novidades
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">{cellInfo.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Líder: {cellInfo.leader}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Próxima reunião: {cellInfo.nextMeeting}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  📍 {cellInfo.location}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{cellInfo.members} membros</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" variant="outline" size="sm">
                  Mural de Avisos
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  Lista de Membros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Minhas Contribuições */}
          <Card className="shadow-kerigma">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-secondary" />
                Minhas Contribuições
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <Heart className="h-12 w-12 text-secondary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Sua generosidade transforma vidas e fortalece nossa missão
                </p>
                <Button className="w-full mb-2 bg-secondary hover:bg-secondary/90">
                  Contribuir Agora
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Histórico
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comunicados */}
          <Card className="lg:col-span-2 shadow-kerigma">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Comunicados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start gap-3 p-4 border border-muted/50 rounded-lg hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    announcement.priority === 'alta' ? 'bg-secondary' : 'bg-primary'
                  }`} />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {announcement.preview}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Por {announcement.author}</span>
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button className="w-full" variant="outline">
                Ver Todos os Comunicados
              </Button>
            </CardContent>
          </Card>

          {/* Minhas Inscrições */}
          <Card className="shadow-kerigma">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Minhas Inscrições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Seus eventos e cursos inscritos aparecerão aqui
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Inscrições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CommunityLifePage;