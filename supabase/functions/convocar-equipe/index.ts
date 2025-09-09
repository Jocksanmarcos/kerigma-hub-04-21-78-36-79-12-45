import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Verifica se quem chama a função é um admin/líder (lógica de segurança)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }
    
    const { data: { user } } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { evento_id } = await req.json();
    if (!evento_id) throw new Error("ID do evento não fornecido.");

    console.log(`Convocando equipe para o evento ${evento_id}`);

    // 1. Busca todos os membros escalados para este evento que estão com status 'pendente'
    const { data: membrosEscalados, error: selectError } = await supabaseAdmin
      .from('escalas_membros')
      .select(`
        id, 
        membro_id,
        pessoas!inner(user_id, nome_completo),
        escalas_eventos!inner(nome_evento)
      `)
      .eq('evento_id', evento_id)
      .eq('status', 'pendente');
    
    if (selectError) {
      console.error('Erro ao buscar membros escalados:', selectError);
      throw selectError;
    }
    
    if (!membrosEscalados || membrosEscalados.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum membro pendente para notificar." }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Cria um objeto de notificação para cada membro
    const notificacoesParaCriar = membrosEscalados.map(escala => ({
      user_id: escala.pessoas.user_id,
      tipo: 'convocacao_louvor',
      titulo: 'Você foi convocado para uma escala!',
      conteudo: `Você foi escalado para o evento: "${escala.escalas_eventos.nome_evento}". Por favor, confirme sua participação.`,
      categoria: 'louvor',
      prioridade: 2,
      acao_requerida: true,
      dados_contexto: {
        evento_id: evento_id,
        escala_membro_id: escala.id // ID da sua linha na escala
      }
    }));
    
    // 3. Insere todas as notificações no banco de dados de uma só vez
    const { error: insertError } = await supabaseAdmin
      .from('notificacoes')
      .insert(notificacoesParaCriar);

    if (insertError) {
      console.error('Erro ao inserir notificações:', insertError);
      throw insertError;
    }
    
    return new Response(
      JSON.stringify({ 
        message: `${membrosEscalados.length} membros notificados com sucesso!`,
        success: true,
        membros_notificados: membrosEscalados.length
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na função convocar-equipe:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})