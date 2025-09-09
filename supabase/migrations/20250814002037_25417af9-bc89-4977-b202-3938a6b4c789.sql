-- Corrigir problemas de segurança identificados

-- 1. Adicionar policies para as tabelas cache_localizacoes e emails_queue
CREATE POLICY "Sistema pode gerenciar localizações" ON public.cache_localizacoes
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

CREATE POLICY "Sistema pode gerenciar emails" ON public.emails_queue
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

-- 2. Corrigir search_path nas funções criadas
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.pessoas WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.update_updated_at_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;