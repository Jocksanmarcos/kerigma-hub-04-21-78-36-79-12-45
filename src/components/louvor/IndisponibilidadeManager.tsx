import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Indisponibilidade {
  id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  ativo: boolean;
}

interface NovaIndisponibilidade {
  data_inicio: string;
  data_fim: string;
  motivo: string;
}

export const IndisponibilidadeManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NovaIndisponibilidade>({
    data_inicio: '',
    data_fim: '',
    motivo: ''
  });
  
  const queryClient = useQueryClient();

  const { data: indisponibilidades, isLoading } = useQuery({
    queryKey: ['indisponibilidades'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!pessoa) throw new Error('Pessoa não encontrada');

      const { data, error } = await supabase
        .from('membros_indisponibilidade')
        .select('*')
        .eq('membro_id', pessoa.id)
        .eq('ativo', true)
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      return data as Indisponibilidade[];
    }
  });

  const salvarIndisponibilidade = useMutation({
    mutationFn: async (data: NovaIndisponibilidade) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!pessoa) throw new Error('Pessoa não encontrada');

      if (editingId) {
        // Atualizar
        const { error } = await supabase
          .from('membros_indisponibilidade')
          .update(data)
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        // Criar novo
        const { error } = await supabase
          .from('membros_indisponibilidade')
          .insert({
            ...data,
            membro_id: pessoa.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indisponibilidades'] });
      toast.success(editingId ? 'Indisponibilidade atualizada!' : 'Indisponibilidade cadastrada!');
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao salvar indisponibilidade:', error);
      toast.error('Erro ao salvar indisponibilidade. Tente novamente.');
    }
  });

  const removerIndisponibilidade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('membros_indisponibilidade')
        .update({ ativo: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indisponibilidades'] });
      toast.success('Indisponibilidade removida!');
    },
    onError: (error) => {
      console.error('Erro ao remover indisponibilidade:', error);
      toast.error('Erro ao remover indisponibilidade. Tente novamente.');
    }
  });

  const resetForm = () => {
    setFormData({ data_inicio: '', data_fim: '', motivo: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (indisponibilidade: Indisponibilidade) => {
    setFormData({
      data_inicio: indisponibilidade.data_inicio,
      data_fim: indisponibilidade.data_fim,
      motivo: indisponibilidade.motivo
    });
    setEditingId(indisponibilidade.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
      toast.error('A data de fim deve ser posterior à data de início.');
      return;
    }
    
    salvarIndisponibilidade.mutate(formData);
  };

  const isPeriodoAtivo = (dataInicio: string, dataFim: string) => {
    const agora = new Date();
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return agora >= inicio && agora <= fim;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Disponibilidade</h3>
          <p className="text-sm text-muted-foreground">
            Informe períodos em que não estará disponível para escalas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Indisponibilidade
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Editar Indisponibilidade' : 'Nova Indisponibilidade'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <Textarea
                  id="motivo"
                  placeholder="Ex: Viagem, compromisso familiar, etc."
                  value={formData.motivo}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={salvarIndisponibilidade.isPending}>
                  {editingId ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {indisponibilidades?.map((indisponibilidade) => {
          const isAtivo = isPeriodoAtivo(indisponibilidade.data_inicio, indisponibilidade.data_fim);
          
          return (
            <Card key={indisponibilidade.id} className={isAtivo ? 'ring-2 ring-orange-500/20' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {format(new Date(indisponibilidade.data_inicio), 'PPP', { locale: ptBR })}
                        {' até '}
                        {format(new Date(indisponibilidade.data_fim), 'PPP', { locale: ptBR })}
                      </span>
                      {isAtivo && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                          Ativo agora
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {indisponibilidade.motivo}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(indisponibilidade)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removerIndisponibilidade.mutate(indisponibilidade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {!indisponibilidades?.length && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma indisponibilidade cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Você está disponível para todas as escalas. Cadastre períodos de indisponibilidade quando necessário.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Indisponibilidade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};