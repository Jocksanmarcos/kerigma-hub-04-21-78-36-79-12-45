import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, BookOpen, User, AlertCircle } from 'lucide-react';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { useToast } from '@/hooks/use-toast';

interface AgendaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AgendaItem {
  id: string;
  tipo: 'curso' | 'agendamento' | 'evento' | 'tarefa';
  titulo: string;
  data: string;
  horario?: string;
  status: string;
  prioridade?: 'alta' | 'media' | 'baixa';
  detalhes?: string;
}

export const AgendaModal: React.FC<AgendaModalProps> = ({ open, onOpenChange }) => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    titulo: '',
    tipo: 'tarefa' as AgendaItem['tipo'],
    data: '',
    horario: '',
    prioridade: 'media' as AgendaItem['prioridade'],
    detalhes: ''
  });
  const { pessoa } = useCurrentPerson();
  const { toast } = useToast();

  useEffect(() => {
    if (open && pessoa) {
      loadAgendaItems();
    }
  }, [open, pessoa]);

  const loadAgendaItems = async () => {
    if (!pessoa) return;

    try {
      setLoading(true);
      const today = new Date();
      
      // Dados simulados para demonstração
      const items: AgendaItem[] = [
        {
          id: '1',
          tipo: 'curso',
          titulo: 'Continuar: Fundamentos da Fé',
          data: today.toISOString().split('T')[0],
          status: 'pendente',
          detalhes: 'Lição 3: O Amor de Deus',
          prioridade: 'media'
        },
        {
          id: '2',
          tipo: 'agendamento',
          titulo: 'Aconselhamento Pastoral',
          data: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          horario: '14:00',
          status: 'agendado',
          detalhes: 'Conversa sobre crescimento espiritual',
          prioridade: 'alta'
        },
        {
          id: '3',
          tipo: 'evento',
          titulo: 'Culto de Oração',
          data: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          horario: '19:30',
          status: 'confirmado',
          detalhes: 'Templo Central',
          prioridade: 'media'
        }
      ];

      setAgendaItems(items);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAgendaItem = () => {
    if (!newItem.titulo || !newItem.data) {
      toast({
        title: "Erro",
        description: "Título e data são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const item: AgendaItem = {
      id: Date.now().toString(),
      ...newItem,
      status: 'pendente'
    };

    setAgendaItems(prev => [...prev, item].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    ));

    setNewItem({
      titulo: '',
      tipo: 'tarefa',
      data: '',
      horario: '',
      prioridade: 'media',
      detalhes: ''
    });

    setShowAddForm(false);

    toast({
      title: "Sucesso!",
      description: "Item adicionado à agenda.",
    });
  };

  const getItemIcon = (tipo: string) => {
    switch (tipo) {
      case 'curso': return BookOpen;
      case 'agendamento': return User;
      case 'evento': return Calendar;
      case 'tarefa': return AlertCircle;
      default: return Clock;
    }
  };

  const getItemColor = (tipo: string, prioridade?: string) => {
    if (prioridade === 'alta') return 'bg-error/10 text-error border-error/20';
    
    switch (tipo) {
      case 'curso': return 'bg-primary/10 text-primary border-primary/20';
      case 'agendamento': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'evento': return 'bg-success/10 text-success border-success/20';
      case 'tarefa': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string }> = {
      'agendado': { variant: 'default', text: 'Agendado' },
      'concluido': { variant: 'secondary', text: 'Concluído' },
      'cancelado': { variant: 'destructive', text: 'Cancelado' },
      'pendente': { variant: 'outline', text: 'Pendente' },
      'confirmado': { variant: 'default', text: 'Confirmado' }
    };

    const config = variants[status] || { variant: 'outline' as const, text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Minha Agenda
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {showAddForm && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={newItem.titulo}
                  onChange={(e) => setNewItem(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título do item"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={newItem.tipo} onValueChange={(value) => setNewItem(prev => ({ ...prev, tipo: value as AgendaItem['tipo'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curso">Curso</SelectItem>
                    <SelectItem value="agendamento">Agendamento</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="tarefa">Tarefa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={newItem.data}
                  onChange={(e) => setNewItem(prev => ({ ...prev, data: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  type="time"
                  value={newItem.horario}
                  onChange={(e) => setNewItem(prev => ({ ...prev, horario: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={newItem.prioridade} onValueChange={(value) => setNewItem(prev => ({ ...prev, prioridade: value as AgendaItem['prioridade'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="detalhes">Detalhes</Label>
              <Textarea
                id="detalhes"
                value={newItem.detalhes}
                onChange={(e) => setNewItem(prev => ({ ...prev, detalhes: e.target.value }))}
                placeholder="Detalhes adicionais (opcional)"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addAgendaItem}>Adicionar</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}
        
        <ScrollArea className="h-96">
          <div className="space-y-3 pr-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))
            ) : agendaItems.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum item na agenda</p>
              </div>
            ) : (
              agendaItems.map((item) => {
                const Icon = getItemIcon(item.tipo);
                return (
                  <div 
                    key={item.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${getItemColor(item.tipo, item.prioridade)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold">{item.titulo}</h5>
                            {item.horario && (
                              <Badge variant="outline" className="text-xs">
                                {item.horario}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {getDateLabel(item.data)}
                          </p>
                          {item.detalhes && (
                            <p className="text-sm opacity-80">{item.detalhes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(item.status)}
                        {item.prioridade === 'alta' && (
                          <Badge variant="destructive" className="text-xs">
                            Urgente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};