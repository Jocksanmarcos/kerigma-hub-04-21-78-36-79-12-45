import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Cabeçalho de autorização ausente');
    }

    // Verify the JWT token and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Parse request body
    const { escala_membro_id, resposta, notificacao_id } = await req.json();
    
    // Validate required fields
    if (!escala_membro_id || !resposta) {
      throw new Error('Dados da resposta incompletos. Forneça escala_membro_id e resposta.');
    }
    
    // Validate response values
    if (!['confirmado', 'recusado'].includes(resposta)) {
      throw new Error("Resposta inválida. Use 'confirmado' ou 'recusado'.");
    }

    console.log('Processando resposta:', { escala_membro_id, resposta, user_id: user.id });

    // 1. VERIFICAÇÃO DE SEGURANÇA CRÍTICA
    // Buscar dados completos da escala e verificar autorização
    const { data: escalaData, error: escalaError } = await supabase
      .from('escalas_membros')
      .select(`
        id,
        membro_id,
        evento_id,
        cargo_id,
        status,
        observacoes,
        escalas_eventos!inner(titulo, data_evento),
        louvor_cargos!inner(nome)
      `)
      .eq('id', escala_membro_id)
      .single();

    if (escalaError || !escalaData) {
      console.error('Erro ao buscar escala:', escalaError);
      throw new Error('Convocação não encontrada.');
    }

    // Verificar se o usuário atual é o membro convocado
    if (escalaData.membro_id !== user.id) {
      console.error('Tentativa de acesso não autorizado:', {
        user_id: user.id,
        membro_id: escalaData.membro_id
      });
      throw new Error('Não autorizado. Você não pode responder a esta convocação.');
    }

    // 2. ATUALIZAR O STATUS NA ESCALA
    const { error: updateError } = await supabase
      .from('escalas_membros')
      .update({ 
        status: resposta,
        data_resposta: new Date().toISOString()
      })
      .eq('id', escala_membro_id);
    
    if (updateError) {
      console.error('Erro ao atualizar escala:', updateError);
      throw updateError;
    }

    // 3. BUSCAR DADOS DO USUÁRIO PARA A NOTIFICAÇÃO
    const { data: userData, error: userError } = await supabase
      .from('pessoas')
      .select('nome_completo')
      .eq('user_id', user.id)
      .single();

    const nomeUsuario = userData?.nome_completo || 'Usuário';

    // 4. CRIAR NOTIFICAÇÃO PARA O LÍDER
    const statusNotificacao = resposta === 'confirmado' ? 'confirmacao' : 'recusa';
    const mensagemNotificacao = `${nomeUsuario} ${resposta === 'confirmado' ? 'confirmou' : 'recusou'} a convocação para ${escalaData.louvor_cargos.nome} no evento "${escalaData.escalas_eventos.titulo}"`;

    const { error: notificationError } = await supabase
      .from('notificacoes_escala')
      .insert({
        escala_membro_id: escala_membro_id,
        tipo: statusNotificacao,
        titulo: `Resposta de Convocação`,
        mensagem: mensagemNotificacao,
        status: 'enviada'
      });

    if (notificationError) {
      console.error('Erro ao criar notificação:', notificationError);
      // Não falha a operação se a notificação falhar
    }

    // 5. MARCAR NOTIFICAÇÃO ORIGINAL COMO LIDA (se fornecida)
    if (notificacao_id) {
      await supabase
        .from('notificacoes_escala')
        .update({ 
          status: 'lida',
          lida_em: new Date().toISOString()
        })
        .eq('id', notificacao_id);
    }

    console.log('Resposta processada com sucesso:', { 
      escala_membro_id, 
      resposta, 
      usuario: nomeUsuario 
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Resposta '${resposta}' registrada com sucesso!`,
        data: {
          escala_membro_id,
          status: resposta,
          evento: escalaData.escalas_eventos.titulo,
          cargo: escalaData.louvor_cargos.nome
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Erro na função responder-convocacao:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor',
        details: 'Verifique os dados enviados e tente novamente'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})