import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Folder, FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  created_at: string;
}

export const PatrimonioCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categorias_patrimonio')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategoria) {
        const { error } = await supabase
          .from('categorias_patrimonio')
          .update(formData)
          .eq('id', editingCategoria.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('categorias_patrimonio')
          .insert([{ ...formData, ativa: true }]);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Categoria criada com sucesso!' });
      }

      setShowForm(false);
      setEditingCategoria(null);
      resetForm();
      loadCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a categoria.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: ''
    });
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || ''
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (categoria: Categoria) => {
    try {
      const { error } = await supabase
        .from('categorias_patrimonio')
        .update({ ativa: !categoria.ativa })
        .eq('id', categoria.id);

      if (error) throw error;
      
      toast({ 
        title: 'Sucesso', 
        description: `Categoria ${categoria.ativa ? 'desativada' : 'ativada'} com sucesso!` 
      });
      loadCategorias();
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status da categoria.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('categorias_patrimonio')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso!' });
      loadCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria. Verifique se não há patrimônios associados.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Categorias de Patrimônio</h2>
          <p className="text-muted-foreground">Organize seus ativos por categorias</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCategoria(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome*</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Eletrônicos, Móveis, Instrumentos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição opcional da categoria"
                  rows={3}
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

      {/* Lista de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Carregando categorias...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <FolderPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie categorias para organizar melhor seus patrimônios
            </p>
          </div>
        ) : (
          categorias.map((categoria) => (
            <Card key={categoria.id} className={`hover:shadow-md transition-shadow ${!categoria.ativa ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{categoria.nome}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      categoria.ativa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {categoria.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoria.descricao && (
                  <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Criada em: {new Date(categoria.created_at).toLocaleDateString('pt-BR')}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(categoria)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleToggleStatus(categoria)}
                    className={categoria.ativa ? 'text-yellow-600' : 'text-green-600'}
                  >
                    {categoria.ativa ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(categoria.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
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