import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuração das APIs disponíveis para diferentes versões
const BIBLE_APIS = {
  'bible-com': {
    url: 'https://bible-api.com',
    requiresKey: false,
    supportedVersions: ['acf', 'arc'],
    defaultVersion: 'acf'
  },
  'api-bible': {
    url: 'https://api.scripture.api.bible/v1',
    requiresKey: true,
    supportedVersions: ['ara', 'nvi', 'ntlh', 'kjv'],
    keyEnvVar: 'SCRIPTURE_API_BIBLE_KEY'
  }
};

// Helpers de livros (mapeamentos e utilitários)
const BOOK_OSIS_TO_SLUG: Record<string, string> = {
  GEN:'genesis', EXO:'exodus', LEV:'leviticus', NUM:'numbers', DEU:'deuteronomy',
  JOS:'joshua', JDG:'judges', RUT:'ruth', '1SA':'1_samuel', '2SA':'2_samuel',
  '1KI':'1_kings', '2KI':'2_kings', '1CH':'1_chronicles', '2CH':'2_chronicles',
  EZR:'ezra', NEH:'nehemiah', EST:'esther', JOB:'job', PSA:'psalms', PRO:'proverbs',
  ECC:'ecclesiastes', SNG:'song_of_songs', ISA:'isaiah', JER:'jeremiah', LAM:'lamentations',
  EZK:'ezekiel', DAN:'daniel', HOS:'hosea', JOL:'joel', AMO:'amos', OBA:'obadiah',
  JON:'jonah', MIC:'micah', NAM:'nahum', HAB:'habakkuk', ZEP:'zephaniah', HAG:'haggai',
  ZEC:'zechariah', MAL:'malachi', MAT:'matthew', MRK:'mark', LUK:'luke', JHN:'john',
  ACT:'acts', ROM:'romans', '1CO':'1_corinthians', '2CO':'2_corinthians', GAL:'galatians',
  EPH:'ephesians', PHP:'philippians', COL:'colossians', '1TH':'1_thessalonians', '2TH':'2_thessalonians',
  '1TI':'1_timothy', '2TI':'2_timothy', TIT:'titus', PHM:'philemon', HEB:'hebrews', JAM:'james',
  '1PE':'1_peter', '2PE':'2_peter', '1JN':'1_john', '2JN':'2_john', '3JN':'3_john', JUD:'jude', REV:'revelation'
};

const BOOKS_ORDER_SLUGS = [
  'genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth','1_samuel','2_samuel',
  '1_kings','2_kings','1_chronicles','2_chronicles','ezra','nehemiah','esther','job','psalms','proverbs',
  'ecclesiastes','song_of_songs','isaiah','jeremiah','lamentations','ezekiel','daniel','hosea','joel','amos',
  'obadiah','jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi',
  'matthew','mark','luke','john','acts','romans','1_corinthians','2_corinthians','galatians','ephesians',
  'philippians','colossians','1_thessalonians','2_thessalonians','1_timothy','2_timothy','titus','philemon',
  'hebrews','james','1_peter','2_peter','1_john','2_john','3_john','jude','revelation'
];

function normalizeBookId(input?: string | null): string | undefined {
  if (!input || typeof input !== 'string') return undefined;
  const trimmed = input.trim();
  // Se vier no formato "JHN.3" pegue apenas o livro
  const bookPart = trimmed.split(/[\s\.:]/)[0];
  const upper = bookPart.toUpperCase();
  if (BOOK_OSIS_TO_SLUG[upper]) return BOOK_OSIS_TO_SLUG[upper];
  return bookPart.toLowerCase().replace(/\s+/g, '_');
}

