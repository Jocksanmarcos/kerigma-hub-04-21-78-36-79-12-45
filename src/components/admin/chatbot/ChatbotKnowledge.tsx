import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Database,
  Globe,
  FileText,
  MessageSquare,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  source_type: string;
  source_url?: string;
  keywords: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const ChatbotKnowledge: React.FC = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    source_type: 'manual',
    source_url: '',
    keywords: ''
  });
  
  const { toast } = useToast();

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_knowledge')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setKnowledge(data || []);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a base de conhecimento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveKnowledgeItem = async () => {
    try {
      const itemData = {
        title: newItem.title,
        content: newItem.content,
        source_type: newItem.source_type,
        source_url: newItem.source_url || null,
        keywords: newItem.keywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      let error;
      if (editingItem) {
        const { error: updateError } = await supabase
          .from('chatbot_knowledge')
          .update(itemData)
          .eq('id', editingItem.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('chatbot_knowledge')
          .insert([itemData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: editingItem ? "Item atualizado com sucesso." : "Item adicionado com sucesso.",
      });

      setIsAddModalOpen(false);
      setEditingItem(null);
      setNewItem({
        title: '',
        content: '',
        source_type: 'manual',
        source_url: '',
        keywords: ''
      });
      
      fetchKnowledge();
    } catch (error) {
      console.error('Error saving knowledge item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item.",
        variant: "destructive"
      });
    }
  };

  const deleteKnowledgeItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('chatbot_knowledge')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Item excluído com sucesso.",
      });

      fetchKnowledge();
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item.",
        variant: "destructive"
      });
    }
  };

  const toggleActiveStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('chatbot_knowledge')
        .update({ active: !active })
        .eq('id', id);

      if (error) throw error;

      fetchKnowledge();
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };

  const filteredKnowledge = knowledge.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || item.source_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'page': return <Globe className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'conversation': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const startEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      content: item.content,
      source_type: item.source_type,
      source_url: item.source_url || '',
      keywords: item.keywords.join(', ')
    });
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Base de Conhecimento</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setNewItem({
                title: '',
                content: '',
                source_type: 'manual',
                source_url: '',
                keywords: ''
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conhecimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Conhecimento' : 'Adicionar Conhecimento'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  placeholder="Ex: Horários de Culto"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de Fonte</label>
                <Select value={newItem.source_type} onValueChange={(value) => setNewItem({...newItem, source_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="page">Página do Site</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="database">Banco de Dados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">URL (opcional)</label>
                <Input
                  value={newItem.source_url}
                  onChange={(e) => setNewItem({...newItem, source_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Conteúdo</label>
                <Textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                  placeholder="Descreva as informações que o chatbot deve conhecer..."
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Palavras-chave</label>
                <Input
                  value={newItem.keywords}
                  onChange={(e) => setNewItem({...newItem, keywords: e.target.value})}
                  placeholder="culto, horário, domingo, igreja (separadas por vírgula)"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveKnowledgeItem}>
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar na base de conhecimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="page">Páginas do Site</SelectItem>
            <SelectItem value="document">Documentos</SelectItem>
            <SelectItem value="database">Banco de Dados</SelectItem>
            <SelectItem value="conversation">Conversas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Knowledge Items */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : filteredKnowledge.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum conhecimento encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedType !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece adicionando conhecimento para treinar o chatbot.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredKnowledge.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(item.source_type)}
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {!item.active && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActiveStatus(item.id, item.active)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKnowledgeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {item.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.slice(0, 5).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {item.keywords.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.keywords.length - 5} mais
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};