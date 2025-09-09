import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, Users, Clock, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NextActivityCardProps {
  pessoa: any;
}

interface NextActivity {
  type: 'course' | 'cell' | 'event';
  title: string;
  date: Date;
  location?: string;
  progress?: number;
  action?: string;
}

export const NextActivityCard: React.FC<NextActivityCardProps> = ({ pessoa }) => {
  const [nextActivity, setNextActivity] = useState<NextActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pessoa) {
      loadNextActivity();
    }
  }, [pessoa]);

  const loadNextActivity = async () => {
    try {
      const activities: NextActivity[] = [];

      // Buscar próximo curso em progresso
      const { data: coursesData } = await supabase
        .from('matriculas')
        .select(`
          curso_id,
          status,
          cursos (
            nome,
            categoria
          )
        `)
        .eq('pessoa_id', pessoa.id)
        .neq('status', 'concluido');

      if (coursesData && coursesData.length > 0) {
        const course = coursesData[0];
        activities.push({
          type: 'course',
          title: `Continuar: ${course.cursos?.nome}`,
          date: new Date(), // Disponível agora
          progress: 50, // Progresso estimado
          action: 'Continuar Estudo'
        });
      }

      // Buscar próxima reunião de célula (se for membro de uma)
      if (pessoa.celula_id) {
        const { data: celulaData } = await supabase
          .from('celulas')
          .select('nome, endereco, horario, dia_semana')
          .eq('id', pessoa.celula_id)
          .single();

        if (celulaData) {
          const today = new Date();
          const nextCellDate = getNextCellMeeting(celulaData.dia_semana, celulaData.horario);
          
          activities.push({
            type: 'cell',
            title: `Célula: ${celulaData.nome}`,
            date: nextCellDate,
            location: celulaData.endereco || 'Local a confirmar',
            action: 'Ver Detalhes'
          });
        }
      }

      // Buscar próximo evento inscrito
      const { data: eventsData } = await supabase
        .from('participacao_eventos')
        .select(`
          evento_id,
          eventos (
            titulo,
            data_inicio,
            local
          )
        `)
        .eq('email', pessoa.email)
        .eq('status', 'confirmado')
        .gte('eventos.data_inicio', new Date().toISOString());

      if (eventsData && eventsData.length > 0) {
        const event = eventsData[0];
        activities.push({
          type: 'event',
          title: event.eventos?.titulo || 'Evento',
          date: new Date(event.eventos?.data_inicio || ''),
          location: event.eventos?.local || 'Local a confirmar',
          action: 'Ver Evento'
        });
      }

      // Ordenar por data mais próxima
      activities.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      setNextActivity(activities[0] || null);
    } catch (error) {
      console.error('Erro ao carregar próxima atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextCellMeeting = (diaSemana: string, horario: string) => {
    // Lógica para calcular próxima reunião baseada no dia da semana
    const today = new Date();
    const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const targetDay = daysOfWeek.indexOf(diaSemana.toLowerCase());
    
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
    const nextMeeting = new Date(today);
    nextMeeting.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    
    return nextMeeting;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'cell': return Users;
      case 'event': return Calendar;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'cell': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'event': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatActivityDate = (date: Date) => {
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-6 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextActivity) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próxima Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma atividade agendada</p>
            <p className="text-sm">Explore nossos cursos ou eventos!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ActivityIcon = getActivityIcon(nextActivity.type);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Próxima Atividade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getActivityColor(nextActivity.type)}`}>
            <ActivityIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">
              {nextActivity.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatActivityDate(nextActivity.date)}
              </div>
              
              {nextActivity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {nextActivity.location}
                </div>
              )}
            </div>

            {nextActivity.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progresso</span>
                  <span>{nextActivity.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${nextActivity.progress}%` }}
                  />
                </div>
              </div>
            )}

            {nextActivity.action && (
              <Button size="sm" className="mt-3 w-full">
                {nextActivity.action}
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};