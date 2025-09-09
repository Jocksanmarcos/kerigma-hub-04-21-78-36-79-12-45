import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function verificarProgressoDesafios(supabase, userId, action) {
  try {
    // 1. Encontra os desafios que o usuário aceitou e ainda estão ativos
    const { data: desafiosAtivos, error: desafiosError } = await supabase
      .from('jornada_desafios_usuarios')
      .select(`
        id,
        progresso_json,
        desafios:desafio_id ( 
          tipo_desafio, 
          meta_json, 
          pontos_bonus, 
          medalha_id_recompensa 
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'ativo');

    if (desafiosError) {
      console.error('Erro ao buscar desafios ativos:', desafiosError);
      return;
    }

    if (!desafiosAtivos || desafiosAtivos.length === 0) {
      console.log('Nenhum desafio ativo encontrado para o usuário:', userId);
      return;
    }

    console.log(`Verificando ${desafiosAtivos.length} desafios ativos para a ação:`, action);

    for (const desafio of desafiosAtivos) {
      let progressoAtualizado = desafio.progresso_json || {};
      let metaAlcancada = false;

      const tipoDesafio = desafio.desafios.tipo_desafio;
      const meta = desafio.desafios.meta_json;

      console.log(`Processando desafio tipo: ${tipoDesafio}, meta:`, meta);

      // 2. Verifica se a ação atual contribui para algum desafio ativo
      if (tipoDesafio === 'leitura_livro' && action.type === 'leitura') {
        const bookId = action.id.split('.')[0]; // Pega 'GEN' de 'GEN.1'
        
        if (bookId === meta.bookId) {
          // Incrementa contagem de capítulos lidos
          progressoAtualizado.capitulos_lidos = (progressoAtualizado.capitulos_lidos || 0) + 1;
          
          // Verifica se atingiu a meta
          if (progressoAtualizado.capitulos_lidos >= meta.quantidade_capitulos) {
            metaAlcancada = true;
          }
          
          // Atualiza o progresso no banco
          await supabase
            .from('jornada_desafios_usuarios')
            .update({ progresso_json: progressoAtualizado })
            .eq('id', desafio.id);
        }
      } 
      
      else if (tipoDesafio === 'quiz_livro' && action.type === 'quiz') {
        const bookId = action.id.split('.')[0]; // Pega 'GEN' de 'GEN.1'
        
        if (bookId === meta.bookId) {
          // Incrementa contagem de quizzes realizados
          progressoAtualizado.quizzes_realizados = (progressoAtualizado.quizzes_realizados || 0) + 1;
          
          // Verifica se atingiu a meta
          if (progressoAtualizado.quizzes_realizados >= meta.quantidade_quizzes) {
            metaAlcancada = true;
          }
          
          // Atualiza o progresso no banco
          await supabase
            .from('jornada_desafios_usuarios')
            .update({ progresso_json: progressoAtualizado })
            .eq('id', desafio.id);
        }
      }
      
      else if (tipoDesafio === 'streak_leitura' && action.type === 'leitura') {
        // Para streak, precisamos verificar se leu hoje e quantos dias consecutivos
        const hoje = new Date().toISOString().split('T')[0];
        const ultimoDiaLeitura = progressoAtualizado.ultimo_dia_leitura;
        
        if (ultimoDiaLeitura !== hoje) {
          const ontem = new Date();
          ontem.setDate(ontem.getDate() - 1);
          const ontemStr = ontem.toISOString().split('T')[0];
          
          if (ultimoDiaLeitura === ontemStr) {
            // Continuou a sequência
            progressoAtualizado.dias_consecutivos = (progressoAtualizado.dias_consecutivos || 0) + 1;
          } else {
            // Quebrou a sequência ou começou uma nova
            progressoAtualizado.dias_consecutivos = 1;
          }
          
          progressoAtualizado.ultimo_dia_leitura = hoje;
          
          // Verifica se atingiu a meta de streak
          if (progressoAtualizado.dias_consecutivos >= meta.dias_consecutivos) {
            metaAlcancada = true;
          }
          
          // Atualiza o progresso no banco
          await supabase
            .from('jornada_desafios_usuarios')
            .update({ progresso_json: progressoAtualizado })
            .eq('id', desafio.id);
        }
      }

      // 3. Se um desafio foi concluído...
      if (metaAlcancada) {
        console.log(`🎉 Desafio concluído! Concedendo recompensas...`);
        
        // Atualiza o status do desafio para 'concluído'
        await supabase
          .from('jornada_desafios_usuarios')
          .update({ 
            status: 'concluido', 
            concluido_em: new Date().toISOString() 
          })
          .eq('id', desafio.id);

        // Concede os pontos de bônus ao perfil do usuário
        const { data: perfil } = await supabase
          .from('jornada_perfis_usuarios')
          .select('pontos_sabedoria')
          .eq('user_id', userId)
          .single();

        if (perfil) {
          const novosPontos = (perfil.pontos_sabedoria || 0) + desafio.desafios.pontos_bonus;
          
          await supabase
            .from('jornada_perfis_usuarios')
            .update({ 
              pontos_sabedoria: novosPontos,
              ultima_atividade_em: new Date().toISOString()
            })
            .eq('user_id', userId);
        }

        // Concede a medalha de recompensa
        if (desafio.desafios.medalha_id_recompensa) {
          const { error: medalhaError } = await supabase
            .from('jornada_medalhas_usuarios')
            .insert({ 
              user_id: userId, 
              medalha_id: desafio.desafios.medalha_id_recompensa,
              conquistada_em: new Date().toISOString()
            });

          if (medalhaError && medalhaError.code !== '23505') { // Ignora erro de duplicata
            console.error('Erro ao conceder medalha:', medalhaError);
          }
        }

        console.log(`✅ Recompensas concedidas: ${desafio.desafios.pontos_bonus} pontos + medalha`);
      }
    }
  } catch (error) {
    console.error('Erro geral ao verificar progresso de desafios:', error);
  }
}