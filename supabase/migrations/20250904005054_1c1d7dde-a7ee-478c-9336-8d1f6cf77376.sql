-- Criar função para verificar se usuário é líder de ministério
CREATE OR REPLACE FUNCTION public.is_lider_ministerio()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM ministerios m
    INNER JOIN pessoas p ON p.id = m.lider_id
    WHERE p.user_id = auth.uid()
      AND m.ativo = true
  )
$$;