import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, TrendingUp, ExternalLink, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LivroDestaque {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  sinopse?: string;
  imagem_capa_url?: string;
  total_emprestimos: number;
}

export const BibliotecaSitePublico = () => {
  const [livrosDestaque, setLivrosDestaque] = useState<LivroDestaque[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDadosBiblioteca();
  }, []);

  const fetchDadosBiblioteca = async () => {
    try {
      // Buscar livros mais populares
      const { data: livros, error: livrosError } = await supabase
        .from('biblioteca_livros')
        .select(`
          id,
          titulo,
          autor,
          categoria,
          sinopse,
          imagem_capa_url
        `)
        .eq('ativo', true)
        .eq('status', 'Disponível')
        .limit(6);

      if (livrosError) throw livrosError;

      setLivrosDestaque((livros || []).map(livro => ({
        ...livro,
        total_emprestimos: 0 // Placeholder até implementar estatísticas
      })));

      // Buscar categorias únicas
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('biblioteca_livros')
        .select('categoria')
        .eq('ativo', true);

      if (categoriasError) throw categoriasError;

      const categoriasUnicas = [...new Set(categoriasData?.map(item => item.categoria).filter(Boolean))];
      setCategorias(categoriasUnicas);

    } catch (error) {
      console.error('Erro ao carregar dados da biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-[3/4] bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Biblioteca da Igreja
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra nossa coleção de livros cristãos, materiais de estudo e recursos para fortalecer sua fé e conhecimento.
          </p>
        </div>

        {/* Categorias */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categorias.slice(0, 8).map((categoria) => (
              <Badge key={categoria} variant="outline" className="text-sm">
                {categoria}
              </Badge>
            ))}
          </div>
        )}

        {/* Livros em destaque */}
        {livrosDestaque.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {livrosDestaque.map((livro, index) => (
              <Card key={livro.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-[3/4] bg-muted overflow-hidden">
                      {livro.imagem_capa_url ? (
                        <img 
                          src={livro.imagem_capa_url} 
                          alt={livro.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Badge de popularidade */}
                    {index < 3 && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}

                    {/* Tipo de material */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline">
                        📚 Físico
                      </Badge>
                    </div>

                    {/* Indicador de empréstimos */}
                    {livro.total_emprestimos > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {livro.total_emprestimos} empréstimos
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                        {livro.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {livro.autor}
                      </p>
                    </div>
                    
                    <Badge variant="outline" className="mb-3">
                      {livro.categoria}
                    </Badge>
                    
                    {livro.sinopse && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {livro.sinopse}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Disponível na Biblioteca Física – Retire na igreja</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Biblioteca em Construção</h3>
            <p className="text-muted-foreground mb-6">
              Em breve teremos uma vasta coleção de livros e materiais disponíveis.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8 bg-primary/5 border-primary/20">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold mb-2">
                  Quer ter acesso completo à biblioteca?
                </h3>
                <p className="text-muted-foreground">
                  Faça parte da nossa comunidade e tenha acesso a todo o acervo
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/contato'}>
                  Fale Conosco
                </Button>
                <Button onClick={() => window.location.href = '/ensino'}>
                  Ver Cursos
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};