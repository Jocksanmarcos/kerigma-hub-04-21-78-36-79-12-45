import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface ContentBlock {
  id: string;
  type: string;
  content: any;
  order: number;
}

interface PageSection {
  id: string;
  type: string;
  order: number;
  blocks: ContentBlock[];
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  sections: PageSection[];
}

const DynamicPage: React.FC = () => {
  const { slug = 'home' } = useParams();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get('modo') === 'editar';
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadPageData();
  }, [slug]);

  const loadPageData = async () => {
    try {
      // Buscar página
      const { data: page, error: pageError } = await supabase
        .from('paginas_site')
        .select('*')
        .eq('slug', slug)
        .single();

      if (pageError) throw pageError;

      // Buscar blocos diretamente da página (simplificado)
      const { data: blocks, error: blocksError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page_id', page.id)
        .order('order_position');

      if (blocksError) throw blocksError;

      // Agrupar blocos em seções simples
      const sections: PageSection[] = [
        {
          id: 'hero',
          type: 'hero',
          order: 1,
          blocks: (blocks || [])
            .filter(block => block.type === 'title' || block.type === 'subtitle')
            .map(block => ({
              id: block.id,
              type: block.type,
              content: block.content_json,
              order: block.order_position
            }))
        },
        {
          id: 'content',
          type: 'content', 
          order: 2,
          blocks: (blocks || [])
            .filter(block => block.type === 'text' || block.type === 'button')
            .map(block => ({
              id: block.id,
              type: block.type,
              content: block.content_json,
              order: block.order_position
            }))
        }
      ].filter(section => section.blocks.length > 0);

      setPageData({
        ...page,
        sections: sections
      });
    } catch (error) {
      console.error('Erro ao carregar página:', error);
      toast.error('Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlock = (block: ContentBlock) => {
    setEditingBlock(block);
    setEditContent(block.content?.text || block.content || '');
  };

  const handleSaveBlock = async () => {
    if (!editingBlock) return;

    try {
      const updatedContent = editingBlock.type === 'text' || editingBlock.type === 'title' 
        ? { text: editContent }
        : editContent;

      const { error } = await supabase
        .from('content_blocks')
        .update({ content_json: updatedContent })
        .eq('id', editingBlock.id);

      if (error) throw error;

      toast.success('Conteúdo atualizado com sucesso!');
      setEditingBlock(null);
      loadPageData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  const renderBlock = (block: ContentBlock) => {
    const content = block.content?.text || block.content || '';
    
    const blockElement = (() => {
      switch (block.type) {
        case 'title':
          return <h1 className="text-4xl font-bold text-foreground mb-6">{content}</h1>;
        case 'subtitle':
          return <h2 className="text-2xl font-semibold text-foreground mb-4">{content}</h2>;
        case 'text':
          return <p className="text-lg text-muted-foreground mb-4">{content}</p>;
        case 'button':
          return (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3">
              {content}
            </Button>
          );
        default:
          return <div className="p-4 bg-muted rounded">{content}</div>;
      }
    })();

    return (
      <div key={block.id} className="relative group">
        {blockElement}
        {editMode && (
          <Button
            size="sm"
            variant="outline"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md"
            onClick={() => handleEditBlock(block)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">Página não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {editMode && (
        <div className="bg-primary text-primary-foreground p-3 text-center">
          <span className="font-semibold">Modo de Edição Ativo</span> - Clique nos ícones ✏️ para editar o conteúdo
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        {pageData.sections.map((section) => (
          <section key={section.id} className="mb-12">
            {section.type === 'hero' && (
              <div className="text-center py-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                {section.blocks.map(renderBlock)}
              </div>
            )}
            {section.type === 'content' && (
              <div className="max-w-4xl mx-auto">
                {section.blocks.map(renderBlock)}
              </div>
            )}
            {section.type === 'features' && (
              <div className="grid md:grid-cols-3 gap-8">
                {section.blocks.map(renderBlock)}
              </div>
            )}
          </section>
        ))}
      </main>

      {/* Modal de Edição */}
      <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conteúdo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              {editingBlock?.type === 'text' ? (
                <Textarea
                  id="content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                />
              ) : (
                <Input
                  id="content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingBlock(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBlock}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicPage;