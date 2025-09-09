import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '6')
    const featured = url.searchParams.get('featured') === 'true'

    console.log(`Fetching events - limit: ${limit}, featured: ${featured}`)

    let query = supabase
      .from('eventos')
      .select(`
        id,
        titulo,
        descricao,
        data_inicio,
        data_fim,
        local,
        endereco,
        tipo,
        cover_image_url,
        publico,
        capacidade,
        inscricoes_abertas
      `)
      .eq('publico', true)
      .gte('data_inicio', new Date().toISOString())
      .order('data_inicio', { ascending: true })

    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }

    console.log(`Successfully fetched ${events?.length || 0} events`)

    return new Response(
      JSON.stringify({ 
        events: events || [],
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})