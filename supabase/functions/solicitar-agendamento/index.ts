import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SolicitarAgendamentoRequest {
  conselheiro_id: string;
  data_hora_inicio: string;
  titulo: string;
  observacoes?: string;
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

    const { conselheiro_id, data_hora_inicio, titulo, observacoes }: SolicitarAgendamentoRequest = await req.json();

    // Validate input
    if (!conselheiro_id || !data_hora_inicio || !titulo) {
      throw new Error('Campos obrigatórios: conselheiro_id, data_hora_inicio, titulo');
    }

    // Calculate end time (default to 1 hour)
    const dataInicio = new Date(data_hora_inicio);
    const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000); // +1 hour

    // Insert new agendamento
    const { data: agendamento, error: insertError } = await supabase
      .from('agendamentos')
      .insert({
        solicitante_id: user.id,
        conselheiro_id,
        data_hora_inicio: dataInicio.toISOString(),
        data_hora_fim: dataFim.toISOString(),
        titulo,
        observacoes,
        status: 'solicitado'
      })
      .select('*, conselheiro:auth.users!conselheiro_id(*)')
      .single();

    if (insertError) {
      console.error('Erro ao inserir agendamento:', insertError);
      throw new Error('Erro ao criar solicitação de agendamento');
    }

    // Get conselheiro details for email
    const { data: conselheiro, error: conselheiroError } = await supabase
      .from('pessoas')
      .select('nome_completo, email')
      .eq('user_id', conselheiro_id)
      .single();

    if (!conselheiroError && conselheiro?.email) {
      // Send notification email to counselor
      try {
        await resend.emails.send({
          from: "Aconselhamento CBN Kerigma <noreply@cbnkerigma.com>",
          to: [conselheiro.email],
          subject: "Nova Solicitação de Aconselhamento",
          html: `
            <h2>Nova Solicitação de Aconselhamento</h2>
            <p>Você recebeu uma nova solicitação de aconselhamento:</p>
            <p><strong>Título:</strong> ${titulo}</p>
            <p><strong>Data/Hora:</strong> ${new Date(data_hora_inicio).toLocaleString('pt-BR')}</p>
            <p><strong>Observações:</strong> ${observacoes || 'Nenhuma'}</p>
            <p>Acesse a plataforma para aprovar ou recusar esta solicitação.</p>
            <a href="${Deno.env.get('SITE_URL')}/dashboard/aconselhamento" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Solicitação</a>
          `
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      agendamento,
      message: 'Solicitação de agendamento criada com sucesso!'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função solicitar-agendamento:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});