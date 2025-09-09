import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const authHeader = req.headers.get('authorization');
    
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await checkRateLimit(supabase, ip);

    // JWT Authentication - required for all financial operations
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1];
    const isLancamentosEndpoint = pathParts.includes('lancamentos');

    switch (req.method) {
      case 'GET':
        if (isLancamentosEndpoint) {
          if (id && id !== 'lancamentos') {
            return await handleGetLancamento(supabase, id, user);
          }
          return await handleGetLancamentos(supabase, url, user);
        }
        
        // Novos endpoints para doações
        if (pathParts.includes('doacoes-recentes')) {
          return await handleGetDoacoesRecentes(supabase, user);
        }
        
        if (pathParts.includes('estatisticas-doacoes')) {
          return await handleGetEstatisticasDoacoes(supabase, user);
        }
        
        return await handleGetRelatorios(supabase, url, user);
      
      case 'POST':
        if (isLancamentosEndpoint) {
          return await handleCreateLancamento(supabase, req, user);
        }
        return new Response(JSON.stringify({ error: "Endpoint not found" }), 
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      
      case 'PUT':
        if (isLancamentosEndpoint && id) {
          return await handleUpdateLancamento(supabase, req, id, user);
        }
        return new Response(JSON.stringify({ error: "Endpoint not found" }), 
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      
      case 'DELETE':
        if (isLancamentosEndpoint && id) {
          return await handleDeleteLancamento(supabase, id, user);
        }
        return new Response(JSON.stringify({ error: "Endpoint not found" }), 
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), 
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (error: any) {
    console.error("API Financeiro Error:", error);
    
    await logAuditTrail(error.message, 'error', req);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

async function handleGetLancamento(supabase: any, id: string, user: any) {
  const { data, error } = await supabase
    .from('lancamentos_financeiros_v2')
    .select(`
      id, tipo, descricao, valor, data_lancamento, data_vencimento,
      forma_pagamento, numero_documento, status, observacoes,
      conta:contas_bancarias(id, nome),
      categoria:categorias_financeiras(id, nome, cor),
      pessoa:pessoas(id, nome_completo),
      created_at, updated_at
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  if (!data) {
    return new Response(JSON.stringify({ error: "Lançamento não encontrado" }), 
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  await logAuditTrail(`Lançamento visualizado: ${data.descricao}`, 'view', null, user.id);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleGetLancamentos(supabase: any, url: URL, user: any) {
  // Paginação
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  
  // Filtros
  const tipo = url.searchParams.get('tipo');
  const status = url.searchParams.get('status');
  const categoriaId = url.searchParams.get('categoria_id');
  const dataInicio = url.searchParams.get('data_inicio');
  const dataFim = url.searchParams.get('data_fim');

  let query = supabase
    .from('lancamentos_financeiros_v2')
    .select(`
      id, tipo, descricao, valor, data_lancamento, status,
      conta:contas_bancarias(nome),
      categoria:categorias_financeiras(nome, cor),
      created_at
    `, { count: 'exact' });

  if (tipo) query = query.eq('tipo', tipo);
  if (status) query = query.eq('status', status);
  if (categoriaId) query = query.eq('categoria_id', categoriaId);
  if (dataInicio) query = query.gte('data_lancamento', dataInicio);
  if (dataFim) query = query.lte('data_lancamento', dataFim);

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('data_lancamento', { ascending: false });

  if (error) throw error;

  // Calcular saldo automaticamente
  const saldo = await calcularSaldo(supabase, { tipo, status, categoriaId, dataInicio, dataFim });

  return new Response(JSON.stringify({
    data,
    saldo,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleGetRelatorios(supabase: any, url: URL, user: any) {
  const tipoRelatorio = url.searchParams.get('tipo') || 'mensal';
  const mes = url.searchParams.get('mes') || new Date().toISOString().slice(0, 7);
  
  let dataInicio, dataFim;
  
  if (tipoRelatorio === 'mensal') {
    dataInicio = `${mes}-01`;
    const proximoMes = new Date(mes + '-01');
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    dataFim = proximoMes.toISOString().slice(0, 10);
  }

  // Buscar dados para o relatório
  const [receitasRes, despesasRes, categoriasRes] = await Promise.all([
    supabase
      .from('lancamentos_financeiros_v2')
      .select('valor, data_lancamento')
      .eq('tipo', 'receita')
      .eq('status', 'confirmado')
      .gte('data_lancamento', dataInicio)
      .lt('data_lancamento', dataFim),
    
    supabase
      .from('lancamentos_financeiros_v2')
      .select('valor, data_lancamento')
      .eq('tipo', 'despesa')
      .eq('status', 'confirmado')
      .gte('data_lancamento', dataInicio)
      .lt('data_lancamento', dataFim),
    
    supabase
      .from('lancamentos_financeiros_v2')
      .select('valor, categoria:categorias_financeiras(nome, cor)')
      .eq('status', 'confirmado')
      .gte('data_lancamento', dataInicio)
      .lt('data_lancamento', dataFim)
  ]);

  const totalReceitas = receitasRes.data?.reduce((sum: number, item: any) => sum + Number(item.valor), 0) || 0;
  const totalDespesas = despesasRes.data?.reduce((sum: number, item: any) => sum + Number(item.valor), 0) || 0;
  const saldoLiquido = totalReceitas - totalDespesas;

  // Agrupar por categoria
  const categorias = categoriasRes.data?.reduce((acc: any, item: any) => {
    const categoria = item.categoria?.nome || 'Sem categoria';
    if (!acc[categoria]) {
      acc[categoria] = { valor: 0, cor: item.categoria?.cor || '#6b7280' };
    }
    acc[categoria].valor += Number(item.valor);
    return acc;
  }, {}) || {};

  const relatorio = {
    periodo: { inicio: dataInicio, fim: dataFim },
    resumo: {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: saldoLiquido
    },
    categorias,
    gerado_em: new Date().toISOString()
  };

  await logAuditTrail(`Relatório financeiro gerado: ${tipoRelatorio}`, 'report', null, user.id);

  return new Response(JSON.stringify(relatorio), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleCreateLancamento(supabase: any, req: Request, user: any) {
  const body = await req.json();
  
  // Validação
  const requiredFields = ['tipo', 'descricao', 'valor', 'conta_id', 'categoria_id'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  if (!['receita', 'despesa'].includes(body.tipo)) {
    return new Response(JSON.stringify({ error: "Tipo deve ser 'receita' ou 'despesa'" }), 
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { data, error } = await supabase
    .from('lancamentos_financeiros_v2')
    .insert({
      tipo: body.tipo,
      descricao: body.descricao,
      valor: body.valor,
      data_lancamento: body.data_lancamento || new Date().toISOString().slice(0, 10),
      data_vencimento: body.data_vencimento,
      conta_id: body.conta_id,
      categoria_id: body.categoria_id,
      pessoa_id: body.pessoa_id,
      forma_pagamento: body.forma_pagamento || 'dinheiro',
      numero_documento: body.numero_documento,
      status: body.status || 'confirmado',
      observacoes: body.observacoes,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;

  await logAuditTrail(`Novo lançamento criado: ${body.descricao} - R$ ${body.valor}`, 'create', req, user.id);

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleUpdateLancamento(supabase: any, req: Request, id: string, user: any) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('lancamentos_financeiros_v2')
    .update({
      descricao: body.descricao,
      valor: body.valor,
      data_lancamento: body.data_lancamento,
      data_vencimento: body.data_vencimento,
      forma_pagamento: body.forma_pagamento,
      numero_documento: body.numero_documento,
      status: body.status,
      observacoes: body.observacoes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAuditTrail(`Lançamento atualizado: ${data.descricao}`, 'update', req, user.id);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleDeleteLancamento(supabase: any, id: string, user: any) {
  // Buscar dados do lançamento antes de deletar
  const { data: lancamento } = await supabase
    .from('lancamentos_financeiros_v2')
    .select('descricao, valor')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('lancamentos_financeiros_v2')
    .delete()
    .eq('id', id);

  if (error) throw error;

  await logAuditTrail(`Lançamento removido: ${lancamento?.descricao} - R$ ${lancamento?.valor}`, 'delete', null, user.id);

  return new Response(JSON.stringify({ message: "Lançamento removido com sucesso" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function calcularSaldo(supabase: any, filtros: any = {}) {
  let receitasQuery = supabase
    .from('lancamentos_financeiros_v2')
    .select('valor')
    .eq('tipo', 'receita')
    .eq('status', 'confirmado');

  let despesasQuery = supabase
    .from('lancamentos_financeiros_v2')
    .select('valor')
    .eq('tipo', 'despesa')
    .eq('status', 'confirmado');

  // Aplicar filtros se necessário
  if (filtros.dataInicio) {
    receitasQuery = receitasQuery.gte('data_lancamento', filtros.dataInicio);
    despesasQuery = despesasQuery.gte('data_lancamento', filtros.dataInicio);
  }
  
  if (filtros.dataFim) {
    receitasQuery = receitasQuery.lte('data_lancamento', filtros.dataFim);
    despesasQuery = despesasQuery.lte('data_lancamento', filtros.dataFim);
  }

  const [receitasRes, despesasRes] = await Promise.all([receitasQuery, despesasQuery]);

  const totalReceitas = receitasRes.data?.reduce((sum: number, item: any) => sum + Number(item.valor), 0) || 0;
  const totalDespesas = despesasRes.data?.reduce((sum: number, item: any) => sum + Number(item.valor), 0) || 0;

  return {
    receitas: totalReceitas,
    despesas: totalDespesas,
    saldo: totalReceitas - totalDespesas
  };
}

async function checkRateLimit(supabase: any, ip: string) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  const { count } = await supabase
    .from('api_rate_limits')
    .select('*', { count: 'exact' })
    .eq('ip_address', ip)
    .gte('created_at', oneMinuteAgo.toISOString());

  if ((count || 0) > 100) {
    throw new Error('Rate limit exceeded');
  }

  await supabase
    .from('api_rate_limits')
    .insert({ ip_address: ip, endpoint: '/api/financeiro' });
}

async function logAuditTrail(action: string, type: string, req: Request | null, userId?: string) {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);

    await supabase
      .from('logs_sistema')
      .insert({
        usuario_id: userId,
        tipo_acao: 'api_financeiro',
        acao: action,
        detalhes: { type, endpoint: '/api/financeiro' },
        nivel_log: type === 'error' ? 'error' : 'info',
        ip_address: req?.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req?.headers.get('user-agent')
      });
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}

// Novos handlers para doações
async function handleGetDoacoesRecentes(supabase: any, user: any) {
  const { data: doacoes, error } = await supabase
    .from('lancamentos_financeiros_v2')
    .select(`
      id,
      valor,
      descricao,
      data_lancamento,
      forma_pagamento,
      status,
      observacoes,
      tags,
      numero_documento,
      created_at
    `)
    .eq('tipo', 'receita')
    .contains('tags', ['doacao_online'])
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  await logAuditTrail(`Doações recentes consultadas`, 'view', null, user.id);

  return new Response(JSON.stringify({
    success: true,
    data: doacoes
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleGetEstatisticasDoacoes(supabase: any, user: any) {
  // Total de doações online no mês atual
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { data: doacoesMes, error: erroMes } = await supabase
    .from('lancamentos_financeiros_v2')
    .select('valor')
    .eq('tipo', 'receita')
    .contains('tags', ['doacao_online'])
    .gte('data_lancamento', inicioMes.toISOString().split('T')[0]);

  if (erroMes) throw erroMes;

  const totalMes = doacoesMes?.reduce((acc: any, curr: any) => acc + (curr.valor || 0), 0) || 0;

  // Total de doações online no ano
  const inicioAno = new Date();
  inicioAno.setMonth(0, 1);
  inicioAno.setHours(0, 0, 0, 0);

  const { data: doacoesAno, error: erroAno } = await supabase
    .from('lancamentos_financeiros_v2')
    .select('valor')
    .eq('tipo', 'receita')
    .contains('tags', ['doacao_online'])
    .gte('data_lancamento', inicioAno.toISOString().split('T')[0]);

  if (erroAno) throw erroAno;

  const totalAno = doacoesAno?.reduce((acc: any, curr: any) => acc + (curr.valor || 0), 0) || 0;

  // Quantidade de doações
  const { count: quantidadeDoacoes } = await supabase
    .from('lancamentos_financeiros_v2')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'receita')
    .contains('tags', ['doacao_online']);

  await logAuditTrail(`Estatísticas de doações consultadas`, 'view', null, user.id);

  return new Response(JSON.stringify({
    success: true,
    data: {
      total_doacoes_mes: totalMes,
      total_doacoes_ano: totalAno,
      quantidade_doacoes: quantidadeDoacoes || 0,
      integracao_ativa: true,
      ultima_atualizacao: new Date().toISOString()
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}