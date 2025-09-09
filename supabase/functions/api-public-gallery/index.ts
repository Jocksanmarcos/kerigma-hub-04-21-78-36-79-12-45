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
    const limit = parseInt(url.searchParams.get('limit') || '12')
    const categoria = url.searchParams.get('categoria')

    console.log(`Fetching gallery photos - limit: ${limit}, categoria: ${categoria}`)

    let query = supabase
      .from('galeria_fotos')
      .select(`
        id,
        titulo,
        descricao,
        url_imagem,
        url_thumbnail,
        categoria,
        data_evento,
        destaque
      `)
      .order('destaque', { ascending: false })
      .order('data_evento', { ascending: false })

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data: photos, error } = await query

    if (error) {
      console.error('Error fetching gallery photos:', error)
      throw error
    }

    console.log(`Successfully fetched ${photos?.length || 0} photos`)

    return new Response(
      JSON.stringify({ 
        photos: photos || [],
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