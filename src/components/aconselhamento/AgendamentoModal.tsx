import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { toast } from 'sonner';

interface AgendamentoModalProps {
  trigger?: React.ReactNode;
}

export function AgendamentoModal({ trigger }: AgendamentoModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [titulo, setTitulo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [selectedConselheiro, setSelectedConselheiro] = useState('');
  const [selectedMembro, setSelectedMembro] = useState('');

  const {
    conselheiros,
    membros,
    currentUser,
    isConselheiro,
    solicitarAgendamento,
    gerenciarAgendamento,
    solicitandoAgendamento,
    gerenciandoAgendamento
  } = useAgendamentos();

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setTitulo('');
    setObservacoes('');
    setSelectedConselheiro('');
    setSelectedMembro('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !titulo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const dataHoraInicio = new Date(selectedDate);
      dataHoraInicio.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (isConselheiro) {
        // Conselheiro criando agendamento direto
        if (!selectedMembro) {
          toast.error('Selecione um membro para o agendamento');
          return;
        }

        await gerenciarAgendamento({
          acao: 'aprovar_direto',
          payload: {
            solicitante_id: selectedMembro,
            conselheiro_id: currentUser?.user_id,
            data_hora_inicio: dataHoraInicio.toISOString(),
            titulo,
            observacoes
          }
        });
      } else {
        // Membro solicitando agendamento
        if (!selectedConselheiro) {
          toast.error('Selecione um conselheiro');
          return;
        }

        await solicitarAgendamento({
          conselheiro_id: selectedConselheiro,
          data_hora_inicio: dataHoraInicio.toISOString(),
          titulo,
          observacoes
        });
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao processar agendamento:', error);
    }
  };

  // Generate time slots from 8:00 to 18:00
  const timeSlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isConselheiro ? 'Agendar Sessão' : 'Solicitar Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Conselheiro (para membros) */}
          {!isConselheiro && (
            <div className="space-y-2">
              <Label htmlFor="conselheiro">Conselheiro *</Label>
              <Select value={selectedConselheiro} onValueChange={setSelectedConselheiro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um conselheiro" />
                </SelectTrigger>
                <SelectContent>
                  {conselheiros?.map((conselheiro) => (
                    <SelectItem key={conselheiro.user_id} value={conselheiro.user_id}>
                      {conselheiro.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Seleção de Membro (para conselheiros) */}
          {isConselheiro && (
            <div className="space-y-2">
              <Label htmlFor="membro">Membro *</Label>
              <Select value={selectedMembro} onValueChange={setSelectedMembro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  {membros?.map((membro) => (
                    <SelectItem key={membro.user_id} value={membro.user_id}>
                      {membro.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Data */}
          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="horario">Horário *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Aconselhamento sobre relacionamentos"
              required
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o motivo do aconselhamento"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={solicitandoAgendamento || gerenciandoAgendamento}
            >
              {solicitandoAgendamento || gerenciandoAgendamento ? 'Processando...' : 
               isConselheiro ? 'Agendar' : 'Solicitar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}