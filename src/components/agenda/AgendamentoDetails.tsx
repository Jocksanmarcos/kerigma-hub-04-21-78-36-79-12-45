import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, MapPin, Edit, Trash2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Agendamento {
  id: string;
  calendario_id: string;
  titulo: string;
  descricao?: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  responsavel_id?: string;
}

interface Participante {
  id: string;
  nome_completo: string;
  email?: string;
}

interface Recurso {
  id: string;
  nome: string;
  categoria?: string;
}

interface Calendar {
  id: string;
  nome: string;
  cor: string;
}

interface AgendamentoDetailsProps {
  agendamento: Agendamento;
  onClose: () => void;
  onUpdate: (updatedEvent: Partial<Agendamento>) => void;
  onDelete: (eventId: string) => void;
}

export const AgendamentoDetails: React.FC<AgendamentoDetailsProps> = ({
  agendamento,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [calendario, setCalendario] = useState<Calendar | null>(null);
  const [responsavel, setResponsavel] = useState<Participante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [agendamento.id]);

  const loadDetails = async () => {
    try {
      setLoading(true);

      // Carregar participantes
      const { data: participantesData } = await supabase
        .from('agendamento_participantes')
        .select(`
          pessoa_id,
          pessoas!inner(id, nome_completo, email)
        `)
        .eq('agendamento_id', agendamento.id);

      if (participantesData) {
        const participantesFormatted = participantesData.map(p => ({
          id: (p.pessoas as any).id,
          nome_completo: (p.pessoas as any).nome_completo,
          email: (p.pessoas as any).email,
        }));
        setParticipantes(participantesFormatted);
      }

      // Carregar recursos
      const { data: recursosData } = await supabase
        .from('agendamento_recursos')
        .select(`
          recurso_id,
          patrimonios!inner(id, nome)
        `)
        .eq('agendamento_id', agendamento.id);

      if (recursosData) {
        const recursosFormatted = recursosData.map(r => ({
          id: (r.patrimonios as any).id,
          nome: (r.patrimonios as any).nome,
        }));
        setRecursos(recursosFormatted);
      }

      // Carregar calendário
      const { data: calendarioData } = await supabase
        .from('calendarios')
        .select('*')
        .eq('id', agendamento.calendario_id)
        .single();

      if (calendarioData) {
        setCalendario(calendarioData);
      }

      // Carregar responsável
      if (agendamento.responsavel_id) {
        const { data: responsavelData } = await supabase
          .from('pessoas')
          .select('id, nome_completo, email')
          .eq('id', agendamento.responsavel_id)
          .single();

        if (responsavelData) {
          setResponsavel(responsavelData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      onDelete(agendamento.id);
    }
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {agendamento.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Horário:</span>
                <span>{formatDateTime(agendamento.data_hora_inicio)} - {format(new Date(agendamento.data_hora_fim), 'HH:mm')}</span>
              </div>

              {calendario && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: calendario.cor }}
                  />
                  <span className="font-medium">Calendário:</span>
                  <span>{calendario.nome}</span>
                </div>
              )}

              {responsavel && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Responsável:</span>
                  <span>{responsavel.nome_completo}</span>
                </div>
              )}

              {agendamento.descricao && (
                <div>
                  <span className="font-medium">Descrição:</span>
                  <p className="mt-1 text-muted-foreground">{agendamento.descricao}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participantes */}
          {participantes.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Participantes ({participantes.length})</span>
                </div>
                <div className="space-y-2">
                  {participantes.map((participante) => (
                    <div key={participante.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{participante.nome_completo}</div>
                        {participante.email && (
                          <div className="text-sm text-muted-foreground">{participante.email}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recursos */}
          {recursos.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Recursos Reservados ({recursos.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recursos.map((recurso) => (
                    <Badge key={recurso.id} variant="outline">
                      {recurso.nome}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Ações */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};