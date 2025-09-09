-- Fix security warnings by setting search_path for existing functions that need it
CREATE OR REPLACE FUNCTION public.atualizar_progresso_leitura()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  pessoa_id_usuario UUID;
  pontos_ganhos INTEGER := 10;
BEGIN
  SELECT id INTO pessoa_id_usuario
  FROM public.pessoas 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF pessoa_id_usuario IS NULL THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.estudo_biblico_progresso (
    pessoa_id,
    pontos_xp,
    total_versiculos_lidos,
    sequencia_dias,
    ultimo_versiculo_lido_id,
    preferencias
  ) 
  VALUES (
    pessoa_id_usuario,
    pontos_ganhos,
    1,
    1,
    NEW.id,
    '{}'::jsonb
  )
  ON CONFLICT (pessoa_id) 
  DO UPDATE SET
    pontos_xp = estudo_biblico_progresso.pontos_xp + pontos_ganhos,
    total_versiculos_lidos = estudo_biblico_progresso.total_versiculos_lidos + 1,
    ultimo_versiculo_lido_id = NEW.id,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.marcar_capitulo_lido(
  p_livro_id UUID,
  p_capitulo INTEGER,
  p_versao_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  pessoa_id_usuario UUID;
  primeiro_versiculo_id UUID;
  pontos_capitulo INTEGER := 50;
BEGIN
  SELECT id INTO pessoa_id_usuario
  FROM public.pessoas 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF pessoa_id_usuario IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT id INTO primeiro_versiculo_id
  FROM public.biblia_versiculos
  WHERE livro_id = p_livro_id 
  AND capitulo = p_capitulo
  AND (p_versao_id IS NULL OR versao_id = p_versao_id)
  ORDER BY versiculo
  LIMIT 1;
  
  IF primeiro_versiculo_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.estudo_biblico_progresso (
    pessoa_id,
    pontos_xp,
    total_versiculos_lidos,
    sequencia_dias,
    ultimo_versiculo_lido_id,
    preferencias
  ) 
  VALUES (
    pessoa_id_usuario,
    pontos_capitulo,
    1,
    CASE 
      WHEN CURRENT_DATE > (SELECT updated_at::date FROM public.estudo_biblico_progresso WHERE pessoa_id = pessoa_id_usuario) 
      THEN 1 
      ELSE 0 
    END,
    primeiro_versiculo_id,
    '{}'::jsonb
  )
  ON CONFLICT (pessoa_id) 
  DO UPDATE SET
    pontos_xp = estudo_biblico_progresso.pontos_xp + pontos_capitulo,
    total_versiculos_lidos = estudo_biblico_progresso.total_versiculos_lidos + 1,
    ultimo_versiculo_lido_id = primeiro_versiculo_id,
    sequencia_dias = CASE 
      WHEN CURRENT_DATE = estudo_biblico_progresso.updated_at::date THEN estudo_biblico_progresso.sequencia_dias
      WHEN CURRENT_DATE = (estudo_biblico_progresso.updated_at::date + INTERVAL '1 day') THEN estudo_biblico_progresso.sequencia_dias + 1
      ELSE 1
    END,
    updated_at = now();
  
  RETURN TRUE;
END;
$$;