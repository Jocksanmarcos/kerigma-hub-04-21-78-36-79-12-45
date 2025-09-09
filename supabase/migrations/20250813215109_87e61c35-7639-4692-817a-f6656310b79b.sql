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