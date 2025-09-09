import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuração das versões da Bíblia em português do Brasil
const BIBLE_VERSIONS = {
  'arc': { id: 'arc', name: 'Almeida Revista e Corrigida', abbreviation: 'ARC' },
  'ara': { id: 'ara', name: 'Almeida Revista e Atualizada', abbreviation: 'ARA' },
  'nvi': { id: 'nvi', name: 'Nova Versão Internacional', abbreviation: 'NVI' },
  'ntlh': { id: 'ntlh', name: 'Nova Tradução na Linguagem de Hoje', abbreviation: 'NTLH' }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = await (async () => {
      try { return await req.json(); } catch { return {}; }
    })();

    const action = payload.action;
    const versionId = payload.versionId || payload.bibleId || 'nvi';

    console.log(`🔧 Ação: ${action}, Versão: ${versionId}`);

    switch (action) {
      case 'diagnostics':
        return await diagnostics();
      
      case 'getAvailableBibles':
        return await getAvailableBibles(supabase);
      
      case 'syncBooksFromVersicles':
        return await syncBooksFromVersicles(supabase, versionId);
      
      case 'getVersions':
        return await getVersions(supabase);
      
      case 'importAllVersions':
        return await importAllVersions(supabase);
      
      case 'importVersion':
        return await importVersion(supabase, versionId);
      
      case 'getBooks':
        return await getBooks(supabase, versionId);
      
      case 'getChapters':
        return await getChapters(payload.bookId, versionId, supabase);
      
      case 'getChapterContent':
        return await getChapterContent(payload.chapterId, versionId, supabase);
      
      default:
        throw new Error(`Ação não reconhecida: ${action}`);
    }

  } catch (error) {
    console.error('Erro na function bible-import-enhanced:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function diagnostics() {
  return new Response(JSON.stringify({
    success: true,
    message: 'Bible Import Enhanced Function está funcionando!',
    timestamp: new Date().toISOString(),
    versions: BIBLE_VERSIONS
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getAvailableBibles(supabase: any) {
  try {
    console.log('🔄 Sincronizando versões disponíveis...');
    
    const versionsToSync = [
      { id: 'arc', nome: 'Almeida Revista e Corrigida', abreviacao: 'ARC', editora: 'Sociedade Bíblica do Brasil', ano_publicacao: 1995, ordem_exibicao: 1 },
      { id: 'ara', nome: 'Almeida Revista e Atualizada', abreviacao: 'ARA', editora: 'Sociedade Bíblica do Brasil', ano_publicacao: 1993, ordem_exibicao: 2 },
      { id: 'nvi', nome: 'Nova Versão Internacional', abreviacao: 'NVI', editora: 'Editora Vida', ano_publicacao: 2000, ordem_exibicao: 3 },
      { id: 'ntlh', nome: 'Nova Tradução na Linguagem de Hoje', abreviacao: 'NTLH', editora: 'Sociedade Bíblica do Brasil', ano_publicacao: 2000, ordem_exibicao: 4 }
    ];

    let syncedCount = 0;
    
    for (const version of versionsToSync) {
      const { error } = await supabase
        .from('biblia_versoes')
        .upsert({
          ...version,
          ativa: true,
          idioma: 'pt',
          codigo_versao: version.abreviacao,
          descricao: `Versão ${version.nome}`
        }, {
          onConflict: 'id'
        });

      if (!error) {
        console.log(`✅ Versão ${version.nome} sincronizada`);
        syncedCount++;
      } else {
        console.error(`❌ Erro ao sincronizar ${version.nome}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      synced_count: syncedCount,
      message: `${syncedCount} versões sincronizadas com sucesso`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao sincronizar versões:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getVersions(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('biblia_versoes')
      .select('*')
      .eq('ativa', true)
      .order('ordem_exibicao');

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      versions: data || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao buscar versões:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function importAllVersions(supabase: any) {
  return new Response(JSON.stringify({
    success: true,
    message: 'Importação de todas as versões não implementada ainda',
    available_versions: Object.keys(BIBLE_VERSIONS)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function importVersion(supabase: any, versionId: string) {
  return new Response(JSON.stringify({
    success: true,
    message: `Importação da versão ${versionId} não implementada ainda`,
    version: BIBLE_VERSIONS[versionId] || null
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function syncBooksFromVersicles(supabase: any, versionId: string) {
  console.log(`🔄 Sincronizando estrutura de livros para versão ${versionId} baseado nos versículos existentes`);
  
  try {
    // Buscar versículos únicos por livro para esta versão
    const { data: uniqueBooks, error: versesError } = await supabase
      .from('biblia_versiculos')
      .select('livro_id')
      .eq('versao_id', versionId);

    if (versesError) {
      console.error('Erro ao buscar versículos únicos:', versesError);
      throw versesError;
    }

    if (!uniqueBooks || uniqueBooks.length === 0) {
      console.log(`⚠️ Nenhum versículo encontrado para versão ${versionId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        synced_books: 0,
        message: `Nenhum versículo encontrado para sincronização da versão ${versionId}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Obter livros únicos
    const uniqueBookIds = [...new Set(uniqueBooks.map(v => v.livro_id))];
    console.log(`🔍 Encontrados ${uniqueBookIds.length} livros únicos nos versículos`);

    let syncedCount = 0;

    for (const bookId of uniqueBookIds) {
      // Verificar se o livro já existe
      const { data: existingBook } = await supabase
        .from('biblia_livros')
        .select('id')
        .eq('id', bookId)
        .eq('versao_id', versionId)
        .maybeSingle();

      if (!existingBook) {
        // Mapear o nome do livro baseado no ID
        const bookInfo = getBookInfoFromId(bookId);
        
        console.log(`📖 Sincronizando livro: ${bookInfo.nome} (${bookId})`);

        const { error: insertError } = await supabase
          .from('biblia_livros')
          .insert({
            id: bookId,
            versao_id: versionId,
            nome: bookInfo.nome,
            abreviacao: bookInfo.abreviacao,
            ordinal: bookInfo.ordinal
          });

        if (insertError) {
          console.error(`❌ Erro ao sincronizar livro ${bookId}:`, insertError);
        } else {
          console.log(`✅ Livro ${bookInfo.nome} sincronizado`);
          syncedCount++;
        }
      }
    }

    console.log(`🎉 Sincronização concluída: ${syncedCount} livros sincronizados para versão ${versionId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      synced_books: syncedCount,
      version_id: versionId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na sincronização de livros:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Função auxiliar para mapear ID do livro para informações
function getBookInfoFromId(bookId: string): {nome: string, abreviacao: string, ordinal: number} {
  const bookMappings: {[key: string]: {nome: string, abreviacao: string, ordinal: number}} = {
    'genesis': { nome: 'Gênesis', abreviacao: 'Gn', ordinal: 1 },
    'exodus': { nome: 'Êxodo', abreviacao: 'Ex', ordinal: 2 },
    'leviticus': { nome: 'Levítico', abreviacao: 'Lv', ordinal: 3 },
    'numbers': { nome: 'Números', abreviacao: 'Nm', ordinal: 4 },
    'deuteronomy': { nome: 'Deuteronômio', abreviacao: 'Dt', ordinal: 5 },
    'joshua': { nome: 'Josué', abreviacao: 'Js', ordinal: 6 },
    'judges': { nome: 'Juízes', abreviacao: 'Jz', ordinal: 7 },
    'ruth': { nome: 'Rute', abreviacao: 'Rt', ordinal: 8 },
    '1_samuel': { nome: '1 Samuel', abreviacao: '1Sm', ordinal: 9 },
    '2_samuel': { nome: '2 Samuel', abreviacao: '2Sm', ordinal: 10 },
    '1_kings': { nome: '1 Reis', abreviacao: '1Rs', ordinal: 11 },
    '2_kings': { nome: '2 Reis', abreviacao: '2Rs', ordinal: 12 },
    '1_chronicles': { nome: '1 Crônicas', abreviacao: '1Cr', ordinal: 13 },
    '2_chronicles': { nome: '2 Crônicas', abreviacao: '2Cr', ordinal: 14 },
    'ezra': { nome: 'Esdras', abreviacao: 'Ed', ordinal: 15 },
    'nehemiah': { nome: 'Neemias', abreviacao: 'Ne', ordinal: 16 },
    'esther': { nome: 'Ester', abreviacao: 'Et', ordinal: 17 },
    'job': { nome: 'Jó', abreviacao: 'Jó', ordinal: 18 },
    'psalms': { nome: 'Salmos', abreviacao: 'Sl', ordinal: 19 },
    'proverbs': { nome: 'Provérbios', abreviacao: 'Pv', ordinal: 20 },
    'ecclesiastes': { nome: 'Eclesiastes', abreviacao: 'Ec', ordinal: 21 },
    'song_of_songs': { nome: 'Cantares', abreviacao: 'Ct', ordinal: 22 },
    'isaiah': { nome: 'Isaías', abreviacao: 'Is', ordinal: 23 },
    'jeremiah': { nome: 'Jeremias', abreviacao: 'Jr', ordinal: 24 },
    'lamentations': { nome: 'Lamentações', abreviacao: 'Lm', ordinal: 25 },
    'ezekiel': { nome: 'Ezequiel', abreviacao: 'Ez', ordinal: 26 },
    'daniel': { nome: 'Daniel', abreviacao: 'Dn', ordinal: 27 },
    'hosea': { nome: 'Oseias', abreviacao: 'Os', ordinal: 28 },
    'joel': { nome: 'Joel', abreviacao: 'Jl', ordinal: 29 },
    'amos': { nome: 'Amós', abreviacao: 'Am', ordinal: 30 },
    'obadiah': { nome: 'Obadias', abreviacao: 'Ob', ordinal: 31 },
    'jonah': { nome: 'Jonas', abreviacao: 'Jn', ordinal: 32 },
    'micah': { nome: 'Miqueias', abreviacao: 'Mq', ordinal: 33 },
    'nahum': { nome: 'Naum', abreviacao: 'Na', ordinal: 34 },
    'habakkuk': { nome: 'Habacuque', abreviacao: 'Hc', ordinal: 35 },
    'zephaniah': { nome: 'Sofonias', abreviacao: 'Sf', ordinal: 36 },
    'haggai': { nome: 'Ageu', abreviacao: 'Ag', ordinal: 37 },
    'zechariah': { nome: 'Zacarias', abreviacao: 'Zc', ordinal: 38 },
    'malachi': { nome: 'Malaquias', abreviacao: 'Ml', ordinal: 39 },
    'matthew': { nome: 'Mateus', abreviacao: 'Mt', ordinal: 40 },
    'mark': { nome: 'Marcos', abreviacao: 'Mc', ordinal: 41 },
    'luke': { nome: 'Lucas', abreviacao: 'Lc', ordinal: 42 },
    'john': { nome: 'João', abreviacao: 'Jo', ordinal: 43 },
    'acts': { nome: 'Atos', abreviacao: 'At', ordinal: 44 },
    'romans': { nome: 'Romanos', abreviacao: 'Rm', ordinal: 45 },
    '1_corinthians': { nome: '1 Coríntios', abreviacao: '1Co', ordinal: 46 },
    '2_corinthians': { nome: '2 Coríntios', abreviacao: '2Co', ordinal: 47 },
    'galatians': { nome: 'Gálatas', abreviacao: 'Gl', ordinal: 48 },
    'ephesians': { nome: 'Efésios', abreviacao: 'Ef', ordinal: 49 },
    'philippians': { nome: 'Filipenses', abreviacao: 'Fp', ordinal: 50 },
    'colossians': { nome: 'Colossenses', abreviacao: 'Cl', ordinal: 51 },
    '1_thessalonians': { nome: '1 Tessalonicenses', abreviacao: '1Ts', ordinal: 52 },
    '2_thessalonians': { nome: '2 Tessalonicenses', abreviacao: '2Ts', ordinal: 53 },
    '1_timothy': { nome: '1 Timóteo', abreviacao: '1Tm', ordinal: 54 },
    '2_timothy': { nome: '2 Timóteo', abreviacao: '2Tm', ordinal: 55 },
    'titus': { nome: 'Tito', abreviacao: 'Tt', ordinal: 56 },
    'philemon': { nome: 'Filemom', abreviacao: 'Fm', ordinal: 57 },
    'hebrews': { nome: 'Hebreus', abreviacao: 'Hb', ordinal: 58 },
    'james': { nome: 'Tiago', abreviacao: 'Tg', ordinal: 59 },
    '1_peter': { nome: '1 Pedro', abreviacao: '1Pe', ordinal: 60 },
    '2_peter': { nome: '2 Pedro', abreviacao: '2Pe', ordinal: 61 },
    '1_john': { nome: '1 João', abreviacao: '1Jo', ordinal: 62 },
    '2_john': { nome: '2 João', abreviacao: '2Jo', ordinal: 63 },
    '3_john': { nome: '3 João', abreviacao: '3Jo', ordinal: 64 },
    'jude': { nome: 'Judas', abreviacao: 'Jd', ordinal: 65 },
    'revelation': { nome: 'Apocalipse', abreviacao: 'Ap', ordinal: 66 }
  };

  return bookMappings[bookId] || { nome: bookId, abreviacao: bookId.substring(0, 3), ordinal: 999 };
}

async function getBooks(supabase: any, versionId: string) {
  console.log(`📚 Buscando livros para versão: ${versionId}`);
  
  try {
    // Primeiro, tentar sincronizar a estrutura de livros baseado nos versículos existentes
    await syncBooksFromVersicles(supabase, versionId);
    
    // Agora buscar os livros estruturados
    const { data: structuredBooks, error: booksError } = await supabase
      .from('biblia_livros')
      .select('*')
      .eq('versao_id', versionId)
      .order('ordinal');

    if (booksError) {
      console.error('Erro ao buscar livros estruturados:', booksError);
      throw booksError;
    }

    if (structuredBooks && structuredBooks.length > 0) {
      console.log(`✅ Encontrados ${structuredBooks.length} livros para ${versionId}`);
      
      const booksWithTestament = structuredBooks.map(book => {
        // Determinar testamento baseado no ordinal ou nome
        const ordinal = book.ordinal || 0;
        let testamento = 'AT'; // Antigo Testamento por padrão
        
        // Livros do Novo Testamento geralmente começam a partir do ordinal 40 (Mateus)
        if (ordinal >= 40 || book.nome.includes('Mateus') || book.nome.includes('Marcos') || 
            book.nome.includes('Lucas') || book.nome.includes('João') || book.nome.includes('Atos')) {
          testamento = 'NT';
        }
        
        return {
          id: book.id,
          nome: book.nome,
          abreviacao: book.abreviacao,
          testamento: testamento,
          total_capitulos: 0 // Será preenchido quando necessário
        };
      });

      return new Response(JSON.stringify({ 
        success: true, 
        books: booksWithTestament
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Se ainda não há livros, retornar lista vazia com aviso
    console.log(`⚠️ Nenhum livro encontrado para versão ${versionId}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      books: [],
      message: `Nenhum livro encontrado para a versão ${versionId}. Verifique se há dados importados.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getChapters(bookId: string, versionId: string, supabase: any) {
  console.log(`📖 Buscando capítulos para livro: ${bookId}, versão: ${versionId}`);
  
  try {
    // Buscar capítulos únicos deste livro nos versículos
    const { data: versesData, error: versesError } = await supabase
      .from('biblia_versiculos')
      .select('capitulo')
      .eq('versao_id', versionId)
      .eq('livro_id', bookId)
      .order('capitulo');

    if (versesError) {
      console.error('Erro ao buscar versículos:', versesError);
      throw versesError;
    }

    if (versesData && versesData.length > 0) {
      // Obter capítulos únicos
      const uniqueChapters = [...new Set(versesData.map(v => v.capitulo))];
      
      const chapters = uniqueChapters.map(chapterNum => ({
        id: `${bookId}.${chapterNum}`,
        number: chapterNum.toString(),
        bibleId: versionId,
        bookId: bookId
      }));

      console.log(`✅ Retornando ${chapters.length} capítulos para ${bookId}`);
      
      return new Response(JSON.stringify({
        success: true,
        chapters: chapters
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`⚠️ Nenhum capítulo encontrado para ${bookId} na versão ${versionId}`);
    
    return new Response(JSON.stringify({
      success: true,
      chapters: [],
      message: `Nenhum capítulo encontrado para o livro ${bookId} na versão ${versionId}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao buscar capítulos:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getChapterContent(chapterId: string, versionId: string, supabase: any) {
  console.log(`🔍 Buscando conteúdo: ${chapterId}, versão ${versionId}`);
  
  // Extrair bookId e chapter number do chapterId
  // Formato esperado: "bookId.chapterNum" (ex: "genesis.1", "exodus.1")
  const parts = chapterId.split('.');
  if (parts.length !== 2) {
    throw new Error(`Formato de chapterId inválido: ${chapterId}. Esperado: "bookId.chapterNum"`);
  }
  
  const [bookId, chapterNum] = parts;
  
  // Primeiro, tentar sincronizar os livros se necessário
  await syncBooksFromVersicles(supabase, versionId);
  
  // Verificar se o livro existe para esta versão
  const { data: bookExists, error: bookError } = await supabase
    .from('biblia_livros')
    .select('nome')
    .eq('id', bookId)
    .eq('versao_id', versionId)
    .maybeSingle();

  if (bookError) {
    console.log(`❌ Erro ao buscar livro ${bookId} na versão ${versionId}:`, bookError);
  }

  // Se o livro não existe na estrutura, mas pode ter versículos, buscar diretamente
  let bookName = bookExists?.nome;
  if (!bookExists) {
    // Usar o mapeamento para obter o nome do livro
    const bookInfo = getBookInfoFromId(bookId);
    bookName = bookInfo.nome;
    console.log(`📖 Livro ${bookId} não estruturado, usando nome mapeado: ${bookName}`);
  }

  // Buscar versículos do capítulo
  const { data: verses, error: versesError } = await supabase
    .from('biblia_versiculos')
    .select('versiculo, texto')
    .eq('versao_id', versionId)
    .eq('livro_id', bookId)
    .eq('capitulo', parseInt(chapterNum))
    .order('versiculo');

  if (versesError) {
    console.error('Erro ao buscar versículos:', versesError);
    throw versesError;
  }

  if (verses && verses.length > 0) {
    const content = verses.map(verse => 
      `<span class="v">${verse.versiculo}</span>${verse.texto}`
    ).join(' ');
    
    console.log(`✅ Encontrados ${verses.length} versículos para ${bookId} ${chapterNum}`);
    
    return new Response(JSON.stringify({
      content: {
        id: chapterId,
        number: chapterNum,
        reference: `${bookName} ${chapterNum}`,
        content: content,
        copyright: getVersionCopyright(versionId)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`❌ Nenhum versículo encontrado para ${bookId} ${chapterNum}, versão ${versionId}`);
  
  // Verificar se há dados para esta versão
  const { count: totalVerses } = await supabase
    .from('biblia_versiculos')
    .select('*', { count: 'exact', head: true })
    .eq('versao_id', versionId);

  let message = '';
  if (!totalVerses || totalVerses === 0) {
    message = `<p>A versão <strong>${versionId.toUpperCase()}</strong> não foi importada ainda. <br><br>Por favor, vá até a página de <strong>Configurações da Bíblia</strong> e importe esta versão primeiro.</p>`;
  } else {
    message = `<p>O capítulo <strong>${bookName} ${chapterNum}</strong> não está disponível na versão <strong>${versionId.toUpperCase()}</strong>. <br><br>Tente outra versão ou verifique se este livro/capítulo existe nesta tradução.</p>`;
  }
  
  return new Response(JSON.stringify({
    content: {
      id: chapterId,
      number: chapterNum,
      reference: `${bookName} ${chapterNum}`,
      content: message,
      copyright: getVersionCopyright(versionId)
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function getVersionCopyright(versionId: string): string {
  const version = BIBLE_VERSIONS[versionId];
  return version ? `${version.name} - Português do Brasil` : `Versão ${versionId.toUpperCase()}`;
}