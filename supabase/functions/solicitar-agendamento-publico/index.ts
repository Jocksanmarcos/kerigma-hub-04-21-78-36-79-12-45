import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SolicitarAgendamentoPublicoRequest {
  dadosFormulario: {
    nome: string;
    email: string;
    telefone?: string;
    assunto?: string;
    data: string;
    hora: string;
  };
  tokenRecaptcha: string;
}

// Função para validar reCAPTCHA
async function validateRecaptcha(token: string): Promise<boolean> {
  const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY não configurada');
    return false; // Em desenvolvimento, pode retornar true
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Erro ao validar reCAPTCHA:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dadosFormulario, tokenRecaptcha }: SolicitarAgendamentoPublicoRequest = await req.json();

    // Validar dados obrigatórios
    if (!dadosFormulario?.nome || !dadosFormulario?.email || !dadosFormulario?.data || !dadosFormulario?.hora) {
      throw new Error('Campos obrigatórios: nome, email, data, hora');
    }

    // Validar reCAPTCHA
    const recaptchaValid = await validateRecaptcha(tokenRecaptcha);
    if (!recaptchaValid) {
      return new Response(JSON.stringify({ 
        error: 'Falha na validação de segurança. Tente novamente.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Combinar data e hora
    const dataHoraInicio = new Date(`${dadosFormulario.data}T${dadosFormulario.hora}:00`);
    const dataHoraFim = new Date(dataHoraInicio.getTime() + 60 * 60 * 1000); // +1 hora

    // Verificação final de conflito
    const { data: conflito } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data_hora_inicio', dataHoraInicio.toISOString())
      .in('status', ['agendado', 'confirmado', 'solicitado'])
      .single();

    if (conflito) {
      return new Response(JSON.stringify({ 
        error: 'Este horário acabou de ser preenchido. Por favor, escolha outro.' 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar ou criar calendário padrão para aconselhamento
    let { data: calendario } = await supabase
      .from('calendarios')
      .select('id')
      .eq('nome', 'Aconselhamento Pastoral')
      .single();

    if (!calendario) {
      const { data: novoCalendario } = await supabase
        .from('calendarios')
        .insert({
          nome: 'Aconselhamento Pastoral',
          descricao: 'Calendário para agendamentos de aconselhamento pastoral',
          ativo: true
        })
        .select('id')
        .single();
      calendario = novoCalendario;
    }

    if (!calendario) {
      throw new Error('Erro ao configurar calendário');
    }

    // Inserir novo agendamento
    const { data: agendamento, error: insertError } = await supabase
      .from('agendamentos')
      .insert({
        calendario_id: calendario.id,
        titulo: dadosFormulario.assunto || 'Solicitação de Aconselhamento',
        descricao: `Solicitação de aconselhamento de ${dadosFormulario.nome}`,
        data_hora_inicio: dataHoraInicio.toISOString(),
        data_hora_fim: dataHoraFim.toISOString(),
        visitante_nome: dadosFormulario.nome,
        visitante_email: dadosFormulario.email,
        visitante_telefone: dadosFormulario.telefone,
        status: 'solicitado'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir agendamento:', insertError);
      throw new Error('Erro ao criar solicitação de agendamento');
    }

    // Enviar e-mail de notificação para a equipe pastoral
    if (Deno.env.get("RESEND_API_KEY")) {
      try {
        await resend.emails.send({
          from: "Aconselhamento CBN Kerigma <noreply@cbnkerigma.com>",
          to: ["pastoral@cbnkerigma.com"], // Configure este e-mail
          subject: "Nova Solicitação de Aconselhamento",
          html: `
            <h2>Nova Solicitação de Aconselhamento</h2>
            <p>Uma nova solicitação de aconselhamento foi recebida:</p>
            <ul>
              <li><strong>Nome:</strong> ${dadosFormulario.nome}</li>
              <li><strong>E-mail:</strong> ${dadosFormulario.email}</li>
              <li><strong>Telefone:</strong> ${dadosFormulario.telefone || 'Não informado'}</li>
              <li><strong>Data/Hora:</strong> ${dataHoraInicio.toLocaleString('pt-BR')}</li>
              <li><strong>Assunto:</strong> ${dadosFormulario.assunto || 'Não especificado'}</li>
            </ul>
            <p>Acesse a plataforma para gerenciar esta solicitação.</p>
            <a href="${Deno.env.get('SITE_URL')}/admin/aconselhamento" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Gerenciar Solicitação</a>
          `
        });
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError);
        // Não falhar a requisição se o e-mail falhar
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Solicitação enviada com sucesso!',
      agendamento_id: agendamento.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função solicitar-agendamento-publico:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});