import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Get Rankings Function Started ===');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('Usuário autenticado:', user.id);

    const { rankingType, celulaId } = await req.json();
    console.log('Tipo de ranking solicitado:', rankingType);

    let rankingData: any[] = [];

    switch (rankingType) {
      case 'geral':
        console.log('Buscando ranking geral...');
        // Ranking geral baseado nos resultados de quiz
        const { data: geralData, error: geralError } = await supabase
          .from('quiz_resultados')
          .select(`
            pessoa_id,
            pontos_ganhos,
            pessoas:pessoa_id ( nome_completo, foto_url )
          `)
          .order('pontos_ganhos', { ascending: false })
          .limit(100);

        if (geralError) {
          console.error('Erro ao buscar ranking geral:', geralError);
          throw geralError;
        }

        // Agregar pontos por pessoa
        const pessoasPontos = new Map();
        geralData?.forEach(resultado => {
          const pessoaId = resultado.pessoa_id;
          const pontos = resultado.pontos_ganhos || 0;
          const pessoa = resultado.pessoas;
          
          if (pessoasPontos.has(pessoaId)) {
            pessoasPontos.get(pessoaId).pontos_total += pontos;
          } else {
            pessoasPontos.set(pessoaId, {
              pessoa_id: pessoaId,
              pontos_total: pontos,
              nome_completo: pessoa?.nome_completo || 'Usuário',
              foto_url: pessoa?.foto_url || null,
              posicao: 0
            });
          }
        });

        rankingData = Array.from(pessoasPontos.values())
          .sort((a, b) => b.pontos_total - a.pontos_total)
          .slice(0, 100)
          .map((pessoa, index) => ({
            ...pessoa,
            posicao: index + 1
          }));

        console.log('Ranking geral encontrado:', rankingData.length, 'usuários');
        break;

      case 'minha_celula':
        console.log('Buscando ranking da célula do usuário...');
        
        // Primeiro, descobrir a célula do usuário
        const { data: userPessoa, error: userError } = await supabase
          .from('pessoas')
          .select('id, celula_id')
          .eq('user_id', user.id)
          .single();

        if (userError || !userPessoa?.celula_id) {
          console.log('Usuário não encontrado ou sem célula');
          rankingData = [];
          break;
        }

        console.log('Célula do usuário:', userPessoa.celula_id);

        // Buscar todos os membros da célula e seus pontos
        const { data: celulaData, error: celulaError } = await supabase
          .from('pessoas')
          .select(`
            id,
            nome_completo,
            foto_url,
            quiz_resultados ( pontos_ganhos )
          `)
          .eq('celula_id', userPessoa.celula_id)
          .eq('situacao', 'ativo');

        if (celulaError) {
          console.error('Erro ao buscar membros da célula:', celulaError);
          throw celulaError;
        }

        // Calcular pontos totais por membro
        const membrosPontos = celulaData?.map(membro => {
          const pontosTotal = membro.quiz_resultados?.reduce((total: number, resultado: any) => 
            total + (resultado.pontos_ganhos || 0), 0) || 0;
          
          return {
            pessoa_id: membro.id,
            nome_completo: membro.nome_completo,
            foto_url: membro.foto_url,
            pontos_total: pontosTotal
          };
        }) || [];

        rankingData = membrosPontos
          .sort((a, b) => b.pontos_total - a.pontos_total)
          .map((membro, index) => ({
            ...membro,
            posicao: index + 1
          }));

        console.log('Ranking da célula encontrado:', rankingData.length, 'membros');
        break;

      case 'disputa_celulas':
        console.log('Buscando ranking de células...');
        
        // Buscar todas as células e somar pontos dos membros
        const { data: celulasDisputa, error: disputaError } = await supabase.rpc('get_ranking_disputa_celulas');

        if (disputaError) {
          console.error('Erro ao buscar disputa de células:', disputaError);
          // Fallback para consulta manual se a função não existir
          const { data: celulasData, error: celulasError } = await supabase
            .from('celulas')
            .select(`
              id,
              nome,
              pessoas ( 
                id,
                quiz_resultados ( pontos_ganhos )
              )
            `);

          if (celulasError) throw celulasError;

          const celulasComPontos = celulasData?.map(celula => {
            const totalPontos = celula.pessoas?.reduce((total, pessoa) => {
              const pontosLessooa = pessoa.quiz_resultados?.reduce((sum: number, resultado: any) => 
                sum + (resultado.pontos_ganhos || 0), 0) || 0;
              return total + pontosLessooa;
            }, 0) || 0;

            return {
              nome_celula: celula.nome,
              total_pontos: totalPontos,
              total_membros: celula.pessoas?.length || 0
            };
          }) || [];

          rankingData = celulasComPontos
            .sort((a, b) => b.total_pontos - a.total_pontos)
            .map((celula, index) => ({
              ...celula,
              posicao: index + 1
            }));
        } else {
          rankingData = celulasDisputa || [];
        }

        console.log('Ranking de células encontrado:', rankingData.length, 'células');
        break;

      default:
        console.log('Tipo de ranking inválido:', rankingType);
        throw new Error('Tipo de ranking inválido');
    }

    console.log('=== Retornando dados do ranking ===');
    console.log('Total de itens:', rankingData.length);

    return new Response(
      JSON.stringify({
        success: true,
        data: rankingData,
        type: rankingType,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na função get-rankings:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})