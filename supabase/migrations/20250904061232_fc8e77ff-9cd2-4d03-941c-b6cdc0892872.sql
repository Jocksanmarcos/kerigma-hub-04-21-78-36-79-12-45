-- Corrigir a função is_admin() para verificar corretamente administradores
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel = 'admin'
  );
END;
$$;