import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Plus, Edit2, Trash2, Palette } from 'lucide-react';

interface Calendar {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  tipo: 'pessoal' | 'ministerio' | 'publico';
  visivel_para_todos: boolean;
}

const CALENDAR_COLORS = [
  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d',
  '#16a34a', '#059669', '#0891b2', '#0284c7', '#2563eb',
  '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777'
];

const CALENDAR_TYPES = [
  { value: 'pessoal', label: 'Pessoal', description: 'Calendário privado' },
  { value: 'ministerio', label: 'Ministério', description: 'Para atividades ministeriais' },
  { value: 'publico', label: 'Público', description: 'Visível para todos' }
];

export const CalendarManager: React.FC = () => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6',
    tipo: 'pessoal' as 'pessoal' | 'ministerio' | 'publico',
    visivel_para_todos: false
  });

  useEffect(() => {
    if (isOpen) {
      loadCalendars();
    }
  }, [isOpen]);

  const loadCalendars = async () => {
    try {
      const { data, error } = await supabase
        .from('calendarios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCalendars(data?.map(calendar => ({
        ...calendar,
        tipo: calendar.tipo as 'pessoal' | 'ministerio' | 'publico'
      })) || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar calendários",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      cor: '#3b82f6',
      tipo: 'pessoal',
      visivel_para_todos: false
    });
    setEditingCalendar(null);
  };

  const handleEdit = (calendar: Calendar) => {
    setFormData({
      nome: calendar.nome,
      descricao: calendar.descricao || '',
      cor: calendar.cor,
      tipo: calendar.tipo,
      visivel_para_todos: calendar.visivel_para_todos
    });
    setEditingCalendar(calendar);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    try {
      setLoading(true);

      if (editingCalendar) {
        const { error } = await supabase
          .from('calendarios')
          .update(formData)
          .eq('id', editingCalendar.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Calendário atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('calendarios')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Calendário criado com sucesso",
        });
      }

      resetForm();
      loadCalendars();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar calendário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este calendário?')) return;

    try {
      const { error } = await supabase
        .from('calendarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Calendário excluído com sucesso",
      });

      loadCalendars();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir calendário",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Gerenciar Calendários
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Calendários</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {editingCalendar ? 'Editar Calendário' : 'Novo Calendário'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do calendário"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do calendário"
                  rows={2}
                />
              </div>

              <div>
                <Label>Tipo de Calendário</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'pessoal' | 'ministerio' | 'publico') => 
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALENDAR_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cor do Calendário</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {CALENDAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.cor === color ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, cor: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="visivel"
                  checked={formData.visivel_para_todos}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, visivel_para_todos: checked })
                  }
                />
                <Label htmlFor="visivel">Visível para todos</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : editingCalendar ? 'Atualizar' : 'Criar'}
                </Button>
                {editingCalendar && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Calendários */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Calendários Existentes</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {calendars.map((calendar) => (
                <Card key={calendar.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: calendar.cor }}
                        />
                        <div>
                          <h4 className="font-medium">{calendar.nome}</h4>
                          {calendar.descricao && (
                            <p className="text-sm text-muted-foreground">
                              {calendar.descricao}
                            </p>
                          )}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {CALENDAR_TYPES.find(t => t.value === calendar.tipo)?.label}
                            </Badge>
                            {calendar.visivel_para_todos && (
                              <Badge variant="outline" className="text-xs">
                                Público
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(calendar)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(calendar.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {calendars.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum calendário encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};