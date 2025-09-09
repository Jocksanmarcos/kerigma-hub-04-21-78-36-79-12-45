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
import { Plus, Wrench, Calendar, DollarSign, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Manutencao {
  id: string;
  patrimonio_id: string;
  data_manutencao: string;
  tipo_manutencao: string;
  descricao: string;
  valor_gasto?: number;
  responsavel_id?: string;
  empresa_responsavel?: string;
  comprovante_url?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  patrimonios: {
    nome: string;
    codigo_patrimonio: string;
  };
}

interface Patrimonio {
  id: string;
  nome: string;
  codigo_patrimonio: string;
  status: string;
}

export const PatrimonioManutencoes: React.FC = () => {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingManutencao, setEditingManutencao] = useState<Manutencao | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTipo, setSelectedTipo] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patrimonio_id: '',
    data_manutencao: '',
    tipo_manutencao: 'preventiva',
    descricao: '',
    valor_gasto: '',
    empresa_responsavel: '',
    observacoes: ''
  });

  useEffect(() => {
    loadManutencoes();
    loadPatrimonios();
  }, []);

  const loadManutencoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manutencoes_patrimonio')
        .select(`
          *,
          patrimonios!inner(nome, codigo_patrimonio)
        `)
        .order('data_manutencao', { ascending: false });

      if (error) throw error;
      setManutencoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as manutenções.',
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
        .order('nome');

      if (error) throw error;
      setPatrimonios(data || []);
    } catch (error) {
      console.error('Erro ao carregar patrimônios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const manutencaoData = {
        ...formData,
        valor_gasto: formData.valor_gasto ? parseFloat(formData.valor_gasto) : null
      };

      if (editingManutencao) {
        const { error } = await supabase
          .from('manutencoes_patrimonio')
          .update(manutencaoData)
          .eq('id', editingManutencao.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Manutenção atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('manutencoes_patrimonio')
          .insert([manutencaoData]);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Manutenção cadastrada com sucesso!' });
      }

      setShowForm(false);
      setEditingManutencao(null);
      resetForm();
      loadManutencoes();
    } catch (error) {
      console.error('Erro ao salvar manutenção:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a manutenção.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patrimonio_id: '',
      data_manutencao: '',
      tipo_manutencao: 'preventiva',
      descricao: '',
      valor_gasto: '',
      empresa_responsavel: '',
      observacoes: ''
    });
  };

  const handleEdit = (manutencao: Manutencao) => {
    setEditingManutencao(manutencao);
    setFormData({
      patrimonio_id: manutencao.patrimonio_id,
      data_manutencao: manutencao.data_manutencao,
      tipo_manutencao: manutencao.tipo_manutencao,
      descricao: manutencao.descricao,
      valor_gasto: manutencao.valor_gasto?.toString() || '',
      empresa_responsavel: manutencao.empresa_responsavel || '',
      observacoes: manutencao.observacoes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta manutenção?')) return;

    try {
      const { error } = await supabase
        .from('manutencoes_patrimonio')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Manutenção excluída com sucesso!' });
      loadManutencoes();
    } catch (error) {
      console.error('Erro ao excluir manutenção:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a manutenção.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendada': return 'Agendada';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'preventiva': return 'bg-green-100 text-green-800';
      case 'corretiva': return 'bg-red-100 text-red-800';
      case 'preditiva': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'preventiva': return 'Preventiva';
      case 'corretiva': return 'Corretiva';
      case 'preditiva': return 'Preditiva';
      default: return tipo;
    }
  };

  const filteredManutencoes = manutencoes.filter(manutencao => {
    const matchesTipo = selectedTipo === 'all' || manutencao.tipo_manutencao === selectedTipo;
    return matchesTipo;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Manutenções de Patrimônio</h2>
          <p className="text-muted-foreground">Controle manutenções preventivas e corretivas</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingManutencao(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingManutencao ? 'Editar Manutenção' : 'Nova Manutenção'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="tipo_manutencao">Tipo*</Label>
                  <Select value={formData.tipo_manutencao} onValueChange={(value) => setFormData({ ...formData, tipo_manutencao: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                      <SelectItem value="preditiva">Preditiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data_manutencao">Data da Manutenção*</Label>
                  <Input
                    id="data_manutencao"
                    type="date"
                    value={formData.data_manutencao}
                    onChange={(e) => setFormData({ ...formData, data_manutencao: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor_gasto">Valor Gasto</Label>
                  <Input
                    id="valor_gasto"
                    type="number"
                    step="0.01"
                    value={formData.valor_gasto}
                    onChange={(e) => setFormData({ ...formData, valor_gasto: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="empresa_responsavel">Empresa Responsável</Label>
                  <Input
                    id="empresa_responsavel"
                    value={formData.empresa_responsavel}
                    onChange={(e) => setFormData({ ...formData, empresa_responsavel: e.target.value })}
                    placeholder="Nome da empresa ou responsável"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição*</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  required
                  placeholder="Descreva o que será realizado na manutenção"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  placeholder="Informações adicionais"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo-filter">Tipo</Label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preditiva">Preditiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de manutenções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <Wrench className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Carregando manutenções...</p>
          </div>
        ) : filteredManutencoes.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Wrench className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              {manutencoes.length === 0 ? 'Nenhuma manutenção cadastrada' : 'Nenhuma manutenção encontrada com os filtros aplicados'}
            </p>
          </div>
        ) : (
          filteredManutencoes.map((manutencao) => (
            <Card key={manutencao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{manutencao.patrimonios.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {manutencao.patrimonios.codigo_patrimonio}
                    </p>
                  </div>
                   <div className="flex flex-col gap-1">
                     <Badge className={getTipoColor(manutencao.tipo_manutencao)}>
                       {getTipoLabel(manutencao.tipo_manutencao)}
                     </Badge>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{manutencao.descricao}</p>
                
                 <div className="text-sm space-y-1">
                   <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                     <span>Data: {new Date(manutencao.data_manutencao).toLocaleDateString('pt-BR')}</span>
                   </div>
                   {manutencao.valor_gasto && (
                     <div className="flex items-center gap-2">
                       <DollarSign className="h-4 w-4 text-muted-foreground" />
                       <span>Valor: R$ {manutencao.valor_gasto.toFixed(2)}</span>
                     </div>
                   )}
                   {manutencao.empresa_responsavel && (
                     <div className="flex items-center gap-2">
                       <User className="h-4 w-4 text-muted-foreground" />
                       <span>Empresa: {manutencao.empresa_responsavel}</span>
                     </div>
                   )}
                 </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(manutencao)}>
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(manutencao.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};