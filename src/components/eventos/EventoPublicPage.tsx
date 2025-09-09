import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Ticket,
  DollarSign,
  FileText,
  Heart,
  Star,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { EventoCheckout } from './EventoCheckout';

interface EventoPublicPageProps {
  eventoId: string;
}

interface EventoPublico {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  endereco: string;
  cover_image_url: string;
  capacidade: number;
  is_paid_event: boolean;
  publico: boolean;
  inscricoes_abertas: boolean;
  registration_deadline: string;
  form_structure_json: any[];
  tipo: string;
}

interface EventoTicket {
  id: string;
  nome: string;
  preco: number;
  quantidade_total: number;
  quantidade_vendida: number;
}

export const EventoPublicPage: React.FC<EventoPublicPageProps> = ({ eventoId }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento-publico', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .eq('publico', true)
        .single();

      if (error) throw error;
      return data as EventoPublico;
    }
  });

  const { data: tickets } = useQuery({
    queryKey: ['evento-tickets', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evento_tickets')
        .select('*')
        .eq('evento_id', eventoId)
        .eq('ativo', true);

      if (error) throw error;
      return data as EventoTicket[];
    },
    enabled: !!evento?.is_paid_event
  });

  const { data: stats } = useQuery({
    queryKey: ['evento-stats', eventoId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('evento_inscricoes')
        .select('*', { count: 'exact', head: true })
        .eq('evento_id', eventoId);

      if (error) throw error;
      return { inscricoes: count || 0 };
    }
  });

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: evento?.titulo,
        text: evento?.descricao,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copiado!', description: 'O link do evento foi copiado para a área de transferência.' });
    }
  };

  const getAvailableTickets = (ticket: EventoTicket) => {
    return Math.max(0, ticket.quantidade_total - ticket.quantidade_vendida);
  };

  const totalSelectedTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalValue = tickets?.reduce((sum, ticket) => 
    sum + (selectedTickets[ticket.id] || 0) * ticket.preco, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-64 bg-muted"></div>
          <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Evento não encontrado</h2>
            <p className="text-muted-foreground">Este evento não está disponível ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEventExpired = new Date(evento.data_inicio) < new Date();
  const isRegistrationClosed = evento.registration_deadline && 
    new Date(evento.registration_deadline) < new Date();

  if (showCheckout) {
    return (
      <EventoCheckout
        evento={evento}
        tickets={tickets || []}
        selectedTickets={selectedTickets}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {evento.cover_image_url ? (
          <img 
            src={evento.cover_image_url} 
            alt={evento.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-kerigma" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Header Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {evento.tipo}
                  </Badge>
                  {evento.is_paid_event && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Evento Pago
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {evento.titulo}
                </h1>
                <p className="text-white/90 text-lg max-w-2xl">
                  {evento.descricao?.substring(0, 150)}...
                </p>
              </div>
              
              <Button 
                onClick={shareEvent}
                variant="secondary" 
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                    <p className="font-semibold">
                      {format(new Date(evento.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(evento.data_inicio), 'HH:mm')}
                    </p>
                  </div>
                  
                  {evento.data_fim && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data de Fim</p>
                      <p className="font-semibold">
                        {format(new Date(evento.data_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(evento.data_fim), 'HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <p className="font-semibold">{evento.local}</p>
                  </div>
                  {evento.endereco && (
                    <p className="text-sm text-muted-foreground pl-6">
                      {evento.endereco}
                    </p>
                  )}
                </div>
                
                {evento.capacidade > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-kerigma">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Capacidade</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{stats?.inscricoes || 0} / {evento.capacidade}</p>
                      <p className="text-xs text-muted-foreground">inscritos</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{evento.descricao}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Registration */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  {evento.is_paid_event ? 'Ingressos' : 'Inscrição'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!evento.inscricoes_abertas || isEventExpired || isRegistrationClosed ? (
                  <div className="text-center py-6">
                    <Badge variant="destructive" className="mb-2">
                      {isEventExpired ? 'Evento Finalizado' : 
                       isRegistrationClosed ? 'Inscrições Encerradas' : 'Inscrições Fechadas'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {isEventExpired 
                        ? 'Este evento já aconteceu'
                        : 'Não é possível se inscrever neste momento'
                      }
                    </p>
                  </div>
                ) : evento.is_paid_event && tickets ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => {
                      const available = getAvailableTickets(ticket);
                      return (
                        <div key={ticket.id} className="border rounded-kerigma p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{ticket.nome}</h4>
                            <p className="font-bold text-lg">R$ {ticket.preco.toFixed(2)}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              {available > 0 ? `${available} disponíveis` : 'Esgotado'}
                            </p>
                            
                            {available > 0 && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTickets(prev => ({
                                    ...prev,
                                    [ticket.id]: Math.max(0, (prev[ticket.id] || 0) - 1)
                                  }))}
                                  disabled={!selectedTickets[ticket.id]}
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center">
                                  {selectedTickets[ticket.id] || 0}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTickets(prev => ({
                                    ...prev,
                                    [ticket.id]: Math.min(available, (prev[ticket.id] || 0) + 1)
                                  }))}
                                  disabled={(selectedTickets[ticket.id] || 0) >= available}
                                >
                                  +
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {totalSelectedTickets > 0 && (
                      <div className="p-4 bg-surface-blue rounded-kerigma">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Total</span>
                          <span className="text-xl font-bold text-primary">
                            R$ {totalValue.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {totalSelectedTickets} {totalSelectedTickets === 1 ? 'ingresso' : 'ingressos'}
                        </p>
                        <Button 
                          onClick={() => setShowCheckout(true)}
                          className="w-full"
                          size="lg"
                        >
                          Continuar Inscrição
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-surface-blue rounded-kerigma">
                      <h3 className="font-semibold text-lg mb-2">Inscrição Gratuita</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Garante sua vaga neste evento especial
                      </p>
                      <Button 
                        onClick={() => setShowCheckout(true)}
                        size="lg" 
                        className="w-full"
                      >
                        <Ticket className="mr-2 h-4 w-4" />
                        Inscrever-se Gratuitamente
                      </Button>
                    </div>
                  </div>
                )}

                {evento.registration_deadline && !isRegistrationClosed && (
                  <div className="text-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Inscrições até {format(new Date(evento.registration_deadline), 'dd/MM/yyyy')}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{stats?.inscricoes || 0}</p>
                    <p className="text-xs text-muted-foreground">Inscritos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {evento.capacidade > 0 ? Math.max(0, evento.capacidade - (stats?.inscricoes || 0)) : '∞'}
                    </p>
                    <p className="text-xs text-muted-foreground">Vagas Restantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};