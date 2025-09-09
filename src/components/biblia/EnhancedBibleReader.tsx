import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Search,
  Type,
  Moon,
  Sun,
  Copy,
  Share,
  Bookmark,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SeletorVersaoBiblia } from './SeletorVersaoBiblia';
import { cn } from '@/lib/utils';

interface Book {
  id: string;
  nome: string;
  abreviacao: string;
  testamento: string;
  total_capitulos: number;
}

interface Chapter {
  id: string;
  number: string;
  bibleId: string;
  bookId: string;
}

interface ChapterContent {
  id: string;
  number: string;
  content: string;
  reference: string;
  copyright: string;
}

interface ReadingPreferences {
  fontSize: number;
  isDarkMode: boolean;
  isVerseByVerse: boolean;
  maxWidth: 'narrow' | 'normal' | 'wide';
}

export const EnhancedBibleReader: React.FC = () => {
  const { toast } = useToast();
  
  // Estados principais
  const [versaoSelecionada, setVersaoSelecionada] = useState('nvi');
  const [livros, setLivros] = useState<Book[]>([]);
  const [livroSelecionado, setLivroSelecionado] = useState<string>('');
  const [capitulos, setCapitulos] = useState<Chapter[]>([]);
  const [capituloSelecionado, setCapituloSelecionado] = useState<string>('');
  const [conteudoCapitulo, setConteudoCapitulo] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState({
    livros: false,
    capitulos: false,
    conteudo: false
  });

  // Estados de interface
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  
  // Preferências de leitura
  const [preferences, setPreferences] = useState<ReadingPreferences>({
    fontSize: 16,
    isDarkMode: false,
    isVerseByVerse: false,
    maxWidth: 'normal'
  });

  // Carregar livros quando versão mudar
  useEffect(() => {
    if (versaoSelecionada) {
      carregarLivros();
    }
  }, [versaoSelecionada]);

  // Carregar capítulos quando livro mudar
  useEffect(() => {
    if (livroSelecionado && versaoSelecionada) {
      carregarCapitulos();
    }
  }, [livroSelecionado, versaoSelecionada]);

  // Carregar conteúdo quando capítulo mudar
  useEffect(() => {
    if (capituloSelecionado && versaoSelecionada) {
      carregarConteudoCapitulo();
    }
  }, [capituloSelecionado, versaoSelecionada]);

  const carregarLivros = async () => {
    try {
      setLoading(prev => ({ ...prev, livros: true }));
      
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: {
          action: 'getBooks',
          versionId: versaoSelecionada
        }
      });

      if (error) throw error;

      if (data?.books) {
        setLivros(data.books);
        
        // Auto-selecionar Gênesis se disponível, caso contrário o primeiro livro
        if (!livroSelecionado && data.books.length > 0) {
          const genesis = data.books.find((book: Book) => book.id === 'genesis');
          setLivroSelecionado(genesis ? genesis.id : data.books[0].id);
        }
      } else {
        console.warn('Nenhum livro retornado para a versão:', versaoSelecionada);
        setLivros([]);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      toast({
        title: 'Erro ao carregar livros',
        description: 'Não foi possível carregar a lista de livros. Verifique se a versão foi importada.',
        variant: 'destructive'
      });
      setLivros([]);
    } finally {
      setLoading(prev => ({ ...prev, livros: false }));
    }
  };

  const carregarCapitulos = async () => {
    try {
      setLoading(prev => ({ ...prev, capitulos: true }));
      
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: {
          action: 'getChapters',
          bookId: livroSelecionado,
          versionId: versaoSelecionada
        }
      });

      if (error) throw error;

      if (data?.chapters) {
        setCapitulos(data.chapters);
        
        if (!capituloSelecionado && data.chapters.length > 0) {
          setCapituloSelecionado(data.chapters[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar capítulos:', error);
      toast({
        title: 'Erro ao carregar capítulos',
        description: 'Não foi possível carregar a lista de capítulos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, capitulos: false }));
    }
  };

  const carregarConteudoCapitulo = async () => {
    try {
      setLoading(prev => ({ ...prev, conteudo: true }));
      setConteudoCapitulo(null); // Limpar conteúdo anterior
      
      const { data, error } = await supabase.functions.invoke('bible-import-enhanced', {
        body: {
          action: 'getChapterContent',
          chapterId: capituloSelecionado,
          versionId: versaoSelecionada
        }
      });

      if (error) throw error;

      if (data?.content) {
        setConteudoCapitulo(data.content);
      } else {
        console.warn('Conteúdo não encontrado para:', capituloSelecionado);
        setConteudoCapitulo({
          id: capituloSelecionado,
          number: '1',
          content: '<p>Conteúdo não disponível para este capítulo.</p>',
          reference: 'Capítulo não encontrado',
          copyright: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      const errorMessage = error?.message || 'Não foi possível carregar o conteúdo do capítulo.';
      toast({
        title: 'Erro ao carregar capítulo',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Mostrar mensagem de erro no conteúdo
      setConteudoCapitulo({
        id: capituloSelecionado,
        number: '1',
        content: `<p class="text-center text-muted-foreground">${errorMessage}</p>`,
        reference: 'Erro',
        copyright: ''
      });
    } finally {
      setLoading(prev => ({ ...prev, conteudo: false }));
    }
  };

  const navegarCapitulo = (direcao: 'anterior' | 'proximo') => {
    const indiceAtual = capitulos.findIndex(cap => cap.id === capituloSelecionado);
    
    if (direcao === 'anterior' && indiceAtual > 0) {
      setCapituloSelecionado(capitulos[indiceAtual - 1].id);
    } else if (direcao === 'proximo' && indiceAtual < capitulos.length - 1) {
      setCapituloSelecionado(capitulos[indiceAtual + 1].id);
    }
  };

  const copiarTexto = () => {
    if (conteudoCapitulo) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = conteudoCapitulo.content;
      const textoLimpo = tempElement.textContent || tempElement.innerText || '';
      
      const textoCompleto = `${conteudoCapitulo.reference}\n\n${textoLimpo}\n\n${conteudoCapitulo.copyright}`;
      navigator.clipboard.writeText(textoCompleto);
      
      toast({
        title: 'Texto copiado!',
        description: 'O texto foi copiado para a área de transferência.'
      });
    }
  };

  const compartilhar = async () => {
    if (conteudoCapitulo && navigator.share) {
      try {
        await navigator.share({
          title: conteudoCapitulo.reference,
          text: conteudoCapitulo.reference,
          url: window.location.href
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      copiarTexto();
    }
  };

  const livroAtual = livros.find(l => l.id === livroSelecionado);
  const capituloAtual = capitulos.find(c => c.id === capituloSelecionado);
  const livrosFiltrados = livros.filter(l => 
    l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.abreviacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaxWidth = () => {
    switch (preferences.maxWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'wide': return 'max-w-6xl';
      default: return 'max-w-4xl';
    }
  };

  return (
    <div className={cn("min-h-screen", preferences.isDarkMode && "dark")}>
      {/* Fixed Navigation Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarCapitulo('anterior')}
                disabled={capitulos.length === 0 || capitulos.findIndex(c => c.id === capituloSelecionado) === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Anterior</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarCapitulo('proximo')}
                disabled={capitulos.length === 0 || capitulos.findIndex(c => c.id === capituloSelecionado) === capitulos.length - 1}
              >
                <span className="hidden sm:inline mr-1">Próximo</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Center: Book Chapter Selector */}
            <Dialog open={showBookSelector} onOpenChange={setShowBookSelector}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 max-w-xs mx-4">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="truncate">
                    {livroAtual?.abreviacao} {capituloAtual?.number || ''}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Livro e Capítulo</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar livro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {livrosFiltrados.map((livro) => (
                      <Button
                        key={livro.id}
                        variant={livroSelecionado === livro.id ? "default" : "outline"}
                        className="justify-start h-auto p-3"
                        onClick={() => {
                          setLivroSelecionado(livro.id);
                          setSearchTerm('');
                          setShowBookSelector(false);
                        }}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {livro.abreviacao}
                            </Badge>
                            <span className="font-medium">{livro.nome}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {livro.total_capitulos} capítulos • {livro.testamento}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Right: Version Selector & Settings */}
            <div className="flex items-center gap-2">
              <SeletorVersaoBiblia
                versaoSelecionada={versaoSelecionada}
                onVersaoChange={setVersaoSelecionada}
              />
              
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Type className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurações de Leitura</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Font Size */}
                    <div className="space-y-2">
                      <Label>Tamanho da Fonte</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreferences(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 2) }))}
                        >
                          A
                        </Button>
                        <span className="text-sm font-medium min-w-[60px] text-center">
                          {preferences.fontSize}px
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreferences(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 2) }))}
                        >
                          <span className="text-lg">A</span>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Reading Layout */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Layout Verso a Verso</Label>
                        <div className="text-sm text-muted-foreground">
                          Cada versículo em uma linha separada
                        </div>
                      </div>
                      <Switch
                        checked={preferences.isVerseByVerse}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, isVerseByVerse: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    {/* Max Width */}
                    <div className="space-y-2">
                      <Label>Largura do Texto</Label>
                      <Select
                        value={preferences.maxWidth}
                        onValueChange={(value: 'narrow' | 'normal' | 'wide') =>
                          setPreferences(prev => ({ ...prev, maxWidth: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrow">Estreita (foco máximo)</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="wide">Larga</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo Escuro</Label>
                        <div className="text-sm text-muted-foreground">
                          Melhor para leitura noturna
                        </div>
                      </div>
                      <Switch
                        checked={preferences.isDarkMode}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, isDarkMode: checked }))
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div className="container mx-auto px-4 py-8">
        <div className={cn("mx-auto", getMaxWidth())}>
          {loading.conteudo ? (
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : conteudoCapitulo ? (
            <Card>
              <CardContent className="p-8">
                {/* Chapter Title */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-primary mb-2">
                    {conteudoCapitulo.reference}
                  </h1>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={copiarTexto}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button variant="outline" size="sm" onClick={compartilhar}>
                      <Share className="h-4 w-4 mr-1" />
                      Compartilhar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-1" />
                      Marcar
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Anotar
                    </Button>
                  </div>
                </div>

                {/* Bible Text */}
                <div 
                  className={cn(
                    "prose prose-slate max-w-none dark:prose-invert leading-relaxed",
                    preferences.isVerseByVerse && "space-y-3",
                    // Custom verse styling
                    "[&_.v]:inline-block [&_.v]:text-xs [&_.v]:font-bold",
                    "[&_.v]:text-primary [&_.v]:bg-primary/10 [&_.v]:px-2 [&_.v]:py-1",
                    "[&_.v]:rounded-full [&_.v]:mr-3 [&_.v]:min-w-[24px] [&_.v]:text-center",
                    "[&_.v]:border [&_.v]:border-primary/20",
                    // Verse by verse layout
                    preferences.isVerseByVerse && "[&_p]:flex [&_p]:items-start [&_p]:mb-4",
                    // Selectable verses
                    "[&_.v]:cursor-pointer [&_.v]:hover:bg-primary/20",
                    "[&_.v]:transition-colors"
                  )}
                  style={{ fontSize: `${preferences.fontSize}px` }}
                  dangerouslySetInnerHTML={{ __html: conteudoCapitulo.content }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('v')) {
                      const verseNumber = target.textContent;
                      setSelectedVerse(verseNumber);
                      toast({
                        title: `Versículo ${verseNumber} selecionado`,
                        description: 'Use os botões de ação para destacar, anotar ou compartilhar.'
                      });
                    }
                  }}
                />
                
                {/* Copyright */}
                {conteudoCapitulo.copyright && (
                  <div className="border-t mt-8 pt-6">
                    <p className="text-xs text-muted-foreground text-center">
                      {conteudoCapitulo.copyright}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Leitor Bíblico</h2>
                <p className="text-muted-foreground mb-6">
                  Selecione uma versão, livro e capítulo para começar sua jornada de estudo
                </p>
                <Button onClick={() => setShowBookSelector(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Escolher Livro
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};