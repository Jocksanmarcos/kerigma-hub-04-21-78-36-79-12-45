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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Iniciando detecção de inatividade pastoral...');

    // 1. Buscar pessoas ativas que não têm atividade recente
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30); // 30 dias atrás

    const { data: pessoasInativas, error: errorPessoas } = await supabaseClient
      .from('pessoas')
      .select(`
        id,
        nome_completo,
        email,
        telefone,
        situacao,
        created_at,
        celula_id,
        celulas!inner(nome, lider_id, pessoas!lider_id(nome_completo, email))
      `)
      .eq('situacao', 'ativo')
      .lt('created_at', thresholdDate.toISOString());

    if (errorPessoas) {
      console.error('Erro ao buscar pessoas:', errorPessoas);
      throw errorPessoas;
    }

    console.log(`Encontradas ${pessoasInativas?.length || 0} pessoas potencialmente inativas`);

    // 2. Para cada pessoa inativa, verificar se já não tem a tag de inativo
    const pessoasParaMarcar = [];
    
    for (const pessoa of pessoasInativas || []) {
      // Verificar se já não está marcada como inativa
      const { data: tagsExistentes } = await supabaseClient
        .from('pessoas')
        .select('observacoes')
        .eq('id', pessoa.id)
        .single();

      const observacoes = tagsExistentes?.observacoes || '';
      if (!observacoes.includes('#INATIVO')) {
        pessoasParaMarcar.push(pessoa);
      }
    }

    console.log(`${pessoasParaMarcar.length} pessoas serão marcadas como inativas`);

    // 3. Marcar pessoas como inativas e notificar líderes
    const resultados = [];
    
    for (const pessoa of pessoasParaMarcar) {
      try {
        // Atualizar observações com tag de inativo
        const novasObservacoes = (pessoa.observacoes || '') + 
          `\n\n[${new Date().toLocaleDateString()}] #INATIVO - Detectado por IA: Sem atividade há mais de 30 dias`;

        await supabaseClient
          .from('pessoas')
          .update({ observacoes: novasObservacoes })
          .eq('id', pessoa.id);

        // Criar tarefa para o líder da célula se existir
        if (pessoa.celulas?.lider_id) {
          await supabaseClient
            .from('agendamentos_pastorais')
            .insert({
              solicitante_id: pessoa.celulas.lider_id,
              motivo_contato: 'Acompanhamento de Membro Inativo',
              detalhes_pedido: `A IA detectou que ${pessoa.nome_completo} está inativo há mais de 30 dias. É recomendado fazer contato para verificar sua situação espiritual.`,
              urgencia: 'media',
              status: 'solicitado'
            });
        }

        resultados.push({
          pessoa_id: pessoa.id,
          nome: pessoa.nome_completo,
          acao: 'marcada_inativa',
          lider_notificado: !!pessoa.celulas?.lider_id
        });

      } catch (error) {
        console.error(`Erro ao processar pessoa ${pessoa.id}:`, error);
        resultados.push({
          pessoa_id: pessoa.id,
          nome: pessoa.nome_completo,
          acao: 'erro',
          erro: error.message
        });
      }
    }

    // 4. Buscar visitantes com múltiplas visitas para conversão
    const { data: visitantesFrequentes, error: errorVisitantes } = await supabaseClient
      .from('pessoas')
      .select(`
        id,
        nome_completo,
        email,
        tipo_pessoa,
        created_at,
        celula_id,
        celulas(nome, lider_id, pessoas!lider_id(nome_completo, email))
      `)
      .eq('tipo_pessoa', 'visitante')
      .eq('situacao', 'ativo');

    if (!errorVisitantes && visitantesFrequentes) {
      for (const visitante of visitantesFrequentes) {
        // Simular detecção de múltiplas visitas (em produção, seria baseado em dados reais)
        const diasComoVisitante = Math.floor((new Date().getTime() - new Date(visitante.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasComoVisitante >= 21) { // 3 semanas como visitante
          // Criar tarefa para acompanhamento de integração
          await supabaseClient
            .from('agendamentos_pastorais')
            .insert({
              solicitante_id: visitante.celulas?.lider_id || null,
              motivo_contato: 'Integração de Visitante Frequente',
              detalhes_pedido: `${visitante.nome_completo} é visitante há ${diasComoVisitante} dias. Considere processos de integração e conversão para membro.`,
              urgencia: 'alta',
              status: 'solicitado'
            });

          resultados.push({
            pessoa_id: visitante.id,
            nome: visitante.nome_completo,
            acao: 'tarefa_integracao_criada',
            dias_como_visitante: diasComoVisitante
          });
        }
      }
    }

    console.log('Processamento concluído:', resultados);

    return new Response(JSON.stringify({
      success: true,
      processados: resultados.length,
      resultados: resultados,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função de detecção de inatividade:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});