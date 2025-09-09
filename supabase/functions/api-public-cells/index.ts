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

    console.log('Fetching public cells information')

    const { data: cells, error } = await supabase
      .from('celulas')
      .select(`
        id,
        nome,
        descricao,
        bairro,
        cidade,
        dia_semana,
        horario,
        latitude,
        longitude,
        status
      `)
      .eq('ativa', true)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Error fetching cells:', error)
      throw error
    }

    // Filter out sensitive information and only return public cells
    const publicCells = cells?.map(cell => ({
      id: cell.id,
      nome: cell.nome,
      descricao: cell.descricao,
      bairro: cell.bairro,
      cidade: cell.cidade,
      dia_semana: cell.dia_semana,
      horario: cell.horario,
      // Only include location if it's available
      latitude: cell.latitude,
      longitude: cell.longitude
    })) || []

    console.log(`Successfully fetched ${publicCells.length} public cells`)

    return new Response(
      JSON.stringify({ 
        cells: publicCells,
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