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
    
    // Rate limiting check
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await checkRateLimit(supabase, ip);

    // JWT Authentication for protected endpoints
    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    switch (req.method) {
      case 'GET':
        return await handleGetCelulas(supabase, url, user);
      
      case 'POST':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleCreateCelula(supabase, req, user);
      
      case 'PUT':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleUpdateCelula(supabase, req, url, user);
      
      case 'DELETE':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleDeleteCelula(supabase, url, user);
      
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), 
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (error: any) {
    console.error("API Celulas Error:", error);
    
    // Log audit trail
    await logAuditTrail(error.message, 'error', req);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

async function handleGetCelulas(supabase: any, url: URL, user: any) {
  // Paginação
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('celulas')
    .select(`
      id, nome, endereco, horario, latitude, longitude, ativa,
      lider:pessoas!lider_id(nome_completo, email),
      membros:pessoas(count),
      created_at, updated_at
    `, { count: 'exact' })
    .eq('ativa', true)
    .range(offset, offset + limit - 1)
    .order('nome', { ascending: true });

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

async function handleCreateCelula(supabase: any, req: Request, user: any) {
  const body = await req.json();
  
  // Validação de entrada
  const requiredFields = ['nome', 'endereco', 'horario', 'lider_id'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  const { data, error } = await supabase
    .from('celulas')
    .insert({
      nome: body.nome,
      endereco: body.endereco,
      horario: body.horario,
      lider_id: body.lider_id,
      latitude: body.latitude,
      longitude: body.longitude,
      observacoes: body.observacoes,
      ativa: true,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;

  // Log audit trail
  await logAuditTrail(`Nova célula criada: ${body.nome}`, 'create', req, user.id);

  // Atualizar permissões do líder (webhook simulado)
  await updateLeaderPermissions(supabase, body.lider_id, data.id);

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleUpdateCelula(supabase: any, req: Request, url: URL, user: any) {
  const id = url.pathname.split('/').pop();
  const body = await req.json();

  const { data, error } = await supabase
    .from('celulas')
    .update({
      nome: body.nome,
      endereco: body.endereco,
      horario: body.horario,
      lider_id: body.lider_id,
      latitude: body.latitude,
      longitude: body.longitude,
      observacoes: body.observacoes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Log audit trail
  await logAuditTrail(`Célula atualizada: ${data.nome}`, 'update', req, user.id);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleDeleteCelula(supabase: any, url: URL, user: any) {
  const id = url.pathname.split('/').pop();

  const { error } = await supabase
    .from('celulas')
    .update({ ativa: false })
    .eq('id', id);

  if (error) throw error;

  // Log audit trail
  await logAuditTrail(`Célula desativada: ${id}`, 'delete', null, user.id);

  return new Response(JSON.stringify({ message: "Célula desativada com sucesso" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function updateLeaderPermissions(supabase: any, liderId: string, celulaId: string) {
  // Adicionar permissões específicas para líder de célula
  const permissoes = [
    'gerenciar_celula',
    'criar_relatorio',
    'gerenciar_membros_celula'
  ];

  for (const permissao of permissoes) {
    await supabase
      .from('permissoes_pessoa')
      .upsert({
        pessoa_id: liderId,
        permissao,
        recurso_id: celulaId,
        recurso_tipo: 'celula',
        ativo: true
      });
  }
}

async function checkRateLimit(supabase: any, ip: string) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  const { count } = await supabase
    .from('api_rate_limits')
    .select('*', { count: 'exact' })
    .eq('ip_address', ip)
    .gte('created_at', oneMinuteAgo.toISOString());

  if ((count || 0) > 100) { // 100 requests per minute
    throw new Error('Rate limit exceeded');
  }

  // Record this request
  await supabase
    .from('api_rate_limits')
    .insert({ ip_address: ip, endpoint: '/api/celulas' });
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
        tipo_acao: 'api_celulas',
        acao: action,
        detalhes: { type, endpoint: '/api/celulas' },
        nivel_log: type === 'error' ? 'error' : 'info',
        ip_address: req?.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req?.headers.get('user-agent')
      });
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}