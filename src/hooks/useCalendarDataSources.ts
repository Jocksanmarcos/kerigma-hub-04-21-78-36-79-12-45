import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Holidays from 'date-holidays';

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

interface Igreja {
  id: string;
  nome: string;
  data_fundacao?: string;
  tipo: string;
}

interface Pessoa {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
}

// Função para gerar feriados automáticos
const generateHolidayData = () => {
  const hdBr = new Holidays('BR');
  const hdSlz = new Holidays('BR', 'MA', 'Sao Luis');
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  const toDateOnly = (iso: string) => iso.slice(0, 10);
  const addOneDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const brList = years.flatMap((y) => (hdBr as any).getHolidays(y)).filter((h: any) => h.type === 'public');
  const slzList = years.flatMap((y) => (hdSlz as any).getHolidays(y)).filter((h: any) => h.type === 'public');

  const holidayCalendars = [
    { id: 'holidays-br', nome: 'Feriados Brasil', cor: '#059669', visible: true },
    { id: 'holidays-slz', nome: 'Feriados São Luís (MA)', cor: '#f59e0b', visible: true },
  ];

  let counter = 0;
  const mapToEvents = (list: any[], calendario_id: string, prefix: string) =>
    list.map((h: any) => {
      const date = toDateOnly(h.date);
      counter += 1;
      return {
        id: `${prefix}-${date}-${counter}`,
        calendario_id,
        titulo: `Feriado: ${h.name}`,
        descricao: calendario_id === 'holidays-br' ? 'Feriado Nacional do Brasil' : 'Feriado Municipal de São Luís (MA)',
        data_hora_inicio: date,
        data_hora_fim: addOneDay(date),
      } as Agendamento;
    });

  const holidayEvents = [
    ...mapToEvents(brList, 'holidays-br', 'feriado-br'),
    ...mapToEvents(slzList, 'holidays-slz', 'feriado-slz'),
  ];

  return { holidayCalendars, holidayEvents };
};

// Função para gerar eventos de aniversários
const generateAnniversaryEvents = (igrejas: Igreja[], pessoas: Pessoa[]) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];
  
  const anniversaryCalendar = {
    id: 'anniversaries',
    nome: 'Aniversários',
    cor: '#8b5cf6',
    visible: true
  };

  const events: Agendamento[] = [];

  // Aniversários das igrejas
  years.forEach(year => {
    igrejas.forEach(igreja => {
      if (igreja.data_fundacao) {
        const [, month, day] = igreja.data_fundacao.split('-');
        const eventDate = `${year}-${month}-${day}`;
        
        events.push({
          id: `igreja-anniversary-${igreja.id}-${year}`,
          calendario_id: 'anniversaries',
          titulo: `Aniversário: ${igreja.nome}`,
          descricao: `${igreja.tipo === 'Sede' ? 'Sede' : 'Missão'} - Fundada em ${igreja.data_fundacao}`,
          data_hora_inicio: eventDate,
          data_hora_fim: eventDate,
        });
      }
    });

    // Aniversários das pessoas (amostra dos próximos)
    pessoas.forEach(pessoa => {
      if (pessoa.data_nascimento) {
        const [, month, day] = pessoa.data_nascimento.split('-');
        const eventDate = `${year}-${month}-${day}`;
        
        events.push({
          id: `person-anniversary-${pessoa.id}-${year}`,
          calendario_id: 'anniversaries',
          titulo: `Aniversário: ${pessoa.nome_completo}`,
          descricao: `Data de nascimento`,
          data_hora_inicio: eventDate,
          data_hora_fim: eventDate,
        });
      }
    });
  });

  return { anniversaryCalendar, anniversaryEvents: events };
};

export const useCalendarDataSources = () => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCalendars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando busca de calendários e agendamentos...');
      
      // Carregar calendários do Supabase
      const calendarsPromise = supabase
        .from('calendarios')
        .select('*')
        .order('nome');

      // Carregar agendamentos com relações
      const agendamentosPromise = supabase
        .from('agendamentos')
        .select(`
          *,
          calendarios (
            id,
            nome,
            cor,
            tipo
          )
        `)
        .order('data_hora_inicio');

      // Carregar igrejas para aniversários
      const igrejasPromise = supabase
        .from('igrejas')
        .select('id, nome, data_fundacao, tipo')
        .eq('ativa', true);

      // Carregar pessoas para aniversários (limitando para performance)
      const pessoasPromise = supabase
        .from('pessoas')
        .select('id, nome_completo, data_nascimento')
        .eq('situacao', 'ativo')
        .not('data_nascimento', 'is', null)
        .limit(100);

      // Executar todas as queries em paralelo com timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), 15000)
      );

      const [calendarsResult, agendamentosResult, igrejasResult, pessoasResult] = await Promise.race([
        Promise.all([calendarsPromise, agendamentosPromise, igrejasPromise, pessoasPromise]),
        timeoutPromise
      ]) as any[];

      const { data: calendarsData, error: calendarsError } = calendarsResult;
      const { data: agendamentosData, error: agendamentosError } = agendamentosResult;
      const { data: igrejasData, error: igrejasError } = igrejasResult;
      const { data: pessoasData, error: pessoasError } = pessoasResult;

      if (calendarsError) {
        console.error('Erro ao carregar calendários:', calendarsError);
        throw new Error(`Erro ao carregar calendários: ${calendarsError.message}`);
      }

      if (agendamentosError) {
        console.error('Erro ao carregar agendamentos:', agendamentosError);
        throw new Error(`Erro ao carregar agendamentos: ${agendamentosError.message}`);
      }

      // Gerar dados de feriados
      const { holidayCalendars, holidayEvents } = generateHolidayData();

      // Gerar dados de aniversários
      const { anniversaryCalendar, anniversaryEvents } = generateAnniversaryEvents(
        igrejasData || [],
        pessoasData || []
      );

      // Formatar calendários
      const formattedCalendars = (calendarsData || []).map(cal => ({ 
        ...cal, 
        visible: true
      }));

      // Combinar todos os calendários
      const allCalendars = [
        ...formattedCalendars,
        ...holidayCalendars,
        anniversaryCalendar
      ];

      // Combinar todos os eventos
      const allEvents = [
        ...(agendamentosData || []),
        ...holidayEvents,
        ...anniversaryEvents
      ];

      setCalendars(allCalendars);
      setEvents(allEvents);
      setError(null);

      console.log('Dados carregados com sucesso:', {
        calendarios: allCalendars.length,
        eventos: allEvents.length,
        feriados: holidayEvents.length,
        aniversarios: anniversaryEvents.length
      });

      return {
        calendars: allCalendars,
        events: allEvents
      };
    } catch (error: any) {
      console.error('Erro ao carregar dados da agenda:', error);
      const errorMessage = error.message || 'Erro desconhecido ao carregar dados';
      
      setError(errorMessage);
      setCalendars([]);
      setEvents([]);
      
      return { calendars: [], events: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getAllCalendars = useCallback(() => {
    return calendars;
  }, [calendars]);

  const getAllEvents = useCallback(() => {
    return events;
  }, [events]);

  const loadAllCalendarData = useCallback(async () => {
    console.log('Iniciando carregamento de dados da agenda...');
    return await fetchCalendars();
  }, [fetchCalendars]);

  return {
    // Data
    calendars,
    events,
    
    // Combined data (mantido para compatibilidade)
    getAllCalendars,
    getAllEvents,
    
    // Status
    loading,
    error,
    
    // Actions
    fetchCalendars,
    loadAllCalendarData,
  };
};