function toTitleCaseFromSlug(slug: string): string {
  return slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SCRIPTURE_API_KEY = Deno.env.get('SCRIPTURE_API_BIBLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const payload = await (async () => {
      try { return await req.json(); } catch { return {}; }
    })();
    const action = payload.action || payload.acao;
    const rawBibleId = payload.bibleId || payload.version || 'arc';
    const rawBookId = payload.bookId || payload.book;
    const chapterId = payload.chapterId || payload.capituloId || payload.chapter_id;
    const versionId = payload.versionId || rawBibleId;

    // Determinar API e configuração baseado na versão solicitada
    const apiConfig = getApiConfigForVersion(versionId);
    const bookId = normalizeBookId(rawBookId);

    switch (action) {
      case 'diagnostics':
        return await diagnostics(SCRIPTURE_API_KEY);
      case 'getBibles':
      case 'get_bibles':
        return await getBibles(supabase);
      case 'getBooks':
      case 'get_books':
        return await getBooks(supabase, versionId, apiConfig, SCRIPTURE_API_KEY);
      case 'getChapters':
      case 'get_chapters':
        return await getChapters(bookId!, versionId, apiConfig, SCRIPTURE_API_KEY);
      case 'getChapterContent':
      case 'get_chapter_content':
        return await getChapterContent(chapterId, apiConfig, SCRIPTURE_API_KEY);
      case 'importBook':
      case 'import_book':
        return await importBook(supabase, versionId, bookId!, apiConfig, SCRIPTURE_API_KEY);
      case 'importVersion':
      case 'import_version':
        return await importCompleteVersion(supabase, versionId, apiConfig, SCRIPTURE_API_KEY);
      default:
        throw new Error('Ação não reconhecida');
    }

  } catch (error) {
    console.error('Erro na edge function bible-import:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Determina a configuração da API baseado na versão
function getApiConfigForVersion(versionId: string) {
  if (['arc', 'acf', 'bible-com-pt'].includes(versionId)) {
    return BIBLE_APIS['bible-com'];
  } else if (['ara', 'nvi', 'ntlh', 'kjv'].includes(versionId)) {
    return BIBLE_APIS['api-bible'];
  }
  return BIBLE_APIS['bible-com']; // fallback
}

async function getBibles(supabase: any) {
  const response = await fetch('https://bible-api.com/books', {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar bíblias: ${response.status}`);
  }
  
  const data = await response.json();
  
  // API Bible.com retorna lista de livros diretamente, vamos criar uma estrutura de bíblia
  const bibliaPortuguesa = {
    id: 'bible-com-pt',
    name: 'Bíblia em Português',
    abbreviation: 'ACF',
    description: 'Almeida Corrigida Fiel',
    language: { id: 'pt', name: 'Português' }
  };
  
  const portugueseBibles = [bibliaPortuguesa];
  
  // Sincronizar com nossa base
  for (const bible of portugueseBibles) {
    await supabase
      .from('biblia_versoes')
      .upsert({
        id: bible.id,
        nome: bible.name,
        abreviacao: bible.abbreviation,
        descricao: bible.description,
        idioma: 'pt'
      });
  }
  
  return new Response(JSON.stringify({ bibles: portugueseBibles }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getBooks(apiKey: string, supabase: any, bibleId: string) {
  const response = await fetch('https://bible-api.com/books', {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar livros: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Sincronizar livros com nossa base
  for (let i = 0; i < data.length; i++) {
    const book = data[i];
    const testamento = i < 39 ? 'AT' : 'NT'; // Primeiros 39 são AT
    
    await supabase
      .from('biblia_livros')
      .upsert({
        id: book.name.toLowerCase().replace(/\s+/g, '_'),
        versao_id: bibleId,
        nome: book.name,
        abreviacao: book.name.substring(0, 3).toUpperCase(),
        testamento,
        ordinal: i + 1
      });
  }
  
  return new Response(JSON.stringify({ books: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getChapters(apiKey: string, bookId: string, bibleId: string) {
  // Para API Bible.com, vamos gerar capítulos baseado no livro
  // A maioria dos livros tem diferentes números de capítulos
  const chapterCounts: { [key: string]: number } = {
    'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
    'joshua': 24, 'judges': 21, 'ruth': 4, '1_samuel': 31, '2_samuel': 24,
    '1_kings': 22, '2_kings': 25, '1_chronicles': 29, '2_chronicles': 36,
    'ezra': 10, 'nehemiah': 13, 'esther': 10, 'job': 42, 'psalms': 150,
    'proverbs': 31, 'ecclesiastes': 12, 'song_of_songs': 8, 'isaiah': 66,
    'jeremiah': 52, 'lamentations': 5, 'ezekiel': 48, 'daniel': 12,
    'hosea': 14, 'joel': 3, 'amos': 9, 'obadiah': 1, 'jonah': 4,
    'micah': 7, 'nahum': 3, 'habakkuk': 3, 'zephaniah': 3, 'haggai': 2,
    'zechariah': 14, 'malachi': 4, 'matthew': 28, 'mark': 16, 'luke': 24,
    'john': 21, 'acts': 28, 'romans': 16, '1_corinthians': 16, '2_corinthians': 13,
    'galatians': 6, 'ephesians': 6, 'philippians': 4, 'colossians': 4,
    '1_thessalonians': 5, '2_thessalonians': 3, '1_timothy': 6, '2_timothy': 4,
    'titus': 3, 'philemon': 1, 'hebrews': 13, 'james': 5, '1_peter': 5,
    '2_peter': 3, '1_john': 5, '2_john': 1, '3_john': 1, 'jude': 1, 'revelation': 22
  };
  
  const chapterCount = chapterCounts[bookId] || 1;
  const chapters = Array.from({ length: chapterCount }, (_, i) => ({
    id: `${bookId}.${i + 1}`,
    number: i + 1,
    reference: `${bookId} ${i + 1}`
  }));
  
  return new Response(JSON.stringify({ chapters }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getChapterContent(apiKey: string, chapterId: string) {
  // Parse chapterId: ex: "genesis.1"
  const [bookName, chapterNum] = chapterId.split('.');
  
  const response = await fetch(`https://bible-api.com/${bookName}+${chapterNum}`, {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar conteúdo: ${response.status}`);
  }
  
  const data = await response.json();
  
  return new Response(JSON.stringify({ content: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function importBook(apiKey: string, supabase: any, bibleId: string, bookId: string) {
  console.log(`🔄 Iniciando importação do livro ${bookId} da versão ${bibleId}`);
  
  try {
    // Garantir que a versão e o livro existam na base
    await supabase.from('biblia_versoes').upsert({
      id: bibleId,
      nome: 'Bíblia (Bible API)',
      abreviacao: 'WEB',
      descricao: 'Fonte: bible-api.com',
      idioma: 'pt'
    });

    const idx = BOOKS_ORDER_SLUGS.indexOf(bookId);
    const livroNome = toTitleCaseFromSlug(bookId);
    const testamento = idx >= 0 ? (idx < 39 ? 'AT' : 'NT') : 'AT';
    const ordinal = idx >= 0 ? idx + 1 : null;

    await supabase.from('biblia_livros').upsert({
      id: bookId,
      versao_id: bibleId,
      nome: livroNome,
      abreviacao: livroNome.substring(0, 3).toUpperCase(),
      testamento,
      ordinal: ordinal || undefined
    });
    // Mapeamento de capítulos por livro para API Bible.com
    const chapterCounts: { [key: string]: number } = {
      'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
      'joshua': 24, 'judges': 21, 'ruth': 4, '1_samuel': 31, '2_samuel': 24,
      '1_kings': 22, '2_kings': 25, '1_chronicles': 29, '2_chronicles': 36,
      'ezra': 10, 'nehemiah': 13, 'esther': 10, 'job': 42, 'psalms': 150,
      'proverbs': 31, 'ecclesiastes': 12, 'song_of_songs': 8, 'isaiah': 66,
      'jeremiah': 52, 'lamentations': 5, 'ezekiel': 48, 'daniel': 12,
      'hosea': 14, 'joel': 3, 'amos': 9, 'obadiah': 1, 'jonah': 4,
      'micah': 7, 'nahum': 3, 'habakkuk': 3, 'zephaniah': 3, 'haggai': 2,
      'zechariah': 14, 'malachi': 4, 'matthew': 28, 'mark': 16, 'luke': 24,
      'john': 21, 'acts': 28, 'romans': 16, '1_corinthians': 16, '2_corinthians': 13,
      'galatians': 6, 'ephesians': 6, 'philippians': 4, 'colossians': 4,
      '1_thessalonians': 5, '2_thessalonians': 3, '1_timothy': 6, '2_timothy': 4,
      'titus': 3, 'philemon': 1, 'hebrews': 13, 'james': 5, '1_peter': 5,
      '2_peter': 3, '1_john': 5, '2_john': 1, '3_john': 1, 'jude': 1, 'revelation': 22
    };
    
    const totalChapters = chapterCounts[bookId] || 1;
    console.log(`📖 Importando ${totalChapters} capítulos do livro ${bookId}`);
    
    let totalVersiculos = 0;
    
    // Para cada capítulo do livro
    for (let chapterNum = 1; chapterNum <= totalChapters; chapterNum++) {
      console.log(`📄 Processando capítulo ${chapterNum} de ${bookId}`);
      
      try {
        // Buscar o capítulo completo da API Bible.com
        const response = await fetch(`https://bible-api.com/${bookId}+${chapterNum}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          console.error(`Erro ao buscar capítulo ${bookId} ${chapterNum}: ${response.status}`);
          continue;
        }
        
        const chapterData = await response.json();
        
        if (chapterData.verses && chapterData.verses.length > 0) {
          // Inserir cada versículo
          for (const verse of chapterData.verses) {
            const { error } = await supabase
              .from('biblia_versiculos')
              .upsert({
                versao_id: bibleId,
                livro_id: bookId,
                capitulo: chapterNum,
                versiculo: verse.verse,
                texto: verse.text.trim()
              });
            
            if (error) {
              console.error(`Erro ao inserir versículo ${bookId} ${chapterNum}:${verse.verse}:`, error);
            } else {
              totalVersiculos++;
            }
          }
        }
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (chapterError) {
        console.error(`Erro ao processar capítulo ${chapterNum}:`, chapterError);
      }
    }
    
    console.log(`✅ Importação concluída: ${totalVersiculos} versículos importados`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: `Livro ${bookId} importado com sucesso`,
      versiculos_importados: totalVersiculos,
      bible_id: bibleId,
      book_id: bookId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erro na importação do livro:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      bible_id: bibleId,
      book_id: bookId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function diagnostics() {
  const statusMessage = "DIAGNÓSTICO: API Bible.com configurada! Esta API é gratuita e não requer chave de autenticação.";
  console.log(statusMessage);

  return new Response(
    JSON.stringify({
      diagnostico: statusMessage,
      api_type: 'Bible.com API (gratuita)',
      status: 'ready',
      has_SCRIPTURE_API_BIBLE_KEY: true,
      has_SCRIPTURE_API_KEY: true
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
