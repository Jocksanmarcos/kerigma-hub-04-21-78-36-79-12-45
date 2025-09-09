-- Corrigir função de update para ter search_path seguro
DROP FUNCTION IF EXISTS update_progresso_planos_updated_at();

CREATE OR REPLACE FUNCTION update_progresso_planos_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;