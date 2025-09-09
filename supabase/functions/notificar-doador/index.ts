import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificacaoRequest {
  doacao_id: string;
  interessado: {
    nome: string;
    telefone?: string;
    email?: string;
    mensagem: string;
  };
  doacao: {
    titulo: string;
    descricao: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { doacao_id, interessado, doacao }: NotificacaoRequest = await req.json();

    console.log('Processando notificação para doador:', { doacao_id, interessado: interessado.nome });

    // Buscar dados do doador
    const { data: doacaoData, error: doacaoError } = await supabaseClient
      .from('mural_doacoes')
      .select(`
        doador_id,
        pessoas!doador_id (
          nome_completo,
          email,
          telefone
        )
      `)
      .eq('id', doacao_id)
      .single();

    if (doacaoError) {
      console.error('Erro ao buscar doação:', doacaoError);
      throw new Error(`Erro ao buscar doação: ${doacaoError.message}`);
    }

    if (!doacaoData?.pessoas) {
      throw new Error('Doador não encontrado');
    }

    const doador = doacaoData.pessoas;

    // Criar notificação no sistema
    await supabaseClient
      .from('user_notifications')
      .insert({
        title: `Interesse na sua doação: ${doacao.titulo}`,
        message: `${interessado.nome} demonstrou interesse na sua doação. Mensagem: "${interessado.mensagem}"`,
        type: 'doacao_interesse',
        read: false,
        metadata: {
          doacao_id,
          interessado: {
            nome: interessado.nome,
            telefone: interessado.telefone,
            email: interessado.email,
          }
        }
      });

    // Se tiver Resend configurado, também enviar email
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey && doador.email) {
        const emailContent = `
          <h2>Alguém tem interesse na sua doação!</h2>
          
          <p>Olá ${doador.nome_completo},</p>
          
          <p><strong>${interessado.nome}</strong> demonstrou interesse na sua doação:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3>${doacao.titulo}</h3>
            <p><strong>Mensagem do interessado:</strong></p>
            <p style="font-style: italic;">"${interessado.mensagem}"</p>
          </div>
          
          <h3>Dados para contato:</h3>
          <ul>
            <li><strong>Nome:</strong> ${interessado.nome}</li>
            ${interessado.telefone ? `<li><strong>Telefone:</strong> ${interessado.telefone}</li>` : ''}
            ${interessado.email ? `<li><strong>Email:</strong> ${interessado.email}</li>` : ''}
          </ul>
          
          <p>Entre em contato diretamente com ${interessado.nome} para combinar a entrega da doação.</p>
          
          <p>Que Deus abençoe sua generosidade! 💝</p>
        `;

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Mural da Generosidade <noreply@suaigrejadigital.com>',
            to: [doador.email],
            subject: `Interesse na sua doação: ${doacao.titulo}`,
            html: emailContent,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Erro ao enviar email via Resend:', await emailResponse.text());
        } else {
          console.log('Email enviado com sucesso para:', doador.email);
        }
      }
    } catch (emailError) {
      console.error('Erro no envio de email:', emailError);
      // Não falhar a função se o email falhar
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função notificar-doador:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);