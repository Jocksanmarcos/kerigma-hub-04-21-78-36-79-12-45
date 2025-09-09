import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarInterface } from '@/components/agenda/CalendarInterface';
import { CalendarSidebar } from '@/components/agenda/CalendarSidebar';
import { SchedulingWizard } from '@/components/agenda/SchedulingWizard';
import { AgendamentoDetails } from '@/components/agenda/AgendamentoDetails';
import { AgendaSkeleton } from '@/components/agenda/AgendaSkeleton';
import { AgendaErrorState } from '@/components/agenda/AgendaErrorState';
import { useCalendarDataSources } from '@/hooks/useCalendarDataSources';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


interface Calendar {
  id: string;
  nome: string;
  cor: string;
  visible: boolean;
  proprietario_id?: string;
}

interface CalendarData {
  id: string;
  nome: string;
  cor: string;
  tipo: string;
}

interface Agendamento {
  id: string;
  calendario_id: string;
  titulo: string;
  descricao?: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  responsavel_id?: string;
  agendamento_pastoral_id?: string;
  local?: string;
  status?: string;
  calendarios?: CalendarData;
}


const AgendaPage: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardInitialDate, setWizardInitialDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<Agendamento | null>(null);
  const { toast } = useToast();

  const {
    getAllCalendars,
    getAllEvents,
    loading,
    error,
    loadAllCalendarData
  } = useCalendarDataSources();

  

  useEffect(() => {
    document.title = "Agenda – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Central de agendamento e calendários");
    
    // ETAPA 2: Novo workflow resiliente de carregamento
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    console.log('Iniciando carregamento da Central de Agenda...');
    
    try {
      // Usar a nova função que implementa arquitetura resiliente
      const result = await loadAllCalendarData();
      
      // Se houve erro na função interna, o estado já foi atualizado
      if (result?.error) {
        console.error('Erro ao carregar dados da agenda:', result.error);
        return;
      }
      
      console.log('Dados da agenda carregados com sucesso');
    } catch (error) {
      console.error('Erro inesperado ao carregar dados da agenda:', error);
    }
  };

  // Os calendários e eventos já incluem feriados e aniversários
  const allCalendars = getAllCalendars();
  const allEvents = getAllEvents();

  const [calendarVisibility, setCalendarVisibility] = useState<Record<string, boolean>>({});

  // Inicializar visibilidade dos calendários
  useEffect(() => {
    const visibility: Record<string, boolean> = {};
    allCalendars.forEach(cal => {
      if (!(cal.id in calendarVisibility)) {
        visibility[cal.id] = true;
      }
    });
    if (Object.keys(visibility).length > 0) {
      setCalendarVisibility(prev => ({ ...prev, ...visibility }));
    }
  }, [allCalendars.length]);

  const handleToggleCalendar = (calendarId: string) => {
    setCalendarVisibility(prev => ({
      ...prev,
      [calendarId]: !prev[calendarId]
    }));
  };

  // Aplicar visibilidade aos calendários
  const calendarsWithVisibility = allCalendars.map(cal => ({
    ...cal,
    visible: calendarVisibility[cal.id] ?? true
  }));

  const visibleCalendars = calendarsWithVisibility.filter(cal => cal.visible);

  const handleEventSelect = (agendamento: Agendamento) => {
    if (agendamento.calendario_id.startsWith('holidays-') || agendamento.calendario_id === 'anniversaries') {
      const eventType = agendamento.calendario_id.startsWith('holidays-') ? 'Feriado' : 'Aniversário';
      toast({ 
        title: eventType, 
        description: `Eventos de ${eventType.toLowerCase()} são somente leitura.` 
      });
      return;
    }
    setSelectedEvent(agendamento);
  };

  const handleCreateEvent = (date?: Date) => {
    setWizardInitialDate(date);
    setShowWizard(true);
  };

  const handleEventUpdate = async (updatedEvent: Partial<Agendamento>) => {
    try {
      if (!updatedEvent.id) throw new Error('Evento sem ID');

      const { error } = await supabase
        .from('agendamentos')
        .update({
          data_hora_inicio: updatedEvent.data_hora_inicio,
          data_hora_fim: updatedEvent.data_hora_fim,
        })
        .eq('id', updatedEvent.id);

      if (error) throw error;

      await loadData();
      setSelectedEvent(null);
      
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento",
        variant: "destructive",
      });
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await loadData();
      setSelectedEvent(null);
      
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento",
        variant: "destructive",
      });
    }
  };

  const visibleEvents = allEvents.filter(event => 
    visibleCalendars.some(cal => cal.id === event.calendario_id)
  );

  // Estados de carregamento e erro
  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-screen overflow-hidden">
          <CalendarSidebar
            calendars={[]}
            onToggleCalendar={() => {}}
            onCreateEvent={() => {}}
            onCalendarUpdate={async () => {}}
          />
          <div className="flex-1 min-w-0">
            <AgendaSkeleton />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex h-screen overflow-hidden">
          <CalendarSidebar
            calendars={[]}
            onToggleCalendar={() => {}}
            onCreateEvent={() => {}}
            onCalendarUpdate={async () => {}}
          />
          <div className="flex-1 min-w-0">
            <AgendaErrorState 
              onRetry={loadData}
              error={error}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-screen overflow-hidden">
        <CalendarSidebar
          calendars={calendarsWithVisibility}
          onToggleCalendar={handleToggleCalendar}
          onCreateEvent={handleCreateEvent}
          onCalendarUpdate={loadData}
        />
        
        <div className="flex-1 min-w-0">
          <CalendarInterface
            events={visibleEvents}
            calendars={visibleCalendars}
            onEventSelect={handleEventSelect}
            onCreateEvent={handleCreateEvent}
            onEventUpdate={handleEventUpdate}
          />
        </div>

        {showWizard && (
          <SchedulingWizard
            onClose={() => setShowWizard(false)}
            onSuccess={() => {
              setShowWizard(false);
              loadData();
            }}
            calendars={calendarsWithVisibility.filter(c => 
              !c.id.startsWith('holidays-') && c.id !== 'anniversaries'
            )}
            initialDate={wizardInitialDate}
          />
        )}

        {selectedEvent && (
          <AgendamentoDetails
            agendamento={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onUpdate={handleEventUpdate}
            onDelete={handleEventDelete}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default AgendaPage;