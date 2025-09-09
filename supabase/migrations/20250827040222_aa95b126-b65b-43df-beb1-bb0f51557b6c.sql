-- Primeiro remover o trigger
DROP TRIGGER IF EXISTS update_progresso_planos_updated_at ON public.progresso_planos_leitura;

-- Depois remover a função
DROP FUNCTION IF EXISTS update_progresso_planos_updated_at();

-- Recriar a função com search_path seguro
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

-- Recriar o trigger
CREATE TRIGGER update_progresso_planos_updated_at
  BEFORE UPDATE ON public.progresso_planos_leitura
  FOR EACH ROW
  EXECUTE FUNCTION update_progresso_planos_updated_at();