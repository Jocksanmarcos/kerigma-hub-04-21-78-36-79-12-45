import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, User, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Reserva {
  id: string;
  patrimonio_id: string;
  solicitante_id: string;
  inicio: string;
  fim: string;
  motivo?: string;
  status: string;
  aprovado_por?: string;
  observacoes?: string;
  created_at: string;
  patrimonios: {
    nome: string;
    codigo_patrimonio: string;
  };
  pessoas?: {
    nome_completo: string;
  };
}

interface Patrimonio {
  id: string;
  nome: string;
  codigo_patrimonio: string;
  status: string;
}

export const PatrimonioReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patrimonio_id: '',
    inicio: '',
    fim: '',
    motivo: '',
    observacoes: ''
  });

  useEffect(() => {
    loadReservas();
    loadPatrimonios();
  }, []);

  const loadReservas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patrimonio_reservas')
        .select(`
          *,
          patrimonios!inner(nome, codigo_patrimonio),
          pessoas!inner(nome_completo)
        `)
        .order('inicio', { ascending: false });

      if (error) throw error;
      setReservas((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as reservas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatrimonios = async () => {
    try {
      const { data, error } = await supabase
        .from('patrimonios')
        .select('id, nome, codigo_patrimonio, status')
        .eq('status', 'Disponível')
        .order('nome');

      if (error) throw error;
      setPatrimonios(data || []);
    } catch (error) {
      console.error('Erro ao carregar patrimônios:', error);
    }
  };

  const getCurrentPersonId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data?.id;
    } catch (error) {
      console.error('Erro ao obter ID da pessoa:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const personId = await getCurrentPersonId();
      if (!personId) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar conflitos de horário
      const { data: conflitos, error: conflitosError } = await supabase
        .from('patrimonio_reservas')
        .select('id')
        .eq('patrimonio_id', formData.patrimonio_id)
        .neq('status', 'cancelado')
        .or(`and(inicio.lte.${formData.fim},fim.gte.${formData.inicio})`);

      if (conflitosError) throw conflitosError;

      if (conflitos && conflitos.length > 0) {
        toast({
          title: 'Conflito de Horário',
          description: 'Já existe uma reserva para este patrimônio no período selecionado.',
          variant: 'destructive'
        });
        return;
      }

      const reservaData = {
        ...formData,
        solicitante_id: personId,
        status: 'pendente'
      };

      const { error } = await supabase
        .from('patrimonio_reservas')
        .insert([reservaData]);

      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Reserva solicitada com sucesso!' });
      setShowForm(false);
      resetForm();
      loadReservas();
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a reserva.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patrimonio_id: '',
      inicio: '',
      fim: '',
      motivo: '',
      observacoes: ''
    });
  };

  const handleApprove = async (reservaId: string) => {
    try {
      const personId = await getCurrentPersonId();
      if (!personId) {
        throw new Error('Usuário não encontrado');
      }

      const { error } = await supabase
        .from('patrimonio_reservas')
        .update({ 
          status: 'aprovado',
          aprovado_por: personId
        })
        .eq('id', reservaId);

      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Reserva aprovada com sucesso!' });
      loadReservas();
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a reserva.',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (reservaId: string) => {
    try {
      const { error } = await supabase
        .from('patrimonio_reservas')
        .update({ status: 'cancelado' })
        .eq('id', reservaId);

      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Reserva cancelada com sucesso!' });
      loadReservas();
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a reserva.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'concluido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aprovado': return 'Aprovado';
      case 'cancelado': return 'Cancelado';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  const filteredReservas = reservas.filter(reserva => {
    return selectedStatus === 'all' || reserva.status === selectedStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Reservas de Patrimônio</h2>
          <p className="text-muted-foreground">Gerencie reservas e empréstimos de equipamentos</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Reserva</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patrimonio">Patrimônio*</Label>
                <Select value={formData.patrimonio_id} onValueChange={(value) => setFormData({ ...formData, patrimonio_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um patrimônio" />
                  </SelectTrigger>
                  <SelectContent>
                    {patrimonios.map((patrimonio) => (
                      <SelectItem key={patrimonio.id} value={patrimonio.id}>
                        {patrimonio.nome} ({patrimonio.codigo_patrimonio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inicio">Data/Hora Início*</Label>
                  <Input
                    id="inicio"
                    type="datetime-local"
                    value={formData.inicio}
                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fim">Data/Hora Fim*</Label>
                  <Input
                    id="fim"
                    type="datetime-local"
                    value={formData.fim}
                    onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo*</Label>
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ex: Culto especial, evento, manutenção"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Solicitar Reserva'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Carregando reservas...</p>
          </div>
        ) : filteredReservas.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              {reservas.length === 0 ? 'Nenhuma reserva cadastrada' : 'Nenhuma reserva encontrada com o filtro aplicado'}
            </p>
          </div>
        ) : (
          filteredReservas.map((reserva) => (
            <Card key={reserva.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{reserva.patrimonios.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Código: {reserva.patrimonios.codigo_patrimonio}
                        </p>
                      </div>
                      <Badge className={getStatusColor(reserva.status)}>
                        {getStatusLabel(reserva.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Solicitante: {reserva.pessoas?.nome_completo || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(reserva.inicio).toLocaleString('pt-BR')} - {new Date(reserva.fim).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    {reserva.motivo && (
                      <p className="text-sm"><span className="font-medium">Motivo:</span> {reserva.motivo}</p>
                    )}
                    
                    {reserva.observacoes && (
                      <p className="text-sm"><span className="font-medium">Observações:</span> {reserva.observacoes}</p>
                    )}
                  </div>
                  
                  {reserva.status === 'pendente' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(reserva.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Aprovar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleReject(reserva.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};