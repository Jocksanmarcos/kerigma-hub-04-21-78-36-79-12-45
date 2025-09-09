-- SAFE OPTIMIZATION MIGRATION (no destructive drops)
-- Fix recurring error and add performance indexes + secure RLS

-- 0) Fix: add missing column cursos.destaque referenced by app/logs
ALTER TABLE public.cursos
  ADD COLUMN IF NOT EXISTS destaque boolean NOT NULL DEFAULT false;

-- 1) Performance indexes (only on existing columns)
-- Pessoas
CREATE INDEX IF NOT EXISTS idx_pessoas_user_id ON public.pessoas(user_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_celula_id ON public.pessoas(celula_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON public.pessoas(email);
CREATE INDEX IF NOT EXISTS idx_pessoas_situacao ON public.pessoas(situacao);
CREATE INDEX IF NOT EXISTS idx_pessoas_tipo_pessoa ON public.pessoas(tipo_pessoa);

-- Células
CREATE INDEX IF NOT EXISTS idx_celulas_lider_id ON public.celulas(lider_id);
CREATE INDEX IF NOT EXISTS idx_celulas_ativa ON public.celulas(ativa);
CREATE INDEX IF NOT EXISTS idx_celulas_rede_id ON public.celulas(rede_id);
CREATE INDEX IF NOT EXISTS idx_celulas_geracao ON public.celulas(geracao);

-- Agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_inicio ON public.agendamentos(data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_calendario ON public.agendamentos(calendario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON public.agendamentos(status);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON public.eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_igreja_id ON public.eventos(igreja_id);
CREATE INDEX IF NOT EXISTS idx_eventos_publico ON public.eventos(publico);
CREATE INDEX IF NOT EXISTS idx_eventos_inscricoes_abertas ON public.eventos(inscricoes_abertas);

-- Financeiro
CREATE INDEX IF NOT EXISTS idx_lf_v2_data ON public.lancamentos_financeiros_v2(data_lancamento);
CREATE INDEX IF NOT EXISTS idx_lf_v2_tipo ON public.lancamentos_financeiros_v2(tipo);
CREATE INDEX IF NOT EXISTS idx_lf_v2_status ON public.lancamentos_financeiros_v2(status);
CREATE INDEX IF NOT EXISTS idx_lf_v2_categoria ON public.lancamentos_financeiros_v2(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lf_v2_pessoa ON public.lancamentos_financeiros_v2(pessoa_id);

-- Escalas de serviço
CREATE INDEX IF NOT EXISTS idx_escalas_servico_pessoa ON public.escalas_servico(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_escalas_servico_funcao ON public.escalas_servico(funcao_id);
CREATE INDEX IF NOT EXISTS idx_escalas_servico_status ON public.escalas_servico(status_confirmacao);

-- 2) Secure RLS for sensitive tables (close public reads)
-- Relacionamentos familiares
ALTER TABLE public.relacionamentos_familiares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rf_admin_select" ON public.relacionamentos_familiares;
CREATE POLICY "rf_admin_select" ON public.relacionamentos_familiares
FOR SELECT USING (is_admin());

-- Profile permissions
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pp_admin_all" ON public.profile_permissions;
CREATE POLICY "pp_admin_all" ON public.profile_permissions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Security profile permissions
ALTER TABLE public.security_profile_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "spp_admin_all" ON public.security_profile_permissions;
CREATE POLICY "spp_admin_all" ON public.security_profile_permissions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Security permissions catalogue
ALTER TABLE public.security_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sp_admin_select" ON public.security_permissions;
CREATE POLICY "sp_admin_select" ON public.security_permissions
FOR SELECT USING (is_admin());

-- Papeis igreja
ALTER TABLE public.papeis_igreja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pi_admin_select" ON public.papeis_igreja;
CREATE POLICY "pi_admin_select" ON public.papeis_igreja
FOR SELECT USING (is_admin());

-- 3) Update planner stats
ANALYZE;