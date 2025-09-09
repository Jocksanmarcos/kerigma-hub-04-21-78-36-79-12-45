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
    const action = url.searchParams.get('action');

    switch (req.method) {
      case 'GET':
        return await handleGetLogs(supabase, url);
      
      case 'POST':
        return await handleCreateLog(supabase, req);
      
      default:
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("System Logs Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleGetLogs(supabase: any, url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const tipo = url.searchParams.get('tipo');
  const usuario_id = url.searchParams.get('usuario_id');
  const data_inicio = url.searchParams.get('data_inicio');
  const data_fim = url.searchParams.get('data_fim');
  const nivel = url.searchParams.get('nivel');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('logs_sistema')
    .select(`
      id, usuario_id, tipo_acao, acao, detalhes, 
      timestamp, ip_address, nivel_log,
      usuario:pessoas(nome_completo, email)
    `)
    .order('timestamp', { ascending: false })
    .range(from, to);

  // Aplicar filtros
  if (tipo) {
    query = query.eq('tipo_acao', tipo);
  }
  
  if (usuario_id) {
    query = query.eq('usuario_id', usuario_id);
  }
  
  if (data_inicio) {
    query = query.gte('timestamp', data_inicio);
  }
  
  if (data_fim) {
    query = query.lte('timestamp', data_fim);
  }
  
  if (nivel) {
    query = query.eq('nivel_log', nivel);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  // Buscar estatísticas dos logs
  const { data: stats } = await supabase
    .from('logs_sistema')
    .select('tipo_acao, nivel_log')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Últimas 24h

  const estatisticas = {
    total_24h: stats?.length || 0,
    por_tipo: {},
    por_nivel: {}
  };

  stats?.forEach(log => {
    // Contar por tipo
    if (!estatisticas.por_tipo[log.tipo_acao]) {
      estatisticas.por_tipo[log.tipo_acao] = 0;
    }
    estatisticas.por_tipo[log.tipo_acao]++;

    // Contar por nível
    if (!estatisticas.por_nivel[log.nivel_log]) {
      estatisticas.por_nivel[log.nivel_log] = 0;
    }
    estatisticas.por_nivel[log.nivel_log]++;
  });

  return new Response(
    JSON.stringify({
      logs: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      },
      estatisticas
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleCreateLog(supabase: any, req: Request) {
  const body = await req.json();
  const { 
    tipo_acao, 
    acao, 
    detalhes, 
    nivel_log = 'info',
    ip_address,
    user_agent 
  } = body;

  // Validar dados obrigatórios
  if (!tipo_acao || !acao) {
    return new Response(
      JSON.stringify({ error: "tipo_acao e acao são obrigatórios" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Obter usuário atual
  const authHeader = req.headers.get('authorization');
  let usuario_id = null;
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    usuario_id = user?.id;
  }

  // Criar log
  const { data, error } = await supabase
    .from('logs_sistema')
    .insert({
      usuario_id,
      tipo_acao,
      acao,
      detalhes,
      nivel_log,
      timestamp: new Date().toISOString(),
      ip_address: ip_address || getClientIP(req),
      user_agent: user_agent || req.headers.get('user-agent')
    })
    .select()
    .single();

  if (error) throw error;

  // Se for um log crítico, notificar administradores
  if (nivel_log === 'error' || nivel_log === 'critical') {
    await notificarLogCritico(supabase, data);
  }

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function notificarLogCritico(supabase: any, log: any) {
  // Buscar administradores
  const { data: admins } = await supabase
    .from('pessoas')
    .select('id, nome_completo')
    .eq('papel_igreja', 'admin')
    .eq('situacao', 'ativo');

  // Criar notificações
  const notificacoes = admins?.map(admin => ({
    pessoa_id: admin.id,
    titulo: `Log ${log.nivel_log.toUpperCase()} Detectado`,
    mensagem: `Ação: ${log.tipo_acao} - ${log.acao}`,
    tipo: 'sistema',
    lida: false,
    prioridade: 'alta',
    dados_extras: {
      log_id: log.id,
      timestamp: log.timestamp
    }
  })) || [];

  if (notificacoes.length > 0) {
    await supabase
      .from('notificacoes')
      .insert(notificacoes);
  }

  // Para logs críticos, também enviar email
  if (log.nivel_log === 'critical') {
    for (const admin of admins || []) {
      await supabase
        .from('emails_queue')
        .insert({
          destinatario: admin.email,
          assunto: `🚨 LOG CRÍTICO - ${log.tipo_acao}`,
          template: 'log_critico',
          dados: {
            nome: admin.nome_completo,
            log: log
          },
          prioridade: 'alta',
          status: 'pendente'
        });
    }
  }
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}