import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConclusaoDoacaoRequest {
  doacao_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { doacao_id }: ConclusaoDoacaoRequest = await req.json();

    console.log('Processando conclusão de doação:', doacao_id);

    // Atualizar status da doação
    const { data: doacaoData, error: updateError } = await supabaseClient
      .from('mural_doacoes')
      .update({ status: 'doado' })
      .eq('id', doacao_id)
      .select('doador_id')
      .single();

    if (updateError) {
      console.error('Erro ao atualizar doação:', updateError);
      throw new Error(`Erro ao atualizar doação: ${updateError.message}`);
    }

    // Processar conquista de generosidade
    try {
      await supabaseClient.functions.invoke('processar-conquista', {
        body: {
          pessoa_id: doacaoData.doador_id,
          tipo_conquista: 'doacao_concluida',
          detalhes: {
            doacao_id: doacao_id,
            data_conclusao: new Date().toISOString()
          }
        }
      });
      
      console.log('Conquista de generosidade processada para:', doacaoData.doador_id);
    } catch (conquistaError) {
      console.error('Erro ao processar conquista:', conquistaError);
      // Não falhar a função se a conquista falhar
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Doação marcada como concluída e conquista processada' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função concluir-doacao:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);