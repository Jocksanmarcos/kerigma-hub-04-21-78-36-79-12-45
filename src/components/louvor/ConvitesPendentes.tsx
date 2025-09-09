import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConvitePendente {
  id: string;
  status: string;
  observacoes?: string;
  created_at: string;
  escalas_eventos: {
    id: string;
    nome_evento: string;
    data_evento: string;
    local_evento: string;
    status: string;
  };
  louvor_cargos: {
    nome_cargo: string;
    cor: string;
  };
}

export const ConvitesPendentes: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: convites, isLoading } = useQuery({
    queryKey: ['convites-pendentes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!pessoa) throw new Error('Pessoa não encontrada');

      const { data, error } = await supabase
        .from('escalas_membros')
        .select(`
          *,
          escalas_eventos(id, nome_evento, data_evento, local_evento, status),
          louvor_cargos(nome_cargo, cor)
        `)
        .eq('membro_id', pessoa.id)
        .eq('status', 'pendente')
        .gte('escalas_eventos.data_evento', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ConvitePendente[];
    }
  });

  const responderConvite = useMutation({
    mutationFn: async ({ id, status, observacoes }: { id: string; status: string; observacoes?: string }) => {
      const { error } = await supabase
        .from('escalas_membros')
        .update({ 
          status,
          observacoes,
          data_resposta: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['convites-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-escalas'] });
      toast.success(
        status === 'confirmado' 
          ? 'Convite aceito com sucesso!' 
          : 'Convite recusado com sucesso!'
      );
    },
    onError: (error) => {
      console.error('Erro ao responder convite:', error);
      toast.error('Erro ao responder convite. Tente novamente.');
    }
  });

  const isConviteUrgente = (dataEvento: string) => {
    const evento = new Date(dataEvento);
    const agora = new Date();
    const diffDays = (evento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 3; // 3 dias ou menos
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Convites Pendentes</h3>
        <p className="text-sm text-muted-foreground">
          Responda aos convites para participar dos eventos de louvor
        </p>
      </div>

      <div className="grid gap-4">
        {convites?.map((convite) => {
          const evento = convite.escalas_eventos;
          const dataEvento = new Date(evento.data_evento);
          const isUrgente = isConviteUrgente(evento.data_evento);
          
          return (
            <Card key={convite.id} className={isUrgente ? 'ring-2 ring-orange-500/20' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{evento.nome_evento}</h4>
                      {isUrgente && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Urgente
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(dataEvento, 'PPP', { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(dataEvento, 'HH:mm')}
                      </div>
                      {evento.local_evento && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {evento.local_evento}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: convite.louvor_cargos.cor }}
                      />
                      <span className="font-medium text-sm">
                        Convidado para: {convite.louvor_cargos.nome_cargo}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Convite enviado em {format(new Date(convite.created_at), 'PPp', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm"
                    onClick={() => responderConvite.mutate({ 
                      id: convite.id, 
                      status: 'confirmado' 
                    })}
                    disabled={responderConvite.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceitar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => responderConvite.mutate({ 
                      id: convite.id, 
                      status: 'recusado',
                      observacoes: 'Recusado pelo membro'
                    })}
                    disabled={responderConvite.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Recusar
                  </Button>
                  {isUrgente && (
                    <span className="text-xs text-orange-600 ml-auto">
                      Resposta urgente necessária
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {!convites?.length && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum convite pendente</h3>
              <p className="text-muted-foreground">
                Você não possui convites aguardando resposta no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};