import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

interface ChapterContent {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  reference: string;
  verseCount: number;
  content: string;
}

const BibliaLeitorPage: React.FC = () => {
  const { versionId, bookId, chapterId } = useParams<{ 
    versionId: string; 
    bookId: string; 
    chapterId: string; 
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  // Dados passados via state
  const bookName = location.state?.bookName || 'Livro';
  const chapterNumber = location.state?.chapterNumber || 1;

  useEffect(() => {
    if (versionId && bookId && chapterId) {
      loadChapterContent();
      loadChaptersList();
    }
  }, [versionId, bookId, chapterId]);

  const loadChapterContent = async () => {
    try {
      setLoading(true);
      
      console.log(`📖 Carregando capítulo: ${chapterId} da versão: ${versionId}`);
      
      // Chamar a edge function para buscar conteúdo
      const { data, error } = await supabase.functions.invoke('get-chapter-content', {
        body: { 
          bibleId: versionId,
          chapterId: chapterId
        }
      });

      if (error) throw error;

      if (data?.success && data?.chapter) {
        console.log(`✅ Conteúdo carregado: ${data.chapter.reference}`);
        setContent(data.chapter);
      } else {
        throw new Error(data?.error || 'Falha ao carregar conteúdo');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar conteúdo:', error);
      toast({
        title: 'Erro ao carregar capítulo',
        description: error?.message || 'Não foi possível carregar o conteúdo do capítulo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChaptersList = async () => {
    try {
      // Buscar lista de capítulos para navegação
      const { data: chaptersData, error } = await supabase
        .from('biblia_capitulos')
        .select('*')
        .eq('livro_id', bookId)
        .eq('versao_id', versionId)
        .order('numero');
      
      if (error) throw error;
      
      if (chaptersData) {
        setChapters(chaptersData);
        // Encontrar índice do capítulo atual
        const currentIndex = chaptersData.findIndex(ch => ch.id === chapterId);
        setCurrentChapterIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar lista de capítulos:', error);
    }
  };

  const navigateToChapter = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? currentChapterIndex - 1 
      : currentChapterIndex + 1;
    
    if (newIndex >= 0 && newIndex < chapters.length) {
      const newChapter = chapters[newIndex];
      navigate(`/ensino/biblia/leitor/${versionId}/${bookId}/${newChapter.id}`, {
        state: { 
          bookName,
          chapterNumber: newChapter.numero,
          versionId
        }
      });
    }
  };

  const formatContent = (text: string) => {
    if (!text) return '';
    
    // Dividir em versículos e formatar
    const verses = text.split(/(\d+)/);
    const formattedVerses = [];
    
    for (let i = 0; i < verses.length; i += 2) {
      const verseNumber = verses[i + 1];
      const verseText = verses[i + 2];
      
      if (verseNumber && verseText) {
        formattedVerses.push(
          <span key={i} className="verse">
            <sup className="verse-number text-primary font-semibold mr-1">{verseNumber}</sup>
            <span className="verse-text">{verseText.trim()}</span>
          </span>
        );
      }
    }
    
    return formattedVerses;
  };

  return (
    <AppLayout>
      <Helmet>
        <title>{content ? `${content.reference}` : `${bookName} ${chapterNumber}`} | Kerigma</title>
        <meta name="description" content={`Leia ${content?.reference || `${bookName} capítulo ${chapterNumber}`} na versão bíblica selecionada.`} />
        <link rel="canonical" href={`${window.location.origin}/ensino/biblia/leitor/${versionId}/${bookId}/${chapterId}`} />
      </Helmet>
      <div className="space-y-6">
        {/* Header com navegação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/ensino/biblia/capitulos/${bookId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Capítulos
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {content ? content.reference : `${bookName} ${chapterNumber}`}
              </h1>
              {content && (
                <p className="text-muted-foreground">
                  {content.verseCount} versículos
                </p>
              )}
            </div>
          </div>

          {/* Navegação entre capítulos */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToChapter('prev')}
              disabled={currentChapterIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Badge variant="secondary">
              {currentChapterIndex + 1} de {chapters.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToChapter('next')}
              disabled={currentChapterIndex >= chapters.length - 1}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conteúdo do capítulo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {content ? content.reference : `${bookName} ${chapterNumber}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando capítulo...</span>
              </div>
            ) : content ? (
              <div className="prose prose-lg max-w-none">
                <div className="text-lg leading-relaxed space-y-2">
                  {formatContent(content.content)}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Não foi possível carregar o conteúdo</p>
                <Button onClick={loadChapterContent}>
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegação inferior */}
        {chapters.length > 1 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigateToChapter('prev')}
              disabled={currentChapterIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Capítulo Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateToChapter('next')}
              disabled={currentChapterIndex >= chapters.length - 1}
            >
              Próximo Capítulo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BibliaLeitorPage;