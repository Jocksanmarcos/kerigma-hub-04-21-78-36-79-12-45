import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Receipt, 
  Shield, 
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Check,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventoCheckoutProps {
  evento: any;
  tickets: any[];
  selectedTickets: { [key: string]: number };
  onBack: () => void;
}

interface FormData {
  nome_completo: string;
  email: string;
  telefone: string;
  [key: string]: any;
}

export const EventoCheckout: React.FC<EventoCheckoutProps> = ({ 
  evento, 
  tickets, 
  selectedTickets, 
  onBack 
}) => {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'boleto'>('pix');
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const totalValue = tickets.reduce((sum, ticket) => 
    sum + (selectedTickets[ticket.id] || 0) * ticket.preco, 0);

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const inscricaoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Primeiro, criar ou buscar a pessoa
      const { data: pessoa, error: pessoaError } = await supabase
        .from('pessoas')
        .upsert({
          nome_completo: formData.nome_completo,
          email: formData.email,
          telefone: formData.telefone,
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (pessoaError) throw pessoaError;

      // Criar inscrições para cada ticket
      const inscricoes = [];
      for (const ticket of tickets) {
        const quantity = selectedTickets[ticket.id] || 0;
        for (let i = 0; i < quantity; i++) {
          inscricoes.push({
            evento_id: evento.id,
            pessoa_id: pessoa.id,
            ticket_id: ticket.id,
            status_pagamento: evento.is_paid_event ? 'Pendente' : 'Gratuito',
            pagamento_valor: ticket.preco,
            pagamento_moeda: 'BRL',
            qr_code_hash: `${evento.id}_${pessoa.id}_${Date.now()}_${i}`,
            dados_formulario_json: { ...formData }
          });
        }
      }

      // Para evento gratuito, criar apenas uma inscrição
      if (!evento.is_paid_event) {
        const { data, error } = await supabase
          .from('evento_inscricoes')
          .insert({
            evento_id: evento.id,
            pessoa_id: pessoa.id,
            ticket_id: tickets[0]?.id || null,
            status_pagamento: 'Gratuito',
            pagamento_valor: 0,
            pagamento_moeda: 'BRL',
            qr_code_hash: `${evento.id}_${pessoa.id}_${Date.now()}`,
            dados_formulario_json: { ...formData }
          })
          .select()
          .single();

        if (error) throw error;
        return { inscricao: data, tipo: 'gratuito' };
      }

      // Para eventos pagos, inserir todas as inscrições
      const { data, error } = await supabase
        .from('evento_inscricoes')
        .insert(inscricoes)
        .select();

      if (error) throw error;
      return { inscricoes: data, tipo: 'pago' };
    },
    onSuccess: async (result) => {
      if (evento.is_paid_event) {
        try {
          const inscricaoIds: string[] = (result as any).inscricoes?.map((i: any) => i.id) || [];
          const items = tickets
            .map((t) => ({ id: t.id, nome: t.nome, preco: t.preco, qty: selectedTickets[t.id] || 0 }))
            .filter((t) => t.qty > 0)
            .map((t) => ({ title: `${evento.titulo} - ${t.nome}`, quantity: t.qty, unit_price: Number(t.preco) }));

          const backBase = window.location.origin + `/eventos/${evento.id}`;

          const { data, error } = await supabase.functions.invoke('mercado-pago-create-preference', {
            body: {
              items,
              external_reference: JSON.stringify({ inscricao_ids: inscricaoIds, evento_id: evento.id }),
              back_urls: {
                success: `${backBase}?status=success`,
                pending: `${backBase}?status=pending`,
                failure: `${backBase}?status=failure`,
              },
            },
          });

          if (error) throw error;
          if (data?.init_point) {
            window.location.href = data.init_point;
            return;
          }
          throw new Error('Falha ao iniciar pagamento');
        } catch (err: any) {
          toast({ title: 'Erro ao iniciar pagamento', description: err.message, variant: 'destructive' });
        }
      } else {
        setStep('success');
        toast({ 
          title: 'Inscrição realizada!', 
          description: 'Sua inscrição foi confirmada. Verifique seu email.'
        });
      }
    },
    onError: (error) => {
      toast({ 
        title: 'Erro na inscrição', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: FormData) => {
    if (step === 'info') {
      if (evento.is_paid_event && totalValue > 0) {
        setStep('payment');
      } else {
        inscricaoMutation.mutate(data);
      }
    } else if (step === 'payment') {
      inscricaoMutation.mutate(data);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Inscrição Realizada!</h2>
              <p className="text-muted-foreground">
                {evento.is_paid_event 
                  ? 'Você receberá as instruções de pagamento por email em breve.'
                  : 'Sua inscrição foi confirmada com sucesso!'
                }
              </p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-kerigma space-y-2">
              <h3 className="font-semibold">{evento.titulo}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {totalTickets} {totalTickets === 1 ? 'ingresso' : 'ingressos'}
                </div>
                {evento.is_paid_event && (
                  <div className="flex items-center gap-2">
                    <Receipt className="h-3 w-3" />
                    R$ {totalValue.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.close()} 
                className="w-full"
                size="lg"
              >
                Finalizar
              </Button>
              <Button 
                variant="outline" 
                onClick={onBack}
                className="w-full"
              >
                Voltar ao Evento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="font-semibold">Finalizar Inscrição</h1>
              <p className="text-sm text-muted-foreground">{evento.titulo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 'info' && (
                <>
                  {/* Personal Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Dados Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="nome_completo">Nome Completo *</Label>
                          <Input
                            id="nome_completo"
                            {...register('nome_completo', { required: 'Nome é obrigatório' })}
                          />
                          {errors.nome_completo && (
                            <p className="text-sm text-destructive">{errors.nome_completo.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register('email', { required: 'Email é obrigatório' })}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          {...register('telefone')}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Form Fields */}
                  {evento.form_structure_json && evento.form_structure_json.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Informações Adicionais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {evento.form_structure_json.map((field: any) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>
                              {field.label}
                              {field.required && ' *'}
                            </Label>
                            {field.type === 'textarea' ? (
                              <Textarea
                                id={field.id}
                                {...register(field.id, { required: field.required })}
                                placeholder={field.placeholder}
                              />
                            ) : (
                              <Input
                                id={field.id}
                                type={field.type}
                                {...register(field.id, { required: field.required })}
                                placeholder={field.placeholder}
                              />
                            )}
                            {field.description && (
                              <p className="text-sm text-muted-foreground">{field.description}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {step === 'payment' && evento.is_paid_event && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Método de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div 
                        className={`border rounded-kerigma p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'pix' ? 'border-primary bg-surface-blue' : 'border-border'
                        }`}
                        onClick={() => setPaymentMethod('pix')}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5" />
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-muted-foreground">
                              Aprovação instantânea
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`border rounded-kerigma p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'credit' ? 'border-primary bg-surface-blue' : 'border-border'
                        }`}
                        onClick={() => setPaymentMethod('credit')}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Cartão de Crédito</p>
                            <p className="text-sm text-muted-foreground">
                              Parcelamento disponível
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`border rounded-kerigma p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'boleto' ? 'border-primary bg-surface-blue' : 'border-border'
                        }`}
                        onClick={() => setPaymentMethod('boleto')}
                      >
                        <div className="flex items-center gap-3">
                          <Receipt className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Boleto Bancário</p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento em 3 dias úteis
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-kerigma">
                      <Shield className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-muted-foreground">
                        Pagamento 100% seguro via Mercado Pago
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={inscricaoMutation.isPending}
              >
                {inscricaoMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {step === 'info' 
                  ? (evento.is_paid_event && totalValue > 0 ? 'Continuar para Pagamento' : 'Finalizar Inscrição')
                  : 'Confirmar Pagamento'
                }
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{evento.titulo}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  {tickets.map(ticket => {
                    const quantity = selectedTickets[ticket.id] || 0;
                    if (quantity === 0) return null;

                    return (
                      <div key={ticket.id} className="flex justify-between">
                        <div>
                          <p className="font-medium">{ticket.nome}</p>
                          <p className="text-sm text-muted-foreground">Qtd: {quantity}</p>
                        </div>
                        <p className="font-semibold">
                          R$ {(ticket.preco * quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}

                  {!evento.is_paid_event && (
                    <div className="flex justify-between">
                      <p className="font-medium">Inscrição Gratuita</p>
                      <Badge variant="secondary">Grátis</Badge>
                    </div>
                  )}
                </div>

                {evento.is_paid_event && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>R$ {totalValue.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Você receberá um email de confirmação</p>
                  <p>• Seus ingressos terão QR Code para check-in</p>
                  {evento.is_paid_event && (
                    <p>• O pagamento será processado via Mercado Pago</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};