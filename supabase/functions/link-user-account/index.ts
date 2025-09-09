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
      throw new Error('Acesso negado: apenas administradores podem vincular contas')
    }

    const { person_id, email } = await req.json()

    if (!person_id || !email) {
      throw new Error('ID da pessoa e email são obrigatórios')
    }

    // Buscar o user_id na tabela auth.users pelo email
    const { data: authUser, error: authUserError } = await supabaseClient.auth.admin.listUsers()
    
    if (authUserError) {
      throw new Error('Erro ao buscar usuários de autenticação')
    }

    const targetAuthUser = authUser.users.find(u => u.email === email)
    
    if (!targetAuthUser) {
      throw new Error('Usuário não encontrado na autenticação')
    }

    // Verificar se o user_id já está vinculado a outra pessoa
    const { data: existingLink, error: checkError } = await supabaseClient
      .from('pessoas')
      .select('id, nome_completo')
      .eq('user_id', targetAuthUser.id)
      .neq('id', person_id)
      .maybeSingle()

    if (checkError) {
      throw new Error('Erro ao verificar vinculação existente')
    }

    if (existingLink) {
      throw new Error(`Esta conta já está vinculada a ${existingLink.nome_completo}`)
    }

    // Vincular o user_id na tabela pessoas
    const { error: updateError } = await supabaseClient
      .from('pessoas')
      .update({ user_id: targetAuthUser.id })
      .eq('id', person_id)

    if (updateError) {
      throw new Error('Erro ao vincular conta de login')
    }

    // Log da ação
    await supabaseClient
      .from('security_audit_logs')
      .insert({
        user_id: user.id,
        action: 'LINK_USER_ACCOUNT',
        resource_type: 'user_account',
        resource_id: person_id,
        metadata: {
          linked_auth_user_id: targetAuthUser.id,
          linked_email: email,
          timestamp: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conta vinculada com sucesso',
        auth_user_id: targetAuthUser.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na vinculação de conta:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})