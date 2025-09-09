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

-- Tabela para notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'critica')),
  dados_extras JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_pessoa ON public.notificacoes(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);

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

-- Tabela para agendamentos de células
CREATE TABLE IF NOT EXISTS public.agendamentos_celulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celula_id UUID REFERENCES public.celulas(id),
  data_reuniao DATE NOT NULL,
  horario TIME NOT NULL,
  local TEXT,
  tipo TEXT DEFAULT 'reuniao_celula',
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'realizado', 'cancelado')),
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agend_celulas_celula ON public.agendamentos_celulas(celula_id);
CREATE INDEX IF NOT EXISTS idx_agend_celulas_data ON public.agendamentos_celulas(data_reuniao);

-- Tabela para controle de presença
CREATE TABLE IF NOT EXISTS public.presenca_celulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relatorio_id UUID REFERENCES public.relatorios(id),
  pessoa_id UUID REFERENCES public.pessoas(id),
  presente BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presenca_relatorio ON public.presenca_celulas(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_presenca_pessoa ON public.presenca_celulas(pessoa_id);

-- Tabela para progresso de lições
CREATE TABLE IF NOT EXISTS public.progresso_licoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id),
  licao_id UUID, -- Referência às lições quando implementarmos a tabela
  progresso_percent DECIMAL(5,2) DEFAULT 0,
  concluida BOOLEAN DEFAULT false,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, licao_id)
);

CREATE INDEX IF NOT EXISTS idx_progresso_licoes_pessoa ON public.progresso_licoes(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_progresso_licoes_licao ON public.progresso_licoes(licao_id);

-- Tabela para tokens de push notification
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  token TEXT NOT NULL,
  plataforma TEXT NOT NULL CHECK (plataforma IN ('ios', 'android', 'web')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_ativo ON public.user_push_tokens(ativo);

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
CREATE TRIGGER update_sync_dispositivos_updated_at
  BEFORE UPDATE ON public.sync_dispositivos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_trigger();

CREATE TRIGGER update_progresso_licoes_updated_at
  BEFORE UPDATE ON public.progresso_licoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_trigger();

CREATE TRIGGER update_user_push_tokens_updated_at
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_trigger();

CREATE TRIGGER update_agendamentos_celulas_updated_at
  BEFORE UPDATE ON public.agendamentos_celulas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_trigger();

-- RLS Policies
ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_sincronizacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presenca_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_licoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Policies para logs (apenas admins podem ver)
CREATE POLICY "Admins podem gerenciar logs" ON public.logs_sistema
  FOR ALL USING (is_admin());

-- Policies para cache (sistema pode gerenciar)
CREATE POLICY "Sistema pode gerenciar cache" ON public.cache_relatorios
  FOR ALL USING (auth.role() = 'service_role');

-- Policies para sync (sistema e admins)
CREATE POLICY "Sistema pode gerenciar sync" ON public.sync_queue
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

CREATE POLICY "Sistema pode gerenciar logs sync" ON public.logs_sincronizacao
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

-- Policies para dispositivos (usuários podem ver próprios)
CREATE POLICY "Usuários podem gerenciar próprios dispositivos" ON public.sync_dispositivos
  FOR ALL USING (user_id = auth.uid() OR is_admin());

-- Policies para notificações (usuários veem próprias)
CREATE POLICY "Usuários podem ver próprias notificações" ON public.notificacoes
  FOR SELECT USING (pessoa_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar próprias notificações" ON public.notificacoes
  FOR UPDATE USING (pessoa_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Sistema pode criar notificações" ON public.notificacoes
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR is_admin());

-- Policies para agendamentos (líderes de células)
CREATE POLICY "Líderes podem gerenciar agendamentos de suas células" ON public.agendamentos_celulas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.celulas c 
      WHERE c.id = celula_id 
      AND (c.lider_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()) OR is_admin())
    )
  );

-- Policies para presença (líderes de células)
CREATE POLICY "Líderes podem gerenciar presença" ON public.presenca_celulas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.relatorios r
      JOIN public.celulas c ON c.id = r.celula_id
      WHERE r.id = relatorio_id
      AND (c.lider_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()) OR is_admin())
    )
  );

-- Policies para progresso de lições
CREATE POLICY "Usuários podem ver próprio progresso" ON public.progresso_licoes
  FOR SELECT USING (pessoa_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()) OR is_admin());

CREATE POLICY "Sistema pode atualizar progresso" ON public.progresso_licoes
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

-- Policies para push tokens
CREATE POLICY "Usuários podem gerenciar próprios tokens" ON public.user_push_tokens
  FOR ALL USING (user_id = auth.uid());

-- Função auxiliar para buscar pessoa atual
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.pessoas WHERE user_id = auth.uid() LIMIT 1;
$$;