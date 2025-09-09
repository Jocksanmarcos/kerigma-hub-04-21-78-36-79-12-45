import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  CheckCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagem_url: string;
  link_url?: string;
  link_texto?: string;
  ordem: number;
  ativo: boolean;
  data_inicio?: string;
  data_fim?: string;
  created_at: string;
}

export const BannersManager: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    imagem_url: '',
    link_url: '',
    link_texto: '',
    ordem: 0,
    ativo: true,
    data_inicio: '',
    data_fim: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar banners
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners_home')
        .select('*')
        .order('ordem', { ascending: true });
      
      if (error) throw error;
      return data as Banner[];
    }
  });

  // Mutação para salvar banner
  const saveBanner = useMutation({
    mutationFn: async (data: any) => {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners_home')
          .update(data)
          .eq('id', editingBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banners_home')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Banner ${editingBanner ? 'atualizado' : 'criado'} com sucesso!` });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao salvar banner', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Mutação para deletar banner
  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners_home')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Banner excluído com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir banner', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Mutação para reordenar banners
  const reorderBanner = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('banners_home')
        .update({ ordem: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    }
  });

  const openDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        titulo: banner.titulo,
        subtitulo: banner.subtitulo || '',
        imagem_url: banner.imagem_url,
        link_url: banner.link_url || '',
        link_texto: banner.link_texto || '',
        ordem: banner.ordem,
        ativo: banner.ativo,
        data_inicio: banner.data_inicio || '',
        data_fim: banner.data_fim || ''
      });
    } else {
      setEditingBanner(null);
      const maxOrder = Math.max(...(banners?.map(b => b.ordem) || [0]), 0);
      setFormData({
        titulo: '',
        subtitulo: '',
        imagem_url: '',
        link_url: '',
        link_texto: '',
        ordem: maxOrder + 1,
        ativo: true,
        data_inicio: '',
        data_fim: ''
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      data_inicio: formData.data_inicio || null,
      data_fim: formData.data_fim || null,
      subtitulo: formData.subtitulo || null,
      link_url: formData.link_url || null,
      link_texto: formData.link_texto || null
    };
    saveBanner.mutate(data);
  };

  const moveBanner = (bannerId: string, direction: 'up' | 'down') => {
    if (!banners) return;
    
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;

    const sortedBanners = [...banners].sort((a, b) => a.ordem - b.ordem);
    const currentIndex = sortedBanners.findIndex(b => b.id === bannerId);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetBanner = sortedBanners[currentIndex - 1];
      reorderBanner.mutate({ id: bannerId, newOrder: targetBanner.ordem });
      reorderBanner.mutate({ id: targetBanner.id, newOrder: banner.ordem });
    } else if (direction === 'down' && currentIndex < sortedBanners.length - 1) {
      const targetBanner = sortedBanners[currentIndex + 1];
      reorderBanner.mutate({ id: bannerId, newOrder: targetBanner.ordem });
      reorderBanner.mutate({ id: targetBanner.id, newOrder: banner.ordem });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Banners da Home</h2>
          <p className="text-muted-foreground">Gerencie os banners exibidos na página inicial</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-kerigma-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Lista de Banners */}
      <div className="grid grid-cols-1 gap-4">
        {banners?.sort((a, b) => a.ordem - b.ordem).map((banner) => (
          <Card key={banner.id} className="hover:shadow-kerigma transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Preview da Imagem */}
                <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {banner.imagem_url ? (
                    <img 
                      src={banner.imagem_url} 
                      alt={banner.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{banner.titulo}</h3>
                      {banner.subtitulo && (
                        <p className="text-muted-foreground text-sm">{banner.subtitulo}</p>
                      )}
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge variant="outline">Ordem: {banner.ordem}</Badge>
                        
                        {banner.ativo ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                        
                        {banner.link_url && (
                          <Badge variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Com Link
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col space-y-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => moveBanner(banner.id, 'up')}
                          disabled={banner.ordem === Math.min(...(banners?.map(b => b.ordem) || []))}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => moveBanner(banner.id, 'down')}
                          disabled={banner.ordem === Math.max(...(banners?.map(b => b.ordem) || []))}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button variant="outline" size="sm" onClick={() => openDialog(banner)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteBanner.mutate(banner.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Editar Banner' : 'Novo Banner'}
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
                  placeholder="Título do banner"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitulo">Subtítulo (opcional)</Label>
              <Input
                id="subtitulo"
                value={formData.subtitulo}
                onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                placeholder="Subtítulo do banner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem_url">URL da Imagem</Label>
              <Input
                id="imagem_url"
                value={formData.imagem_url}
                onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                placeholder="https://exemplo.com/banner.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link_url">URL do Link (opcional)</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link_texto">Texto do Link (opcional)</Label>
                <Input
                  id="link_texto"
                  value={formData.link_texto}
                  onChange={(e) => setFormData({ ...formData, link_texto: e.target.value })}
                  placeholder="Saiba mais"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início (opcional)</Label>
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

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Banner Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saveBanner.isPending}>
              {saveBanner.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};