import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id?: string
  title: string
  body: string
  data?: Record<string, any>
  type: string
  send_immediately?: boolean
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload: NotificationPayload = await req.json()
    
    console.log('Push notification request:', payload)

    // Validar dados obrigatórios
    if (!payload.title || !payload.body || !payload.type) {
      return new Response(
        JSON.stringify({ error: 'Título, corpo e tipo são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Se user_id específico, enviar apenas para ele, senão para todos os usuários ativos
    let targetUsers: any[] = []

    if (payload.user_id) {
      const { data: userData } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', payload.user_id)
        .eq('active', true)
      
      targetUsers = userData || []
    } else {
      // Buscar todos os tokens ativos
      const { data: allTokens } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('active', true)
      
      targetUsers = allTokens || []
    }

    console.log(`Enviando notificação para ${targetUsers.length} dispositivos`)

    const notifications = []
    const errors = []

    // Para cada token, tentar enviar a notificação
    for (const userToken of targetUsers) {
      try {
        // Simular envio de push notification
        // Em produção, usar Firebase Admin SDK ou serviço similar
        
        // Registrar no log de notificações
        const { error: logError } = await supabase
          .from('notifications_log')
          .insert({
            user_id: userToken.user_id,
            title: payload.title,
            body: payload.body,
            type: payload.type,
            data: payload.data || {},
            status: 'sent'
          })

        if (logError) {
          console.error('Erro ao registrar log:', logError)
          errors.push({ user_id: userToken.user_id, error: logError.message })
        } else {
          notifications.push({ user_id: userToken.user_id, status: 'sent' })
        }

        // Criar notificação no sistema interno também
        const { error: userNotifError } = await supabase
          .from('user_notifications')
          .insert({
            user_id: userToken.user_id,
            title: payload.title,
            message: payload.body,
            type: payload.type,
            read: false
          })

        if (userNotifError) {
          console.error('Erro ao criar notificação interna:', userNotifError)
        }

      } catch (error) {
        console.error('Erro ao enviar para:', userToken.user_id, error)
        errors.push({ user_id: userToken.user_id, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: notifications.length,
        errors: errors.length,
        details: { notifications, errors }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro na função push-notifications:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})