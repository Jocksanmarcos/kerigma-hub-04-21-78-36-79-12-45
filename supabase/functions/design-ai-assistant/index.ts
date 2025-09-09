import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, baseColors, prompt, elementId, currentStyles, designSystem, context } = await req.json()

    console.log('Design AI Assistant called with action:', action)

    switch (action) {
      case 'generate_palette':
        return new Response(
          JSON.stringify({
            palette: {
              primary: baseColors[0] ? `220 90% 58%` : '213 90% 58%',
              secondary: baseColors[1] ? `45 100% 65%` : '45 100% 65%',
              background: '0 0% 100%',
              foreground: '215 25% 15%',
              accent: '210 85% 55%',
              muted: '210 40% 98%'
            },
            description: `Paleta gerada baseada em: ${baseColors.join(', ')}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'generate_section':
        return new Response(
          JSON.stringify({
            section: {
              type: 'custom_section',
              title: 'Seção Gerada por IA',
              content: `<div class="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div class="container mx-auto px-4">
                  <h2 class="text-3xl font-bold text-center mb-8">Seção Criada por IA</h2>
                  <p class="text-center text-muted-foreground max-w-2xl mx-auto">
                    Esta seção foi gerada baseada no prompt: "${prompt}"
                  </p>
                </div>
              </div>`,
              layout: 'full-width'
            },
            description: `Seção criada baseada no prompt: ${prompt}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'refine_styles':
        return new Response(
          JSON.stringify({
            suggestions: {
              backgroundColor: currentStyles.backgroundColor || 'hsl(var(--primary) / 0.1)',
              textColor: currentStyles.textColor || 'hsl(var(--foreground))',
              padding: currentStyles.padding || '1rem',
              margin: currentStyles.margin || '0.5rem',
              borderRadius: currentStyles.borderRadius || '0.5rem',
              fontSize: currentStyles.fontSize || '1rem'
            },
            description: `Estilos refinados para o elemento ${elementId}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Action not supported' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
    }
  } catch (error) {
    console.error('Design AI Assistant error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})