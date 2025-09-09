import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, BookOpen, AlertCircle, Plus } from 'lucide-react';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

interface AgendaItem {
  id: string;
  tipo: 'curso' | 'agendamento' | 'evento' | 'tarefa';
  titulo: string;
  data: string;
  horario?: string;
  status: string;
  prioridade?: 'alta' | 'media' | 'baixa';
  detalhes?: string;
}

export const PersonalAgenda: React.FC = () => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    if (pessoa) {
      loadAgendaItems();
    }
  }, [pessoa]);

  const loadAgendaItems = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);
      const today = new Date();
      
      // Mock data for demonstration
      const items: AgendaItem[] = [
        {
          id: '1',
          tipo: 'curso',
          titulo: 'Continuar: Fundamentos da Fé',
          data: today.toISOString().split('T')[0],
          status: 'pendente',
          detalhes: 'Lição 3: O Amor de Deus',
          prioridade: 'media'
        },
        {
          id: '2',
          tipo: 'agendamento',
          titulo: 'Aconselhamento Pastoral',
          data: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          horario: '14:00',
          status: 'agendado',
          detalhes: 'Conversa sobre crescimento espiritual',
          prioridade: 'alta'
        }
      ];

      setAgendaItems(items);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (tipo: string) => {
    switch (tipo) {
      case 'curso': return BookOpen;
      case 'agendamento': return User;
      case 'evento': return Calendar;
      case 'tarefa': return AlertCircle;
      default: return Clock;
    }
  };

  const getItemColor = (tipo: string, prioridade?: string) => {
    if (prioridade === 'alta') return 'bg-error/10 text-error border-error/20';
    
    switch (tipo) {
      case 'curso': return 'bg-primary/10 text-primary border-primary/20';
      case 'agendamento': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'evento': return 'bg-success/10 text-success border-success/20';
      case 'tarefa': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string }> = {
      'agendado': { variant: 'default', text: 'Agendado' },
      'concluido': { variant: 'secondary', text: 'Concluído' },
      'cancelado': { variant: 'destructive', text: 'Cancelado' },
      'pendente': { variant: 'outline', text: 'Pendente' },
      'confirmado': { variant: 'default', text: 'Confirmado' }
    };

    const config = variants[status] || { variant: 'outline' as const, text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Minha Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Minha Agenda
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agendaItems.map((item) => {
            const Icon = getItemIcon(item.tipo);
            return (
              <div 
                key={item.id}
                className={`p-4 border rounded-lg hover:shadow-kerigma transition-all duration-300 ${getItemColor(item.tipo, item.prioridade)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{item.titulo}</h5>
                        {item.horario && (
                          <Badge variant="outline" className="text-xs">
                            {item.horario}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {getDateLabel(item.data)}
                      </p>
                      {item.detalhes && (
                        <p className="text-sm opacity-80">{item.detalhes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(item.status)}
                    {item.prioridade === 'alta' && (
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};