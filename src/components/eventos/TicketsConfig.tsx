import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Ticket, DollarSign } from 'lucide-react';

interface TicketConfig {
  id?: string;
  nome: string;
  preco: number;
  quantidade_total: number;
  ativo: boolean;
}

interface TicketsConfigProps {
  tickets: TicketConfig[];
  onChange: (tickets: TicketConfig[]) => void;
}

export const TicketsConfig: React.FC<TicketsConfigProps> = ({ tickets, onChange }) => {
  const [newTicket, setNewTicket] = useState<Omit<TicketConfig, 'id'>>({
    nome: '',
    preco: 0,
    quantidade_total: 0,
    ativo: true
  });

  const addTicket = () => {
    if (!newTicket.nome || newTicket.preco <= 0 || newTicket.quantidade_total <= 0) return;

    const ticket: TicketConfig = {
      ...newTicket,
      id: Date.now().toString()
    };

    onChange([...tickets, ticket]);
    setNewTicket({
      nome: '',
      preco: 0,
      quantidade_total: 0,
      ativo: true
    });
  };

  const removeTicket = (index: number) => {
    onChange(tickets.filter((_, i) => i !== index));
  };

  const updateTicket = (index: number, updates: Partial<TicketConfig>) => {
    const newTickets = [...tickets];
    newTickets[index] = { ...newTickets[index], ...updates };
    onChange(newTickets);
  };

  return (
    <div className="space-y-6">
      {/* Tickets existentes */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          <Label>Tipos de Tickets Configurados</Label>
          {tickets.map((ticket, index) => (
            <Card key={ticket.id || index} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Nome do Ticket</Label>
                    <Input
                      value={ticket.nome}
                      onChange={(e) => updateTicket(index, { nome: e.target.value })}
                      placeholder="Ex: Ingresso Geral"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ticket.preco}
                      onChange={(e) => updateTicket(index, { preco: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Quantidade Disponível</Label>
                    <Input
                      type="number"
                      min="1"
                      value={ticket.quantidade_total}
                      onChange={(e) => updateTicket(index, { quantidade_total: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={ticket.ativo ? "default" : "secondary"}>
                    {ticket.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicket(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-kerigma">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Valor Total (se todos vendidos):</span>
                  <span className="font-semibold">
                    R$ {(ticket.preco * ticket.quantidade_total).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {/* Resumo total */}
          <Card className="bg-surface-blue">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Receita Potencial Total:</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  R$ {tickets.reduce((total, ticket) => total + (ticket.preco * ticket.quantidade_total), 0).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total de {tickets.reduce((total, ticket) => total + ticket.quantidade_total, 0)} ingressos disponíveis
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adicionar novo ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Adicionar Tipo de Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nome do Ticket</Label>
              <Input
                value={newTicket.nome}
                onChange={(e) => setNewTicket(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Ingresso Geral, VIP, Estudante..."
              />
            </div>

            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newTicket.preco || ''}
                onChange={(e) => setNewTicket(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade Total</Label>
              <Input
                type="number"
                min="1"
                value={newTicket.quantidade_total || ''}
                onChange={(e) => setNewTicket(prev => ({ ...prev, quantidade_total: parseInt(e.target.value) || 0 }))}
                placeholder="Quantidade disponível"
              />
            </div>
          </div>

          {newTicket.preco > 0 && newTicket.quantidade_total > 0 && (
            <div className="p-3 bg-muted/30 rounded-kerigma">
              <p className="text-sm text-muted-foreground">
                Receita potencial: <span className="font-semibold">R$ {(newTicket.preco * newTicket.quantidade_total).toFixed(2)}</span>
              </p>
            </div>
          )}

          <Button 
            onClick={addTicket} 
            disabled={!newTicket.nome || newTicket.preco <= 0 || newTicket.quantidade_total <= 0}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Tipo de Ticket
          </Button>
        </CardContent>
      </Card>

      {tickets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Ticket className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Nenhum tipo de ticket configurado</p>
          <p className="text-sm">Adicione os tipos de ingressos disponíveis para este evento</p>
        </div>
      )}
    </div>
  );
};