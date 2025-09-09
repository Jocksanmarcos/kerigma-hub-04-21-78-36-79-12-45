import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Copy, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface OrderItem {
  id: string;
  titulo_item: string;
  tipo_item: string;
  duracao_estimada_min: number;
  responsavel_id?: string;
  detalhes?: string;
  observacoes?: string;
  ordem: number;
}

interface ServicePlan {
  id: string;
  tema_culto: string;
  dirigente_id?: string;
  pregador_id?: string;
  descricao?: string;
  status: string;
  agendamento_id?: string;
}

const ServicePlannerView: React.FC = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const itemTypes = [
    'Boas-vindas',
    'Oração',
    'Louvor',
    'Oferta',
    'Palavra',
    'Convite',
    'Oração Final',
    'Bênção'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar planos de culto
      const { data: plansData, error: plansError } = await supabase
        .from('culto_planos')
        .select('*')
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Carregar pessoas
      const { data: pessoasData, error: pessoasError } = await supabase
        .from('pessoas')
        .select('id, nome_completo')
        .eq('situacao', 'ativo');

      if (pessoasError) throw pessoasError;
      setPessoas(pessoasData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('culto_ordem_itens')
        .select('*')
        .eq('plano_id', planId)
        .order('ordem');

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: "Erro ao carregar itens da ordem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePlanSelect = (plan: ServicePlan) => {
    setSelectedPlan(plan);
    loadOrderItems(plan.id);
  };

  const createNewPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('culto_planos')
        .insert({
          tema_culto: 'Novo Plano de Culto',
          status: 'rascunho'
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadData();
      setSelectedPlan(data);
      setOrderItems([]);
      
      toast({
        title: "Plano criado",
        description: "Novo plano de culto criado com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao criar plano:', error);
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: `temp-${Date.now()}`,
      titulo_item: 'Novo Item',
      tipo_item: 'geral',
      duracao_estimada_min: 5,
      ordem: orderItems.length + 1,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    const updated = orderItems.filter((_, i) => i !== index);
    setOrderItems(updated);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar ordem
    const updatedItems = items.map((item, index) => ({
      ...item,
      ordem: index + 1
    }));

    setOrderItems(updatedItems);
  };

  const savePlan = async () => {
    if (!selectedPlan) return;

    try {
      // Salvar plano
      const { error: planError } = await supabase
        .from('culto_planos')
        .update({
          tema_culto: selectedPlan.tema_culto,
          dirigente_id: selectedPlan.dirigente_id,
          pregador_id: selectedPlan.pregador_id,
          descricao: selectedPlan.descricao,
          status: selectedPlan.status
        })
        .eq('id', selectedPlan.id);

      if (planError) throw planError;

      // Deletar itens existentes
      const { error: deleteError } = await supabase
        .from('culto_ordem_itens')
        .delete()
        .eq('plano_id', selectedPlan.id);

      if (deleteError) throw deleteError;

      // Inserir novos itens
      if (orderItems.length > 0) {
        const itemsToInsert = orderItems.map(item => ({
          plano_id: selectedPlan.id,
          titulo_item: item.titulo_item,
          tipo_item: item.tipo_item,
          duracao_estimada_min: item.duracao_estimada_min,
          responsavel_id: item.responsavel_id,
          detalhes: item.detalhes,
          observacoes: item.observacoes,
          ordem: item.ordem
        }));

        const { error: insertError } = await supabase
          .from('culto_ordem_itens')
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Plano salvo",
        description: "Plano de culto salvo com sucesso",
      });

      await loadData();
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro ao salvar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Planejador de Cultos
            <Button onClick={createNewPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Planos */}
            <div className="space-y-4">
              <h3 className="font-semibold">Planos de Culto</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {plans.map(plan => (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{plan.tema_culto}</div>
                      <div className="text-sm text-muted-foreground">
                        Status: {plan.status}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Editor do Plano */}
            {selectedPlan && (
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tema do Culto</label>
                    <Input
                      value={selectedPlan.tema_culto}
                      onChange={(e) => setSelectedPlan({
                        ...selectedPlan,
                        tema_culto: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select
                      value={selectedPlan.status}
                      onValueChange={(value) => setSelectedPlan({
                        ...selectedPlan,
                        status: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dirigente</label>
                    <Select
                      value={selectedPlan.dirigente_id || ''}
                      onValueChange={(value) => setSelectedPlan({
                        ...selectedPlan,
                        dirigente_id: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar dirigente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pessoas.map(pessoa => (
                          <SelectItem key={pessoa.id} value={pessoa.id}>
                            {pessoa.nome_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pregador</label>
                    <Select
                      value={selectedPlan.pregador_id || ''}
                      onValueChange={(value) => setSelectedPlan({
                        ...selectedPlan,
                        pregador_id: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar pregador" />
                      </SelectTrigger>
                      <SelectContent>
                        {pessoas.map(pessoa => (
                          <SelectItem key={pessoa.id} value={pessoa.id}>
                            {pessoa.nome_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição</label>
                  <Textarea
                    value={selectedPlan.descricao || ''}
                    onChange={(e) => setSelectedPlan({
                      ...selectedPlan,
                      descricao: e.target.value
                    })}
                    placeholder="Descrição do culto..."
                  />
                </div>

                {/* Ordem do Culto */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Ordem do Culto</h3>
                    <Button onClick={addOrderItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="order-items">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {orderItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="p-4"
                                >
                                  <div className="flex items-start gap-3">
                                    <div {...provided.dragHandleProps} className="mt-2">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                                      <Input
                                        value={item.titulo_item}
                                        onChange={(e) => updateOrderItem(index, 'titulo_item', e.target.value)}
                                        placeholder="Título do item"
                                      />
                                      
                                      <Select
                                        value={item.tipo_item}
                                        onValueChange={(value) => updateOrderItem(index, 'tipo_item', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {itemTypes.map(type => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      
                                      <Input
                                        type="number"
                                        value={item.duracao_estimada_min}
                                        onChange={(e) => updateOrderItem(index, 'duracao_estimada_min', parseInt(e.target.value))}
                                        placeholder="Duração (min)"
                                      />
                                      
                                      <Select
                                        value={item.responsavel_id || ''}
                                        onValueChange={(value) => updateOrderItem(index, 'responsavel_id', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Responsável" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {pessoas.map(pessoa => (
                                            <SelectItem key={pessoa.id} value={pessoa.id}>
                                              {pessoa.nome_completo}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeOrderItem(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  {(item.detalhes || item.observacoes) && (
                                    <div className="mt-3 ml-7 grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Textarea
                                        value={item.detalhes || ''}
                                        onChange={(e) => updateOrderItem(index, 'detalhes', e.target.value)}
                                        placeholder="Detalhes..."
                                        rows={2}
                                      />
                                      <Textarea
                                        value={item.observacoes || ''}
                                        onChange={(e) => updateOrderItem(index, 'observacoes', e.target.value)}
                                        placeholder="Observações..."
                                        rows={2}
                                      />
                                    </div>
                                  )}
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar Plano
                  </Button>
                  <Button onClick={savePlan}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Plano
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicePlannerView;