-- Função para calcular saúde da célula automaticamente com search_path seguro
CREATE OR REPLACE FUNCTION public.calcular_saude_celula(celula_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  total_relatorios INTEGER;
  relatorios_recentes INTEGER;
  media_presenca DECIMAL;
  crescimento_visitantes DECIMAL;
  saude TEXT;
BEGIN
  -- Contar relatórios dos últimos 30 dias
  SELECT COUNT(*) INTO relatorios_recentes
  FROM public.relatorios_semanais_celulas
  WHERE celula_id = celula_uuid AND data_reuniao > CURRENT_DATE - INTERVAL '30 days';
  
  -- Calcular média de presença dos últimos 8 relatórios
  SELECT AVG(presentes) INTO media_presenca
  FROM (
    SELECT presentes FROM public.relatorios_semanais_celulas
    WHERE celula_id = celula_uuid
    ORDER BY data_reuniao DESC
    LIMIT 8
  ) recent_reports;
  
  -- Calcular crescimento de visitantes
  SELECT AVG(visitantes) INTO crescimento_visitantes
  FROM public.relatorios_semanais_celulas
  WHERE celula_id = celula_uuid AND data_reuniao > CURRENT_DATE - INTERVAL '60 days';
  
  -- Definir saúde baseada em critérios
  IF relatorios_recentes >= 3 AND COALESCE(media_presenca, 0) >= 8 AND COALESCE(crescimento_visitantes, 0) >= 1 THEN
    saude := 'Verde';
  ELSIF relatorios_recentes >= 2 AND COALESCE(media_presenca, 0) >= 5 THEN
    saude := 'Amarelo';
  ELSE
    saude := 'Vermelho';
  END IF;
  
  -- Atualizar a célula
  UPDATE public.celulas SET saude_celula = saude WHERE id = celula_uuid;
  
  RETURN saude;
END;
$$;

-- Trigger para atualizar saúde automaticamente quando relatório é inserido
CREATE OR REPLACE FUNCTION trigger_atualizar_saude_celula()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.calcular_saude_celula(NEW.celula_id);
  RETURN NEW;
END;
$$;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS atualizar_saude_celula_trigger ON public.relatorios_semanais_celulas;
CREATE TRIGGER atualizar_saude_celula_trigger 
AFTER INSERT OR UPDATE ON public.relatorios_semanais_celulas 
FOR EACH ROW EXECUTE FUNCTION trigger_atualizar_saude_celula();