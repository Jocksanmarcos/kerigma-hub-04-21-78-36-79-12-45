import React from 'npm:react@18.3.1'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ReservaAprovadaEmail } from './_templates/reserva-aprovada.tsx'
import { ReservaRecusadaEmail } from './_templates/reserva-recusada.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

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

    const { reserva_id, acao, motivo_recusa } = await req.json()

    console.log('Processando notificação:', { reserva_id, acao, motivo_recusa })

    // Buscar dados completos da reserva
    const { data: reservaData, error: reservaError } = await supabase
      .from('biblioteca_reservas')
      .select(`
        *,
        biblioteca_livros!inner(titulo, autor, localizacao_fisica),
        pessoas!inner(nome_completo, email, telefone)
      `)
      .eq('id', reserva_id)
      .single()

    if (reservaError) {
      console.error('Erro ao buscar reserva:', reservaError)
      throw reservaError
    }

    if (!reservaData) {
      throw new Error('Reserva não encontrada')
    }

    const numeroReserva = `BIB-${reserva_id.slice(0, 8).toUpperCase()}`
    const linkAcompanhamento = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}/biblioteca/acompanhar/${reserva_id}`
    const linkBiblioteca = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}/biblioteca`

    let emailHtml: string
    let subject: string

    if (acao === 'aprovar') {
      // Update reservation status to 'Atendida'
      const { error: updateError } = await supabase
        .from('biblioteca_reservas')
        .update({ 
          status: 'Atendida',
          processado_por: '00000000-0000-0000-0000-000000000001', // Use a default admin ID since we can't get auth.uid() in service role
          data_processamento: new Date().toISOString()
        })
        .eq('id', reserva_id)

      if (updateError) {
        console.error('Erro ao atualizar status da reserva:', updateError)
        throw updateError
      }

      // Calcular data limite para retirada (7 dias)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + 7)

      emailHtml = await renderAsync(
        React.createElement(ReservaAprovadaEmail, {
          nome: reservaData.pessoas.nome_completo,
          livroTitulo: reservaData.biblioteca_livros.titulo,
          livroAutor: reservaData.biblioteca_livros.autor,
          numeroReserva: numeroReserva,
          dataLimiteRetirada: dataLimite.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          localizacaoFisica: reservaData.biblioteca_livros.localizacao_fisica,
          linkAcompanhamento: linkAcompanhamento,
        })
      )

      subject = `✅ Solicitação Aprovada - ${reservaData.biblioteca_livros.titulo}`

    } else if (acao === 'recusar') {
      // Update reservation status to 'Recusada'
      const { error: updateError } = await supabase
        .from('biblioteca_reservas')
        .update({ 
          status: 'Recusada',
          processado_por: '00000000-0000-0000-0000-000000000001', // Use a default admin ID
          data_processamento: new Date().toISOString(),
          motivo_recusa: motivo_recusa
        })
        .eq('id', reserva_id)

      if (updateError) {
        console.error('Erro ao atualizar status da reserva:', updateError)
        throw updateError
      }

      emailHtml = await renderAsync(
        React.createElement(ReservaRecusadaEmail, {
          nome: reservaData.pessoas.nome_completo,
          livroTitulo: reservaData.biblioteca_livros.titulo,
          livroAutor: reservaData.biblioteca_livros.autor,
          numeroReserva: numeroReserva,
          motivoRecusa: motivo_recusa,
          linkBiblioteca: linkBiblioteca,
        })
      )

      subject = `📚 Informações sobre sua solicitação - ${reservaData.biblioteca_livros.titulo}`

    } else {
      throw new Error('Ação inválida. Use "aprovar" ou "recusar"')
    }

    // Enviar email
    const emailResult = await resend.emails.send({
      from: 'Biblioteca CBN Kerigma <biblioteca@cbnkerigma.com.br>',
      to: [reservaData.pessoas.email],
      subject: subject,
      html: emailHtml,
    })

    console.log('Email enviado:', emailResult)

    // Registrar log da notificação
    await supabase
      .from('biblioteca_notificacoes_log')
      .insert([{
        reserva_id: reserva_id,
        tipo_notificacao: acao === 'aprovar' ? 'aprovacao' : 'recusa',
        email_destinatario: reservaData.pessoas.email,
        status_envio: 'enviado',
        motivo_recusa: acao === 'recusar' ? motivo_recusa : null,
        metadata: {
          email_id: emailResult.data?.id,
          numero_reserva: numeroReserva
        }
      }])

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email de ${acao === 'aprovar' ? 'aprovação' : 'recusa'} enviado com sucesso!`,
        email_id: emailResult.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na função de notificações:', error)
    
    // Tentar registrar erro no log
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase
        .from('biblioteca_notificacoes_log')
        .insert([{
          reserva_id: req.url.includes('reserva_id') ? new URL(req.url).searchParams.get('reserva_id') : null,
          tipo_notificacao: 'erro',
          status_envio: 'erro',
          erro_detalhes: error.message
        }])
    } catch (logError) {
      console.error('Erro ao registrar log:', logError)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro interno do servidor' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})