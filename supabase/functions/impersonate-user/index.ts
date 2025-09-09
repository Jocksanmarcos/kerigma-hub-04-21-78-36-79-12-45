import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se o usuário atual é admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se é admin
    const { data: isAdmin, error: adminError } = await supabaseClient
      .rpc('is_sede_admin', { uid: user.id })
    
    if (adminError || !isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem assumir sessões')
    }

    const { target_user_id } = await req.json()

    if (!target_user_id) {
      throw new Error('ID do usuário alvo é obrigatório')
    }

    // Buscar o user_id do auth.users baseado no ID da tabela pessoas
    const { data: pessoa, error: pessoaError } = await supabaseClient
      .from('pessoas')
      .select('user_id, email, nome_completo')
      .eq('id', target_user_id)
      .single()

    if (pessoaError || !pessoa || !pessoa.user_id) {
      throw new Error('Usuário não encontrado ou não possui vinculação com autenticação')
    }

    // Verificar se o usuário alvo existe no auth
    const { data: targetUser, error: targetError } = await supabaseClient.auth.admin.getUserById(pessoa.user_id)
    
    if (targetError || !targetUser.user) {
      throw new Error('Usuário alvo não encontrado')
    }

    // Gerar tokens de acesso para o usuário alvo
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.user.email!,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`
      }
    })

    if (sessionError || !sessionData) {
      throw new Error('Erro ao gerar sessão para o usuário alvo')
    }

    // Log da ação de impersonação
    await supabaseClient
      .from('security_audit_logs')
      .insert({
        user_id: user.id,
        action: 'IMPERSONATE_USER',
        resource_type: 'user_session',
        resource_id: pessoa.user_id,
        metadata: {
          target_user_email: targetUser.user.email,
          target_user_name: pessoa.nome_completo,
          timestamp: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        }
      })

    // Retornar tokens de acesso
    return new Response(
      JSON.stringify({
        access_token: sessionData.properties?.access_token,
        refresh_token: sessionData.properties?.refresh_token,
        target_user: {
          id: targetUser.user.id,
          email: targetUser.user.email
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na impersonação:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})