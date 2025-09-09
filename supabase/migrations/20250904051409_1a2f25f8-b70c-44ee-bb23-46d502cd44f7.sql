-- ===================================================================
-- CORREÇÃO: FUNÇÃO TRIGGER COM ERRO DE NOMENCLATURA
-- ===================================================================

-- Corrigir função que usa nome de coluna incorreto
CREATE OR REPLACE FUNCTION public.calcular_saude_celula(celula_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  media_presencas NUMERIC;
  crescimento_percentual NUMERIC;
  frequencia_relatorios NUMERIC;
  pontuacao_final NUMERIC;
BEGIN
  -- Calcular média de presenças usando nome correto da coluna
  SELECT AVG((presencas->>'total')::INTEGER) INTO media_presencas
  FROM (
    SELECT presencas FROM public.relatorios_semanais_celulas
    WHERE celula_id = celula_uuid
    ORDER BY data_reuniao DESC
    LIMIT 8
  ) recent_reports;

  -- Calcular crescimento percentual nas últimas 4 semanas
  SELECT 
    CASE 
      WHEN AVG(CASE WHEN rn <= 2 THEN (presencas->>'total')::INTEGER END) > 0 
      THEN ((AVG(CASE WHEN rn > 2 THEN (presencas->>'total')::INTEGER END) / 
             AVG(CASE WHEN rn <= 2 THEN (presencas->>'total')::INTEGER END)) - 1) * 100
      ELSE 0 
    END INTO crescimento_percentual
  FROM (
    SELECT presencas, ROW_NUMBER() OVER (ORDER BY data_reuniao DESC) as rn
    FROM public.relatorios_semanais_celulas
    WHERE celula_id = celula_uuid
    ORDER BY data_reuniao DESC
    LIMIT 4
  ) ranked_reports;

  -- Calcular frequência de relatórios (últimas 8 semanas)
  SELECT 
    (COUNT(*)::NUMERIC / 8) * 100 INTO frequencia_relatorios
  FROM public.relatorios_semanais_celulas
  WHERE celula_id = celula_uuid
    AND data_reuniao >= CURRENT_DATE - INTERVAL '8 weeks';

  -- Calcular pontuação final (0-100)
  pontuacao_final := GREATEST(0, LEAST(100,
    COALESCE(media_presencas, 0) * 0.4 +
    GREATEST(0, COALESCE(crescimento_percentual, 0)) * 0.3 +
    COALESCE(frequencia_relatorios, 0) * 0.3
  ));

  RETURN pontuacao_final;
END;
$$;