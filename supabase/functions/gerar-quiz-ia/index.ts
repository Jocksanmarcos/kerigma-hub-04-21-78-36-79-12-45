import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Mapeamento de códigos OSIS para IDs dos livros em nossa base
const BOOK_MAPPING: Record<string, string> = {
  'GEN': 'genesis', 'EXO': 'exodus', 'LEV': 'leviticus', 'NUM': 'numbers', 'DEU': 'deuteronomy',
  'JOS': 'joshua', 'JDG': 'judges', 'RUT': 'ruth', '1SA': '1_samuel', '2SA': '2_samuel',
  '1KI': '1_kings', '2KI': '2_kings', '1CH': '1_chronicles', '2CH': '2_chronicles',
  'EZR': 'ezra', 'NEH': 'nehemiah', 'EST': 'esther', 'JOB': 'job', 'PSA': 'psalms',
  'PRO': 'proverbs', 'ECC': 'ecclesiastes', 'SNG': 'song_of_songs', 'ISA': 'isaiah',
  'JER': 'jeremiah', 'LAM': 'lamentations', 'EZK': 'ezekiel', 'DAN': 'daniel',
  'HOS': 'hosea', 'JOL': 'joel', 'AMO': 'amos', 'OBA': 'obadiah', 'JON': 'jonah',
  'MIC': 'micah', 'NAM': 'nahum', 'HAB': 'habakkuk', 'ZEP': 'zephaniah', 'HAG': 'haggai',
  'ZEC': 'zechariah', 'MAL': 'malachi', 'MAT': 'matthew', 'MRK': 'mark', 'LUK': 'luke',
  'JHN': 'john', 'ACT': 'acts', 'ROM': 'romans', '1CO': '1_corinthians', '2CO': '2_corinthians',
  'GAL': 'galatians', 'EPH': 'ephesians', 'PHP': 'philippians', 'COL': 'colossians',
  '1TH': '1_thessalonians', '2TH': '2_thessalonians', '1TI': '1_timothy', '2TI': '2_timothy',
  'TIT': 'titus', 'PHM': 'philemon', 'HEB': 'hebrews', 'JAM': 'james', '1PE': '1_peter',
  '2PE': '2_peter', '1JN': '1_john', '2JN': '2_john', '3JN': '3_john', 'JUD': 'jude', 'REV': 'revelation'
};

// Função para parsear referência bíblica (ex: "ROM.8" -> { livro: "romans", capitulo: 8 })
function parseChapterReference(chapterId: string) {
  const [bookCode, chapterNum] = chapterId.split('.');
  const livroId = BOOK_MAPPING[bookCode?.toUpperCase()];
  const capitulo = parseInt(chapterNum);

  if (!livroId || isNaN(capitulo)) {
    throw new Error(`Referência inválida: ${chapterId}. Use o formato como ROM.8, JHN.3, etc.`);
  }

  return { livroId, capitulo };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verificar autenticação
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pega o ID do capítulo que o admin quer gerar o quiz, vindo do frontend
    const { chapterId } = await req.json(); // Ex: "JHN.3" para João 3
    if (!chapterId) {
      return new Response(
        JSON.stringify({ error: 'ID do capítulo não fornecido' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🤖 Iniciando geração de quiz para capítulo: ${chapterId}`);

    // 1. BUSCAR AS CHAVES SECRETAS
    const googleAiApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    
    if (!googleAiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Chave da API do Google AI não configurada (GOOGLE_AI_API_KEY)' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. BUSCAR A MATÉRIA-PRIMA (O TEXTO BÍBLICO) NO BANCO INTERNO
    console.log(`📖 Buscando texto bíblico no banco para: ${chapterId}`);
    
    const { livroId, capitulo } = parseChapterReference(chapterId);

    // Buscar versículos do capítulo no banco
    const { data: versiculos, error: versiculosError } = await supabaseAdmin
      .from('biblia_versiculos')
      .select(`
        versiculo,
        texto,
        biblia_livros!inner(nome)
      `)
      .eq('versao_id', 'bible-com-pt')
      .eq('livro_id', livroId)
      .eq('capitulo', capitulo)
      .order('versiculo');

    if (versiculosError || !versiculos || versiculos.length === 0) {
      console.error('Erro ao buscar versículos:', versiculosError);
      return new Response(
        JSON.stringify({ error: `Capítulo não encontrado no banco: ${chapterId}. Use a edge function 'bible-import' para importar primeiro.` }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Montar texto do capítulo
    const nomeBookData = versiculos[0].biblia_livros as any;
    const nomeLivro = nomeBookData?.nome || 'Livro';
    const chapterText = versiculos.map(v => `${v.versiculo}. ${v.texto}`).join(' ');
    const chapterReference = `${nomeLivro} ${capitulo}`;

    console.log(`✅ Texto bíblico obtido: ${chapterReference} (${versiculos.length} versículos)`);

    // 3. CRIAR O "MOLDE" PARA O ARTESÃO (O PROMPT PARA A IA)
    const aiPrompt = `
      Você é um assistente teológico especialista em criar conteúdo para discipulado cristão.
      Baseado EXCLUSIVAMENTE no seguinte texto bíblico de ${chapterReference}, crie 3 perguntas de múltipla escolha (com 4 opções cada) para um quiz.
      As perguntas devem testar a compreensão e a atenção aos detalhes do texto.
      Retorne sua resposta APENAS no formato JSON, como um array de objetos, sem nenhum outro texto ou explicação.
      O formato de cada objeto no array deve ser: { "pergunta": "texto da pergunta", "opcoes": [{"id": "A", "texto": "texto da opção A"}, {"id": "B", "texto": "texto da opção B"}, {"id": "C", "texto": "texto da opção C"}, {"id": "D", "texto": "texto da opção D"}], "resposta_correta": "letra da resposta correta" }
      
      Texto Bíblico: """${chapterText}"""
    `;

    // 4. ENVIAR O TRABALHO PARA O ARTESÃO (CHAMAR A API DO GEMINI)
    console.log(`🧠 Enviando texto para IA processar...`);
    
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleAiApiKey}`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: aiPrompt }] }] 
        })
      }
    );

    if (!aiResponse.ok) {
      console.error('Erro na API do Gemini:', await aiResponse.text());
      return new Response(
        JSON.stringify({ error: 'Falha ao comunicar com a API de IA do Google' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log(`🎯 IA respondeu com sucesso`);

    // Extrai e limpa a resposta JSON da IA
    const jsonText = aiData.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const quizJson = JSON.parse(jsonText);

    console.log(`📝 Perguntas geradas: ${quizJson.length}`);

    // 5. ARMAZENAR O PRODUTO FINAL NO NOSSO ESTOQUE (SALVAR NO SUPABASE)
    const perguntasParaInserir = quizJson.map((q: any) => ({
      reference_id: chapterId,
      texto_pergunta: q.pergunta,
      opcoes: q.opcoes,
      resposta_correta: q.resposta_correta,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabaseAdmin
      .from('biblia_quiz_perguntas')
      .insert(perguntasParaInserir);

    if (error) {
      console.error('Erro ao salvar no banco:', error);
      throw error;
    }

    console.log(`✅ Quiz salvo com sucesso no banco de dados`);

    // 6. RETORNAR SUCESSO
    return new Response(
      JSON.stringify({ 
        message: `🎉 Quiz para ${chapterReference} gerado e salvo com sucesso!`,
        perguntas_criadas: quizJson.length,
        capitulo: chapterReference
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("❌ Erro na função gerar-quiz-ia:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})