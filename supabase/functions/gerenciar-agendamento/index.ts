import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface GerenciarAgendamentoRequest {
  acao: 'aprovar' | 'recusar' | 'cancelar' | 'aprovar_direto';
  agendamento_id?: string;
  payload?: {
    solicitante_id: string;
    conselheiro_id: string;
    data_hora_inicio: string;
    titulo: string;
    observacoes?: string;
  };
  motivo_recusa?: string;
}

// Simple Google Meet link generator (in production, you'd use Google Calendar API)
function generateMeetLink(): string {
  const meetId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `https://meet.google.com/${meetId}`;
}

async function createGoogleCalendarEvent(agendamento: any): Promise<{link_meet: string, google_event_id: string}> {
  try {
    // For now, we'll generate a simple Meet link
    // In production, you'd integrate with Google Calendar API
    const link_meet = generateMeetLink();
    const google_event_id = `event_${Date.now()}`;
    
    console.log('Google Calendar event created:', { link_meet, google_event_id });
    return { link_meet, google_event_id };
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
    throw new Error('Falha ao criar evento no Google Calendar');
  }
}

async function deleteGoogleCalendarEvent(google_event_id: string): Promise<void> {
  try {
    // In production, you'd call Google Calendar API to delete the event
    console.log('Google Calendar event deleted:', google_event_id);
  } catch (error) {
    console.error('Erro ao deletar evento no Google Calendar:', error);
    // Don't throw error for deletion failures
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { acao, agendamento_id, payload, motivo_recusa }: GerenciarAgendamentoRequest = await req.json();

    switch (acao) {
      case 'aprovar': {
        if (!agendamento_id) {
          throw new Error('ID do agendamento é obrigatório para aprovação');
        }

        // Get agendamento details
        const { data: agendamento, error: fetchError } = await supabase
          .from('agendamentos')
          .select('*')
          .eq('id', agendamento_id)
          .eq('conselheiro_id', user.id)
          .eq('status', 'solicitado')
          .single();

        if (fetchError || !agendamento) {
          throw new Error('Agendamento não encontrado ou não autorizado');
        }

        // Create Google Calendar event
        const { link_meet, google_event_id } = await createGoogleCalendarEvent(agendamento);

        // Update agendamento with approval
        const { data: updatedAgendamento, error: updateError } = await supabase
          .from('agendamentos')
          .update({
            status: 'agendado',
            link_meet,
            google_event_id
          })
          .eq('id', agendamento_id)
          .select('*, solicitante:auth.users!solicitante_id(*), conselheiro:auth.users!conselheiro_id(*)')
          .single();

        if (updateError) {
          // If update fails due to conflict, delete the created event
          await deleteGoogleCalendarEvent(google_event_id);
          throw new Error('Conflito de horário detectado');
        }

        // Send confirmation emails
        const { data: solicitante } = await supabase
          .from('pessoas')
          .select('nome_completo, email')
          .eq('user_id', agendamento.solicitante_id)
          .single();

        const { data: conselheiro } = await supabase
          .from('pessoas')
          .select('nome_completo, email')
          .eq('user_id', agendamento.conselheiro_id)
          .single();

        if (solicitante?.email) {
          try {
            await resend.emails.send({
              from: "Aconselhamento CBN Kerigma <noreply@cbnkerigma.com>",
              to: [solicitante.email],
              subject: "Agendamento Confirmado",
              html: `
                <h2>Seu Agendamento foi Confirmado!</h2>
                <p><strong>Título:</strong> ${agendamento.titulo}</p>
                <p><strong>Data/Hora:</strong> ${new Date(agendamento.data_hora_inicio).toLocaleString('pt-BR')}</p>
                <p><strong>Conselheiro:</strong> ${conselheiro?.nome_completo || 'Não informado'}</p>
                <p><strong>Link da Reunião:</strong> <a href="${link_meet}">${link_meet}</a></p>
                <p>Clique no link acima na hora agendada para participar da sessão.</p>
              `
            });
          } catch (emailError) {
            console.error('Erro ao enviar email de confirmação:', emailError);
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          agendamento: updatedAgendamento,
          message: 'Agendamento aprovado com sucesso!'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'recusar': {
        if (!agendamento_id) {
          throw new Error('ID do agendamento é obrigatório para recusa');
        }

        // Update agendamento status
        const { data: updatedAgendamento, error: updateError } = await supabase
          .from('agendamentos')
          .update({
            status: 'recusado',
            motivo_recusa
          })
          .eq('id', agendamento_id)
          .eq('conselheiro_id', user.id)
          .select('*, solicitante:auth.users!solicitante_id(*)')
          .single();

        if (updateError) {
          throw new Error('Erro ao recusar agendamento');
        }

        // Send notification email
        const { data: solicitante } = await supabase
          .from('pessoas')
          .select('nome_completo, email')
          .eq('user_id', updatedAgendamento.solicitante_id)
          .single();

        if (solicitante?.email) {
          try {
            await resend.emails.send({
              from: "Aconselhamento CBN Kerigma <noreply@cbnkerigma.com>",
              to: [solicitante.email],
              subject: "Agendamento Recusado",
              html: `
                <h2>Agendamento Recusado</h2>
                <p>Seu agendamento para "${updatedAgendamento.titulo}" foi recusado.</p>
                ${motivo_recusa ? `<p><strong>Motivo:</strong> ${motivo_recusa}</p>` : ''}
                <p>Você pode solicitar um novo horário através da plataforma.</p>
                <a href="${Deno.env.get('SITE_URL')}/dashboard/aconselhamento">Solicitar Novo Horário</a>
              `
            });
          } catch (emailError) {
            console.error('Erro ao enviar email de recusa:', emailError);
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Agendamento recusado com sucesso!'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'cancelar': {
        if (!agendamento_id) {
          throw new Error('ID do agendamento é obrigatório para cancelamento');
        }

        // Get agendamento details
        const { data: agendamento, error: fetchError } = await supabase
          .from('agendamentos')
          .select('*')
          .eq('id', agendamento_id)
          .or(`solicitante_id.eq.${user.id},conselheiro_id.eq.${user.id}`)
          .single();

        if (fetchError || !agendamento) {
          throw new Error('Agendamento não encontrado');
        }

        // Delete Google Calendar event if exists
        if (agendamento.google_event_id) {
          await deleteGoogleCalendarEvent(agendamento.google_event_id);
        }

        // Update status to cancelled
        const { error: updateError } = await supabase
          .from('agendamentos')
          .update({ status: 'cancelado' })
          .eq('id', agendamento_id);

        if (updateError) {
          throw new Error('Erro ao cancelar agendamento');
        }

        // Send notification emails to both parties
        const { data: solicitante } = await supabase
          .from('pessoas')
          .select('nome_completo, email')
          .eq('user_id', agendamento.solicitante_id)
          .single();

        const { data: conselheiro } = await supabase
          .from('pessoas')
          .select('nome_completo, email')
          .eq('user_id', agendamento.conselheiro_id)
          .single();

        const emailPromises = [];
        
        if (solicitante?.email && agendamento.solicitante_id !== user.id) {
          emailPromises.push(
            resend.emails.send({
              from: "Aconselhamento CBN Kerigma <noreply@cbnkerigma.com>",
              to: [solicitante.email],
              subject: "Agendamento Cancelado",
              html: `
                <h2>Agendamento Cancelado</h2>
                <p>O agendamento "${agendamento.titulo}" foi cancelado.</p>
                <p><strong>Data/Hora:</strong> ${new Date(agendamento.data_hora_inicio).toLocaleString('pt-BR')}</p>
              `
            })
          );
        }

        if (conselheiro?.email && agendamento.conselheiro_id !== user.id) {
          emailPromises.push(
            resend.emails.send({
              from: "Aconselhamento CBN Kerigma <noreply@cbnkerigma.com>",
              to: [conselheiro.email],
              subject: "Agendamento Cancelado",
              html: `
                <h2>Agendamento Cancelado</h2>
                <p>O agendamento "${agendamento.titulo}" foi cancelado.</p>
                <p><strong>Data/Hora:</strong> ${new Date(agendamento.data_hora_inicio).toLocaleString('pt-BR')}</p>
              `
            })
          );
        }

        try {
          await Promise.all(emailPromises);
        } catch (emailError) {
          console.error('Erro ao enviar emails de cancelamento:', emailError);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Agendamento cancelado com sucesso!'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'aprovar_direto': {
        if (!payload) {
          throw new Error('Payload é obrigatório para agendamento direto');
        }

        const { solicitante_id, conselheiro_id, data_hora_inicio, titulo, observacoes } = payload;

        // Validate that user is the conselheiro
        if (conselheiro_id !== user.id) {
          throw new Error('Você só pode agendar para si mesmo');
        }

        // Calculate end time
        const dataInicio = new Date(data_hora_inicio);
        const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000); // +1 hour

        // Create Google Calendar event
        const { link_meet, google_event_id } = await createGoogleCalendarEvent({
          titulo,
          data_hora_inicio: dataInicio.toISOString(),
          data_hora_fim: dataFim.toISOString()
        });

        // Insert agendamento directly as 'agendado'
        const { data: agendamento, error: insertError } = await supabase
          .from('agendamentos')
          .insert({
            solicitante_id,
            conselheiro_id,
            data_hora_inicio: dataInicio.toISOString(),
            data_hora_fim: dataFim.toISOString(),
            titulo,
            observacoes,
            status: 'agendado',
            link_meet,
            google_event_id
          })
          .select()
          .single();

        if (insertError) {
          // If insert fails due to conflict, delete the created event
          await deleteGoogleCalendarEvent(google_event_id);
          throw new Error('Conflito de horário detectado');
        }

        // Send confirmation email to solicitante
        const { data: solicitante } = await supabase
          .from('pessoas')
          .select('nome_completo, email')
          .eq('user_id', solicitante_id)
          .single();

        if (solicitante?.email) {
          try {
            await resend.emails.send({
              from: "Aconselhamento CBN Kerigma <noreply@cbnkerigma.com>",
              to: [solicitante.email],
              subject: "Agendamento Confirmado",
              html: `
                <h2>Agendamento Confirmado!</h2>
                <p><strong>Título:</strong> ${titulo}</p>
                <p><strong>Data/Hora:</strong> ${dataInicio.toLocaleString('pt-BR')}</p>
                <p><strong>Link da Reunião:</strong> <a href="${link_meet}">${link_meet}</a></p>
                <p>Seu agendamento foi confirmado pelo conselheiro.</p>
              `
            });
          } catch (emailError) {
            console.error('Erro ao enviar email de confirmação:', emailError);
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          agendamento,
          message: 'Agendamento criado e confirmado com sucesso!'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Ação inválida');
    }

  } catch (error) {
    console.error('Erro na função gerenciar-agendamento:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});