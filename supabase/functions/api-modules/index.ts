import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Supabase environment variables missing");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const module = pathSegments[0];
    const action = pathSegments[1];
    const id = pathSegments[2];

    // Extrair parâmetros de paginação
    const getPaginationParams = (url: URL): PaginationParams => {
      return {
        page: parseInt(url.searchParams.get('page') || '1'),
        limit: parseInt(url.searchParams.get('limit') || '20'),
        search: url.searchParams.get('search') || undefined,
        sortBy: url.searchParams.get('sortBy') || 'created_at',
        sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
      };
    };

    // Função para aplicar paginação
    const applyPagination = (query: any, params: PaginationParams) => {
      const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      return query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to);
    };

    switch (module) {
      case 'celulas':
        return await handleCelulasAPI(supabase, req, action, id, getPaginationParams(url));
      
      case 'ensino':
        return await handleEnsinoAPI(supabase, req, action, id, getPaginationParams(url));
      
      case 'financeiro':
        return await handleFinanceiroAPI(supabase, req, action, id, getPaginationParams(url));
      
      case 'eventos':
        return await handleEventosAPI(supabase, req, action, id, getPaginationParams(url));
      
      case 'pessoas':
        return await handlePessoasAPI(supabase, req, action, id, getPaginationParams(url));
      
      default:
        return new Response(
          JSON.stringify({ error: "Module not found" }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// API do módulo Células
async function handleCelulasAPI(supabase: any, req: Request, action: string, id: string, params: PaginationParams) {
  switch (req.method) {
    case 'GET':
      if (action === 'list') {
        let query = supabase
          .from('celulas')
          .select(`
            id, nome, lider_id, supervisor_id, coordenador_id, 
            ativa, data_multiplicacao, endereco, horario,
            pessoas:pessoas!celula_id(count),
            relatorios:relatorios_semanais_celulas!celula_id(count)
          `);

        if (params.search) {
          query = query.or(`nome.ilike.%${params.search}%,endereco.ilike.%${params.search}%`);
        }

        query = applyPagination(query, params);
        const { data, error, count } = await query;

        if (error) throw error;

        return new Response(
          JSON.stringify({
            data,
            pagination: {
              page: params.page,
              limit: params.limit,
              total: count,
              totalPages: Math.ceil((count || 0) / (params.limit || 20))
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (id) {
        const { data, error } = await supabase
          .from('celulas')
          .select(`
            *, 
            lider:pessoas!lider_id(*),
            supervisor:pessoas!supervisor_id(*),
            coordenador:pessoas!coordenador_id(*),
            membros:pessoas!celula_id(*),
            relatorios:relatorios_semanais_celulas(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      break;

    case 'POST':
      if (action === 'agendar-reuniao') {
        const body = await req.json();
        const { celula_id, data_reuniao, horario, local, observacoes } = body;

        const { data, error } = await supabase
          .from('agendamentos_celulas')
          .insert({
            celula_id,
            data_reuniao,
            horario,
            local,
            observacoes,
            tipo: 'reuniao_celula',
            status: 'agendado'
          })
          .select()
          .single();

        if (error) throw error;

        // Notificar membros da célula
        await notificarMembros(supabase, celula_id, 'Reunião agendada', `Nova reunião marcada para ${data_reuniao} às ${horario}`);

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === 'presenca') {
        const body = await req.json();
        const { celula_id, data_reuniao, membros_presentes, visitantes, observacoes } = body;

        const { data, error } = await supabase
          .from('relatorios_semanais_celulas')
          .insert({
            celula_id,
            data_reuniao,
            total_presentes: membros_presentes.length,
            visitantes: visitantes || 0,
            observacoes,
            preenchido_por: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (error) throw error;

        // Registrar presença individual
        for (const pessoa_id of membros_presentes) {
          await supabase
            .from('presenca_celulas')
            .insert({
              relatorio_id: data.id,
              pessoa_id,
              presente: true
            });
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      break;
  }

  return new Response(
    JSON.stringify({ error: "Action not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// API do módulo Ensino
async function handleEnsinoAPI(supabase: any, req: Request, action: string, id: string, params: PaginationParams) {
  switch (req.method) {
    case 'GET':
      if (action === 'cursos') {
        let query = supabase
          .from('cursos')
          .select(`
            id, nome, descricao, categoria, nivel, carga_horaria,
            ativo, destaque, created_at,
            matriculas:matriculas_ensino(count),
            modulos:modulos_curso(count)
          `)
          .eq('ativo', true);

        if (params.search) {
          query = query.or(`nome.ilike.%${params.search}%,descricao.ilike.%${params.search}%`);
        }

        query = applyPagination(query, params);
        const { data, error } = await query;

        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === 'progresso' && id) {
        const { data, error } = await supabase
          .from('progresso_curso')
          .select(`
            *, 
            curso:cursos(*),
            pessoa:pessoas(nome_completo, email)
          `)
          .eq('pessoa_id', id);

        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      break;

    case 'POST':
      if (action === 'marcar-licao') {
        const body = await req.json();
        const { pessoa_id, licao_id, progresso_percent } = body;

        // Atualizar progresso
        const { data, error } = await supabase
          .from('progresso_licoes')
          .upsert({
            pessoa_id,
            licao_id,
            progresso_percent,
            concluida: progresso_percent >= 100,
            data_conclusao: progresso_percent >= 100 ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (error) throw error;

        // Recalcular progresso do curso
        await recalcularProgressoCurso(supabase, pessoa_id, licao_id);

        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      break;
  }

  return new Response(
    JSON.stringify({ error: "Action not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// API do módulo Financeiro
async function handleFinanceiroAPI(supabase: any, req: Request, action: string, id: string, params: PaginationParams) {
  switch (req.method) {
    case 'GET':
      if (action === 'relatorio') {
        const dataInicio = new URL(req.url).searchParams.get('data_inicio');
        const dataFim = new URL(req.url).searchParams.get('data_fim');

        const { data: receitas, error: receitasError } = await supabase
          .from('lancamentos_financeiros_v2')
          .select('valor')
          .eq('tipo', 'receita')
          .eq('status', 'confirmado')
          .gte('data_lancamento', dataInicio)
          .lte('data_lancamento', dataFim);

        const { data: despesas, error: despesasError } = await supabase
          .from('lancamentos_financeiros_v2')
          .select('valor')
          .eq('tipo', 'despesa')
          .eq('status', 'confirmado')
          .gte('data_lancamento', dataInicio)
          .lte('data_lancamento', dataFim);

        if (receitasError || despesasError) {
          throw receitasError || despesasError;
        }

        const totalReceitas = receitas.reduce((sum, r) => sum + Number(r.valor), 0);
        const totalDespesas = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
        const saldo = totalReceitas - totalDespesas;

        return new Response(
          JSON.stringify({
            periodo: { inicio: dataInicio, fim: dataFim },
            receitas: totalReceitas,
            despesas: totalDespesas,
            saldo,
            detalhes: {
              quantidade_receitas: receitas.length,
              quantidade_despesas: despesas.length
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === 'lancamentos') {
        let query = supabase
          .from('lancamentos_financeiros_v2')
          .select(`
            id, tipo, valor, descricao, data_lancamento, status,
            categoria:categorias_financeiras(nome, cor),
            conta:contas_bancarias(nome)
          `);

        if (params.search) {
          query = query.ilike('descricao', `%${params.search}%`);
        }

        query = applyPagination(query, params);
        const { data, error } = await query;

        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      break;

    case 'POST':
      if (action === 'lancamento') {
        const body = await req.json();
        const { data, error } = await supabase
          .from('lancamentos_financeiros_v2')
          .insert(body)
          .select()
          .single();

        if (error) throw error;

        // Log da ação crítica
        await logAcaoCritica(supabase, 'lancamento_financeiro', 'create', { lancamento_id: data.id, valor: body.valor });

        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      break;
  }

  return new Response(
    JSON.stringify({ error: "Action not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// API do módulo Eventos
async function handleEventosAPI(supabase: any, req: Request, action: string, id: string, params: PaginationParams) {
  switch (req.method) {
    case 'GET':
      if (action === 'list') {
        let query = supabase
          .from('eventos')
          .select(`
            id, titulo, descricao, data_inicio, data_fim, local,
            publico, capacidade, inscricoes_abertas,
            participantes:participacao_eventos(count)
          `)
          .eq('publico', true);

        if (params.search) {
          query = query.or(`titulo.ilike.%${params.search}%,descricao.ilike.%${params.search}%`);
        }

        query = applyPagination(query, params);
        const { data, error } = await query;

        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      break;
  }

  return new Response(
    JSON.stringify({ error: "Action not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// API do módulo Pessoas
async function handlePessoasAPI(supabase: any, req: Request, action: string, id: string, params: PaginationParams) {
  switch (req.method) {
    case 'GET':
      if (action === 'list') {
        let query = supabase
          .from('pessoas')
          .select(`
            id, nome_completo, email, telefone, data_nascimento,
            tipo_pessoa, situacao, data_cadastro,
            celula:celulas(nome),
            ministerios:membros_ministerio(ministerio:ministerios(nome))
          `)
          .eq('situacao', 'ativo');

        if (params.search) {
          query = query.or(`nome_completo.ilike.%${params.search}%,email.ilike.%${params.search}%`);
        }

        query = applyPagination(query, params);
        const { data, error } = await query;

        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      break;
  }

  return new Response(
    JSON.stringify({ error: "Action not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Funções auxiliares
async function notificarMembros(supabase: any, celula_id: string, titulo: string, mensagem: string) {
  const { data: membros } = await supabase
    .from('pessoas')
    .select('id, nome_completo, email')
    .eq('celula_id', celula_id)
    .eq('situacao', 'ativo');

  for (const membro of membros || []) {
    await supabase
      .from('notificacoes')
      .insert({
        pessoa_id: membro.id,
        titulo,
        mensagem,
        tipo: 'celula',
        lida: false
      });
  }
}

async function recalcularProgressoCurso(supabase: any, pessoa_id: string, licao_id: string) {
  // Buscar curso da lição
  const { data: licao } = await supabase
    .from('licoes_curso')
    .select('modulo_id, modulos_curso(curso_id)')
    .eq('id', licao_id)
    .single();

  if (!licao) return;

  const curso_id = licao.modulos_curso.curso_id;

  // Contar total de lições do curso
  const { count: totalLicoes } = await supabase
    .from('licoes_curso')
    .select('*', { count: 'exact' })
    .eq('modulos_curso.curso_id', curso_id);

  // Contar lições concluídas
  const { count: licoesConcluidas } = await supabase
    .from('progresso_licoes')
    .select('*', { count: 'exact' })
    .eq('pessoa_id', pessoa_id)
    .eq('concluida', true)
    .eq('licoes_curso.modulos_curso.curso_id', curso_id);

  const percentualConclusao = totalLicoes ? (licoesConcluidas / totalLicoes) * 100 : 0;

  // Atualizar progresso do curso
  await supabase
    .from('progresso_curso')
    .upsert({
      pessoa_id,
      curso_id,
      licoes_concluidas,
      percentual_conclusao: percentualConclusao,
      status: percentualConclusao >= 100 ? 'concluido' : 'em_andamento'
    });
}

async function logAcaoCritica(supabase: any, tipo: string, acao: string, detalhes: any) {
  const user = await supabase.auth.getUser();
  
  await supabase
    .from('logs_sistema')
    .insert({
      usuario_id: user.data.user?.id,
      tipo_acao: tipo,
      acao,
      detalhes,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1' // Em produção, extrair do request
    });
}