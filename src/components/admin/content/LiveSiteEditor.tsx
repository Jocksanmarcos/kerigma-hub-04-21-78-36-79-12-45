import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Globe, Plus, Save, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SitePage {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  status: string;
  published: boolean;
  created_at: string;
}

export const LiveSiteEditor: React.FC = () => {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('paginas_site')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
      toast.error('Erro ao carregar páginas do site');
    } finally {
      setLoading(false);
    }
  };

  const openPageEditor = (pageSlug: string) => {
    // Abre a página pública com o parâmetro de edição
    const editorUrl = `/${pageSlug}?modo=editar`;
    window.open(editorUrl, '_blank');
  };

  const openPagePreview = (pageSlug: string) => {
    // Abre a página pública para visualização
    const previewUrl = `/${pageSlug}`;
    window.open(previewUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-32 rounded-lg"></div>
        <div className="animate-pulse bg-muted h-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Editor de Site Ao Vivo</h2>
          <p className="text-muted-foreground">
            Edite o conteúdo do site público diretamente nas páginas, de forma visual e intuitiva.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Página
        </Button>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma página encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira página para começar a usar o editor ao vivo.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Página
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {page.title}
                      {page.published ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Publicada
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Slug: /{page.slug}
                      {page.meta_description && ` • ${page.meta_description}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPagePreview(page.slug)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openPageEditor(page.slug)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Ao Vivo
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="text-center py-8">
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Edit className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Como usar o Editor Ao Vivo</h3>
          </div>
          <div className="text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
            <p>1. Clique em "Editar Ao Vivo" em qualquer página</p>
            <p>2. Na página que abrir, você verá botões "✏️" sobre os conteúdos editáveis</p>
            <p>3. Clique nos botões para editar textos, imagens e outros elementos</p>
            <p>4. As alterações são salvas automaticamente e ficam visíveis para todos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};