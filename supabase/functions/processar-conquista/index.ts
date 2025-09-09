import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConquistaRequest {
  tipo_conquista: 'curso_concluido' | 'licao_completa' | 'trilha_concluida' | 'estudo_biblico';
  curso_id?: string;
  licao_id?: string;
  trilha_id?: string;
  pessoa_id: string;
  detalhes?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body: ConquistaRequest = await req.json();
    console.log('Processando conquista:', body);

    let pontosXP = 0;
    let nomeBadge = '';
    let tipoConquista = body.tipo_conquista;

    // Definir pontos e badges baseados no tipo de conquista
    switch (body.tipo_conquista) {
      case 'curso_concluido':
        pontosXP = 500; // XP por curso concluído
        nomeBadge = 'Diplomado';
        
        // Buscar informações do curso para personalizar
        if (body.curso_id) {
          const { data: curso } = await supabaseClient
            .from('cursos')
            .select('nome, carga_horaria')
            .eq('id', body.curso_id)
            .single();
          
          if (curso) {
            // Bonus XP baseado na carga horária
            pontosXP += Math.floor((curso.carga_horaria || 0) * 10);
            nomeBadge = `Especialista em ${curso.nome}`;
          }
        }
        break;
        
      case 'licao_completa':
        pontosXP = 50; // XP por lição concluída
        nomeBadge = 'Estudante Dedicado';
        break;
        
      case 'trilha_concluida':
        pontosXP = 1000; // XP por trilha completa
        nomeBadge = 'Mestre da Trilha';
        break;
        
      case 'estudo_biblico':
        pontosXP = 25; // XP por estudo bíblico
        nomeBadge = 'Leitor da Palavra';
        break;
        
      default:
        pontosXP = 10;
        nomeBadge = 'Conquistador';
    }

    // 1. Atualizar ou criar perfil do usuário na jornada
    const { data: perfilExistente } = await supabaseClient
      .from('aluno_stats')
      .select('*')
      .eq('pessoa_id', body.pessoa_id)
      .single();

    if (perfilExistente) {
      // Atualizar perfil existente
      const novoXP = perfilExistente.xp + pontosXP;
      const proximoNivel = Math.floor(novoXP / 2000) + 1;
      const proximoNivelXP = proximoNivel * 2000;
      
      // Determinar novo nível baseado no XP
      let novoNivel = 'Aprendiz';
      if (novoXP >= 10000) novoNivel = 'Doutor';
      else if (novoXP >= 5000) novoNivel = 'Mestre';
      else if (novoXP >= 2000) novoNivel = 'Especialista';
      else if (novoXP >= 1000) novoNivel = 'Intermediário';

      await supabaseClient
        .from('aluno_stats')
        .update({
          xp: novoXP,
          nivel: novoNivel,
          next_level_xp: proximoNivelXP,
          badge_atual: nomeBadge,
          updated_at: new Date().toISOString()
        })
        .eq('pessoa_id', body.pessoa_id);
    } else {
      // Criar novo perfil
      await supabaseClient
        .from('aluno_stats')
        .insert({
          pessoa_id: body.pessoa_id,
          xp: pontosXP,
          nivel: pontosXP >= 2000 ? 'Especialista' : 'Aprendiz',
          next_level_xp: pontosXP >= 2000 ? 4000 : 2000,
          badge_atual: nomeBadge
        });
    }

    // 2. Registrar a conquista específica
    await supabaseClient
      .from('conquistas_ensino')
      .insert({
        pessoa_id: body.pessoa_id,
        pontos_ganhos: pontosXP,
        tipo_conquista: tipoConquista,
        detalhes: {
          ...body.detalhes,
          curso_id: body.curso_id,
          licao_id: body.licao_id,
          trilha_id: body.trilha_id,
          badge_obtido: nomeBadge,
          timestamp: new Date().toISOString()
        }
      });

    // 3. Criar notificação para o usuário
    await supabaseClient
      .from('user_notifications')
      .insert({
        user_id: body.pessoa_id,
        title: '🎉 Nova Conquista!',
        message: `Você ganhou ${pontosXP} XP e o badge "${nomeBadge}"!`,
        type: 'conquista',
        read: false
      });

    console.log(`Conquista processada: ${pontosXP} XP, badge: ${nomeBadge}`);

    return new Response(
      JSON.stringify({
        success: true,
        pontosGanhos: pontosXP,
        badgeObtido: nomeBadge,
        message: `Parabéns! Você ganhou ${pontosXP} XP e o badge "${nomeBadge}"!`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao processar conquista:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});