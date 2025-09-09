import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Define a quantidade de pontos por leitura
const PONTOS_POR_LEITURA = 10;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializa o cliente do Supabase. O Lovable injeta as variáveis de ambiente automaticamente.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Pega o ID do usuário que está chamando a função.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pega o ID do capítulo que o usuário leu, enviado pelo frontend.
    const { chapterId } = await req.json();
    if (!chapterId) {
      return new Response(
        JSON.stringify({ error: 'ID do capítulo não fornecido' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Busca o perfil atual do usuário na jornada.
    const { data: perfil, error: perfilError } = await supabase
      .from('jornada_perfis_usuarios')
      .select('pontos_sabedoria, capitulos_lidos_ids')
      .eq('user_id', user.id)
      .single();

    if (perfilError) {
      console.error('Erro ao buscar perfil:', perfilError);
      throw perfilError;
    }

    // Verifica se o capítulo já foi lido para não dar pontos duplicados.
    const capitulosLidos = perfil.capitulos_lidos_ids || [];
    if (capitulosLidos.includes(chapterId)) {
      return new Response(
        JSON.stringify({ 
          message: 'Capítulo já lido anteriormente.', 
          pontos_ganhos: 0,
          total_pontos: perfil.pontos_sabedoria || 0
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calcula os novos dados.
    const novosPontos = (perfil.pontos_sabedoria || 0) + PONTOS_POR_LEITURA;
    const novaListaDeLidos = [...capitulosLidos, chapterId];

    // Atualiza o perfil do usuário no banco de dados com os novos pontos e o novo capítulo lido.
    const { error: updateError } = await supabase
      .from('jornada_perfis_usuarios')
      .update({ 
        pontos_sabedoria: novosPontos,
        capitulos_lidos_ids: novaListaDeLidos,
        ultima_atividade_em: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      throw updateError;
    }

    // Buscar o ID da pessoa para registrar a atividade
    const { data: pessoaData, error: pessoaError } = await supabase
      .from('pessoas')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!pessoaError && pessoaData) {
      // Registrar a atividade de leitura para o sistema de streaks
      const { error: atividadeError } = await supabase
        .from('atividades_estudo')
        .insert({
          pessoa_id: pessoaData.id,
          tipo_atividade: 'leitura_biblica',
          descricao: `Leitura do capítulo: ${chapterId}`,
          duracao_minutos: 5, // Estimativa de 5 minutos por capítulo
          data_atividade: new Date().toISOString().split('T')[0]
        });

      if (atividadeError) {
        console.error('Erro ao registrar atividade de estudo:', atividadeError);
        // Não falhar por causa disso, apenas logar
      }
    }
    
    // Retorna uma mensagem de sucesso para o Lovable.
    return new Response(
      JSON.stringify({ 
        message: 'Progresso registrado com sucesso!', 
        pontos_ganhos: PONTOS_POR_LEITURA, 
        novo_total_pontos: novosPontos 
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função registrar-leitura-capitulo:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})