import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Music, Edit, Trash2, ExternalLink, Play } from 'lucide-react';
import { useLouvorRepertorio } from '@/hooks/useLouvorRepertorio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RepertorioForm } from '@/components/repertorio/RepertorioForm';
import { toast } from 'sonner';

export function RepertorioManager() {
  const {
    repertorioFiltrado,
    loadingRepertorio,
    createMusica,
    updateMusica,
    deleteMusica,
    filtroRepertorio,
    setFiltroRepertorio,
    creatingMusica,
    updatingMusica,
  } = useLouvorRepertorio();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMusica, setEditingMusica] = useState<any>(null);

  const resetForm = () => {
    setEditingMusica(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingMusica) {
        await updateMusica({ id: editingMusica.id, ...data });
      } else {
        await createMusica(data);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar música');
    }
  };

  const handleEdit = (musica: any) => {
    setEditingMusica(musica);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta música do repertório?')) {
      await deleteMusica(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar músicas..."
              value={filtroRepertorio}
              onChange={(e) => setFiltroRepertorio(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Música
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMusica ? 'Editar Música' : 'Nova Música'}
                </DialogTitle>
                <DialogDescription>
                  {editingMusica ? 'Edite as informações da música.' : 'Adicione uma nova música ao repertório.'}
                </DialogDescription>
              </DialogHeader>
              
              <RepertorioForm
                initialData={editingMusica}
                onSubmit={handleSubmit}
                isSubmitting={creatingMusica || updatingMusica}
                isEditing={!!editingMusica}
              />
            </DialogContent>
        </Dialog>
      </div>

      {loadingRepertorio ? (
        <div className="text-center py-8">Carregando repertório...</div>
      ) : (
        <div className="grid gap-4">
          {repertorioFiltrado?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma música encontrada</p>
              </CardContent>
            </Card>
          ) : (
            repertorioFiltrado?.map((musica) => (
              <Card key={musica.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{musica.titulo}</h3>
                        {musica.link_referencia && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="p-1 h-auto"
                          >
                            <a href={musica.link_referencia} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      {musica.artista && (
                        <p className="text-muted-foreground mb-2">{musica.artista}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                        {musica.tom && <span>Tom: {musica.tom}</span>}
                        {musica.bpm && <span>BPM: {musica.bpm}</span>}
                        {musica.cifra && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                          >
                            <a href={musica.cifra} target="_blank" rel="noopener noreferrer">
                              Ver Cifra
                            </a>
                          </Button>
                        )}
                      </div>

                      {musica.letra && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground italic line-clamp-2">
                            "{musica.letra.slice(0, 120)}{musica.letra.length > 120 ? '...' : ''}"
                          </p>
                        </div>
                      )}
                      
                      {musica.tags && musica.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {musica.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {musica.link_referencia && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={musica.link_referencia} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4 mr-1" />
                            Ouvir
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(musica)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(musica.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}