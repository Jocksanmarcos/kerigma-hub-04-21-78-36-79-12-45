import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HeartHandshake, Lock, UserCheck, Shield, Clock, Calendar as CalendarIconLucide } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().optional(),
  assunto: z.string().optional(),
  data: z.date({
    required_error: 'Data é obrigatória',
  }),
  hora: z.string().min(1, 'Horário é obrigatório'),
});

// Horários disponíveis para agendamento
const HORARIOS_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

type FormData = z.infer<typeof formSchema>;

interface SolicitacaoAconselhamentoFormProps {
  onSuccess?: () => void;
}

export const SolicitacaoAconselhamentoForm: React.FC<SolicitacaoAconselhamentoFormProps> = ({
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const dataSelecionada = form.watch('data');

  // Função para buscar horários ocupados
  const buscarHorariosOcupados = useCallback(async (selectedDate: Date) => {
    if (!selectedDate) return;
    
    setLoadingHorarios(true);
    try {
      const dataFormatada = format(selectedDate, 'yyyy-MM-dd');

      // Make a direct HTTP call since the function expects query parameters
      const response = await fetch(
        `https://vsanvmekqtfkbgmrjwoo.supabase.co/functions/v1/consultar-horarios-disponiveis?data=${dataFormatada}`,
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYW52bWVrcXRma2JnbXJqd29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU0OTUsImV4cCI6MjA2OTEwMTQ5NX0.eJqJcO-lOng2-1OwMhXAOXTYRF1hAsRo7NrkFT34ob8`,
          },
        }
      );

      if (!response.ok) throw new Error('Erro ao consultar horários');
      
      const result = await response.json();
      setHorariosOcupados(result.horarios_ocupados || []);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      toast.error('Erro ao carregar horários disponíveis');
      setHorariosOcupados([]);
    } finally {
      setLoadingHorarios(false);
    }
  }, []);

  // Buscar horários quando a data muda
  useEffect(() => {
    if (dataSelecionada) {
      buscarHorariosOcupados(dataSelecionada);
      // Limpar horário selecionado quando muda a data
      form.setValue('hora', '');
    }
  }, [dataSelecionada, buscarHorariosOcupados, form]);

  // Filtrar horários disponíveis
  const horariosLivres = HORARIOS_DISPONIVEIS.filter(
    horario => !horariosOcupados.includes(horario)
  );

  const onSubmit = async (data: FormData) => {
    if (!recaptchaToken) {
      toast.error('Por favor, complete a verificação de segurança');
      return;
    }

    setIsSubmitting(true);
    try {
      const dadosFormulario = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        assunto: data.assunto,
        data: format(data.data, 'yyyy-MM-dd'),
        hora: data.hora,
      };

      const { data: result, error } = await supabase.functions.invoke('solicitar-agendamento-publico', {
        body: {
          dadosFormulario,
          tokenRecaptcha: recaptchaToken,
        },
      });

      if (error) throw error;

      toast.success('Solicitação enviada com sucesso! Nossa equipe pastoral entrará em contato em breve.');
      form.reset();
      setRecaptchaToken(null);
      onSuccess?.();
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error(error.message || 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <HeartHandshake className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Agendar Aconselhamento Pastoral</CardTitle>
        <CardDescription>
          Escolha uma data e horário para conversar com nossa equipe pastoral. 
          Estamos aqui para caminhar ao seu lado.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Privacy Notice */}
        <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Privacidade e Confidencialidade</h4>
              <p className="text-sm text-muted-foreground">
                Todas as informações compartilhadas são tratadas com total confidencialidade. 
                Apenas a equipe pastoral autorizada terá acesso aos seus dados.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assunto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Motivo do aconselhamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seleção de Data e Hora */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIconLucide className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Escolha Data e Horário</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date.getDay() === 0 // Disable past dates and Sundays
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!dataSelecionada || loadingHorarios}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !dataSelecionada 
                                ? "Selecione uma data primeiro" 
                                : loadingHorarios 
                                  ? "Carregando horários..." 
                                  : "Escolha um horário"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {horariosLivres.length === 0 && dataSelecionada && !loadingHorarios ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              Nenhum horário disponível nesta data
                            </div>
                          ) : (
                            horariosLivres.map((horario) => (
                              <SelectItem key={horario} value={horario}>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {horario}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {dataSelecionada && horariosOcupados.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Horários ocupados: {horariosOcupados.join(', ')}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex flex-col items-center space-y-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-start gap-3 w-full">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Verificação de Segurança</p>
                  <p className="text-muted-foreground">
                    Complete a verificação abaixo para enviar sua solicitação.
                  </p>
                </div>
              </div>
              
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key - replace with real key
                onChange={setRecaptchaToken}
                onExpired={() => setRecaptchaToken(null)}
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Este formulário é protegido pelo Google reCAPTCHA.{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Termos
                </a>{' '}
                e{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Privacidade
                </a>
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg"
                disabled={isSubmitting || !recaptchaToken || horariosLivres.length === 0}
                className="min-w-[200px]"
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Solicitar Agendamento
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};