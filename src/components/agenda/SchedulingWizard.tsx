import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Users, MapPin, Clock } from 'lucide-react';

interface Calendar {
  id: string;
  nome: string;
  cor: string;
}

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
}

interface Recurso {
  id: string;
  nome: string;
  categoria: string;
  disponivel: boolean;
}

interface PreFilledData {
  titulo?: string;
  descricao?: string;
  participantes?: string[];
  agendamento_pastoral_id?: string;
  confidencial?: boolean;
}

interface SchedulingWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  calendars: Calendar[];
  initialDate?: Date;
  preFilledData?: PreFilledData;
}

export const SchedulingWizard: React.FC<SchedulingWizardProps> = ({
  onClose,
  onSuccess,
  calendars,
  initialDate,
  preFilledData,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const { toast } = useToast();

  // Dados do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    calendario_id: '',
    data_inicio: initialDate && initialDate instanceof Date ? initialDate.toISOString().split('T')[0] : '',
    hora_inicio: initialDate && initialDate instanceof Date ? initialDate.toTimeString().split(':').slice(0, 2).join(':') : '09:00',
    data_fim: initialDate && initialDate instanceof Date ? initialDate.toISOString().split('T')[0] : '',
    hora_fim: initialDate && initialDate instanceof Date ? initialDate.toTimeString().split(':').slice(0, 2).join(':') : '10:00',
    participantes: [] as string[],
    recursos: [] as string[],
  });

  useEffect(() => {
    loadPessoas();
    loadRecursos();
    
    // Pré-preencher dados se fornecidos
    if (preFilledData) {
      setFormData(prev => ({
        ...prev,
        titulo: preFilledData.titulo || prev.titulo,
        descricao: preFilledData.descricao || prev.descricao,
        participantes: preFilledData.participantes || prev.participantes,
      }));
    }
  }, [preFilledData]);

  const loadPessoas = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email')
        .order('nome_completo');

      if (error) throw error;
      setPessoas(data || []);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  const loadRecursos = async () => {
    try {
      // Assumindo que vamos usar a tabela de patrimônios como recursos
      const { data, error } = await supabase
        .from('patrimonios')
        .select('id, nome, categoria_id')
        .eq('status', 'disponivel')
        .order('nome');

      if (error) throw error;
      
      const recursosFormatted = data?.map(item => ({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria_id || 'Geral',
        disponivel: true,
      })) || [];
      
      setRecursos(recursosFormatted);
    } catch (error) {
      console.error('Erro ao carregar recursos:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Criar agendamento
      const dataHoraInicio = new Date(`${formData.data_inicio}T${formData.hora_inicio}`);
      const dataHoraFim = new Date(`${formData.data_fim}T${formData.hora_fim}`);

      const agendamentoData: any = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        calendario_id: formData.calendario_id,
        data_hora_inicio: dataHoraInicio.toISOString(),
        data_hora_fim: dataHoraFim.toISOString(),
      };

      // Incluir ID do aconselhamento pastoral se existir
      if (preFilledData?.agendamento_pastoral_id) {
        agendamentoData.agendamento_pastoral_id = preFilledData.agendamento_pastoral_id;
      }

      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert(agendamentoData)
        .select()
        .single();

      if (agendamentoError) throw agendamentoError;

      // Adicionar participantes
      if (formData.participantes.length > 0) {
        const participantesData = formData.participantes.map(pessoaId => ({
          agendamento_id: agendamento.id,
          pessoa_id: pessoaId,
        }));

        const { error: participantesError } = await supabase
          .from('agendamento_participantes')
          .insert(participantesData);

        if (participantesError) throw participantesError;
      }

      // Adicionar recursos
      if (formData.recursos.length > 0) {
        const recursosData = formData.recursos.map(recursoId => ({
          agendamento_id: agendamento.id,
          recurso_id: recursoId,
        }));

        const { error: recursosError } = await supabase
          .from('agendamento_recursos')
          .insert(recursosData);

        if (recursosError) throw recursosError;
      }

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
          placeholder="Ex: Reunião de equipe"
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Detalhes do agendamento..."
        />
      </div>

      <div>
        <Label>Calendário *</Label>
        <Select
          value={formData.calendario_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, calendario_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o calendário" />
          </SelectTrigger>
          <SelectContent>
            {calendars.map((calendar) => (
              <SelectItem key={calendar.id} value={calendar.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: calendar.cor }}
                  />
                  {calendar.nome}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_inicio">Data Início *</Label>
          <Input
            id="data_inicio"
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="hora_inicio">Hora Início *</Label>
          <Input
            id="hora_inicio"
            type="time"
            value={formData.hora_inicio}
            onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_fim">Data Fim *</Label>
          <Input
            id="data_fim"
            type="date"
            value={formData.data_fim}
            onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="hora_fim">Hora Fim *</Label>
          <Input
            id="hora_fim"
            type="time"
            value={formData.hora_fim}
            onChange={(e) => setFormData(prev => ({ ...prev, hora_fim: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-medium">Participantes</h3>
      </div>

      <div>
        <Label>Adicionar Participantes</Label>
        <Select
          onValueChange={(pessoaId) => {
            if (!formData.participantes.includes(pessoaId)) {
              setFormData(prev => ({
                ...prev,
                participantes: [...prev.participantes, pessoaId]
              }));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma pessoa" />
          </SelectTrigger>
          <SelectContent>
            {pessoas
              .filter(pessoa => !formData.participantes.includes(pessoa.id))
              .map((pessoa) => (
                <SelectItem key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome_completo}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {formData.participantes.length > 0 && (
        <div>
          <Label>Participantes Selecionados</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.participantes.map((pessoaId) => {
              const pessoa = pessoas.find(p => p.id === pessoaId);
              return (
                <Badge
                  key={pessoaId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      participantes: prev.participantes.filter(id => id !== pessoaId)
                    }));
                  }}
                >
                  {pessoa?.nome_completo} ×
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5" />
        <h3 className="text-lg font-medium">Salas e Recursos</h3>
      </div>

      <div>
        <Label>Adicionar Recursos</Label>
        <Select
          onValueChange={(recursoId) => {
            if (!formData.recursos.includes(recursoId)) {
              setFormData(prev => ({
                ...prev,
                recursos: [...prev.recursos, recursoId]
              }));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um recurso" />
          </SelectTrigger>
          <SelectContent>
            {recursos
              .filter(recurso => !formData.recursos.includes(recurso.id))
              .map((recurso) => (
                <SelectItem key={recurso.id} value={recurso.id}>
                  {recurso.nome} - {recurso.categoria}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {formData.recursos.length > 0 && (
        <div>
          <Label>Recursos Selecionados</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.recursos.map((recursoId) => {
              const recurso = recursos.find(r => r.id === recursoId);
              return (
                <Badge
                  key={recursoId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      recursos: prev.recursos.filter(id => id !== recursoId)
                    }));
                  }}
                >
                  {recurso?.nome} ×
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const isStep1Valid = formData.titulo && formData.calendario_id && formData.data_inicio && formData.hora_inicio && formData.data_fim && formData.hora_fim;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Novo Agendamento - Passo {step} de 3
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`h-px flex-1 ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <div className={`h-px flex-1 ${step > 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {step > 1 ? 'Anterior' : 'Cancelar'}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !isStep1Valid}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !isStep1Valid}
              >
                {loading ? 'Criando...' : 'Criar Agendamento'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};