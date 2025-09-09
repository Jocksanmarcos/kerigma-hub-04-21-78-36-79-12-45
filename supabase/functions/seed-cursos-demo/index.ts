import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando seed de cursos demo...')

    // Primeiro, verificar se já existem aulas para os cursos
    const { data: aulasExistentes } = await supabase
      .from('aulas')
      .select('curso_id')
      .limit(1)

    if (aulasExistentes && aulasExistentes.length > 0) {
      console.log('Aulas já existem, pulando seed...')
      return new Response(JSON.stringify({ 
        message: 'Dados demo já existem',
        skipped: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Buscar cursos existentes
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select('id, nome')
      .eq('status', 'publicado')
      .limit(4)

    if (cursosError || !cursos || cursos.length === 0) {
      throw new Error('Nenhum curso encontrado para criar aulas demo')
    }

    console.log(`Encontrados ${cursos.length} cursos para seed...`)

    // Dados de exemplo para aulas
    const aulasDemo = [
      // Curso 1 - Aulas básicas
      {
        titulo_aula: "Introdução ao Crescimento Espiritual",
        ordem: 1,
        tipo_conteudo: "video",
        conteudo_principal: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duracao_minutos: 25,
        material_extra_url: "https://example.com/apostila1.pdf"
      },
      {
        titulo_aula: "Fundamentos da Fé Cristã",
        ordem: 2,
        tipo_conteudo: "texto",
        conteudo_principal: `
          <h2>Fundamentos da Fé Cristã</h2>
          <p>A fé cristã é edificada sobre fundamentos sólidos que têm resistido ao teste do tempo. Nesta aula, exploraremos os pilares essenciais da nossa crença.</p>
          
          <h3>1. A Autoridade das Escrituras</h3>
          <p>A Bíblia é a Palavra de Deus inspirada e infalível. Ela é nossa única regra de fé e prática, contendo tudo o que necessitamos para a salvação e vida cristã.</p>
          
          <h3>2. A Trindade</h3>
          <p>Cremos em um só Deus que existe eternamente em três pessoas: Pai, Filho e Espírito Santo. Cada pessoa é plenamente Deus, mas há apenas um Deus.</p>
          
          <h3>3. A Salvação pela Graça</h3>
          <p>A salvação é um presente de Deus, obtida pela fé em Jesus Cristo, não por obras ou mérito humano. É pela graça que somos salvos, mediante a fé.</p>
          
          <h3>Reflexão</h3>
          <p>Como estes fundamentos impactam sua vida diária? Como você pode crescer no conhecimento e aplicação destes princípios?</p>
        `,
        duracao_minutos: 30
      },
      {
        titulo_aula: "O Poder da Oração",
        ordem: 3,
        tipo_conteudo: "video",
        conteudo_principal: "https://vimeo.com/123456789",
        duracao_minutos: 20
      },

      // Curso 2 - Aulas sobre células
      {
        titulo_aula: "Visão de Igreja em Células",
        ordem: 1,
        tipo_conteudo: "video",
        conteudo_principal: "https://www.youtube.com/watch?v=example2",
        duracao_minutos: 35,
        material_extra_url: "https://example.com/visao-celulas.pdf"
      },
      {
        titulo_aula: "Como Liderar uma Célula",
        ordem: 2,
        tipo_conteudo: "texto",
        conteudo_principal: `
          <h2>Como Liderar uma Célula</h2>
          <p>Liderar uma célula é um privilégio e uma responsabilidade. Aqui estão os princípios fundamentais para uma liderança eficaz.</p>
          
          <h3>1. Seja um Exemplo</h3>
          <p>Sua vida deve refletir os valores e princípios que você ensina. Autenticidade é fundamental para uma liderança eficaz.</p>
          
          <h3>2. Prepare-se Bem</h3>
          <p>Estude o material com antecedência, ore pelos participantes e prepare um ambiente acolhedor para o encontro.</p>
          
          <h3>3. Facilite, Não Monopolize</h3>
          <p>Encoraje a participação de todos. Faça perguntas abertas e ouça atentamente as respostas.</p>
          
          <h3>4. Cuide Pastoralmente</h3>
          <p>Mantenha contato com os membros durante a semana. Ore por eles e esteja disponível para apoiá-los.</p>
        `,
        duracao_minutos: 25
      },
      {
        titulo_aula: "Multiplicação de Células",
        ordem: 3,
        tipo_conteudo: "quiz",
        conteudo_principal: "Quiz sobre multiplicação será implementado em breve",
        duracao_minutos: 15
      },

      // Curso 3 - Aulas sobre discipulado
      {
        titulo_aula: "O Chamado ao Discipulado",
        ordem: 1,
        tipo_conteudo: "video",
        conteudo_principal: "https://www.youtube.com/watch?v=example3",
        duracao_minutos: 30
      },
      {
        titulo_aula: "Características de um Discípulo",
        ordem: 2,
        tipo_conteudo: "texto",
        conteudo_principal: `
          <h2>Características de um Discípulo</h2>
          <p>Jesus chamou pessoas comuns para segui-Lo e transformou suas vidas. Quais são as marcas de um verdadeiro discípulo?</p>
          
          <h3>1. Amor por Jesus</h3>
          <p>"Se alguém me ama, guardará a minha palavra" (João 14:23). O amor por Cristo se manifesta na obediência.</p>
          
          <h3>2. Abnegação</h3>
          <p>"Se alguém quer vir após mim, negue-se a si mesmo, tome a sua cruz e siga-me" (Mateus 16:24).</p>
          
          <h3>3. Frutificação</h3>
          <p>"Nisto é glorificado meu Pai: que deis muito fruto; e assim sereis meus discípulos" (João 15:8).</p>
          
          <h3>4. Perseverança</h3>
          <p>"Se vós permanecerdes na minha palavra, verdadeiramente sereis meus discípulos" (João 8:31).</p>
        `,
        duracao_minutos: 28
      },

      // Curso 4 - Aulas sobre liderança
      {
        titulo_aula: "Princípios de Liderança Cristã",
        ordem: 1,
        tipo_conteudo: "video",
        conteudo_principal: "https://www.youtube.com/watch?v=example4",
        duracao_minutos: 40,
        material_extra_url: "https://example.com/lideranca-crista.pdf"
      },
      {
        titulo_aula: "Liderança Servidora",
        ordem: 2,
        tipo_conteudo: "texto",
        conteudo_principal: `
          <h2>Liderança Servidora</h2>
          <p>Jesus revolucionou o conceito de liderança quando disse: "Quem quiser tornar-se grande entre vós, será vosso servo" (Marcos 10:43).</p>
          
          <h3>O Exemplo de Jesus</h3>
          <p>Jesus, sendo Senhor de todos, lavou os pés dos discípulos. Ele liderou através do serviço humilde e sacrificial.</p>
          
          <h3>Características da Liderança Servidora</h3>
          <ul>
            <li><strong>Humildade:</strong> Reconhecer que a liderança é para servir, não para ser servido</li>
            <li><strong>Empatia:</strong> Compreender e se importar com as necessidades dos outros</li>
            <li><strong>Sacrifício:</strong> Estar disposto a abrir mão de privilégios pelo bem dos liderados</li>
            <li><strong>Desenvolvimento:</strong> Investir no crescimento de outros líderes</li>
          </ul>
          
          <h3>Aplicação Prática</h3>
          <p>Como você pode aplicar os princípios da liderança servidora em seu contexto de ministério?</p>
        `,
        duracao_minutos: 35
      }
    ]

    // Inserir aulas para cada curso
    let totalAulasInseridas = 0
    
    for (let i = 0; i < cursos.length; i++) {
      const curso = cursos[i]
      const aulasParaCurso = aulasDemo.slice(i * 3, (i + 1) * 3) // 3 aulas por curso
      
      if (aulasParaCurso.length === 0) continue

      for (const aulaData of aulasParaCurso) {
        const { error: aulaError } = await supabase
          .from('aulas')
          .insert({
            curso_id: curso.id,
            ...aulaData
          })

        if (aulaError) {
          console.error(`Erro ao inserir aula para curso ${curso.nome}:`, aulaError)
        } else {
          totalAulasInseridas++
          console.log(`Aula "${aulaData.titulo_aula}" inserida para curso "${curso.nome}"`)
        }
      }
    }

    // Atualizar cursos com dados adicionais
    const cursosUpdate = [
      {
        imagem_capa_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
        pontos_xp_recompensa: 500,
        status: 'publicado',
        destaque: true
      },
      {
        imagem_capa_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=300&fit=crop",
        pontos_xp_recompensa: 750,
        status: 'publicado',
        destaque: false
      },
      {
        imagem_capa_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop",
        pontos_xp_recompensa: 600,
        status: 'publicado',
        destaque: true
      },
      {
        imagem_capa_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        pontos_xp_recompensa: 800,
        status: 'publicado',
        destaque: false
      }
    ]

    for (let i = 0; i < Math.min(cursos.length, cursosUpdate.length); i++) {
      await supabase
        .from('cursos')
        .update(cursosUpdate[i])
        .eq('id', cursos[i].id)
    }

    console.log('Seed de cursos demo concluído com sucesso!')

    return new Response(JSON.stringify({ 
      success: true,
      message: `Seed concluído! ${totalAulasInseridas} aulas inseridas para ${cursos.length} cursos.`,
      cursos_processados: cursos.length,
      aulas_inseridas: totalAulasInseridas
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Erro no seed:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to seed demo courses',
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})