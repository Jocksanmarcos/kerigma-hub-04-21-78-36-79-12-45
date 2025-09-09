import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Search, Copy, ExternalLink, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VersiculoResultado {
  versao_id: string;
  livro_id: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  livro_nome: string;
  versao_nome: string;
}

export const ConsultaRapidaBiblia: React.FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<VersiculoResultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedTermo, setDebouncedTermo] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermo(termo);
    }, 500);

    return () => clearTimeout(timer);
  }, [termo]);

  // Search effect
  useEffect(() => {
    if (debouncedTermo.length > 2) {
      buscarVersiculos(debouncedTermo);
    } else {
      setResultados([]);
    }
  }, [debouncedTermo]);

  const parseReferencia = (input: string) => {
    // Parse referencias como "gn 1:1", "salmos 91", "joão 3:16", etc.
    const patterns = [
      // Padrão completo: livro capitulo:versiculo
      /^(\w+)\s*(\d+):(\d+)$/i,
      // Padrão capítulo: livro capitulo
      /^(\w+)\s*(\d+)$/i,
    ];

    for (const pattern of patterns) {
      const match = input.trim().match(pattern);
      if (match) {
        return {
          livro: match[1].toLowerCase(),
          capitulo: parseInt(match[2]),
          versiculo: match[3] ? parseInt(match[3]) : null
        };
      }
    }
    return null;
  };

  const buscarVersiculos = async (busca: string) => {
    setLoading(true);
    try {
      // Verificar se há dados na base primeiro
      const { count } = await supabase
        .from('biblia_versiculos')
        .select('*', { count: 'exact', head: true });
      
      if (!count || count === 0) {
        toast({
          title: 'Base de dados vazia',
          description: 'É necessário importar os dados da Bíblia primeiro. Use o botão "Importar Dados".',
          variant: 'destructive'
        });
        setResultados([]);
        return;
      }

      const referencia = parseReferencia(busca);
      
      if (referencia) {
        // Busca específica por referência
        await buscarPorReferencia(referencia);
      } else {
        // Busca por texto completo
        await buscarPorTexto(busca);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({ 
        title: 'Erro na busca', 
        description: 'Não foi possível realizar a busca. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarPorReferencia = async (ref: { livro: string; capitulo: number; versiculo?: number | null }) => {
    // Mapeamento de abreviações comuns para IDs dos livros
    const abrevMap: Record<string, string> = {
      'gn': 'genesis', 'gen': 'genesis', 'genesis': 'genesis',
      'ex': 'exodus', 'exo': 'exodus', 'exodus': 'exodus',
      'lv': 'leviticus', 'lev': 'leviticus', 'levitico': 'leviticus',
      'nm': 'numbers', 'num': 'numbers', 'numeros': 'numbers',
      'dt': 'deuteronomy', 'deu': 'deuteronomy', 'deuteronomio': 'deuteronomy',
      'js': 'joshua', 'jos': 'joshua', 'josue': 'joshua',
      'jz': 'judges', 'jui': 'judges', 'juizes': 'judges',
      'rt': 'ruth', 'rut': 'ruth', 'rute': 'ruth',
      '1sm': '1_samuel', '1sa': '1_samuel', '1samuel': '1_samuel',
      '2sm': '2_samuel', '2sa': '2_samuel', '2samuel': '2_samuel',
      'sl': 'psalms', 'sal': 'psalms', 'salmos': 'psalms',
      'pv': 'proverbs', 'pro': 'proverbs', 'proverbios': 'proverbs',
      'is': 'isaiah', 'isa': 'isaiah', 'isaias': 'isaiah',
      'mt': 'matthew', 'mat': 'matthew', 'mateus': 'matthew',
      'mc': 'mark', 'mar': 'mark', 'marcos': 'mark',
      'lc': 'luke', 'luc': 'luke', 'lucas': 'luke',
      'jo': 'john', 'joh': 'john', 'joao': 'john',
      'at': 'acts', 'ato': 'acts', 'atos': 'acts',
      'rm': 'romans', 'rom': 'romans', 'romanos': 'romans',
      '1co': '1_corinthians', '1cor': '1_corinthians', '1corintios': '1_corinthians',
      '2co': '2_corinthians', '2cor': '2_corinthians', '2corintios': '2_corinthians',
      'gl': 'galatians', 'gal': 'galatians', 'galatas': 'galatians',
      'ef': 'ephesians', 'efe': 'ephesians', 'efesios': 'ephesians',
      'fp': 'philippians', 'fil': 'philippians', 'filipenses': 'philippians',
      'cl': 'colossians', 'col': 'colossians', 'colossenses': 'colossians',
      '1ts': '1_thessalonians', '1te': '1_thessalonians', '1tessalonicenses': '1_thessalonians',
      '2ts': '2_thessalonians', '2te': '2_thessalonians', '2tessalonicenses': '2_thessalonians',
      '1tm': '1_timothy', '1ti': '1_timothy', '1timoteo': '1_timothy',
      '2tm': '2_timothy', '2ti': '2_timothy', '2timoteo': '2_timothy',
      'tt': 'titus', 'tit': 'titus', 'tito': 'titus',
      'fm': 'philemon', 'flm': 'philemon', 'filemom': 'philemon',
      'hb': 'hebrews', 'heb': 'hebrews', 'hebreus': 'hebrews',
      'tg': 'james', 'tia': 'james', 'tiago': 'james',
      '1pe': '1_peter', '1pd': '1_peter', '1pedro': '1_peter',
      '2pe': '2_peter', '2pd': '2_peter', '2pedro': '2_peter',
      '1jo': '1_john', '1jn': '1_john', '1joao': '1_john',
      '2jo': '2_john', '2jn': '2_john', '2joao': '2_john',
      '3jo': '3_john', '3jn': '3_john', '3joao': '3_john',
      'jd': 'jude', 'jud': 'jude', 'judas': 'jude',
      'ap': 'revelation', 'apo': 'revelation', 'apocalipse': 'revelation'
    };

    // Tentar mapear a abreviação para o ID do livro
    const bookId = abrevMap[ref.livro.toLowerCase()];
    
    if (!bookId) {
      // Se não encontrou na abreviação, tentar busca direta no banco
      const { data: livros } = await supabase
        .from('biblia_livros')
        .select('id, nome, versao_id')
        .or(`nome.ilike.*${ref.livro}*,abreviacao.ilike.*${ref.livro}*`)
        .limit(1);

      if (!livros || livros.length === 0) {
        setResultados([]);
        return;
      }
      var livro = livros[0];
    } else {
      // Buscar o livro pelo ID mapeado
      const { data: livros } = await supabase
        .from('biblia_livros')
        .select('id, nome, versao_id')
        .eq('id', bookId)
        .limit(1);

      if (!livros || livros.length === 0) {
        setResultados([]);
        return;
      }
      var livro = livros[0];
    }

    // Then, search for verses
    let query = supabase
      .from('biblia_versiculos')
      .select('*')
      .eq('livro_id', livro.id)
      .eq('capitulo', ref.capitulo);

    if (ref.versiculo) {
      query = query.eq('versiculo', ref.versiculo);
    }

    const { data: versiculos } = await query.limit(20);
    
    if (versiculos) {
      // Get version name
      const { data: versao } = await supabase
        .from('biblia_versoes')
        .select('nome')
        .eq('id', livro.versao_id)
        .single();

      setResultados(versiculos.map(item => ({
        versao_id: item.versao_id,
        livro_id: item.livro_id,
        livro_nome: livro.nome,
        capitulo: item.capitulo,
        versiculo: item.versiculo,
        texto: item.texto,
        versao_nome: versao?.nome || 'Versão desconhecida'
      })));
    }
  };

  const buscarPorTexto = async (texto: string) => {
    const { data: versiculos } = await supabase
      .from('biblia_versiculos')
      .select('*')
      .textSearch('texto', texto.split(' ').join(' & '))
      .limit(15);

    if (versiculos && versiculos.length > 0) {
      // Get unique book and version IDs
      const livroIds = [...new Set(versiculos.map(v => v.livro_id))];
      const versaoIds = [...new Set(versiculos.map(v => v.versao_id))];

      // Fetch book names
      const { data: livros } = await supabase
        .from('biblia_livros')
        .select('id, nome')
        .in('id', livroIds);

      // Fetch version names
      const { data: versoes } = await supabase
        .from('biblia_versoes')
        .select('id, nome')
        .in('id', versaoIds);

      // Create lookup maps
      const livroMap = Object.fromEntries(livros?.map(l => [l.id, l.nome]) || []);
      const versaoMap = Object.fromEntries(versoes?.map(v => [v.id, v.nome]) || []);

      setResultados(versiculos.map(item => ({
        versao_id: item.versao_id,
        livro_id: item.livro_id,
        livro_nome: livroMap[item.livro_id] || 'Livro desconhecido',
        capitulo: item.capitulo,
        versiculo: item.versiculo,
        texto: item.texto,
        versao_nome: versaoMap[item.versao_id] || 'Versão desconhecida'
      })));
    }
  };

  const copiarVersiculo = (versiculo: VersiculoResultado) => {
    const texto = `${versiculo.texto} - ${versiculo.livro_nome} ${versiculo.capitulo}:${versiculo.versiculo}`;
    navigator.clipboard.writeText(texto);
    toast({ title: 'Versículo copiado!' });
  };

  const importarDados = async () => {
    setLoading(true);
    try {
      toast({
        title: 'Sincronizando estrutura...',
        description: 'Organizando os dados da Bíblia. Aguarde...'
      });

      // Sincronizar estrutura de livros baseada nos versículos existentes
      await supabase.functions.invoke('bible-import-enhanced', {
        body: { 
          action: 'syncBooksFromVersicles',
          versionId: 'bible-com-pt'
        }
      });

      toast({
        title: 'Estrutura sincronizada!',
        description: 'Dados organizados com sucesso. Agora você pode fazer buscas.'
      });
      
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível organizar os dados. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirBiblia = () => {
    setIsOpen(false);
    window.location.href = '/jornada/biblia/enhanced';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Bíblia</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Busca Inteligente da Bíblia
            </span>
            <Button variant="outline" size="sm" onClick={abrirBiblia}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Leitor
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite 'gn 1:1', 'salmos 91' ou busque por palavras..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 flex-1" />
                </div>
              ))}
            </div>
          )}

          {!loading && resultados.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {resultados.map((versiculo) => (
                <div 
                  key={`${versiculo.versao_id}-${versiculo.livro_id}-${versiculo.capitulo}-${versiculo.versiculo}`}
                  className="group flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Badge variant="outline" className="shrink-0 mt-1">
                    {versiculo.livro_nome} {versiculo.capitulo}:{versiculo.versiculo}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{versiculo.texto}</p>
                    <p className="text-xs text-muted-foreground mt-1">{versiculo.versao_nome}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copiarVersiculo(versiculo)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && termo.length > 2 && resultados.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum versículo encontrado</p>
              <p className="text-sm mt-1">Tente outras palavras-chave ou referências</p>
               <div className="mt-4">
                 <Button onClick={importarDados} disabled={loading}>
                   <Download className="h-4 w-4 mr-2" />
                   Sincronizar Dados
                 </Button>
               </div>
            </div>
          )}

          {!loading && termo.length <= 2 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Busque versículos por referência ou palavras</p>
              <div className="text-sm mt-2 space-y-1">
                <p>Exemplos: <code className="px-2 py-1 bg-muted rounded">gn 1:1</code></p>
                <p><code className="px-2 py-1 bg-muted rounded">salmos 91</code> ou <code className="px-2 py-1 bg-muted rounded">amor esperança</code></p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};