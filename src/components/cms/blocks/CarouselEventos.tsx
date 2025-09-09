import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventoAPI {
  titulo: string;
  data_hora_inicio: string;
  imagem_url: string | null;
  link_inscricao: string;
}

const CarouselEventos: React.FC<{ content?: any }> = ({ content }) => {
  const [events, setEvents] = useState<EventoAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const { data, error } = await supabase.functions.invoke('api-events');
      
      if (error) {
        console.error("Erro ao carregar eventos:", error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum evento público encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Próximos Eventos</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evento, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-acolhimento-lg transition-all duration-500 hover:transform hover:scale-105 border-none shadow-acolhimento-md">
            {evento.imagem_url && (
              <div className="h-40 overflow-hidden">
                <img 
                  src={evento.imagem_url} 
                  alt={`Evento ${evento.titulo}`} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-2 text-foreground">{evento.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(evento.data_hora_inicio).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs bg-surface-primary text-primary border-0">
                Evento Público
              </Badge>
              {evento.link_inscricao && (
                <a 
                  href={evento.link_inscricao} 
                  className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Inscrever-se
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CarouselEventos;