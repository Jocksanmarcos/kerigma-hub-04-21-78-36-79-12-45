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
    const categoria = url.searchParams.get('categoria')

    console.log(`Fetching courses - limit: ${limit}, categoria: ${categoria}`)

    let query = supabase
      .from('cursos')
      .select(`
        id,
        nome,
        descricao,
        categoria,
        nivel,
        carga_horaria,
        destaque,
        slug
      `)
      .eq('ativo', true)
      .order('destaque', { ascending: false })
      .order('created_at', { ascending: false })

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data: courses, error } = await query

    if (error) {
      console.error('Error fetching courses:', error)
      throw error
    }

    console.log(`Successfully fetched ${courses?.length || 0} courses`)

    return new Response(
      JSON.stringify({ 
        courses: courses || [],
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