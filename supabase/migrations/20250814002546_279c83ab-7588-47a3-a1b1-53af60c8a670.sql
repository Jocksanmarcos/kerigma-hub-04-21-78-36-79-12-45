-- Corrigir políticas e funções de segurança

-- Remover policies existentes antes de recriar
DROP POLICY IF EXISTS "Sistema pode gerenciar localizações" ON public.cache_localizacoes;
DROP POLICY IF EXISTS "Sistema pode gerenciar emails" ON public.emails_queue;

-- Recriar policies corretamente
CREATE POLICY "Sistema pode gerenciar localizações" ON public.cache_localizacoes
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

CREATE POLICY "Sistema pode gerenciar emails" ON public.emails_queue
  FOR ALL USING (auth.role() = 'service_role' OR is_admin());

-- Corrigir search_path em todas as funções relacionadas
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
  DELETE FROM public.logs_sistema 
  WHERE created_at < (now() - INTERVAL '90 days');
  
  DELETE FROM public.cache_relatorios 
  WHERE expira_em < now();
  
  DELETE FROM public.logs_sincronizacao 
  WHERE timestamp < (now() - INTERVAL '30 days');
  
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