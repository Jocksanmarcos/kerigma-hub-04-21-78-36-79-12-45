import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Music, 
  Users, 
  Play, 
  ExternalLink, 
  Download,
  ChevronLeft,
  Guitar,
  Mic
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SetlistViewer } from '@/components/louvor/SetlistViewer';
import { EquipeEvento } from '@/components/louvor/EquipeEvento';

interface EventoLouvor {
  id: string;
  nome_evento: string;
  data_evento: string;
  local_evento: string;
  setlist: any[];
  observacoes: string;
  status: string;
}

export default function EventoLouvorPage() {
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    document.title = 'Evento de Louvor | Portal do Louvor';
  }, []);

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento-louvor', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do evento não fornecido');
      
      const { data, error } = await supabase
        .from('escalas_eventos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as EventoLouvor;
    },
    enabled: !!id
  });

  const { data: minhaEscala } = useQuery({
    queryKey: ['minha-escala-evento', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!pessoa) return null;

      const { data, error } = await supabase
        .from('escalas_membros')
        .select(`
          *,
          louvor_cargos(nome_cargo, cor)
        `)
        .eq('evento_id', id)
        .eq('membro_id', pessoa.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!evento) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Evento não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O evento que você está procurando não existe ou foi removido.
          </p>
          <Link to="/portal/minhas-escalas">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar para Minhas Escalas
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const dataEvento = new Date(evento.data_evento);
  const isEventoFuturo = dataEvento > new Date();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/portal/minhas-escalas">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {evento.nome_evento}
              </h1>
              <Badge variant={evento.status === 'confirmado' ? 'default' : 'secondary'}>
                {evento.status}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {dataEvento.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {dataEvento.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {evento.local_evento && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {evento.local_evento}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Minha Participação */}
        {minhaEscala && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Minha Participação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: minhaEscala.louvor_cargos?.cor || '#3b82f6' }}
                />
                <span className="font-medium">{minhaEscala.louvor_cargos?.nome_cargo}</span>
                <Badge variant={
                  minhaEscala.status === 'confirmado' ? 'default' : 
                  minhaEscala.status === 'recusado' ? 'destructive' : 'secondary'
                }>
                  {minhaEscala.status}
                </Badge>
              </div>
              {minhaEscala.observacoes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {minhaEscala.observacoes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Setlist */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Repertório do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SetlistViewer setlist={evento.setlist} />
            </CardContent>
          </Card>

          {/* Equipe Escalada */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipe Escalada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EquipeEvento eventoId={evento.id} />
            </CardContent>
          </Card>
        </div>

        {/* Observações */}
        {evento.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações do Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {evento.observacoes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        {isEventoFuturo && (
          <Card>
            <CardHeader>
              <CardTitle>Recursos e Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Setlist
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Sala de Ensaio Virtual
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Playlist Spotify
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}