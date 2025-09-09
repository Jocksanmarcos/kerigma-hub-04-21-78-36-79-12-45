import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Music, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MinhaEscala {
  id: string;
  status: string;
  observacoes?: string;
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

export const MinhasEscalasList: React.FC = () => {
  const { data: minhasEscalas, isLoading } = useQuery({
    queryKey: ['minhas-escalas'],
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
        .eq('status', 'confirmado')
        .gte('escalas_eventos.data_evento', new Date().toISOString())
        .order('escalas_eventos.data_evento');
      
      if (error) throw error;
      return data as MinhaEscala[];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'default';
      case 'planejado': return 'secondary';
      case 'concluido': return 'outline';
      case 'cancelado': return 'destructive';
      default: return 'secondary';
    }
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
        <h3 className="text-lg font-medium mb-2">Próximas Escalas Confirmadas</h3>
        <p className="text-sm text-muted-foreground">
          Eventos onde sua participação está confirmada
        </p>
      </div>

      <div className="grid gap-4">
        {minhasEscalas?.map((escala) => {
          const evento = escala.escalas_eventos;
          const dataEvento = new Date(evento.data_evento);
          const isProximo = dataEvento.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // próximos 7 dias
          
          return (
            <Card key={escala.id} className={isProximo ? 'ring-2 ring-primary/20' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{evento.nome_evento}</h4>
                      {isProximo && (
                        <Badge variant="default" className="text-xs">
                          Próximo
                        </Badge>
                      )}
                      <Badge variant={getStatusColor(evento.status)}>
                        {evento.status}
                      </Badge>
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
                    
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: escala.louvor_cargos.cor }}
                      />
                      <span className="font-medium text-sm">{escala.louvor_cargos.nome_cargo}</span>
                    </div>
                    
                    {escala.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {escala.observacoes}
                      </p>
                    )}
                  </div>
                  
                  <Link to={`/portal/evento-louvor/${evento.id}`}>
                    <Button variant="outline" size="sm">
                      <Music className="h-4 w-4 mr-2" />
                      Ver Detalhes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {!minhasEscalas?.length && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma escala confirmada</h3>
              <p className="text-muted-foreground">
                Você não possui escalas confirmadas no momento. Verifique seus convites pendentes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};