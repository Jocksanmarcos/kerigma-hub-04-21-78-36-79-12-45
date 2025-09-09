import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, MapPin } from 'lucide-react';
import { useLouvorEscalas } from '@/hooks/useLouvorEscalas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ConvocacaoEquipe } from './ConvocacaoEquipe';

export function EscalasLouvorManager() {
  const {
    eventos,
    loadingEventos,
    createEvento,
    updateEvento,
    creatingEvento,
  } = useLouvorEscalas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome_evento: '',
    data_evento: '',
    local_evento: '',
    observacoes: '',
    status: 'planejado' as 'planejado' | 'confirmado' | 'concluido' | 'cancelado',
    setlist: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      nome_evento: '',
      data_evento: '',
      local_evento: '',
      observacoes: '',
      status: 'planejado',
      setlist: [],
    });
    setEditingEvento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvento) {
        await updateEvento({ id: editingEvento.id, ...formData });
      } else {
        await createEvento(formData);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleEdit = (evento: any) => {
    setEditingEvento(evento);
    setFormData({
      nome_evento: evento.nome_evento,
      data_evento: evento.data_evento,
      local_evento: evento.local_evento || '',
      observacoes: evento.observacoes || '',
      status: evento.status,
      setlist: evento.setlist || [],
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'default';
      case 'concluido': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planejado': return 'Planejado';
      case 'confirmado': return 'Confirmado';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Escalas de Louvor</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvento ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
              <DialogDescription>
                {editingEvento ? 'Edite as informações do evento.' : 'Crie um novo evento de louvor.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome_evento">Nome do Evento *</Label>
                <Input
                  id="nome_evento"
                  value={formData.nome_evento}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_evento: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="data_evento">Data do Evento *</Label>
                <Input
                  id="data_evento"
                  type="datetime-local"
                  value={formData.data_evento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_evento: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="local_evento">Local</Label>
                <Input
                  id="local_evento"
                  value={formData.local_evento}
                  onChange={(e) => setFormData(prev => ({ ...prev, local_evento: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={creatingEvento}>
                  {editingEvento ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loadingEventos ? (
        <div className="text-center py-8">Carregando eventos...</div>
      ) : (
        <div className="grid gap-4">
          {eventos?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum evento encontrado</p>
              </CardContent>
            </Card>
          ) : (
            eventos?.map((evento) => (
              <div key={evento.id} className="space-y-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6" onClick={() => handleEdit(evento)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{evento.nome_evento}</h3>
                          <Badge variant={getStatusColor(evento.status)}>
                            {getStatusLabel(evento.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(evento.data_evento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                          
                          {evento.local_evento && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {evento.local_evento}
                            </div>
                          )}
                        </div>
                        
                        {evento.observacoes && (
                          <p className="text-sm text-muted-foreground">{evento.observacoes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <ConvocacaoEquipe 
                  eventoId={evento.id} 
                  nomeEvento={evento.nome_evento} 
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}