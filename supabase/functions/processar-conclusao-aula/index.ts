import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessarConclusaoRequest {
  pessoa_id: string;
  aula_id: string;
  curso_id: string;
  tempo_assistido?: number;
  pontuacao_quiz?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { pessoa_id, aula_id, curso_id, tempo_assistido = 0, pontuacao_quiz }: ProcessarConclusaoRequest = await req.json()

    console.log('Processando conclusão de aula:', { pessoa_id, aula_id, curso_id })

    // 1. Marcar aula como concluída
    const { error: progressoError } = await supabase
      .from('progresso_alunos')
      .upsert({
        pessoa_id,
        aula_id,
        status: 'concluido',
        data_conclusao: new Date().toISOString(),
        tempo_assistido_minutos: tempo_assistido,
        pontuacao_quiz
      })

    if (progressoError) {
      console.error('Erro ao atualizar progresso:', progressoError)
      throw progressoError
    }

    // 2. Conceder XP por conclusão da aula (25 XP base)
    let xp_ganho = 25
    if (pontuacao_quiz && pontuacao_quiz >= 80) {
      xp_ganho += 15 // Bonus por boa performance no quiz
    }

    await supabase
      .from('conquistas_ensino')
      .insert({
        pessoa_id,
        pontos_ganhos: xp_ganho,
        tipo_conquista: 'aula_completa',
        detalhes: {
          aula_id,
          curso_id,
          pontuacao_quiz
        }
      })

    // 3. Verificar se todas as aulas do curso foram concluídas
    const { data: progressoCurso } = await supabase
      .rpc('calcular_progresso_curso', {
        p_pessoa_id: pessoa_id,
        p_curso_id: curso_id
      })

    const progresso = progressoCurso?.[0]
    let curso_completo = false
    let recompensa_curso = null

    if (progresso && progresso.percentual_progresso >= 100) {
      // Curso completado! Processar recompensas
      console.log('Curso completado! Processando recompensas...')
      
      // Buscar informações do curso para recompensas
      const { data: curso } = await supabase
        .from('cursos')
        .select('pontos_xp_recompensa, medalha_id_recompensa, nome')
        .eq('id', curso_id)
        .single()

      if (curso) {
        // Conceder XP do curso (recompensa maior)
        const xp_curso = curso.pontos_xp_recompensa || 500
        await supabase
          .from('conquistas_ensino')
          .insert({
            pessoa_id,
            pontos_ganhos: xp_curso,
            tipo_conquista: 'curso_completo',
            detalhes: {
              curso_id,
              nome_curso: curso.nome,
              total_aulas: progresso.total_aulas
            }
          })

        // Desbloquear medalha se configurada
        if (curso.medalha_id_recompensa) {
          await supabase
            .from('jornada_medalhas_usuarios')
            .upsert({
              pessoa_id,
              medalha_id: curso.medalha_id_recompensa,
              data_conquista: new Date().toISOString(),
              origem: 'curso_completo',
              detalhes: {
                curso_id,
                nome_curso: curso.nome
              }
            })
        }

        // Atualizar status na tabela matriculas se existir
        await supabase
          .from('matriculas')
          .update({
            status: 'concluido',
            data_conclusao: new Date().toISOString(),
            certificado_emitido: curso.emite_certificado || false
          })
          .eq('pessoa_id', pessoa_id)
          .eq('curso_id', curso_id)

        curso_completo = true
        recompensa_curso = {
          xp_ganho: xp_curso,
          medalha_desbloqueada: !!curso.medalha_id_recompensa,
          certificado_disponivel: curso.emite_certificado || false
        }
      }
    }

    const response = {
      success: true,
      aula_concluida: true,
      xp_ganho_aula: xp_ganho,
      progresso_curso: progresso,
      curso_completo,
      recompensa_curso
    }

    console.log('Conclusão processada com sucesso:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Erro ao processar conclusão:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to process completion',
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})