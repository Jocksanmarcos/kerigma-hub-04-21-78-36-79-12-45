import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BibleVersion {
  id: string;
  name: string;
  nameLocal: string;
  abbreviation: string;
  abbreviationLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
  };
  countries: Array<{
    id: string;
    name: string;
    nameLocal: string;
  }>;
}

interface BibleBook {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
  chapters: Array<{
    id: string;
    bibleId: string;
    number: string;
    bookId: string;
    reference: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const bibleApiKey = Deno.env.get('BIBLE_API_KEY');
    if (!bibleApiKey) {
      throw new Error('BIBLE_API_KEY não configurada');
    }

    console.log('🔄 Iniciando sincronização da estrutura da Bíblia...');

    // 1. Buscar versões em português brasileiro
    console.log('📖 Buscando versões em português...');
    const versionsResponse = await fetch('https://api.scripture.api.bible/v1/bibles?language=por-BR', {
      headers: {
        'api-key': bibleApiKey
      }
    });

    if (!versionsResponse.ok) {
      throw new Error(`Erro ao buscar versões: ${versionsResponse.statusText}`);
    }

    const versionsData = await versionsResponse.json();
    const versions: BibleVersion[] = versionsData.data || [];

    console.log(`✅ Encontradas ${versions.length} versões em português`);

    // 2. Salvar versões no banco
    for (const version of versions) {
      const { error: versionError } = await supabaseClient
        .from('biblia_versoes')
        .upsert({
          id: version.id,
          nome: version.nameLocal || version.name,
          abreviacao: version.abbreviationLocal || version.abbreviation,
          idioma: version.language.nameLocal || version.language.name,
          pais: version.countries.map(c => c.nameLocal || c.name).join(', ')
        }, {
          onConflict: 'id'
        });

      if (versionError) {
        console.error(`❌ Erro ao salvar versão ${version.id}:`, versionError);
        continue;
      }

      console.log(`💾 Versão salva: ${version.nameLocal || version.name} (${version.id})`);

      // 3. Buscar e salvar livros para cada versão
      console.log(`📚 Buscando livros para ${version.id}...`);
      
      const booksResponse = await fetch(`https://api.scripture.api.bible/v1/bibles/${version.id}/books`, {
        headers: {
          'api-key': bibleApiKey
        }
      });

      if (!booksResponse.ok) {
        console.error(`❌ Erro ao buscar livros para ${version.id}: ${booksResponse.statusText}`);
        continue;
      }

      const booksData = await booksResponse.json();
      const books: BibleBook[] = booksData.data || [];

      console.log(`📖 Encontrados ${books.length} livros para ${version.id}`);

      // Salvar livros
      for (const book of books) {
        const { error: bookError } = await supabaseClient
          .from('biblia_livros')
          .upsert({
            id: book.id,
            versao_id: version.id,
            nome: book.nameLong || book.name,
            abreviacao: book.abbreviation,
            ordinal: parseInt(book.id.split('.')[1]) || 0
          }, {
            onConflict: 'id,versao_id'
          });

        if (bookError) {
          console.error(`❌ Erro ao salvar livro ${book.id}:`, bookError);
          continue;
        }

        // Salvar capítulos
        if (book.chapters && book.chapters.length > 0) {
          for (const chapter of book.chapters) {
            const { error: chapterError } = await supabaseClient
              .from('biblia_capitulos')
              .upsert({
                id: chapter.id,
                versao_id: version.id,
                livro_id: book.id,
                numero: parseInt(chapter.number),
                titulo: chapter.reference
              }, {
                onConflict: 'id,versao_id'
              });

            if (chapterError) {
              console.error(`❌ Erro ao salvar capítulo ${chapter.id}:`, chapterError);
            }
          }
          console.log(`📄 Salvos ${book.chapters.length} capítulos para ${book.name}`);
        }
      }

      console.log(`✅ Livros processados para versão ${version.id}`);
    }

    console.log('🎉 Sincronização da estrutura concluída com sucesso!');

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sincronização concluída! ${versions.length} versões processadas.`,
      versions: versions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});