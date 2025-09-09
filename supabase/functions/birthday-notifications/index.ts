import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BirthdayNotification {
  id: string;
  notification_type: string;
  days_before: number;
  message_template: string;
  subject_template: string;
  send_time: string;
  is_active: boolean;
}

interface Person {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  data_nascimento: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🎂 Starting birthday notification process...');

    // Get active notification configurations
    const { data: notifications, error: notificationsError } = await supabase
      .from('birthday_notifications')
      .select('*')
      .eq('is_active', true);

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      throw notificationsError;
    }

    if (!notifications || notifications.length === 0) {
      console.log('No active notification configurations found');
      return new Response(
        JSON.stringify({ message: 'No active notifications configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${notifications.length} active notification configs`);

    let totalSent = 0;
    let totalErrors = 0;

    // Process each notification configuration
    for (const notification of notifications as BirthdayNotification[]) {
      console.log(`Processing notification config: ${notification.id}`);

      // Calculate target date based on days_before
      const today = new Date();
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + notification.days_before);

      // Get people with birthdays on target date
      const { data: people, error: peopleError } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email, telefone, data_nascimento')
        .eq('situacao', 'ativo')
        .not('data_nascimento', 'is', null);

      if (peopleError) {
        console.error('Error fetching people:', peopleError);
        continue;
      }

      // Filter people with birthdays on target date
      const birthdayPeople = people?.filter((person: Person) => {
        if (!person.data_nascimento) return false;
        
        const birthDate = new Date(person.data_nascimento);
        return (
          birthDate.getMonth() === targetDate.getMonth() &&
          birthDate.getDate() === targetDate.getDate()
        );
      }) || [];

      console.log(`Found ${birthdayPeople.length} people with birthdays to notify`);

      // Send notifications
      for (const person of birthdayPeople) {
        await sendBirthdayNotification(person, notification);
        totalSent++;
      }
    }

    console.log(`✅ Notification process completed. Sent: ${totalSent}, Errors: ${totalErrors}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${totalSent} notifications`,
        totalSent,
        totalErrors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in birthday notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendBirthdayNotification(person: Person, notification: BirthdayNotification) {
  try {
    console.log(`Sending ${notification.notification_type} notification to ${person.nome_completo}`);

    // Check if already sent today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingLog } = await supabase
      .from('birthday_notification_logs')
      .select('id')
      .eq('pessoa_id', person.id)
      .eq('notification_config_id', notification.id)
      .gte('sent_at', `${today}T00:00:00`)
      .lt('sent_at', `${today}T23:59:59`)
      .single();

    if (existingLog) {
      console.log(`Notification already sent to ${person.nome_completo} today`);
      return;
    }

    // Replace template variables
    const firstName = person.nome_completo.split(' ')[0];
    const message = notification.message_template
      .replace(/{nome}/g, firstName)
      .replace(/{nome_completo}/g, person.nome_completo);
    
    const subject = notification.subject_template
      .replace(/{nome}/g, firstName)
      .replace(/{nome_completo}/g, person.nome_completo);

    let success = false;
    let errorMessage = '';
    let recipient = '';

    // Send email notification
    if ((notification.notification_type === 'email' || notification.notification_type === 'both') && person.email) {
      try {
        recipient = person.email;
        const emailResponse = await resend.emails.send({
          from: 'CBN Kerigma <no-reply@cbnkerigma.com>',
          to: [person.email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin-bottom: 10px;">🎉 Feliz Aniversário! 🎂</h1>
              </div>
              
              <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                <div style="white-space: pre-line; font-size: 16px; line-height: 1.6; color: #374151;">
                  ${message}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Este é um e-mail automático enviado com carinho pela CBN Kerigma
                </p>
              </div>
            </div>
          `,
        });

        console.log('Email sent successfully:', emailResponse);
        success = true;
      } catch (emailError: any) {
        console.error('Error sending email:', emailError);
        errorMessage = emailError.message;
      }
    }

    // Send WhatsApp notification (placeholder for future implementation)
    if ((notification.notification_type === 'whatsapp' || notification.notification_type === 'both') && person.telefone) {
      // TODO: Implement WhatsApp sending logic
      console.log('WhatsApp notification would be sent to:', person.telefone);
      recipient = recipient || person.telefone;
      success = true; // Set to true for now
    }

    // Log the notification
    const { error: logError } = await supabase
      .from('birthday_notification_logs')
      .insert({
        pessoa_id: person.id,
        notification_config_id: notification.id,
        notification_type: notification.notification_type,
        recipient: recipient,
        status: success ? 'sent' : 'failed',
        error_message: errorMessage || null,
        message_content: message
      });

    if (logError) {
      console.error('Error logging notification:', logError);
    }

  } catch (error: any) {
    console.error(`Error sending notification to ${person.nome_completo}:`, error);
    
    // Log the error
    await supabase
      .from('birthday_notification_logs')
      .insert({
        pessoa_id: person.id,
        notification_config_id: notification.id,
        notification_type: notification.notification_type,
        recipient: person.email || person.telefone || '',
        status: 'failed',
        error_message: error.message,
        message_content: notification.message_template
      });
  }
}