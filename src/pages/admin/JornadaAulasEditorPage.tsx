import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ArrowLeft, 
  GripVertical,
  Edit,
  Trash2,
  BookOpen,
  Play,
  FileText,
  Save,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Curso {
  id: string;
  nome: string;
  descricao: string;
}

interface Modulo {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  duracao_estimada: number;
  ativo: boolean;
}

interface NovoModuloForm {
  nome: string;
  descricao: string;
  duracao_estimada: number;
  videoUrl: string;
  materialPdf: File | null;
}

const JornadaAulasEditorPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  
  const [novoModuloForm, setNovoModuloForm] = useState<NovoModuloForm>({
    nome: '',
    descricao: '',
    duracao_estimada: 60,
    videoUrl: '',
    materialPdf: null
  });

  useEffect(() => {
    if (courseId) {
      loadCursoAndModulos();
    }
  }, [courseId]);

  const loadCursoAndModulos = async () => {
    try {
      setLoading(true);
      
      // Load course
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', courseId)
        .single();

      if (cursoError) throw cursoError;
      setCurso(cursoData);

      // Load modules
      const { data: modulosData, error: modulosError } = await supabase
        .from('modulos_curso')
        .select('*')
        .eq('curso_id', courseId)
        .order('ordem');

      if (modulosError) throw modulosError;
      setModulos(modulosData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do curso.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModulo = async () => {
    if (!courseId || !novoModuloForm.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da aula é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      const nextOrder = Math.max(...modulos.map(m => m.ordem), 0) + 1;
      
      const { data, error } = await supabase
        .from('modulos_curso')
        .insert({
          curso_id: courseId,
          nome: novoModuloForm.nome,
          descricao: novoModuloForm.descricao,
          ordem: nextOrder,
          duracao_estimada: novoModuloForm.duracao_estimada
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aula criada com sucesso!"
      });

      // Reset form and close dialog
      setNovoModuloForm({
        nome: '',
        descricao: '',
        duracao_estimada: 60,
        videoUrl: '',
        materialPdf: null
      });
      setIsCreateDialogOpen(false);
      
      // Reload modules
      loadCursoAndModulos();

    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a aula.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteModulo = async (moduloId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modulos_curso')
        .delete()
        .eq('id', moduloId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aula excluída com sucesso."
      });

      loadCursoAndModulos();
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a aula.",
        variant: "destructive"
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(modulos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      ordem: index + 1
    }));

    setModulos(updatedItems);

    // Update in database
    try {
      const updates = updatedItems.map(item => 
        supabase
          .from('modulos_curso')
          .update({ ordem: item.ordem })
          .eq('id', item.id)
      );

      await Promise.all(updates);

      toast({
        title: "Sucesso",
        description: "Ordem das aulas atualizada."
      });
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar as aulas.",
        variant: "destructive"
      });
      // Reload to get correct order
      loadCursoAndModulos();
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p>Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  if (!curso) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p>Curso não encontrado.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/jornada/cursos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Cursos
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Editar Aulas - {curso.nome}
              </h1>
              <p className="text-muted-foreground">
                Gerencie o conteúdo e a ordem das aulas do curso
              </p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Aula</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Título da Aula *</Label>
                  <Input
                    id="nome"
                    value={novoModuloForm.nome}
                    onChange={(e) => setNovoModuloForm(prev => ({...prev, nome: e.target.value}))}
                    placeholder="Ex: Introdução ao Discipulado"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novoModuloForm.descricao}
                    onChange={(e) => setNovoModuloForm(prev => ({...prev, descricao: e.target.value}))}
                    placeholder="Descreva o conteúdo desta aula..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duracao">Duração Estimada (minutos)</Label>
                  <Input
                    id="duracao"
                    type="number"
                    value={novoModuloForm.duracao_estimada}
                    onChange={(e) => setNovoModuloForm(prev => ({...prev, duracao_estimada: parseInt(e.target.value) || 60}))}
                    placeholder="60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video">Link do Vídeo</Label>
                  <Input
                    id="video"
                    value={novoModuloForm.videoUrl}
                    onChange={(e) => setNovoModuloForm(prev => ({...prev, videoUrl: e.target.value}))}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pdf">Material de Apoio (PDF)</Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setNovoModuloForm(prev => ({...prev, materialPdf: e.target.files?.[0] || null}))}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateModulo}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Aula
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {curso.nome}
            </CardTitle>
            <CardDescription>
              {curso.descricao || 'Sem descrição'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge variant="secondary">
                {modulos.length} {modulos.length === 1 ? 'aula' : 'aulas'}
              </Badge>
              <Badge variant="outline">
                {modulos.reduce((acc, m) => acc + m.duracao_estimada, 0)} min total
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Modules List */}
        <Card>
          <CardHeader>
            <CardTitle>Aulas do Curso</CardTitle>
            <CardDescription>
              Arraste e solte para reordenar as aulas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modulos.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Nenhuma aula cadastrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando a primeira aula do seu curso.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Aula
                </Button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="modules">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {modulos.map((modulo, index) => (
                        <Draggable key={modulo.id} draggableId={modulo.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-4 p-4 border rounded-lg bg-background"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    Aula {modulo.ordem}
                                  </Badge>
                                  <h4 className="font-semibold">{modulo.nome}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {modulo.descricao || 'Sem descrição'}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Play className="h-3 w-3" />
                                    {modulo.duracao_estimada} min
                                  </span>
                                  <Badge variant={modulo.ativo ? "default" : "secondary"} className="text-xs">
                                    {modulo.ativo ? 'Ativo' : 'Inativo'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteModulo(modulo.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default JornadaAulasEditorPage;