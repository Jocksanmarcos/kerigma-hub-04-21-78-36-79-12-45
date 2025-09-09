-- Criar função para obter o ID da pessoa baseado no usuário autenticado
CREATE OR REPLACE FUNCTION get_current_person_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM pessoas 
    WHERE user_id = auth.uid() 
    AND situacao = 'ativo'
    LIMIT 1
  );
END;
$$;