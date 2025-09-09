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

    // JWT Authentication check for protected endpoints
    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1];

    switch (req.method) {
      case 'GET':
        if (id && id !== 'api-eventos') {
          return await handleGetEvento(supabase, id, user);
        }
        return await handleGetEventos(supabase, url, user);
      
      case 'POST':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleCreateEvento(supabase, req, user);
      
      case 'PUT':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleUpdateEvento(supabase, req, id, user);
      
      case 'DELETE':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleDeleteEvento(supabase, id, user);
      
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), 
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (error: any) {
    console.error("API Eventos Error:", error);
    
    await logAuditTrail(error.message, 'error', req);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

async function handleGetEvento(supabase: any, id: string, user: any) {
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      id, titulo, descricao, data_inicio, data_fim, local, endereco,
      tipo, publico, capacidade, inscricoes_abertas, cover_image_url,
      igreja:igrejas(nome),
      participantes:participacao_eventos(count),
      tickets:evento_tickets(*),
      created_at, updated_at
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  if (!data) {
    return new Response(JSON.stringify({ error: "Evento não encontrado" }), 
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Verificar se o evento é público (qualquer um pode ver) ou se usuário tem acesso
  if (!data.publico && !user) {
    return new Response(JSON.stringify({ error: "Acesso negado" }), 
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  await logAuditTrail(`Evento visualizado: ${data.titulo}`, 'view', null, user?.id);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleGetEventos(supabase: any, url: URL, user: any) {
  // Paginação
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  
  // Filtros
  const tipo = url.searchParams.get('tipo');
  const publico = url.searchParams.get('publico');
  const dataInicio = url.searchParams.get('data_inicio');
  const dataFim = url.searchParams.get('data_fim');
  const search = url.searchParams.get('search');

  let query = supabase
    .from('eventos')
    .select(`
      id, titulo, descricao, data_inicio, data_fim, local,
      tipo, publico, capacidade, inscricoes_abertas, cover_image_url,
      igreja:igrejas(nome),
      created_at
    `, { count: 'exact' });

  // Se não é usuário autenticado, só mostrar eventos públicos
  if (!user) {
    query = query.eq('publico', true);
  }

  if (tipo) query = query.eq('tipo', tipo);
  if (publico) query = query.eq('publico', publico === 'true');
  if (dataInicio) query = query.gte('data_inicio', dataInicio);
  if (dataFim) query = query.lte('data_inicio', dataFim);
  if (search) {
    query = query.or(`titulo.ilike.%${search}%,descricao.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('data_inicio', { ascending: true });

  if (error) throw error;

  return new Response(JSON.stringify({
    data,
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

async function handleCreateEvento(supabase: any, req: Request, user: any) {
  const body = await req.json();
  
  // Validação
  const requiredFields = ['titulo', 'data_inicio', 'local', 'tipo', 'igreja_id'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  const { data, error } = await supabase
    .from('eventos')
    .insert({
      titulo: body.titulo,
      descricao: body.descricao,
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
      local: body.local,
      endereco: body.endereco,
      tipo: body.tipo,
      publico: body.publico || false,
      capacidade: body.capacidade,
      inscricoes_abertas: body.inscricoes_abertas || false,
      cover_image_url: body.cover_image_url,
      igreja_id: body.igreja_id,
      form_structure_json: body.form_structure_json || []
    })
    .select()
    .single();

  if (error) throw error;

  // Adicionar automaticamente à agenda (webhook simulado)
  await addToAgenda(supabase, data);

  await logAuditTrail(`Novo evento criado: ${body.titulo}`, 'create', req, user.id);

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleUpdateEvento(supabase: any, req: Request, id: string, user: any) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('eventos')
    .update({
      titulo: body.titulo,
      descricao: body.descricao,
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
      local: body.local,
      endereco: body.endereco,
      publico: body.publico,
      capacidade: body.capacidade,
      inscricoes_abertas: body.inscricoes_abertas,
      cover_image_url: body.cover_image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAuditTrail(`Evento atualizado: ${data.titulo}`, 'update', req, user.id);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleDeleteEvento(supabase: any, id: string, user: any) {
  // Buscar dados do evento antes de deletar
  const { data: evento } = await supabase
    .from('eventos')
    .select('titulo')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id);

  if (error) throw error;

  await logAuditTrail(`Evento removido: ${evento?.titulo}`, 'delete', null, user.id);

  return new Response(JSON.stringify({ message: "Evento removido com sucesso" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function addToAgenda(supabase: any, evento: any) {
  // Criar entrada na agenda automaticamente
  await supabase
    .from('agendamentos')
    .insert({
      titulo: evento.titulo,
      descricao: `Evento: ${evento.descricao || ''}`,
      data_hora_inicio: evento.data_inicio,
      data_hora_fim: evento.data_fim,
      local: evento.local,
      tipo: 'evento',
      evento_id: evento.id,
      status: 'confirmado'
    });
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
    .insert({ ip_address: ip, endpoint: '/api/eventos' });
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
        tipo_acao: 'api_eventos',
        acao: action,
        detalhes: { type, endpoint: '/api/eventos' },
        nivel_log: type === 'error' ? 'error' : 'info',
        ip_address: req?.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req?.headers.get('user-agent')
      });
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}