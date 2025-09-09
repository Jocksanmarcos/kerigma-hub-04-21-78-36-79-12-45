import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar métricas pastorais
    const { data: metricas, error: metricasError } = await supabase
      .rpc('get_metricas_pastorais');

    if (metricasError) {
      console.error('Erro ao buscar métricas:', metricasError);
      throw metricasError;
    }

    // Buscar membros sem célula
    const { data: membrosSemCelula, error: membrosError } = await supabase
      .from('pessoas')
      .select('id, nome_completo, dons_talentos')
      .eq('situacao', 'ativo')
      .is('celula_id', null)
      .limit(10);

    if (membrosError) {
      console.error('Erro ao buscar membros sem célula:', membrosError);
      throw membrosError;
    }

    // Buscar aniversariantes da semana
    const hoje = new Date();
    const fimSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const { data: aniversariantes, error: aniversariantesError } = await supabase
      .rpc('get_aniversariantes_mes', { mes_param: hoje.getMonth() + 1 });

    if (aniversariantesError) {
      console.error('Erro ao buscar aniversariantes:', aniversariantesError);
    }

    // Preparar contexto para a IA
    const contexto = {
      metricas: metricas || {},
      membros_sem_celula: membrosSemCelula?.length || 0,
      aniversariantes_semana: aniversariantes?.filter(a => a.dias_para_aniversario <= 7)?.length || 0,
      total_membros: metricas?.total_membros || 0
    };

    const prompt = `
    Você é um assistente pastoral inteligente. Analise os dados da igreja e gere 3 insights acionáveis para a liderança.

    DADOS DA IGREJA:
    - Total de membros: ${contexto.total_membros}
    - Novos membros (30 dias): ${contexto.metricas.novos_membros_30d || 0}
    - Visitantes para acompanhar: ${contexto.metricas.visitantes_acompanhar || 0}
    - Membros sem célula: ${contexto.membros_sem_celula}
    - Aniversariantes esta semana: ${contexto.aniversariantes_semana}

    Para cada insight, forneça:
    1. TÍTULO (máximo 50 caracteres)
    2. DESCRIÇÃO (máximo 200 caracteres)
    3. CATEGORIA (uma de: "crescimento", "pastoral", "engajamento", "oportunidade")
    4. PRIORIDADE (uma de: "alta", "media", "baixa")

    Responda em JSON válido no formato:
    {
      "insights": [
        {
          "titulo": "Título do insight",
          "descricao": "Descrição acionável",
          "categoria": "pastoral",
          "prioridade": "alta"
        }
      ]
    }
    `;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const insightsText = aiResponse.candidates[0].content.parts[0].text;

    // Parse JSON response
    let insights;
    try {
      insights = JSON.parse(insightsText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Salvar insights no banco
    for (const insight of insights.insights) {
      await supabase
        .from('insights_pastorais')
        .insert({
          titulo: insight.titulo,
          descricao: insight.descricao,
          categoria: insight.categoria,
          prioridade: insight.prioridade,
          dados_contexto: contexto
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      insights: insights.insights,
      metricas: contexto
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gerar-insights-pastorais:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});