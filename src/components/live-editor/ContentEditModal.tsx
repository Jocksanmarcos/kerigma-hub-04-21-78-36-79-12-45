import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEditMode } from '@/contexts/EditModeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const ContentEditModal: React.FC = () => {
  const { isEditModalOpen, setEditModalOpen, editingBlock, setEditingBlock } = useEditMode();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (editingBlock) {
      setFormData(editingBlock.conteudo_json || {});
    }
  }, [editingBlock]);

  const handleSave = async () => {
    if (!editingBlock) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('blocos_conteudo')
        .update({ 
          conteudo_json: formData,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', editingBlock.id);

      if (error) throw error;

      toast({
        title: "Conteúdo atualizado com sucesso!",
        description: "As alterações foram salvas e aplicadas ao site."
      });

      handleClose();
      
      // Recarregar a página para mostrar as mudanças instantaneamente
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error: any) {
      console.error("Erro ao salvar conteúdo:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEditModalOpen(false);
    setEditingBlock(null);
    setFormData({});
  };

  const renderFormFields = () => {
    if (!editingBlock) return null;

    const { tipo_bloco } = editingBlock;

    switch (tipo_bloco) {
      case 'titulo':
      case 'subtitulo':
      case 'paragrafo':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="texto">Texto</Label>
              <Textarea
                id="texto"
                value={formData.texto || ''}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                rows={tipo_bloco === 'paragrafo' ? 4 : 2}
              />
            </div>
          </div>
        );

      case 'imagem':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">URL da Imagem</Label>
              <Input
                id="url"
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            <div>
              <Label htmlFor="alt">Texto Alternativo</Label>
              <Input
                id="alt"
                value={formData.alt || ''}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                placeholder="Descrição da imagem"
              />
            </div>
            <div>
              <Label htmlFor="legenda">Legenda (opcional)</Label>
              <Input
                id="legenda"
                value={formData.legenda || ''}
                onChange={(e) => setFormData({ ...formData, legenda: e.target.value })}
                placeholder="Legenda da imagem"
              />
            </div>
          </div>
        );

      case 'botao':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="texto">Texto do Botão</Label>
              <Input
                id="texto"
                value={formData.texto || ''}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                placeholder="Clique aqui"
              />
            </div>
            <div>
              <Label htmlFor="url">Link</Label>
              <Input
                id="url"
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://exemplo.com ou /pagina-interna"
              />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">URL do Vídeo</Label>
              <Input
                id="url"
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://youtube.com/embed/..."
              />
            </div>
            <div>
              <Label htmlFor="titulo">Título (opcional)</Label>
              <Input
                id="titulo"
                value={formData.titulo || ''}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título do vídeo"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do vídeo"
                rows={2}
              />
            </div>
          </div>
        );

      case 'espacador':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="altura">Altura em pixels</Label>
              <Input
                id="altura"
                type="number"
                value={formData.altura || 20}
                onChange={(e) => setFormData({ ...formData, altura: parseInt(e.target.value) })}
                min="5"
                max="200"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="conteudo">Conteúdo JSON</Label>
              <Textarea
                id="conteudo"
                value={JSON.stringify(formData, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData(JSON.parse(e.target.value));
                  } catch {
                    // Ignora erros de JSON inválido durante a digitação
                  }
                }}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Editar {editingBlock?.tipo_bloco || 'Conteúdo'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {renderFormFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};