-- Atualizar a função get_combined_user_role para ser mais robusta
CREATE OR REPLACE FUNCTION public.get_combined_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
  is_pastor BOOLEAN := false;
  is_lider_cel BOOLEAN := false;
  is_lider_min BOOLEAN := false;
BEGIN
  -- Obter o user_id atual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 'membro';
  END IF;

  -- Verificar se é pastor
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = current_user_id AND role = 'pastor'
  ) INTO is_pastor;

  IF is_pastor THEN
    RETURN 'pastor';
  END IF;

  -- Verificar se é líder de célula (pela tabela celulas)
  SELECT EXISTS (
    SELECT 1 FROM celulas c
    INNER JOIN pessoas p ON p.id = c.lider_id
    WHERE p.user_id = current_user_id
      AND c.ativa = true
  ) INTO is_lider_cel;

  -- Verificar se é líder de ministério (pela tabela ministerios)
  SELECT EXISTS (
    SELECT 1 FROM ministerios m
    INNER JOIN pessoas p ON p.id = m.lider_id
    WHERE p.user_id = current_user_id
      AND m.ativo = true
  ) INTO is_lider_min;

  IF is_lider_cel OR is_lider_min THEN
    RETURN 'lider';
  END IF;

  RETURN 'membro';
END;
$$;