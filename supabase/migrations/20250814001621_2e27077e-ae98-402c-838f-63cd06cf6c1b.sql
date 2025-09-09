-- Primeiro verificar se as tabelas já existem e criar apenas as que não existem
-- Criar tabelas para sistema de logs
CREATE TABLE IF NOT EXISTS public.logs_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  tipo_acao TEXT NOT NULL,
  acao TEXT NOT NULL,
  detalhes JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  nivel_log TEXT DEFAULT 'info' CHECK (nivel_log IN ('debug', 'info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_logs_sistema_timestamp ON public.logs_sistema(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tipo_acao ON public.logs_sistema(tipo_acao);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario ON public.logs_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_nivel ON public.logs_sistema(nivel_log);

-- Tabela para cache de relatórios
CREATE TABLE IF NOT EXISTS public.cache_relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  periodo TEXT NOT NULL,
  dados JSONB NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expira_em TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cache_relatorios_tipo ON public.cache_relatorios(tipo);
CREATE INDEX IF NOT EXISTS idx_cache_relatorios_periodo ON public.cache_relatorios(periodo);
CREATE INDEX IF NOT EXISTS idx_cache_relatorios_expira ON public.cache_relatorios(expira_em);

-- Tabela para fila de sincronização
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  dados JSONB NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'processado', 'falhado')),
  tentativas INTEGER DEFAULT 0,
  erro TEXT,
  processado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_tipo ON public.sync_queue(tipo);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON public.sync_queue(created_at);

-- Tabela para logs de sincronização
CREATE TABLE IF NOT EXISTS public.logs_sincronizacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  acao TEXT NOT NULL,
  recurso_id UUID,
  dados JSONB DEFAULT '{}',
  status TEXT DEFAULT 'sucesso',
  erro TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_sync_timestamp ON public.logs_sincronizacao(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_sync_tipo ON public.logs_sincronizacao(tipo);

-- Tabela para dispositivos de sincronização
CREATE TABLE IF NOT EXISTS public.sync_dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ultima_sincronizacao TIMESTAMP WITH TIME ZONE,
  tipos_sincronizados TEXT[],
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_dispositivos_user ON public.sync_dispositivos(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_dispositivos_status ON public.sync_dispositivos(status);

-- Tabela para cache de localizações
CREATE TABLE IF NOT EXISTS public.cache_localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  recurso_id UUID NOT NULL,
  endereco TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cache_loc_tipo_recurso ON public.cache_localizacoes(tipo, recurso_id);

-- Tabela para emails em fila
CREATE TABLE IF NOT EXISTS public.emails_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario TEXT NOT NULL,
  assunto TEXT NOT NULL,
  template TEXT NOT NULL,
  dados JSONB DEFAULT '{}',
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'falhado')),
  tentativas INTEGER DEFAULT 0,
  erro TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emails_queue_status ON public.emails_queue(status);
CREATE INDEX IF NOT EXISTS idx_emails_queue_prioridade ON public.emails_queue(prioridade);

-- Função auxiliar para buscar pessoa atual
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.pessoas WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Manter apenas logs dos últimos 90 dias
  DELETE FROM public.logs_sistema 
  WHERE created_at < (now() - INTERVAL '90 days');
  
  -- Manter apenas cache expirado
  DELETE FROM public.cache_relatorios 
  WHERE expira_em < now();
  
  -- Manter apenas logs de sync dos últimos 30 dias
  DELETE FROM public.logs_sincronizacao 
  WHERE timestamp < (now() - INTERVAL '30 days');
  
  -- Limpar fila de sync processados há mais de 7 dias
  DELETE FROM public.sync_queue 
  WHERE status = 'processado' AND processado_em < (now() - INTERVAL '7 days');
END;
$$;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger nas tabelas que precisam
DROP TRIGGER IF EXISTS update_sync_dispositivos_updated_at ON public.sync_dispositivos;
CREATE TRIGGER update_sync_dispositivos_updated_at
  BEFORE UPDATE ON public.sync_dispositivos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_trigger();

-- RLS Policies
ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_sincronizacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails_queue ENABLE ROW LEVEL SECURITY;

-- Policies para logs (apenas admins podem ver)
DROP POLICY IF EXISTS "Admins podem gerenciar logs" ON public.logs_sistema;
CREATE POLICY "Admins podem gerenciar logs" ON public.logs_sistema
  FOR ALL USING (is_admin());

-- Policies para cache (sistema pode gerenciar)
DROP POLICY IF EXISTS "Sistema pode gerenciar cache" ON public.cache_relatorios;
CREATE POLICY "Sistema pode gerenciar cache" ON public.cache_relatorios
  FOR ALL USING (auth.role() = 'service_role');

-- Policies para sync (sistema e admins)
DROP POLICY IF EXISTS "Sistema pode gerenciar sync" ON public.sync_queue;
CREATE POLICY "Sistema pode gerenciar sync" ON public.sync_queue
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

DROP POLICY IF EXISTS "Sistema pode gerenciar logs sync" ON public.logs_sincronizacao;
CREATE POLICY "Sistema pode gerenciar logs sync" ON public.logs_sincronizacao
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

-- Policies para dispositivos (usuários podem ver próprios)
DROP POLICY IF EXISTS "Usuários podem gerenciar próprios dispositivos" ON public.sync_dispositivos;
CREATE POLICY "Usuários podem gerenciar próprios dispositivos" ON public.sync_dispositivos
  FOR ALL USING (user_id = auth.uid() OR is_admin());