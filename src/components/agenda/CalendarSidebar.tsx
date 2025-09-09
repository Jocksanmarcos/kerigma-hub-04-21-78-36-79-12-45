import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Home } from 'lucide-react';
import { CalendarManager } from './CalendarManager';

interface Calendar {
  id: string;
  nome: string;
  cor: string;
  visible: boolean;
  proprietario_id?: string;
}

interface CalendarSidebarProps {
  calendars: Calendar[];
  onToggleCalendar: (calendarId: string) => void;
  onCreateEvent: () => void;
  onCalendarUpdate?: () => Promise<void>;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  calendars,
  onToggleCalendar,
  onCreateEvent,
  onCalendarUpdate,
}) => {
  const getCalendarIcon = (calendar: Calendar) => {
    if (calendar.id.startsWith('holidays-')) {
      return <Calendar className="h-4 w-4 text-amber-600" />;
    }
    if (calendar.proprietario_id) {
      return <User className="h-4 w-4 text-purple-600" />;
    }
    return <Home className="h-4 w-4 text-green-600" />;
  };

  const getCalendarSourceBadge = (calendar: Calendar) => {
    if (calendar.id.startsWith('holidays-')) {
      return <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">Sistema</Badge>;
    }
    return <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">Kerigma</Badge>;
  };

  const holidayCalendars = calendars.filter(cal => cal.id.startsWith('holidays-'));
  const privateCalendars = calendars.filter(cal => cal.proprietario_id && !cal.id.startsWith('holidays-'));
  const publicCalendars = calendars.filter(cal => !cal.proprietario_id && !cal.id.startsWith('holidays-'));

  return (
    <div className="w-80 border-r border-border bg-background">
      <div className="p-4 space-y-2">
        <Button
          onClick={onCreateEvent}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
        
        <CalendarManager />
      </div>

      <div className="p-4 space-y-4">

        {/* Calendários do Kerigma Hub */}
        {publicCalendars.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Home className="h-4 w-4 text-green-600" />
                Calendários Kerigma Hub
                <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">Interno</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {publicCalendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={calendar.id}
                    checked={calendar.visible}
                    onCheckedChange={() => onToggleCalendar(calendar.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: calendar.cor }}
                    />
                    {getCalendarIcon(calendar)}
                    <label
                      htmlFor={calendar.id}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {calendar.nome}
                    </label>
                    {getCalendarSourceBadge(calendar)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}


        {/* Calendários de Feriados */}
        {holidayCalendars.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600" />
                Feriados & Datas Especiais
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">Sistema</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {holidayCalendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={calendar.id}
                    checked={calendar.visible}
                    onCheckedChange={() => onToggleCalendar(calendar.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: calendar.cor }}
                    />
                    {getCalendarIcon(calendar)}
                    <label
                      htmlFor={calendar.id}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {calendar.nome}
                    </label>
                    {getCalendarSourceBadge(calendar)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Calendários Privados/Pessoais */}
        {privateCalendars.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Calendários Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {privateCalendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={calendar.id}
                    checked={calendar.visible}
                    onCheckedChange={() => onToggleCalendar(calendar.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: calendar.cor }}
                    />
                    {getCalendarIcon(calendar)}
                    <label
                      htmlFor={calendar.id}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {calendar.nome}
                    </label>
                    {getCalendarSourceBadge(calendar)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {calendars.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum calendário encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};