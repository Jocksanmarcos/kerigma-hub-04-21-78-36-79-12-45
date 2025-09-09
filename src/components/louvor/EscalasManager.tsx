import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Users, Music, MapPin, Clock } from 'lucide-react';
import { useLouvorEscalas, EscalaEvento } from '@/hooks/useLouvorEscalas';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EscalasManager: React.FC = () => {
  const {
    eventos,
    membrosEscalados,
    loadingEventos,
    createEvento,
    getMembrosPorEvento
  } = useLouvorEscalas();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<EscalaEvento | null>(null);
  
  const [formEvento, setFormEvento] = useState({
    nome_evento: '',
    data_evento: '',
    local_evento: '',
    observacoes: ''
  });

  const resetForm = () => {
    setFormEvento({
      nome_evento: '',
      data_evento: '',
      local_evento: '',
      observacoes: ''
    });
    setEventoSelecionado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvento({
        ...formEvento,
        setlist: [], // Inicializar com setlist vazio
        status: 'planejado'
      });
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejado':
        return <Badge variant="outline">Planejado</Badge>;
      case 'confirmado':
        return <Badge>Confirmado</Badge>;
      case 'concluido':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (loadingEventos) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Carregando escalas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Escalas de Louvor</h2>
          <p className="text-muted-foreground">Gerencie os eventos e escalas da equipe</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Crie um novo evento para escalar a equipe de louvor
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_evento">Nome do Evento *</Label>
                <Input
                  id="nome_evento"
                  value={formEvento.nome_evento}
                  onChange={(e) => setFormEvento({ ...formEvento, nome_evento: e.target.value })}
                  placeholder="Ex: Culto de Domingo, Ensaio, Evento Especial"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_evento">Data e Hora *</Label>
                <Input
                  id="data_evento"
                  type="datetime-local"
                  value={formEvento.data_evento}
                  onChange={(e) => setFormEvento({ ...formEvento, data_evento: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="local_evento">Local</Label>
                <Input
                  id="local_evento"
                  value={formEvento.local_evento}
                  onChange={(e) => setFormEvento({ ...formEvento, local_evento: e.target.value })}
                  placeholder="Ex: Templo Principal, Auditório"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formEvento.observacoes}
                  onChange={(e) => setFormEvento({ ...formEvento, observacoes: e.target.value })}
                  placeholder="Informações adicionais sobre o evento"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Evento</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Eventos */}
      {eventos?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum evento criado</h3>
            <p className="text-muted-foreground">
              Comece criando um evento para escalar sua equipe
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {eventos?.map((evento) => {
            const membrosDoEvento = getMembrosPorEvento(evento.id);
            
            return (
              <Card key={evento.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {evento.nome_evento}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(evento.data_evento)}
                        </span>
                        {evento.local_evento && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {evento.local_evento}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(evento.status)}
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {membrosDoEvento.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {evento.observacoes && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {evento.observacoes}
                    </p>
                  )}
                  
                  {/* Preview dos membros escalados */}
                  {membrosDoEvento.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Equipe Escalada:</h4>
                      <div className="flex flex-wrap gap-2">
                        {membrosDoEvento.slice(0, 5).map((membro) => (
                          <div
                            key={membro.id}
                            className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm"
                            style={{ 
                              borderLeft: `3px solid ${membro.louvor_cargos?.cor || '#3b82f6'}` 
                            }}
                          >
                            <span className="font-medium">{membro.pessoas?.nome_completo}</span>
                            <Badge variant="outline" className="text-xs">
                              {membro.louvor_cargos?.nome_cargo}
                            </Badge>
                            <Badge 
                              variant={membro.status === 'confirmado' ? 'default' : 
                                      membro.status === 'recusado' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {membro.status}
                            </Badge>
                          </div>
                        ))}
                        {membrosDoEvento.length > 5 && (
                          <Badge variant="outline">
                            +{membrosDoEvento.length - 5} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Music className="h-4 w-4 mr-2" />
                      Setlist
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Escalar Equipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};