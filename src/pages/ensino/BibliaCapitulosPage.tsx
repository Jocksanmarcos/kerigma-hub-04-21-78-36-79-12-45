import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface Chapter {
  id: string;
  numero: number;
  titulo: string;
  versao_id: string;
  livro_id: string;
}

interface Book {
  id: string;
  nome: string;
  abreviacao: string;
  versao_id: string;
}

const BibliaCapitulosPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [versaoSelecionada, setVersaoSelecionada] = useState('9879dbb7cfe39e4d-04');

  useEffect(() => {
    if (bookId && versaoSelecionada) {
      loadChapters();
    }
  }, [bookId, versaoSelecionada]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      
      // Buscar informações do livro
      const { data: bookData, error: bookError } = await supabase
        .from('biblia_livros')
        .select('*')
        .eq('id', bookId)
        .eq('versao_id', versaoSelecionada)
        .single();
      
      if (bookError) throw bookError;
      setBook(bookData);
      
      // Buscar capítulos
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('biblia_capitulos')
        .select('*')
        .eq('livro_id', bookId)
        .eq('versao_id', versaoSelecionada)
        .order('numero');
      
      if (chaptersError) throw chaptersError;
      
      if (chaptersData && chaptersData.length > 0) {
        console.log(`📄 Carregados ${chaptersData.length} capítulos de ${bookData.nome}`);
        setChapters(chaptersData);
      } else {
        toast({
          title: 'Capítulos não encontrados',
          description: 'Não foram encontrados capítulos para este livro.',
          variant: 'destructive'
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar capítulos:', error);
      toast({
        title: 'Erro ao carregar capítulos',
        description: error?.message || 'Não foi possível carregar os capítulos do livro.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterId: string, chapterNumber: number) => {
    navigate(`/ensino/biblia/leitor/${versaoSelecionada}/${bookId}/${chapterId}`, {
      state: { 
        bookName: book?.nome,
        chapterNumber,
        versionId: versaoSelecionada
      }
    });
  };

  return (
    <AppLayout>
      <Helmet>
        <title>{book ? `Capítulos de ${book.nome}` : 'Capítulos'} | Kerigma</title>
        <meta name="description" content={`Navegue pelos capítulos do livro ${book?.nome || 'bíblico'} na versão selecionada.`} />
        <link rel="canonical" href={`${window.location.origin}/ensino/biblia/capitulos/${bookId}`} />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/ensino/biblia/livros')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Livros
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {book ? `Capítulos de ${book.nome}` : 'Carregando...'}
              </h1>
              <p className="text-muted-foreground">Selecione um capítulo para começar a leitura</p>
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
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {Array.from({ length: 30 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : book ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {book.nome}
                <Badge variant="secondary">{chapters.length} capítulos</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {chapters.map((chapter) => (
                  <Button
                    key={chapter.id}
                    variant="outline"
                    className="h-12 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleChapterClick(chapter.id, chapter.numero)}
                  >
                    {chapter.numero}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Livro não encontrado</p>
              <Button onClick={() => navigate('/ensino/biblia/livros')}>
                Voltar aos Livros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default BibliaCapitulosPage;