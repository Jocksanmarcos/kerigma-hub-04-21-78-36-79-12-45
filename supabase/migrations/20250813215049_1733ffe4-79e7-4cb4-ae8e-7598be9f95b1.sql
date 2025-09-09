-- FASE 1: Criar função get_current_person_id que estava em falta
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.pessoas 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;

-- FASE 2: Otimização de performance - adicionar índices críticos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pessoas_user_id ON public.pessoas(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pessoas_situacao ON public.pessoas(situacao);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pessoas_igreja_id ON public.pessoas(igreja_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_permissions_profile_id ON public.profile_permissions(profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_permissions_permission_id ON public.profile_permissions(permission_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_admin_user_id ON public.usuarios_admin(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eventos_igreja_id_publico ON public.eventos(igreja_id, publico);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_celulas_lider_id ON public.celulas(lider_id);

-- FASE 3: Ativar realtime para tabelas críticas
ALTER TABLE public.pessoas REPLICA IDENTITY FULL;
ALTER TABLE public.profile_permissions REPLICA IDENTITY FULL;
ALTER TABLE public.agendamentos REPLICA IDENTITY FULL;
ALTER TABLE public.eventos REPLICA IDENTITY FULL;

-- Adicionar às publicações realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pessoas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos;