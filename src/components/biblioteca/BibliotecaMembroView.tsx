import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Clock, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Livro {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  imagem_capa_url?: string;
  sinopse?: string;
  status: string;
  numero_copias: number;
}

export const BibliotecaMembroView: React.FC = () => {
  const { data: livros, isLoading } = useQuery({
    queryKey: ['biblioteca-livros-membro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('biblioteca_livros')
        .select('*')
        .eq('ativo', true)
        .order('titulo');
      
      if (error) throw error;
      return data as Livro[];
    }
  });

  const { data: meusEmprestimos } = useQuery({
    queryKey: ['meus-emprestimos'],
    queryFn: async () => {
      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!pessoa) return [];

      const { data, error } = await supabase
        .from('biblioteca_emprestimos')
        .select(`
          *,
          biblioteca_livros (titulo, autor)
        `)
        .eq('pessoa_id', pessoa.id)
        .eq('status', 'Ativo')
        .order('data_emprestimo', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const livrosDisponiveis = livros?.filter(livro => 
    livro.status === 'Disponível' && livro.numero_copias > 0
  );

  const livrosPorCategoria = livros?.reduce((acc, livro) => {
    if (!acc[livro.categoria]) {
      acc[livro.categoria] = [];
    }
    acc[livro.categoria].push(livro);
    return acc;
  }, {} as Record<string, Livro[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
        <p className="text-muted-foreground">
          Explore nosso acervo e faça empréstimos de livros
        </p>
      </div>

      <Tabs defaultValue="acervo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="acervo">Acervo</TabsTrigger>
          <TabsTrigger value="emprestimos">
            Meus Empréstimos
            {meusEmprestimos && meusEmprestimos.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {meusEmprestimos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acervo" className="space-y-4">
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Livros</p>
                    <p className="text-2xl font-bold">{livros?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Disponíveis</p>
                    <p className="text-2xl font-bold">{livrosDisponiveis?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categorias</p>
                    <p className="text-2xl font-bold">{Object.keys(livrosPorCategoria || {}).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de livros por categoria */}
          {livrosPorCategoria && Object.entries(livrosPorCategoria).map(([categoria, livrosCategoria]) => (
            <div key={categoria} className="space-y-3">
              <h3 className="text-lg font-semibold">{categoria}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {livrosCategoria.map((livro) => (
                  <Card key={livro.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        {livro.imagem_capa_url ? (
                          <img 
                            src={livro.imagem_capa_url} 
                            alt={livro.titulo}
                            className="w-16 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium line-clamp-2">{livro.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{livro.autor}</p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={livro.status === 'Disponível' ? 'default' : 'secondary'}
                            >
                              {livro.status}
                            </Badge>
                            {livro.status === 'Disponível' && (
                              <Button size="sm" variant="outline">
                                Solicitar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {livro.sinopse && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {livro.sinopse}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="emprestimos" className="space-y-4">
          {meusEmprestimos && meusEmprestimos.length > 0 ? (
            <div className="space-y-4">
              {meusEmprestimos.map((emprestimo: any) => (
                <Card key={emprestimo.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{emprestimo.biblioteca_livros?.titulo}</h4>
                        <p className="text-sm text-muted-foreground">
                          {emprestimo.biblioteca_livros?.autor}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Emprestado em: {new Date(emprestimo.data_emprestimo).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Ativo</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Devolução: {new Date(emprestimo.data_devolucao_prevista).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum empréstimo ativo</h3>
                <p className="text-muted-foreground">
                  Explore nosso acervo e faça seu primeiro empréstimo!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};