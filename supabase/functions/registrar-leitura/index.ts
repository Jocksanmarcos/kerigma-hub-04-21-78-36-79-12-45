import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verificarProgressoDesafios } from '../_shared/challenge-checker.ts'

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
    const { chapterId, bookName, chapterNumber } = await req.json();
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

    if (perfilError && perfilError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', perfilError);
      throw perfilError;
    }

    // Se não existe perfil, cria um novo
    if (!perfil) {
      const { error: createError } = await supabase
        .from('jornada_perfis_usuarios')
        .insert({
          user_id: user.id,
          pontos_sabedoria: PONTOS_POR_LEITURA,
          capitulos_lidos_ids: [chapterId],
          ultima_atividade_em: new Date().toISOString()
        });

      if (createError) {
        console.error('Erro ao criar perfil:', createError);
        throw createError;
      }

      // Buscar pessoa_id para registrar atividade
      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (pessoa) {
        // Registrar atividade de estudo
        await supabase
          .from('atividades_estudo')
          .insert({
            pessoa_id: pessoa.id,
            tipo_atividade: 'leitura',
            duracao_minutos: 5 // Estimativa de 5 minutos por capítulo
          })
          .onConflict('pessoa_id,data_atividade,tipo_atividade')
          .ignoreDuplicates();
      }

      return new Response(
        JSON.stringify({ 
          message: `Parabéns! Você leu ${bookName} ${chapterNumber} e ganhou seus primeiros pontos!`, 
          pontos_ganhos: PONTOS_POR_LEITURA,
          novo_total_pontos: PONTOS_POR_LEITURA,
          primeiro_capitulo: true
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    // Determina o novo nível baseado nos pontos
    let novoNivel = 'Aprendiz';
    let proximoNivelXP = 100;
    
    if (novosPontos >= 1000) {
      novoNivel = 'Doutor';
      proximoNivelXP = Math.ceil(novosPontos / 1000) * 1000 + 1000;
    } else if (novosPontos >= 500) {
      novoNivel = 'Mestre';
      proximoNivelXP = 1000;
    } else if (novosPontos >= 200) {
      novoNivel = 'Especialista';
      proximoNivelXP = 500;
    } else if (novosPontos >= 100) {
      novoNivel = 'Intermediário';
      proximoNivelXP = 200;
    } else {
      proximoNivelXP = 100;
    }

    // Atualiza o perfil do usuário no banco de dados com os novos pontos e o novo capítulo lido.
    const { error: updateError } = await supabase
      .from('jornada_perfis_usuarios')
      .update({ 
        pontos_sabedoria: novosPontos,
        capitulos_lidos_ids: novaListaDeLidos,
        nivel: novoNivel,
        next_level_xp: proximoNivelXP,
        ultima_atividade_em: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      throw updateError;
    }

    // Buscar pessoa_id para registrar atividade
    const { data: pessoa } = await supabase
      .from('pessoas')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (pessoa) {
      // Registrar atividade de estudo
      await supabase
        .from('atividades_estudo')
        .insert({
          pessoa_id: pessoa.id,
          tipo_atividade: 'leitura',
          duracao_minutos: 5
        })
        .onConflict('pessoa_id,data_atividade,tipo_atividade')
        .ignoreDuplicates();
    }

    // Verifica progresso de desafios e concede recompensas se aplicável
    try {
      await verificarProgressoDesafios(supabase, user.id, { type: 'leitura', id: chapterId });
    } catch (challengeError) {
      console.error('Erro ao verificar desafios de leitura:', challengeError);
      // Não quebra a função principal se a verificação de desafio falhar
    }
    
    // Retorna uma mensagem de sucesso para o frontend.
    return new Response(
      JSON.stringify({ 
        message: `Parabéns! Você leu ${bookName} ${chapterNumber} e ganhou ${PONTOS_POR_LEITURA} pontos!`, 
        pontos_ganhos: PONTOS_POR_LEITURA, 
        novo_total_pontos: novosPontos,
        novo_nivel: novoNivel,
        capitulos_lidos: novaListaDeLidos.length
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função registrar-leitura:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})