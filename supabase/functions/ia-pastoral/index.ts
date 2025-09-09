import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, pessoaId, dados } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiKey = Deno.env.get('GEMINI_API_KEY')!;
    
    if (!geminiKey) {
      throw new Error('Gemini API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados da pessoa
    const { data: pessoa, error } = await supabase
      .from('pessoas')
      .select(`
        *,
        profiles(name, level),
        celulas(nome, lider_id),
        congregacoes(nome)
      `)
      .eq('id', pessoaId)
      .single();

    if (error) throw error;

    let prompt = '';
    let systemPrompt = `Você é um assistente pastoral especializado em discipulado e crescimento espiritual. 
    Use uma linguagem carinhosa, pastoral e baseada na Palavra de Deus. 
    Sempre forneça sugestões práticas e biblicamente fundamentadas.`;

    switch (type) {
      case 'analise_perfil':
        prompt = `Analise o perfil espiritual desta pessoa:
        
        Nome: ${pessoa.nome_completo}
        Estado Espiritual: ${pessoa.estado_espiritual}
        Tipo: ${pessoa.tipo_pessoa}
        Situação: ${pessoa.situacao}
        Data Batismo: ${pessoa.data_batismo || 'Não batizado'}
        Congregação: ${pessoa.congregacoes?.nome || 'Não definida'}
        Célula: ${pessoa.celulas?.nome || 'Não participa'}
        
        Forneça uma análise pastoral completa com:
        1. Diagnóstico espiritual atual
        2. Pontos fortes e áreas de crescimento
        3. Próximos passos no discipulado
        4. Sugestões de ministérios adequados
        5. Versículos bíblicos aplicáveis`;
        break;

      case 'sugestoes_discipulado':
        prompt = `Com base no perfil desta pessoa, sugira um plano de discipulado personalizado:
        
        ${JSON.stringify(pessoa, null, 2)}
        
        Contexto adicional: ${dados?.contexto || ''}
        
        Crie um plano com:
        1. Objetivos específicos para os próximos 30, 60 e 90 dias
        2. Estudos bíblicos recomendados
        3. Atividades práticas de crescimento
        4. Indicadores de progresso
        5. Recursos de apoio`;
        break;

      case 'match_ministerio':
        prompt = `Analise o perfil desta pessoa e sugira ministérios onde ela poderia servir:
        
        ${JSON.stringify(pessoa, null, 2)}
        
        Habilidades mencionadas: ${dados?.habilidades || 'Não informado'}
        Interesses: ${dados?.interesses || 'Não informado'}
        
        Sugira:
        1. Ministérios mais adequados ao perfil
        2. Área de crescimento espiritual através do serviço
        3. Como preparar a pessoa para o ministério
        4. Passos práticos para começar`;
        break;

      default:
        throw new Error('Tipo de análise não reconhecido');
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    const aiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${aiResponse.error?.message}`);
    }

    const analise = aiResponse.candidates[0].content.parts[0].text;

    // Salvar análise no banco
    await supabase
      .from('analises_ia_pastoral')
      .insert({
        pessoa_id: pessoaId,
        tipo_analise: type,
        resultado: analise,
        dados_contexto: dados,
        created_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        analise,
        pessoa: pessoa.nome_completo 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in IA Pastoral:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});