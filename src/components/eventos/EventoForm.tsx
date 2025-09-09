import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, DollarSign, Settings, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormularioBuilder } from './FormularioBuilder';
import { TicketsConfig } from './TicketsConfig';

interface EventoFormData {
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  endereco: string;
  tipo: string;
  capacidade: number;
  publico: boolean;
  inscricoes_abertas: boolean;
  is_paid_event: boolean;
  cover_image_url: string;
  registration_deadline: string;
  form_structure_json: any[];
}

interface EventoFormProps {
  evento?: any;
  onSuccess: () => void;
  formId?: string;
  hideSubmit?: boolean;
}

export const EventoForm: React.FC<EventoFormProps> = ({ evento, onSuccess, formId, hideSubmit }) => {
  const [formStructure, setFormStructure] = useState(evento?.form_structure_json || []);
  const [tickets, setTickets] = useState([]);
  const { toast } = useToast();
  const [uploadingCover, setUploadingCover] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventoFormData>({
    defaultValues: {
      titulo: evento?.titulo || '',
      descricao: evento?.descricao || '',
      data_inicio: evento?.data_inicio ? new Date(evento.data_inicio).toISOString().slice(0, 16) : '',
      data_fim: evento?.data_fim ? new Date(evento.data_fim).toISOString().slice(0, 16) : '',
      local: evento?.local || '',
      endereco: evento?.endereco || '',
      tipo: evento?.tipo || 'culto',
      capacidade: evento?.capacidade || 0,
      publico: evento?.publico ?? true,
      inscricoes_abertas: evento?.inscricoes_abertas ?? true,
      is_paid_event: evento?.is_paid_event ?? false,
      cover_image_url: evento?.cover_image_url || '',
      registration_deadline: evento?.registration_deadline ? new Date(evento.registration_deadline).toISOString().slice(0, 10) : '',
      form_structure_json: evento?.form_structure_json || []
    }
  });

  const isPaidEvent = watch('is_paid_event');

  const saveEventoMutation = useMutation({
    mutationFn: async (data: EventoFormData) => {
      const eventoData = {
        ...data,
        form_structure_json: formStructure,
        data_inicio: new Date(data.data_inicio).toISOString(),
        data_fim: data.data_fim ? new Date(data.data_fim).toISOString() : null,
        registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString() : null,
        igreja_id: (await supabase.auth.getUser()).data.user?.user_metadata?.igreja_id
      };

      if (evento) {
        const { data: updatedEvento, error } = await supabase
          .from('eventos')
          .update(eventoData)
          .eq('id', evento.id)
          .select()
          .single();
        
        if (error) throw error;
        return updatedEvento;
      } else {
        const { data: newEvento, error } = await supabase
          .from('eventos')
          .insert(eventoData)
          .select()
          .single();
        
        if (error) throw error;
        return newEvento;
      }
    },
    onSuccess: (eventoData) => {
      toast({ title: `Evento ${evento ? 'atualizado' : 'criado'} com sucesso!` });
      
      // Se é um evento pago e temos tickets configurados, salvar os tickets
      if (isPaidEvent && tickets.length > 0) {
        saveTickets(eventoData.id);
      } else {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({ 
        title: `Erro ao ${evento ? 'atualizar' : 'criar'} evento`, 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const saveTickets = async (eventoId: string) => {
    try {
      // Remove tickets antigos se estiver editando
      if (evento) {
        await supabase
          .from('evento_tickets')
          .delete()
          .eq('evento_id', eventoId);
      }

      // Insere novos tickets
      if (tickets.length > 0) {
        const { error } = await supabase
          .from('evento_tickets')
          .insert(tickets.map(ticket => ({ ...ticket, evento_id: eventoId })));
        
        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      toast({ 
        title: 'Erro ao salvar tickets', 
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const onSubmit = (data: EventoFormData) => {
    saveEventoMutation.mutate(data);
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basico" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basico" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="localizacao" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Local
          </TabsTrigger>
          <TabsTrigger value="inscricoes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Inscrições
          </TabsTrigger>
          {isPaidEvent && (
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tickets
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Evento *</Label>
                  <Input
                    id="titulo"
                    {...register('titulo', { required: 'Título é obrigatório' })}
                    placeholder="Nome do evento"
                  />
                  {errors.titulo && (
                    <p className="text-sm text-destructive">{errors.titulo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Evento *</Label>
                  <Select
                    value={watch('tipo')}
                    onValueChange={(value) => setValue('tipo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="culto">Culto</SelectItem>
                      <SelectItem value="conferencia">Conferência</SelectItem>
                      <SelectItem value="curso">Curso</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="retiro">Retiro</SelectItem>
                      <SelectItem value="evangelismo">Evangelismo</SelectItem>
                      <SelectItem value="social">Evento Social</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Descreva o evento..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data e Hora de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="datetime-local"
                    {...register('data_inicio', { required: 'Data de início é obrigatória' })}
                  />
                  {errors.data_inicio && (
                    <p className="text-sm text-destructive">{errors.data_inicio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data e Hora de Fim</Label>
                  <Input
                    id="data_fim"
                    type="datetime-local"
                    {...register('data_fim')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Imagem de Capa</Label>
                <div className="grid gap-2">
                  <Input
                    id="cover_image_url"
                    {...register('cover_image_url')}
                    placeholder="https://..."
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      id="cover_file"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingCover(true);
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) {
                            toast({ title: 'Faça login para enviar imagens', variant: 'destructive' });
                            return;
                          }
                          const path = `${user.id}/${Date.now()}-${file.name}`;
                          const { error: upErr } = await supabase.storage.from('event-covers').upload(path, file);
                          if (upErr) throw upErr;
                          const { data: pub } = supabase.storage.from('event-covers').getPublicUrl(path);
                          setValue('cover_image_url', pub.publicUrl, { shouldDirty: true });
                          toast({ title: 'Imagem enviada', description: 'URL preenchido automaticamente.' });
                        } catch (err: any) {
                          toast({ title: 'Erro ao enviar imagem', description: err.message, variant: 'destructive' });
                        } finally {
                          setUploadingCover(false);
                          e.currentTarget.value = '';
                        }
                      }}
                      disabled={uploadingCover}
                    />
                    {uploadingCover && (
                      <span className="text-sm text-muted-foreground">Enviando...</span>
                    )}
                  </div>
                  {watch('cover_image_url') && (
                    <img
                      src={watch('cover_image_url')}
                      alt="Capa do evento - prévia"
                      className="h-32 w-full object-cover rounded border"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publico"
                    checked={watch('publico')}
                    onCheckedChange={(checked) => setValue('publico', checked)}
                  />
                  <Label htmlFor="publico">Evento Público</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inscricoes_abertas"
                    checked={watch('inscricoes_abertas')}
                    onCheckedChange={(checked) => setValue('inscricoes_abertas', checked)}
                  />
                  <Label htmlFor="inscricoes_abertas">Inscrições Abertas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_paid_event"
                    checked={watch('is_paid_event')}
                    onCheckedChange={(checked) => setValue('is_paid_event', checked)}
                  />
                  <Label htmlFor="is_paid_event">Evento Pago</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localizacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="local">Local do Evento *</Label>
                <Input
                  id="local"
                  {...register('local', { required: 'Local é obrigatório' })}
                  placeholder="Ex: Igreja Central, Auditório Principal"
                />
                {errors.local && (
                  <p className="text-sm text-destructive">{errors.local.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Textarea
                  id="endereco"
                  {...register('endereco')}
                  placeholder="Rua, número, bairro, cidade, CEP..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade Máxima</Label>
                <Input
                  id="capacidade"
                  type="number"
                  {...register('capacidade', { valueAsNumber: true })}
                  placeholder="0 = sem limite"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inscricoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuração de Inscrições
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration_deadline">Prazo para Inscrições</Label>
                <Input
                  id="registration_deadline"
                  type="date"
                  {...register('registration_deadline')}
                />
                <p className="text-sm text-muted-foreground">
                  Deixe em branco para não ter prazo limite
                </p>
              </div>

              <div className="space-y-2">
                <Label>Formulário de Inscrição</Label>
                <FormularioBuilder
                  structure={formStructure}
                  onChange={setFormStructure}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isPaidEvent && (
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configuração de Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TicketsConfig
                  tickets={tickets}
                  onChange={setTickets}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {!hideSubmit && (
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="submit" variant="premium" size="lg">
            {evento ? 'Atualizar Evento' : 'Criar Evento'}
          </Button>
        </div>
      )}
    </form>
  );
};