import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SeletorVersaoBiblia } from '@/components/biblia/SeletorVersaoBiblia';
import { Helmet } from 'react-helmet-async';

interface Book {
  id: string;
  nome: string;
  abreviacao: string;
  testamento: string;
  ordinal: number;
}

const BibliaLivrosPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [versaoSelecionada, setVersaoSelecionada] = useState('arc');

  useEffect(() => {
    if (versaoSelecionada) {
      loadBooks();
    }
  }, [versaoSelecionada]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      
      // Buscar livros da base local (estrutura sincronizada)
      const { data: localBooks, error } = await supabase
        .from('biblia_livros')
        .select('*')
        .eq('versao_id', versaoSelecionada)
        .order('ordinal');
      
      if (error) throw error;
      
      if (localBooks && localBooks.length > 0) {
        console.log(`📚 Carregados ${localBooks.length} livros da versão ${versaoSelecionada}`);
        setBooks(localBooks);
      } else {
        // Se não há dados, mostrar opção de sincronizar
        toast({
          title: 'Estrutura não sincronizada',
          description: `A estrutura da versão ${versaoSelecionada} ainda não foi sincronizada. Use o gerenciador de versões para sincronizar.`,
          variant: 'destructive'
        });
        setBooks([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar livros:', error);
      toast({
        title: 'Erro ao carregar livros',
        description: error?.message || 'Não foi possível carregar a lista de livros da Bíblia.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (bookId: string) => {
    navigate(`/ensino/biblia/capitulos/${bookId}`);
  };

  const oldTestamentBooks = books.filter(book => book.testamento === 'AT');
  const newTestamentBooks = books.filter(book => book.testamento === 'NT');

  return (
    <AppLayout>
      <Helmet>
        <title>Livros da Bíblia - Versões | Kerigma</title>
        <meta name="description" content="Navegue pelos livros da Bíblia por testamento e versão bíblica." />
        <link rel="canonical" href={`${window.location.origin}/ensino/biblia/livros`} />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/ensino/biblia')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Leitor
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Livros da Bíblia</h1>
              <p className="text-muted-foreground">Selecione um livro para começar a leitura</p>
            </div>
          </div>
          
          {/* Seletor de Versão */}
          <SeletorVersaoBiblia
            versaoSelecionada={versaoSelecionada}
            onVersaoChange={setVersaoSelecionada}
            showVersionManager={true}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Antigo Testamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Antigo Testamento
                  <Badge variant="secondary">{oldTestamentBooks.length} livros</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {oldTestamentBooks.map((book) => (
                    <Button
                      key={book.id}
                      variant="outline"
                      className="justify-start text-sm h-auto py-2 px-3"
                      onClick={() => handleBookSelect(book.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{book.nome}</div>
                        <div className="text-xs text-muted-foreground">{book.abreviacao}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Novo Testamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Novo Testamento
                  <Badge variant="secondary">{newTestamentBooks.length} livros</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {newTestamentBooks.map((book) => (
                    <Button
                      key={book.id}
                      variant="outline"
                      className="justify-start text-sm h-auto py-2 px-3"
                      onClick={() => handleBookSelect(book.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{book.nome}</div>
                        <div className="text-xs text-muted-foreground">{book.abreviacao}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && books.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhum livro encontrado</p>
              <Button onClick={loadBooks}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default BibliaLivrosPage;