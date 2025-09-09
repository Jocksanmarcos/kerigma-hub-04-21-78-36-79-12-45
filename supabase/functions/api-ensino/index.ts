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

    // JWT Authentication check
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
        if (id && id !== 'api-ensino') {
          return await handleGetAula(supabase, id, user);
        }
        return await handleGetAulas(supabase, url, user);
      
      case 'POST':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleCreateAula(supabase, req, user);
      
      case 'PUT':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleUpdateAula(supabase, req, id, user);
      
      case 'DELETE':
        if (!user) {
          return new Response(JSON.stringify({ error: "Authentication required" }), 
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return await handleDeleteAula(supabase, id, user);
      
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), 
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (error: any) {
    console.error("API Ensino Error:", error);
    
    await logAuditTrail(error.message, 'error', req);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

async function handleGetAula(supabase: any, id: string, user: any) {
  const { data, error } = await supabase
    .from('licoes')
    .select(`
      id, titulo, conteudo, ordem, duracao_estimada, 
      recursos_adicionais, ativo,
      curso:cursos(id, nome, categoria),
      progresso:progresso_licao(
        id, pessoa_id, progresso_percent, 
        concluida, tempo_gasto
      ),
      created_at, updated_at
    `)
    .eq('id', id)
    .eq('ativo', true)
    .single();

  if (error) throw error;

  if (!data) {
    return new Response(JSON.stringify({ error: "Aula não encontrada" }), 
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Rastrear progresso do usuário se autenticado
  if (user) {
    await trackUserProgress(supabase, user.id, id, 'view');
  }

  // Log audit trail
  await logAuditTrail(`Aula visualizada: ${data.titulo}`, 'view', null, user?.id);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleGetAulas(supabase: any, url: URL, user: any) {
  // Paginação
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  
  // Filtros
  const categoria = url.searchParams.get('categoria');
  const cursoId = url.searchParams.get('curso_id');
  const search = url.searchParams.get('search');

  let query = supabase
    .from('licoes')
    .select(`
      id, titulo, descricao, ordem, duracao_estimada, ativo,
      curso:cursos(id, nome, categoria),
      created_at, updated_at
    `, { count: 'exact' })
    .eq('ativo', true);

  if (categoria) {
    query = query.eq('cursos.categoria', categoria);
  }
  
  if (cursoId) {
    query = query.eq('curso_id', cursoId);
  }
  
  if (search) {
    query = query.or(`titulo.ilike.%${search}%,descricao.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('ordem', { ascending: true });

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

async function handleCreateAula(supabase: any, req: Request, user: any) {
  const body = await req.json();
  
  // Validação
  const requiredFields = ['titulo', 'conteudo', 'curso_id'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  const { data, error } = await supabase
    .from('licoes')
    .insert({
      titulo: body.titulo,
      descricao: body.descricao,
      conteudo: body.conteudo,
      curso_id: body.curso_id,
      ordem: body.ordem || 1,
      duracao_estimada: body.duracao_estimada || 30,
      recursos_adicionais: body.recursos_adicionais || [],
      ativo: true,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;

  // Notificar membros das células (webhook simulado)
  await notifyMembersNewLesson(supabase, data);

  await logAuditTrail(`Nova aula criada: ${body.titulo}`, 'create', req, user.id);

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleUpdateAula(supabase: any, req: Request, id: string, user: any) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('licoes')
    .update({
      titulo: body.titulo,
      descricao: body.descricao,
      conteudo: body.conteudo,
      ordem: body.ordem,
      duracao_estimada: body.duracao_estimada,
      recursos_adicionais: body.recursos_adicionais,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAuditTrail(`Aula atualizada: ${data.titulo}`, 'update', req, user.id);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleDeleteAula(supabase: any, id: string, user: any) {
  const { error } = await supabase
    .from('licoes')
    .update({ ativo: false })
    .eq('id', id);

  if (error) throw error;

  await logAuditTrail(`Aula desativada: ${id}`, 'delete', null, user.id);

  return new Response(JSON.stringify({ message: "Aula desativada com sucesso" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function trackUserProgress(supabase: any, userId: string, licaoId: string, action: string) {
  const { data: pessoa } = await supabase
    .from('pessoas')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!pessoa) return;

  await supabase
    .from('progresso_licao')
    .upsert({
      pessoa_id: pessoa.id,
      licao_id: licaoId,
      ultima_visualizacao: new Date().toISOString(),
      progresso_percent: action === 'complete' ? 100 : 0
    });
}

async function notifyMembersNewLesson(supabase: any, aula: any) {
  // Buscar membros das células para notificar
  const { data: membros } = await supabase
    .from('pessoas')
    .select('id, nome_completo')
    .eq('situacao', 'ativo');

  const notificacoes = membros?.map((membro: any) => ({
    pessoa_id: membro.id,
    titulo: 'Nova Aula Publicada!',
    mensagem: `A aula "${aula.titulo}" está disponível`,
    tipo: 'ensino',
    lida: false
  })) || [];

  if (notificacoes.length > 0) {
    await supabase
      .from('notificacoes')
      .insert(notificacoes);
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

  if ((count || 0) > 100) {
    throw new Error('Rate limit exceeded');
  }

  await supabase
    .from('api_rate_limits')
    .insert({ ip_address: ip, endpoint: '/api/ensino' });
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
        tipo_acao: 'api_ensino',
        acao: action,
        detalhes: { type, endpoint: '/api/ensino' },
        nivel_log: type === 'error' ? 'error' : 'info',
        ip_address: req?.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req?.headers.get('user-agent')
      });
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}