import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Calendar, MapPin, Users, Edit, Trash2, Eye, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventoForm } from './EventoForm';
import { EventoDetails } from './EventoDetails';
import { EventoInscricoes } from './EventoInscricoes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  endereco: string;
  capacidade: number;
  publico: boolean;
  inscricoes_abertas: boolean;
  tipo: string;
  cover_image_url: string;
  is_paid_event: boolean;
  created_at: string;
  _count?: {
    inscricoes: number;
  };
}

export const EventosList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showInscricoes, setShowInscricoes] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          evento_inscricoes!inner(count)
        `)
        .order('data_inicio', { ascending: false });

      if (error) throw error;

      // Count inscricoes for each evento
      const eventosWithCounts = await Promise.all(
        data.map(async (evento) => {
          const { count } = await supabase
            .from('evento_inscricoes')
            .select('*', { count: 'exact', head: true })
            .eq('evento_id', evento.id);

          return {
            ...evento,
            _count: { inscricoes: count || 0 }
          };
        })
      );

      return eventosWithCounts;
    }
  });

  const deleteEventoMutation = useMutation({
    mutationFn: async (eventoId: string) => {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', eventoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({ title: 'Evento deletado com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao deletar evento', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const filteredEventos = eventos?.filter(evento =>
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (evento: Evento) => {
    const now = new Date();
    const dataInicio = new Date(evento.data_inicio);
    const dataFim = evento.data_fim ? new Date(evento.data_fim) : dataInicio;

    if (dataFim < now) {
      return <Badge variant="secondary">Finalizado</Badge>;
    } else if (dataInicio <= now && now <= dataFim) {
      return <Badge className="bg-green-500 hover:bg-green-600">Em Andamento</Badge>;
    } else {
      return <Badge variant="default">Programado</Badge>;
    }
  };

  const handleEdit = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowForm(true);
  };

  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowDetails(true);
  };

  const handleViewInscricoes = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowInscricoes(true);
  };

  const handleDelete = (evento: Evento) => {
    if (confirm(`Tem certeza que deseja deletar o evento "${evento.titulo}"?`)) {
      deleteEventoMutation.mutate(evento.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Central de Eventos</h2>
          <p className="text-muted-foreground">Gerencie eventos e inscrições da igreja</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button 
              variant="premium" 
              size="lg"
              onClick={() => setSelectedEvento(null)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEvento ? 'Editar Evento' : 'Criar Novo Evento'}
              </DialogTitle>
            </DialogHeader>
            <EventoForm 
              evento={selectedEvento} 
              onSuccess={() => {
                setShowForm(false);
                setSelectedEvento(null);
                queryClient.invalidateQueries({ queryKey: ['eventos'] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEventos.map((evento) => (
          <Card key={evento.id} className="hover:shadow-kerigma-md transition-all duration-300">
            <div className="relative">
              {evento.cover_image_url && (
                <div className="aspect-video rounded-t-kerigma overflow-hidden">
                  <img 
                    src={evento.cover_image_url} 
                    alt={evento.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute top-4 right-4">
                {getStatusBadge(evento)}
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {evento.titulo}
                </CardTitle>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {evento.tipo}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(evento.data_inicio), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{evento.local}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {evento._count?.inscricoes || 0}
                    {evento.capacidade && ` / ${evento.capacidade}`} inscritos
                  </span>
                </div>
              </div>

              {evento.is_paid_event && (
                <Badge variant="secondary" className="w-fit">
                  Evento Pago
                </Badge>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(evento)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewInscricoes(evento)}
                  className="flex-1"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Inscrições
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(evento)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(evento)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEventos.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro evento'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Evento
            </Button>
          )}
        </Card>
      )}

      {/* Modals */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
          </DialogHeader>
          {selectedEvento && (
            <EventoDetails 
              evento={selectedEvento} 
              onEdit={() => {
                setShowDetails(false);
                setShowForm(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showInscricoes} onOpenChange={setShowInscricoes}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inscrições - {selectedEvento?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedEvento && (
            <EventoInscricoes eventoId={selectedEvento.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};