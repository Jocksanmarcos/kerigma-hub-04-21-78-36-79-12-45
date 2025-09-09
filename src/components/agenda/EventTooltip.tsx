import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  calendario_id: string;
  titulo: string;
  descricao?: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  responsavel_id?: string;
  local?: string;
}

interface CalendarData {
  id: string;
  nome: string;
  cor: string;
  visible: boolean;
}

interface EventTooltipProps {
  events: CalendarEvent[];
  calendars: CalendarData[];
  position: { x: number; y: number };
  visible: boolean;
}

export const EventTooltip: React.FC<EventTooltipProps> = ({
  events,
  calendars,
  position,
  visible,
}) => {
  if (!visible || events.length === 0) {
    return null;
  }

  const getCalendarInfo = (calendarId: string) => {
    return calendars.find(cal => cal.id === calendarId);
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const isAllDay = startTime.length === 10;
    
    if (isAllDay) {
      return 'Dia inteiro';
    }

    try {
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      
      return `${format(start, 'HH:mm', { locale: ptBR })} - ${format(end, 'HH:mm', { locale: ptBR })}`;
    } catch {
      return 'Horário não informado';
    }
  };

  const formatEventDate = (dateTime: string) => {
    try {
      const date = parseISO(dateTime);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data não informada';
    }
  };

  const getBadgeVariant = (calendarId: string) => {
    if (calendarId.startsWith('holidays-')) return 'secondary';
    if (calendarId === 'anniversaries') return 'default';
    return 'outline';
  };

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        maxWidth: '400px',
        minWidth: '300px',
      }}
    >
      <Card className="shadow-lg border-2 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {events.length === 1 ? 'Evento do dia' : `${events.length} eventos do dia`}
          </CardTitle>
          <CardDescription className="text-xs">
            {formatEventDate(events[0].data_hora_inicio)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {events.slice(0, 4).map((event, index) => {
            const calendar = getCalendarInfo(event.calendario_id);
            
            return (
              <div key={event.id}>
                {index > 0 && <Separator className="my-2" />}
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-medium leading-tight flex-1">
                      {event.titulo}
                    </h4>
                    <Badge 
                      variant={getBadgeVariant(event.calendario_id)}
                      className="text-xs shrink-0"
                      style={{ 
                        backgroundColor: calendar?.cor + '20',
                        borderColor: calendar?.cor,
                        color: calendar?.cor 
                      }}
                    >
                      {calendar?.nome || 'Calendário'}
                    </Badge>
                  </div>
                  
                  {event.descricao && (
                    <p className="text-xs text-muted-foreground">
                      {event.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatEventTime(event.data_hora_inicio, event.data_hora_fim)}
                    </div>
                    
                    {event.local && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.local}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {events.length > 4 && (
            <div className="text-center pt-2">
              <Badge variant="outline" className="text-xs">
                +{events.length - 4} evento(s) adicional(is)
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};