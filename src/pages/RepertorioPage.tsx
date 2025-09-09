import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLouvorRepertorio } from '@/hooks/useLouvorRepertorio';
import { Music, Plus, Search, Play, Edit, Trash2, ExternalLink } from 'lucide-react';
import { RepertorioForm } from '@/components/repertorio/RepertorioForm';
import { toast } from 'sonner';

export default function RepertorioPage() {
  const {
    repertorioFiltrado,
    loadingRepertorio,
    filtroRepertorio,
    setFiltroRepertorio,
    createMusica,
    updateMusica,
    deleteMusica,
    creatingMusica,
    updatingMusica,
    deletingMusica
  } = useLouvorRepertorio();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMusica, setEditingMusica] = useState<any>(null);

  const handleCreateMusica = async (data: any) => {
    try {
      await createMusica(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar música:', error);
    }
  };

  const handleUpdateMusica = async (data: any) => {
    try {
      if (editingMusica) {
        await updateMusica({ id: editingMusica.id, ...data });
        setIsEditDialogOpen(false);
        setEditingMusica(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
    }
  };

  const handleDeleteMusica = async (id: string, titulo: string) => {
    if (confirm(`Tem certeza que deseja remover "${titulo}" do repertório?`)) {
      try {
        await deleteMusica(id);
      } catch (error) {
        console.error('Erro ao deletar música:', error);
      }
    }
  };

  const openEditDialog = (musica: any) => {
    setEditingMusica(musica);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repertório Musical</h1>
          <p className="text-muted-foreground">Gerencie o repertório de músicas do ministério</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Música
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Música</DialogTitle>
              <DialogDescription>
                Adicione uma nova música ao repertório do ministério
              </DialogDescription>
            </DialogHeader>
            <RepertorioForm 
              onSubmit={handleCreateMusica}
              isSubmitting={creatingMusica}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Músicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, artista ou tags..."
              value={filtroRepertorio}
              onChange={(e) => setFiltroRepertorio(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Músicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingRepertorio ? (
          <div className="col-span-full text-center py-8">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p>Carregando repertório...</p>
          </div>
        ) : repertorioFiltrado.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma música encontrada</h3>
            <p className="text-muted-foreground">
              {filtroRepertorio ? 'Tente ajustar sua busca' : 'Adicione a primeira música ao repertório'}
            </p>
          </div>
        ) : (
          repertorioFiltrado.map((musica) => (
            <Card key={musica.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-2">{musica.titulo}</CardTitle>
                    <CardDescription>{musica.artista || 'Artista não informado'}</CardDescription>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(musica)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMusica(musica.id, musica.titulo)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={deletingMusica}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações musicais */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {musica.tom && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Tom:</span>
                      <Badge variant="outline" className="text-xs">{musica.tom}</Badge>
                    </div>
                  )}
                  {musica.bpm && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">BPM:</span>
                      <Badge variant="outline" className="text-xs">{musica.bpm}</Badge>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {musica.tags && musica.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {musica.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {musica.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{musica.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2 pt-2">
                  {musica.link_referencia && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={musica.link_referencia} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4 mr-1" />
                        Ouvir
                      </a>
                    </Button>
                  )}
                  {musica.cifra && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={musica.cifra} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Cifra
                      </a>
                    </Button>
                  )}
                </div>

                {/* Letra (preview) */}
                {musica.letra && (
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-2 italic">"{musica.letra.slice(0, 100)}..."</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Música</DialogTitle>
            <DialogDescription>
              Edite as informações da música "{editingMusica?.titulo}"
            </DialogDescription>
          </DialogHeader>
          {editingMusica && (
            <RepertorioForm 
              initialData={editingMusica}
              onSubmit={handleUpdateMusica}
              isSubmitting={updatingMusica}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}