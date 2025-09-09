import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Clock, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LivroRecomendacao {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  imagem_capa_url?: string;
  status: string;
}

interface BibliotecaPortalAlunoProps {
  cursoAtual?: {
    id: string;
    nome: string;
    categoria: string;
  };
}

export const BibliotecaPortalAluno: React.FC<BibliotecaPortalAlunoProps> = ({ cursoAtual }) => {
  const [recomendacoes, setRecomendacoes] = useState<LivroRecomendacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecomendacoes();
  }, [cursoAtual]);

  const fetchRecomendacoes = async () => {
    try {
      let query = supabase
        .from('biblioteca_livros')
        .select('*')
        .eq('ativo', true)
        .limit(4);

      // Se há um curso atual, filtrar por categoria relacionada
      if (cursoAtual?.categoria) {
        const categoriasRelacionadas = getCategoriasBiblioteca(cursoAtual.categoria);
        query = query.in('categoria', categoriasRelacionadas);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecomendacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoriasBiblioteca = (categoriaCurso: string): string[] => {
    const mapeamento: Record<string, string[]> = {
      'discipulado': ['Discipulado', 'Devocionais', 'Estudos Bíblicos'],
      'lideranca': ['Liderança', 'Gestão', 'Devocionais'],
      'evangelismo': ['Evangelismo', 'Missões', 'Apologética'],
      'familia': ['Família Cristã', 'Relacionamentos', 'Educação'],
      'louvor': ['Música', 'Adoração', 'Devocionais'],
      'default': ['Teologia', 'Devocionais', 'Estudos Bíblicos']
    };
    
    return mapeamento[categoriaCurso] || mapeamento.default;
  };

  const handleAcaoLivro = (livro: LivroRecomendacao) => {
    // Por enquanto, sempre redirecionar para página de reserva
    window.location.href = `/dashboard/biblioteca?reservar=${livro.id}`;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Leituras Recomendadas
        </CardTitle>
        <CardDescription>
          {cursoAtual 
            ? `Livros relacionados ao curso: ${cursoAtual.nome}`
            : 'Livros e materiais para complementar seus estudos'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recomendacoes.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {recomendacoes.map((livro) => (
                <div key={livro.id} className="space-y-2">
                  <div className="relative group">
                    <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                      {livro.imagem_capa_url ? (
                        <img 
                          src={livro.imagem_capa_url} 
                          alt={livro.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Indicador de tipo */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs">
                        📚 Físico
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm line-clamp-2">{livro.titulo}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{livro.autor}</p>
                    <Badge variant="outline" className="text-xs">
                      {livro.categoria}
                    </Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handleAcaoLivro(livro)}
                    disabled={livro.status !== 'Disponível'}
                  >
                    {livro.status === 'Disponível' ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Reservar
                      </>
                    ) : (
                      'Indisponível'
                    )}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => window.location.href = '/dashboard/biblioteca'}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Explorar toda a biblioteca
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma recomendação disponível no momento
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard/biblioteca'}
            >
              Ver catálogo completo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};