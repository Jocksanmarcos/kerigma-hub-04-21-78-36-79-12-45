import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'send_pending' | 'send_reminder';
  scheduleId?: string;
}

interface PendingNotification {
  notification_id: string;
  escala_id: string;
  pessoa_id: string;
  pessoa_nome: string;
  pessoa_email: string;
  tipo_notificacao: string;
  conteudo_mensagem: string;
  metodo_envio: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { type, scheduleId }: NotificationRequest = await req.json();

    if (type === 'send_pending') {
      // Buscar notificações pendentes
      const { data: notifications, error } = await supabaseClient
        .rpc('get_pending_notifications');

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        throw error;
      }

      console.log(`Encontradas ${notifications?.length || 0} notificações pendentes`);

      let successCount = 0;
      let failureCount = 0;

      for (const notification of (notifications as PendingNotification[]) || []) {
        try {
          // Gerar link de ação para o voluntário
          const actionLink = `https://f239131e-7b11-4349-b1f8-04f6401da903.lovableproject.com/dashboard?action=respond_invitation&id=${notification.escala_id}`;

          // Preparar conteúdo do email baseado no tipo
          let subject = '';
          let htmlContent = '';

          switch (notification.tipo_notificacao) {
            case 'convite':
              subject = `🎵 Convite para Servir - ${notification.conteudo_mensagem.split(':')[1] || 'Ministério'}`;
              htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Convite para Servir</h2>
                  <p>Olá, <strong>${notification.pessoa_nome}</strong>!</p>
                  <p>${notification.conteudo_mensagem}</p>
                  
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${actionLink}&response=accept" 
                       style="display: inline-block; padding: 12px 24px; margin: 0 10px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px;">
                      ✅ Aceitar Convite
                    </a>
                    <a href="${actionLink}&response=decline" 
                       style="display: inline-block; padding: 12px 24px; margin: 0 10px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
                      ❌ Recusar Convite
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280;">
                    Você também pode responder através do app da igreja acessando 
                    <a href="${actionLink}">este link</a>.
                  </p>
                  
                  <hr style="margin: 30px 0;">
                  <p style="font-size: 12px; color: #9ca3af;">
                    Esta é uma mensagem automática do sistema de escalas da igreja.
                    Por favor, não responda diretamente a este email.
                  </p>
                </div>
              `;
              break;

            case 'lembrete':
              subject = `🔔 Lembrete de Serviço - Confirme sua Presença`;
              htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #f59e0b;">Lembrete de Serviço</h2>
                  <p>Olá, <strong>${notification.pessoa_nome}</strong>!</p>
                  <p>Este é um lembrete sobre seu serviço agendado:</p>
                  <p><strong>${notification.conteudo_mensagem}</strong></p>
                  
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${actionLink}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
                      Ver Detalhes da Escala
                    </a>
                  </div>
                </div>
              `;
              break;

            default:
              subject = `Notificação da Igreja`;
              htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <p>Olá, <strong>${notification.pessoa_nome}</strong>!</p>
                  <p>${notification.conteudo_mensagem}</p>
                </div>
              `;
          }

          // Enviar email
          const emailResult = await resend.emails.send({
            from: "Igreja Kerigma <escalas@kerigma.church>",
            to: [notification.pessoa_email],
            subject: subject,
            html: htmlContent,
          });

          if (emailResult.data?.id) {
            // Marcar notificação como enviada
            await supabaseClient
              .rpc('mark_notification_as_sent', { 
                p_notification_id: notification.notification_id 
              });
            
            successCount++;
            console.log(`Email enviado para ${notification.pessoa_nome}: ${emailResult.data.id}`);
          } else {
            throw new Error(`Falha no envio: ${JSON.stringify(emailResult.error)}`);
          }

        } catch (emailError) {
          console.error(`Erro ao enviar email para ${notification.pessoa_nome}:`, emailError);
          failureCount++;
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Processadas ${notifications?.length || 0} notificações`,
        details: {
          sent: successCount,
          failed: failureCount
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Tipo de operação não suportado' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função send-schedule-notifications:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);