import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BibleChapter {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
  verseCount: number;
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bibleId, chapterId } = await req.json();

    if (!bibleId || !chapterId) {
      throw new Error('bibleId e chapterId são obrigatórios');
    }

    const bibleApiKey = Deno.env.get('BIBLE_API_KEY');
    if (!bibleApiKey) {
      throw new Error('BIBLE_API_KEY não configurada');
    }

    console.log(`📖 Buscando conteúdo do capítulo: ${chapterId} da versão: ${bibleId}`);

    // Buscar conteúdo do capítulo
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      {
        headers: {
          'api-key': bibleApiKey
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Capítulo não encontrado');
      }
      throw new Error(`Erro da API: ${response.statusText}`);
    }

    const data = await response.json();
    const chapter: BibleChapter = data.data;

    if (!chapter) {
      throw new Error('Nenhum conteúdo encontrado para este capítulo');
    }

    console.log(`✅ Conteúdo carregado: ${chapter.reference} - ${chapter.verseCount} versículos`);

    // Processar o conteúdo para melhor formatação
    let content = chapter.content || '';
    
    // Remover tags HTML desnecessárias, mas manter estrutura
    content = content
      .replace(/<\/?p[^>]*>/g, '\n')  // Substituir <p> por quebras de linha
      .replace(/<\/?div[^>]*>/g, '\n') // Substituir <div> por quebras de linha
      .replace(/<br\s*\/?>/g, '\n')   // Substituir <br> por quebras de linha
      .replace(/\n\s*\n/g, '\n')      // Remover linhas em branco duplas
      .trim();

    return new Response(JSON.stringify({
      success: true,
      chapter: {
        id: chapter.id,
        bibleId: chapter.bibleId,
        bookId: chapter.bookId,
        number: chapter.number,
        reference: chapter.reference,
        verseCount: chapter.verseCount,
        content: content
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro ao buscar conteúdo do capítulo:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});