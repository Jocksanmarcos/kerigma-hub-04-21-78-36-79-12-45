import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
  destacar: boolean;
  visibilidade: 'publico' | 'membros' | 'lideres';
  imagem_url?: string;
  created_at: string;
}

export const ComunicadosManager: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState<Comunicado | null>(null);
  const [formData, setFormData] = useState<{
    titulo: string;
    conteudo: string;
    prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
    data_inicio: string;
    data_fim: string;
    ativo: boolean;
    destacar: boolean;
    visibilidade: 'publico' | 'membros' | 'lideres';
    imagem_url: string;
  }>({
    titulo: '',
    conteudo: '',
    prioridade: 'normal',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    ativo: true,
    destacar: false,
    visibilidade: 'membros',
    imagem_url: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar comunicados
  const { data: comunicados, isLoading } = useQuery({
    queryKey: ['comunicados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comunicados')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Comunicado[];
    }
  });

  // Mutação para criar/editar comunicado
  const saveComunicado = useMutation({
    mutationFn: async (data: any) => {
      if (editingComunicado) {
        const { error } = await supabase
          .from('comunicados')
          .update(data)
          .eq('id', editingComunicado.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comunicados')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Comunicado ${editingComunicado ? 'atualizado' : 'criado'} com sucesso!` });
      queryClient.invalidateQueries({ queryKey: ['comunicados'] });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao salvar comunicado', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Mutação para deletar comunicado
  const deleteComunicado = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('comunicados')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Comunicado excluído com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['comunicados'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir comunicado', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const openDialog = (comunicado?: Comunicado) => {
    if (comunicado) {
      setEditingComunicado(comunicado);
      setFormData({
        titulo: comunicado.titulo,
        conteudo: comunicado.conteudo,
        prioridade: comunicado.prioridade,
        data_inicio: comunicado.data_inicio,
        data_fim: comunicado.data_fim || '',
        ativo: comunicado.ativo,
        destacar: comunicado.destacar,
        visibilidade: comunicado.visibilidade,
        imagem_url: comunicado.imagem_url || ''
      });
    } else {
      setEditingComunicado(null);
      setFormData({
        titulo: '',
        conteudo: '',
        prioridade: 'normal',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: '',
        ativo: true,
        destacar: false,
        visibilidade: 'membros',
        imagem_url: ''
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingComunicado(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      data_fim: formData.data_fim || null
    };
    saveComunicado.mutate(data);
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      baixa: 'secondary',
      normal: 'default',
      alta: 'destructive',
      urgente: 'destructive'
    };
    
    const colors = {
      baixa: 'text-blue-600',
      normal: 'text-green-600',
      alta: 'text-orange-600',
      urgente: 'text-red-600'
    };

    return (
      <Badge variant={variants[prioridade as keyof typeof variants] as any} className={colors[prioridade as keyof typeof colors]}>
        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
      </Badge>
    );
  };

  const getVisibilidadeBadge = (visibilidade: string) => {
    const labels = {
      publico: 'Público',
      membros: 'Membros',
      lideres: 'Líderes'
    };

    return (
      <Badge variant="outline">
        <Users className="h-3 w-3 mr-1" />
        {labels[visibilidade as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Comunicados</h2>
          <p className="text-muted-foreground">Gerencie comunicados e avisos da plataforma</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-kerigma-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Novo Comunicado
        </Button>
      </div>

      {/* Lista de Comunicados */}
      <div className="grid grid-cols-1 gap-4">
        {comunicados?.map((comunicado) => (
          <Card key={comunicado.id} className="hover:shadow-kerigma transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{comunicado.titulo}</h3>
                    {comunicado.destacar && (
                      <Badge variant="default" className="bg-yellow-500">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {comunicado.conteudo}
                  </p>
                  
                  <div className="flex items-center space-x-3 text-xs">
                    {getPrioridadeBadge(comunicado.prioridade)}
                    {getVisibilidadeBadge(comunicado.visibilidade)}
                    
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(comunicado.data_inicio).toLocaleDateString()}</span>
                      {comunicado.data_fim && (
                        <>
                          <span>até</span>
                          <span>{new Date(comunicado.data_fim).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    
                    {comunicado.ativo ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => openDialog(comunicado)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteComunicado.mutate(comunicado.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingComunicado ? 'Editar Comunicado' : 'Novo Comunicado'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Digite o título do comunicado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select 
                  value={formData.prioridade} 
                  onValueChange={(value: 'baixa' | 'normal' | 'alta' | 'urgente') => setFormData({ ...formData, prioridade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo</Label>
              <Textarea
                id="conteudo"
                rows={4}
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                placeholder="Digite o conteúdo do comunicado"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim (opcional)</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibilidade">Visibilidade</Label>
              <Select 
                value={formData.visibilidade} 
                onValueChange={(value: 'publico' | 'membros' | 'lideres') => setFormData({ ...formData, visibilidade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="membros">Membros</SelectItem>
                  <SelectItem value="lideres">Líderes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem_url">URL da Imagem (opcional)</Label>
              <Input
                id="imagem_url"
                value={formData.imagem_url}
                onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo">Ativo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="destacar"
                  checked={formData.destacar}
                  onCheckedChange={(checked) => setFormData({ ...formData, destacar: checked })}
                />
                <Label htmlFor="destacar">Destacar</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saveComunicado.isPending}>
              {saveComunicado.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};