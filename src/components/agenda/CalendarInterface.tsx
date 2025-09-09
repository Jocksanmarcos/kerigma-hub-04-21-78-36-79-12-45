import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock, List } from 'lucide-react';
import { EventTooltip } from './EventTooltip';
import ptBrLocale from '@fullcalendar/core/locales/pt-br.js';

interface CalendarEvent {
  id: string;
  calendario_id: string;
  titulo: string;
  descricao?: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  responsavel_id?: string;
}

interface CalendarData {
  id: string;
  nome: string;
  cor: string;
  visible: boolean;
}

interface CalendarInterfaceProps {
  events: CalendarEvent[];
  calendars: CalendarData[];
  onEventSelect: (event: CalendarEvent) => void;
  onCreateEvent: (date?: Date) => void;
  onEventUpdate: (updatedEvent: Partial<CalendarEvent>) => void;
}

export const CalendarInterface: React.FC<CalendarInterfaceProps> = ({
  events,
  calendars,
  onEventSelect,
  onCreateEvent,
  onEventUpdate,
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [tooltip, setTooltip] = useState<{
    events: CalendarEvent[];
    position: { x: number; y: number };
    visible: boolean;
  }>({
    events: [],
    position: { x: 0, y: 0 },
    visible: false,
  });

  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.cor || '#3b82f6';
  };

  const formatEventsForFullCalendar = () => {
    return events.map(event => {
      const isHoliday = event.calendario_id.startsWith('holidays-');
      const isAllDay = event.data_hora_inicio.length === 10;
      return {
        id: event.id,
        title: event.titulo,
        start: event.data_hora_inicio,
        end: event.data_hora_fim,
        allDay: isAllDay,
        editable: !isHoliday,
        backgroundColor: getCalendarColor(event.calendario_id),
        borderColor: getCalendarColor(event.calendario_id),
        extendedProps: {
          originalEvent: event,
        },
      };
    });
  };

  const handleEventClick = (info: any) => {
    onEventSelect(info.event.extendedProps.originalEvent);
  };

  const handleDateSelect = (selectInfo: any) => {
    onCreateEvent(selectInfo.start);
  };

  const handleEventDrop = async (info: any) => {
    const originalEvent = info.event.extendedProps.originalEvent;
    const updatedEvent = {
      ...originalEvent,
      data_hora_inicio: info.event.start.toISOString(),
      data_hora_fim: info.event.end?.toISOString() || info.event.start.toISOString(),
    };
    
    onEventUpdate(updatedEvent);
  };

  const handleDateMouseEnter = (info: any) => {
    const dateStr = info.dateStr;
    const eventsForDate = events.filter(event => {
      const eventDate = event.data_hora_inicio.split('T')[0];
      return eventDate === dateStr;
    });

    if (eventsForDate.length > 0) {
      setTooltip({
        events: eventsForDate,
        position: { x: info.jsEvent.clientX, y: info.jsEvent.clientY },
        visible: true,
      });
    }
  };

  const handleDateMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleMouseMove = (info: any) => {
    if (tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        position: { x: info.jsEvent.clientX, y: info.jsEvent.clientY },
      }));
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') {
        calendarApi.prev();
      } else {
        calendarApi.next();
      }
    }
  };

  const changeView = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
    }
  };

  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com controles */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateCalendar('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateCalendar('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Hoje
            </Button>
          </div>
          
          <h1 className="text-xl font-semibold text-foreground">
            Central de Agenda
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeView('dayGridMonth')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Mês
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeView('timeGridWeek')}
          >
            <Clock className="h-4 w-4 mr-1" />
            Semana
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeView('timeGridDay')}
          >
            <List className="h-4 w-4 mr-1" />
            Dia
          </Button>
        </div>
      </div>

      {/* Calendário */}
      <Card className="flex-1 m-4 min-h-0">
        <div className="p-4 h-full min-h-[600px]">
          <div style={{ height: '100%', minHeight: '600px' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={ptBrLocale}
              height="100%"
              headerToolbar={false}
              events={formatEventsForFullCalendar()}
              eventClick={handleEventClick}
              select={handleDateSelect}
              eventDrop={handleEventDrop}
              selectable={true}
              editable={true}
              dayMaxEvents={true}
              weekends={true}
              businessHours={{
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '06:00',
                endTime: '23:00',
              }}
              slotMinTime="06:00:00"
              slotMaxTime="23:00:00"
              allDaySlot={false}
              nowIndicator={true}
              eventDisplay="block"
              dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
              eventMouseEnter={(info) => {
                const eventDate = info.event.start?.toISOString().split('T')[0];
                const eventsForDate = events.filter(event => {
                  const currentEventDate = event.data_hora_inicio.split('T')[0];
                  return currentEventDate === eventDate;
                });
                
                setTooltip({
                  events: eventsForDate,
                  position: { x: info.jsEvent.clientX, y: info.jsEvent.clientY },
                  visible: true,
                });
              }}
              eventMouseLeave={handleDateMouseLeave}
              dayCellDidMount={(info) => {
                const dayCell = info.el;
                const dateStr = info.date.toISOString().split('T')[0];
                
                dayCell.addEventListener('mouseenter', (e) => {
                  const eventsForDate = events.filter(event => {
                    const eventDate = event.data_hora_inicio.split('T')[0];
                    return eventDate === dateStr;
                  });

                  if (eventsForDate.length > 0) {
                    setTooltip({
                      events: eventsForDate,
                      position: { x: e.clientX, y: e.clientY },
                      visible: true,
                    });
                  }
                });
                
                dayCell.addEventListener('mouseleave', () => {
                  setTooltip(prev => ({ ...prev, visible: false }));
                });
                
                dayCell.addEventListener('mousemove', (e) => {
                  if (tooltip.visible) {
                    setTooltip(prev => ({
                      ...prev,
                      position: { x: e.clientX, y: e.clientY },
                    }));
                  }
                });
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tooltip flutuante */}
      <EventTooltip
        events={tooltip.events}
        calendars={calendars}
        position={tooltip.position}
        visible={tooltip.visible}
      />
    </div>
  );
};