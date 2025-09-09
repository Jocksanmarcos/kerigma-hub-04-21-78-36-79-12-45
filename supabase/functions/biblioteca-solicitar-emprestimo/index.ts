import React from 'npm:react@18.3.1'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ReservaConfirmacaoEmail } from './_templates/reserva-confirmacao.tsx'
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
    // Create Supabase client with service role key (bypasses RLS)
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

    const { livro_id, nome, email, telefone, observacoes } = await req.json()

    console.log('Recebendo solicitação de empréstimo:', { livro_id, nome, email, telefone })

    // Primeiro, verificar se a pessoa já existe pelo email
    let pessoa_id: string;
    
    const { data: existingPerson, error: personCheckError } = await supabase
      .from('pessoas')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (personCheckError) {
      console.error('Erro ao verificar pessoa existente:', personCheckError)
      throw personCheckError
    }

    if (existingPerson) {
      pessoa_id = existingPerson.id
      console.log('Pessoa já existe:', pessoa_id)
    } else {
      // Criar nova pessoa como visitante
      const { data: newPerson, error: personCreateError } = await supabase
        .from('pessoas')
        .insert([{
          nome_completo: nome,
          email: email,
          telefone: telefone,
          tipo_pessoa: 'visitante',
          situacao: 'ativo',
          observacoes: 'Cadastro criado via solicitação pública de empréstimo'
        }])
        .select('id')
        .single()

      if (personCreateError) {
        console.error('Erro ao criar pessoa:', personCreateError)
        throw personCreateError
      }

      pessoa_id = newPerson.id
      console.log('Nova pessoa criada:', pessoa_id)
    }

    // Buscar dados do livro para o email
    const { data: livroData, error: livroError } = await supabase
      .from('biblioteca_livros')
      .select('titulo, autor')
      .eq('id', livro_id)
      .single()

    if (livroError) {
      console.error('Erro ao buscar dados do livro:', livroError)
      throw livroError
    }

    // Criar a reserva
    const { data: reservation, error: reservationError } = await supabase
      .from('biblioteca_reservas')
      .insert([{
        livro_id: livro_id,
        pessoa_id: pessoa_id,
        status: 'Ativa'
      }])
      .select()
      .single()

    if (reservationError) {
      console.error('Erro ao criar reserva:', reservationError)
      throw reservationError
    }

    console.log('Reserva criada com sucesso:', reservation.id)

    // Enviar email de confirmação
    try {
      const dataExpiracao = new Date(reservation.data_expiracao)
      const numeroReserva = `BIB-${reservation.id.slice(0, 8).toUpperCase()}`
      const linkAcompanhamento = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}/biblioteca/acompanhar/${reservation.id}`

      const emailHtml = await renderAsync(
        React.createElement(ReservaConfirmacaoEmail, {
          nome: nome,
          livroTitulo: livroData.titulo,
          livroAutor: livroData.autor,
          numeroReserva: numeroReserva,
          dataExpiracao: dataExpiracao.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          linkAcompanhamento: linkAcompanhamento,
        })
      )

      await resend.emails.send({
        from: 'Biblioteca CBN Kerigma <biblioteca@cbnkerigma.com.br>',
        to: [email],
        subject: `Solicitação Recebida - ${livroData.titulo}`,
        html: emailHtml,
      })

      console.log('Email de confirmação enviado para:', email)
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError)
      // Não falhar a operação por erro de email
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reservation_id: reservation.id,
        message: 'Solicitação de empréstimo enviada com sucesso!' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na edge function:', error)
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