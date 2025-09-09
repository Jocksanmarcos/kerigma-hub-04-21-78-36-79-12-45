import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LivroSugestao {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  imagem_capa_url?: string;
  total_emprestimos: number;
}

export const BibliotecaDashboardCard = () => {
  const [livrosDestaque, setLivrosDestaque] = useState<LivroSugestao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLivrosDestaque();
  }, []);

  const fetchLivrosDestaque = async () => {
    try {
      // Buscar livros mais emprestados e populares
      const { data, error } = await supabase
        .from('biblioteca_livros')
        .select(`
          id,
          titulo,
          autor,
          categoria,
          imagem_capa_url
        `)
        .eq('ativo', true)
        .eq('status', 'Disponível')
        .limit(3);

      if (error) throw error;

      setLivrosDestaque((data || []).map(livro => ({
        ...livro,
        total_emprestimos: 0 // Placeholder até implementar estatísticas
      })));
    } catch (error) {
      console.error('Erro ao carregar livros de destaque:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-16 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Biblioteca da Igreja
        </CardTitle>
        <CardDescription>
          Livros mais populares disponíveis para empréstimo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {livrosDestaque.length > 0 ? (
          <>
            <div className="space-y-3">
              {livrosDestaque.map((livro, index) => (
                <div key={livro.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative">
                    <div className="w-12 h-16 bg-muted rounded-sm flex items-center justify-center overflow-hidden">
                      {livro.imagem_capa_url ? (
                        <img 
                          src={livro.imagem_capa_url} 
                          alt={livro.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Star className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{livro.titulo}</p>
                    <p className="text-xs text-muted-foreground truncate">{livro.autor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {livro.categoria}
                      </Badge>
                      {livro.total_emprestimos > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {livro.total_emprestimos}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => window.location.href = '/dashboard/biblioteca'}
              >
                Ver acervo completo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Nenhum livro disponível no momento
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/dashboard/biblioteca'}
            >
              Explorar Biblioteca
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};