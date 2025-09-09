import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, Church } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NextActivitiesCardsProps {
  pessoa: any;
}

export const NextActivitiesCards: React.FC<NextActivitiesCardsProps> = ({ pessoa }) => {
  // Mock data - em produção viria do banco de dados
  const nextCellMeeting = {
    title: "Reunião da Célula",
    date: "Quinta-feira",
    time: "19:30",
    location: "Casa da Família Santos",
    address: "Rua das Flores, 123",
    leader: "Pr. João Silva"
  };

  const nextEvent = {
    title: "Culto de Celebração",
    date: "Domingo",
    time: "09:00",
    location: "Templo Principal",
    address: "Av. Central, 456",
    theme: "Gratidão e Louvor"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card da Próxima Reunião da Célula */}
      <Card className="border-l-4 border-l-primary shadow-kerigma hover:shadow-kerigma-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {nextCellMeeting.title}
            </CardTitle>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Próxima
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{nextCellMeeting.date}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span className="text-sm">{nextCellMeeting.time}</span>
          </div>
          
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">{nextCellMeeting.location}</p>
              <p className="text-xs text-muted-foreground">{nextCellMeeting.address}</p>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">
              Líder: {nextCellMeeting.leader}
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Ver Detalhes da Célula
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card do Próximo Evento/Culto */}
      <Card className="border-l-4 border-l-secondary shadow-kerigma hover:shadow-kerigma-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Church className="h-5 w-5 text-secondary" />
              {nextEvent.title}
            </CardTitle>
            <Badge variant="outline" className="border-secondary/30 text-secondary">
              Próximo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{nextEvent.date}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span className="text-sm">{nextEvent.time}</span>
          </div>
          
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">{nextEvent.location}</p>
              <p className="text-xs text-muted-foreground">{nextEvent.address}</p>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium text-foreground mb-2">
              Tema: {nextEvent.theme}
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Ver Agenda Completa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};