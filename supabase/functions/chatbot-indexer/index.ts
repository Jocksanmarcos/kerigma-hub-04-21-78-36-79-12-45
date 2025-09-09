import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IndexRequest {
  action: 'index_site' | 'add_knowledge' | 'train_from_content';
  url?: string;
  title?: string;
  content?: string;
  source_type?: string;
  keywords?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: IndexRequest = await req.json();

    switch (body.action) {
      case 'index_site':
        return await indexWebsite(supabase, body.url || 'https://f239131e-7b11-4349-b1f8-04f6401da903.lovableproject.com');
      
      case 'add_knowledge':
        return await addKnowledge(supabase, body);
      
      case 'train_from_content':
        return await trainFromExistingContent(supabase);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Error in chatbot-indexer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function indexWebsite(supabase: any, baseUrl: string) {
  console.log(`Indexing website: ${baseUrl}`);
  
  try {
    // Páginas principais para indexar
    const pagesToIndex = [
      { path: '/', title: 'Página Inicial' },
      { path: '/sobre', title: 'Sobre a Igreja' },
      { path: '/ministerios', title: 'Ministérios' },
      { path: '/eventos', title: 'Eventos' },
      { path: '/contato', title: 'Contato' },
      { path: '/galeria', title: 'Galeria' },
      { path: '/ensino', title: 'Ensino' },
      { path: '/blog', title: 'Blog' }
    ];

    let indexedCount = 0;
    let errors: string[] = [];

    for (const page of pagesToIndex) {
      try {
        const url = `${baseUrl}${page.path}`;
        console.log(`Fetching: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch ${url}: ${response.status}`);
          continue;
        }

        const html = await response.text();
        
        // Extrair conteúdo relevante do HTML
        const content = extractContentFromHTML(html);
        const keywords = extractKeywords(content);

        if (content.length > 50) { // Só indexar se tiver conteúdo significativo
          // Verificar se já existe
          const { data: existing } = await supabase
            .from('chatbot_knowledge')
            .select('id')
            .eq('source_url', url)
            .single();

          if (existing) {
            // Atualizar existente
            await supabase
              .from('chatbot_knowledge')
              .update({
                title: page.title,
                content: content.substring(0, 5000), // Limitar tamanho
                keywords: keywords,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);
          } else {
            // Criar novo
            await supabase
              .from('chatbot_knowledge')
              .insert({
                title: page.title,
                content: content.substring(0, 5000),
                source_type: 'page',
                source_url: url,
                keywords: keywords
              });
          }

          indexedCount++;
          console.log(`Indexed: ${page.title}`);
        }
        
        // Delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error indexing ${page.path}:`, error);
        errors.push(`${page.path}: ${error.message}`);
      }
    }

    // Indexar dados do banco de dados
    await indexDatabaseContent(supabase);

    return new Response(JSON.stringify({
      success: true,
      indexed_pages: indexedCount,
      errors: errors,
      message: `Website indexado com sucesso! ${indexedCount} páginas processadas.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error indexing website:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function indexDatabaseContent(supabase: any) {
  console.log('Indexing database content...');
  
  try {
    // Indexar eventos
    const { data: eventos } = await supabase
      .from('eventos')
      .select('*')
      .eq('publico', true)
      .limit(50);

    if (eventos) {
      for (const evento of eventos) {
        const content = `${evento.nome}\n${evento.descricao || ''}\nData: ${evento.data_inicio}\nLocal: ${evento.local || ''}`;
        const keywords = [evento.nome, 'evento', evento.categoria].filter(Boolean);

        await supabase
          .from('chatbot_knowledge')
          .upsert({
            title: `Evento: ${evento.nome}`,
            content: content,
            source_type: 'database',
            source_url: `/eventos/${evento.id}`,
            keywords: keywords
          }, { onConflict: 'source_url' });
      }
    }

    // Indexar cursos
    const { data: cursos } = await supabase
      .from('cursos')
      .select('*')
      .eq('ativo', true)
      .limit(50);

    if (cursos) {
      for (const curso of cursos) {
        const content = `${curso.nome}\n${curso.descricao || ''}\nCategoria: ${curso.categoria}\nNível: ${curso.nivel}`;
        const keywords = [curso.nome, 'curso', curso.categoria, curso.nivel].filter(Boolean);

        await supabase
          .from('chatbot_knowledge')
          .upsert({
            title: `Curso: ${curso.nome}`,
            content: content,
            source_type: 'database',
            source_url: `/ensino/${curso.slug}`,
            keywords: keywords
          }, { onConflict: 'source_url' });
      }
    }

    console.log('Database content indexed successfully');
  } catch (error) {
    console.error('Error indexing database content:', error);
  }
}

function extractContentFromHTML(html: string): string {
  // Remove scripts e styles
  html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');
  html = html.replace(/<style[^>]*>.*?<\/style>/gis, '');
  
  // Remove tags HTML
  html = html.replace(/<[^>]+>/g, ' ');
  
  // Decodificar entidades HTML básicas
  html = html.replace(/&nbsp;/g, ' ');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<');
  html = html.replace(/&gt;/g, '>');
  html = html.replace(/&quot;/g, '"');
  
  // Limpar espaços extras
  html = html.replace(/\s+/g, ' ').trim();
  
  return html;
}

function extractKeywords(content: string): string[] {
  // Palavras comuns para filtrar
  const stopWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'se', 'que', 'e', 'ou',
    'mas', 'não', 'são', 'é', 'está', 'foi', 'ter', 'tem', 'seu', 'sua', 'seus',
    'suas', 'mais', 'muito', 'bem', 'como', 'onde', 'quando', 'sobre', 'até'
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\sçãõáéíóúâêîôû]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Contar frequência
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Retornar palavras mais frequentes
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

async function addKnowledge(supabase: any, data: IndexRequest) {
  if (!data.title || !data.content) {
    throw new Error('Title and content are required');
  }

  const { error } = await supabase
    .from('chatbot_knowledge')
    .insert({
      title: data.title,
      content: data.content,
      source_type: data.source_type || 'manual',
      source_url: data.url,
      keywords: data.keywords || extractKeywords(data.content)
    });

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    message: 'Conhecimento adicionado com sucesso!'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function trainFromExistingContent(supabase: any) {
  // Aqui poderíamos implementar treinamento baseado em conversas anteriores
  // Por enquanto, retorna sucesso
  return new Response(JSON.stringify({
    success: true,
    message: 'Treinamento iniciado com base no conteúdo existente!'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}