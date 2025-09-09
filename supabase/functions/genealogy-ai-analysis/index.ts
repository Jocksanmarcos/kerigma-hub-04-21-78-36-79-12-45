import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pessoaId, tipoAnalise = 'sugestoes_vinculos' } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados genealógicos básicos usando a função do banco
    const { data: dadosBasicos, error: errorBasicos } = await supabase
      .rpc('analisar_genealogia_com_ia', {
        p_pessoa_id: pessoaId,
        p_tipo_analise: tipoAnalise
      });

    if (errorBasicos) {
      console.error('Erro ao buscar dados básicos:', errorBasicos);
      throw new Error('Erro ao buscar dados genealógicos básicos');
    }

    // Buscar informações adicionais para análise de IA
    const { data: pessoas, error: errorPessoas } = await supabase
      .from('pessoas')
      .select(`
        id, nome_completo, data_nascimento, genero, pai_id, mae_id,
        endereco, cidade, telefone, email, created_at
      `)
      .eq('situacao', 'ativo')
      .order('nome_completo');

    if (errorPessoas) {
      console.error('Erro ao buscar pessoas:', errorPessoas);
      throw new Error('Erro ao buscar dados das pessoas');
    }

    // Preparar contexto para IA
    const contextoIA = {
      pessoa_analisada: dadosBasicos.pessoa || null,
      total_pessoas: pessoas?.length || 0,
      sugestoes_banco: {
        possiveis_pais: dadosBasicos.possiveis_pais || [],
        possiveis_filhos: dadosBasicos.possiveis_filhos || []
      },
      inconsistencias_detectadas: dadosBasicos.inconsistencias || [],
      pessoas_cadastradas: pessoas?.slice(0, 50) || [] // Limitar para não sobrecarregar a IA
    };

    // Prompt para análise da IA
    const prompt = `
Você é um especialista em análise genealógica e precisa analisar os dados familiares de uma igreja.

CONTEXTO:
- Pessoa analisada: ${JSON.stringify(contextoIA.pessoa_analisada, null, 2)}
- Total de pessoas no sistema: ${contextoIA.total_pessoas}
- Sugestões do sistema: ${JSON.stringify(contextoIA.sugestoes_banco, null, 2)}

TAREFA: Análise genealógica inteligente

INSTRUÇÕES:
1. Analise os nomes das pessoas para identificar padrões familiares (sobrenomes, nomes compostos)
2. Considere idades compatíveis para relações pai/filho/mãe (diferença mínima de 15 anos)
3. Identifique possíveis vínculos familiares baseados em:
   - Similaridade de sobrenomes
   - Proximidade de endereços
   - Datas de nascimento compatíveis
4. Detecte inconsistências genealógicas
5. Sugira melhorias na estrutura familiar

FORMATO DE RESPOSTA (JSON):
{
  "analise_ia": {
    "confianca": 0.85,
    "sugestoes_vinculos": [
      {
        "pessoa_origem": "id_pessoa",
        "pessoa_destino": "id_pessoa",
        "tipo_vinculo": "pai|mae|filho|filha",
        "confianca": 0.9,
        "motivos": ["mesmo sobrenome", "idade compatível", "mesmo endereço"],
        "prioridade": "alta|media|baixa"
      }
    ],
    "inconsistencias_detectadas": [
      {
        "tipo": "idade_incompativel|sobrenome_diferente|falta_vinculos",
        "descricao": "Descrição clara do problema",
        "pessoas_envolvidas": ["id1", "id2"],
        "sugestao_correcao": "Como corrigir"
      }
    ],
    "insights_familias": [
      {
        "familia_identificada": "Sobrenome Silva",
        "membros_estimados": 5,
        "completude": 0.6,
        "sugestoes_melhorias": "Adicionar vínculos faltantes"
      }
    ],
    "recomendacoes": [
      "Revisar vínculos da família Silva",
      "Verificar idades incompatíveis detectadas"
    ]
  }
}

Dados para análise:
${JSON.stringify(contextoIA, null, 2)}
`;

    // Chamar Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Erro Gemini API:', errorText);
      throw new Error('Erro na análise de IA');
    }

    const geminiData = await geminiResponse.json();
    const analiseTexto = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analiseTexto) {
      throw new Error('Resposta inválida da IA');
    }

    // Tentar extrair JSON da resposta
    let analiseIA;
    try {
      // Procurar por JSON na resposta
      const jsonMatch = analiseTexto.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analiseIA = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: criar estrutura básica
        analiseIA = {
          analise_ia: {
            confianca: 0.5,
            sugestoes_vinculos: [],
            inconsistencias_detectadas: [],
            insights_familias: [],
            recomendacoes: ["Análise processada, mas formato não reconhecido"],
            resposta_completa: analiseTexto
          }
        };
      }
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError);
      analiseIA = {
        analise_ia: {
          confianca: 0.3,
          sugestoes_vinculos: [],
          inconsistencias_detectadas: [],
          insights_familias: [],
          recomendacoes: ["Erro ao processar análise de IA"],
          resposta_completa: analiseTexto,
          erro_parse: parseError.message
        }
      };
    }

    // Combinar resultados
    const resultadoFinal = {
      ...dadosBasicos,
      ...analiseIA,
      metadata: {
        processado_em: new Date().toISOString(),
        tipo_analise: tipoAnalise,
        total_pessoas_analisadas: pessoas?.length || 0,
        fonte: 'gemini-ai'
      }
    };

    console.log('Análise genealógica IA concluída:', {
      pessoa: pessoaId,
      tipo: tipoAnalise,
      sugestoes: analiseIA.analise_ia?.sugestoes_vinculos?.length || 0
    });

    return new Response(JSON.stringify(resultadoFinal), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função genealogy-ai-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});