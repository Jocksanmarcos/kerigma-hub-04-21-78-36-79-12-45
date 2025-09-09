import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimiter {
  [key: string]: { count: number; resetTime: number };
}

const rateLimiter: RateLimiter = {};

const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests por minuto

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const now = Date.now();
    
    if (!rateLimiter[clientIP]) {
      rateLimiter[clientIP] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    }
    
    const userLimit = rateLimiter[clientIP];
    
    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Too many requests." 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    userLimit.count++;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Supabase environment variables missing");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Validação de entrada
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se usuário é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar permissões de admin
    const { data: isAdminData, error: permError } = await supabase
      .rpc('is_admin', { uid: user.id });
    
    if (permError || !isAdminData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    
    switch (req.method) {
      case 'GET':
        return await handleGetRequest(supabase, url, req);
      
      case 'POST':
        return await handlePostRequest(supabase, req, user.id, clientIP);
      
      default:
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("Security API Error:", error);
    
    // Log do erro de segurança
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_KEY) {
        const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
        await supabase
          .from('logs_sistema')
          .insert({
            tipo_acao: 'api_error',
            acao: 'security_api_error',
            detalhes: { 
              error: error.message, 
              stack: error.stack,
              url: req.url 
            },
            nivel_log: 'error',
            ip_address: getClientIP(req)
          });
      }
    } catch (logError) {
      console.error("Failed to log security error:", logError);
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleGetRequest(supabase: any, url: URL, req: Request) {
  const endpoint = url.pathname.split('/').pop();
  
  switch (endpoint) {
    case 'security-scan':
      return await getSecurityScan(supabase);
    
    case 'failed-logins':
      return await getFailedLogins(supabase, url);
    
    case 'suspicious-activities':
      return await getSuspiciousActivities(supabase, url);
    
    case 'session-analytics':
      return await getSessionAnalytics(supabase, url);
    
    default:
      return new Response(
        JSON.stringify({ error: "Endpoint not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
  }
}

async function handlePostRequest(supabase: any, req: Request, userId: string, clientIP: string) {
  const body = await req.json();
  
  // Validação de entrada
  if (!body.action) {
    return new Response(
      JSON.stringify({ error: "Action is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Sanitização de dados
  const sanitizedBody = sanitizeInput(body);
  
  switch (sanitizedBody.action) {
    case 'block-user':
      return await blockUser(supabase, sanitizedBody, userId);
    
    case 'force-logout':
      return await forceLogout(supabase, sanitizedBody, userId);
    
    case 'security-alert':
      return await createSecurityAlert(supabase, sanitizedBody, userId, clientIP);
    
    default:
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
  }
}

async function getSecurityScan(supabase: any) {
  // Verificar tentativas de login falhadas nas últimas 24 horas
  const { data: failedLogins } = await supabase
    .from('security_events')
    .select('*')
    .eq('event_type', 'login_failed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Verificar sessões suspeitas
  const { data: suspiciousSessions } = await supabase
    .from('security_active_sessions')
    .select('*')
    .lt('last_activity', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Verificar logs de erro críticos
  const { data: criticalErrors } = await supabase
    .from('logs_sistema')
    .select('*')
    .eq('nivel_log', 'critical')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Verificar alterações de permissões
  const { data: permissionChanges } = await supabase
    .from('logs_sistema')
    .select('*')
    .eq('tipo_acao', 'permission_change')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const securityScore = calculateSecurityScore({
    failedLogins: failedLogins?.length || 0,
    suspiciousSessions: suspiciousSessions?.length || 0,
    criticalErrors: criticalErrors?.length || 0,
    permissionChanges: permissionChanges?.length || 0
  });

  return new Response(
    JSON.stringify({
      security_score: securityScore,
      failed_logins_24h: failedLogins?.length || 0,
      suspicious_sessions: suspiciousSessions?.length || 0,
      critical_errors_24h: criticalErrors?.length || 0,
      recent_permission_changes: permissionChanges?.length || 0,
      recommendations: generateSecurityRecommendations(securityScore),
      last_scan: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getFailedLogins(supabase: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const hours = parseInt(url.searchParams.get('hours') || '24');
  
  const { data, error } = await supabase
    .from('security_events')
    .select('*')
    .eq('event_type', 'login_failed')
    .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Agrupar por IP para detectar padrões
  const ipGroups: Record<string, any[]> = {};
  data?.forEach(event => {
    const ip = event.ip_address || 'unknown';
    if (!ipGroups[ip]) ipGroups[ip] = [];
    ipGroups[ip].push(event);
  });

  const suspiciousIPs = Object.entries(ipGroups)
    .filter(([ip, events]) => events.length >= 5)
    .map(([ip, events]) => ({ ip, attempts: events.length, events }));

  return new Response(
    JSON.stringify({
      failed_logins: data,
      suspicious_ips: suspiciousIPs,
      total_attempts: data?.length || 0
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function blockUser(supabase: any, body: any, adminId: string) {
  const { user_id, reason } = body;
  
  if (!user_id) {
    throw new Error("user_id is required");
  }

  // Desativar usuário
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user_id,
    { banned_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
  );

  if (updateError) throw updateError;

  // Log da ação
  await supabase
    .from('logs_sistema')
    .insert({
      usuario_id: adminId,
      tipo_acao: 'security_action',
      acao: 'user_blocked',
      detalhes: { 
        blocked_user_id: user_id, 
        reason: reason || 'Security violation',
        duration: '24 hours'
      },
      nivel_log: 'warning'
    });

  return new Response(
    JSON.stringify({ success: true, message: "User blocked successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove caracteres perigosos
    return input.replace(/[<>'"&]/g, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

function calculateSecurityScore(metrics: any): number {
  let score = 100;
  
  // Penalizar por tentativas de login falhadas
  score -= Math.min(metrics.failedLogins * 2, 30);
  
  // Penalizar por sessões suspeitas
  score -= Math.min(metrics.suspiciousSessions * 5, 25);
  
  // Penalizar por erros críticos
  score -= Math.min(metrics.criticalErrors * 10, 40);
  
  // Penalizar por muitas mudanças de permissão
  score -= Math.min(metrics.permissionChanges * 3, 15);
  
  return Math.max(score, 0);
}

function generateSecurityRecommendations(score: number): string[] {
  const recommendations = [];
  
  if (score < 50) {
    recommendations.push("🚨 Score de segurança crítico - Revisar todas as atividades suspeitas imediatamente");
    recommendations.push("🔒 Implementar autenticação de dois fatores para todos os usuários");
    recommendations.push("🛡️ Considerar bloqueio temporário de IPs suspeitos");
  } else if (score < 70) {
    recommendations.push("⚠️ Score de segurança baixo - Monitorar atividades de perto");
    recommendations.push("🔐 Revisar políticas de senha");
    recommendations.push("📊 Aumentar frequência de auditoria de logs");
  } else if (score < 85) {
    recommendations.push("✅ Score de segurança aceitável - Continuar monitoramento");
    recommendations.push("🔄 Revisar logs de segurança regularmente");
  } else {
    recommendations.push("🎉 Excelente score de segurança!");
    recommendations.push("📈 Manter práticas atuais de segurança");
  }
  
  return recommendations;
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

async function getSuspiciousActivities(supabase: any, url: URL) {
  const hours = parseInt(url.searchParams.get('hours') || '24');
  
  // Buscar atividades suspeitas
  const { data: activities } = await supabase
    .from('logs_sistema')
    .select('*')
    .in('nivel_log', ['error', 'critical', 'warning'])
    .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  return new Response(
    JSON.stringify({
      activities: activities || [],
      count: activities?.length || 0
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getSessionAnalytics(supabase: any, url: URL) {
  const days = parseInt(url.searchParams.get('days') || '7');
  
  // Buscar estatísticas de sessão
  const { data: sessions } = await supabase
    .from('security_active_sessions')
    .select('*')
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  const analytics = {
    total_sessions: sessions?.length || 0,
    active_sessions: sessions?.filter(s => 
      new Date(s.last_activity) > new Date(Date.now() - 30 * 60 * 1000)
    ).length || 0,
    avg_session_duration: 0,
    unique_users: new Set(sessions?.map(s => s.user_id)).size || 0
  };

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function forceLogout(supabase: any, body: any, adminId: string) {
  const { user_id } = body;
  
  if (!user_id) {
    throw new Error("user_id is required");
  }

  // Revogar todas as sessões do usuário
  const { error } = await supabase.auth.admin.signOut(user_id, 'global');
  
  if (error) throw error;

  // Log da ação
  await supabase
    .from('logs_sistema')
    .insert({
      usuario_id: adminId,
      tipo_acao: 'security_action',
      acao: 'force_logout',
      detalhes: { 
        target_user_id: user_id,
        scope: 'global'
      },
      nivel_log: 'info'
    });

  return new Response(
    JSON.stringify({ success: true, message: "User logged out successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function createSecurityAlert(supabase: any, body: any, userId: string, clientIP: string) {
  const { alert_type, message, severity } = body;
  
  // Criar alerta de segurança
  await supabase
    .from('logs_sistema')
    .insert({
      usuario_id: userId,
      tipo_acao: 'security_alert',
      acao: alert_type || 'manual_alert',
      detalhes: { 
        message: message || 'Security alert created',
        severity: severity || 'medium',
        source: 'admin_dashboard'
      },
      nivel_log: severity === 'high' ? 'critical' : 'warning',
      ip_address: clientIP
    });

  return new Response(
    JSON.stringify({ success: true, message: "Security alert created" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}