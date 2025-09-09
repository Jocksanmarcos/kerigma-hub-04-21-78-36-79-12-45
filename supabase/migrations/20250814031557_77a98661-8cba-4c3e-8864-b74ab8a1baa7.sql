-- Corrigir funções sem search_path definido para resolver warnings de segurança

-- Atualizar função cleanup_old_rate_limits com search_path
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM api_rate_limits 
  WHERE created_at < (now() - INTERVAL '1 hour');
END;
$$;

-- Atualizar outras funções existentes que não têm search_path definido
CREATE OR REPLACE FUNCTION public.processar_conclusao_licao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  pontos_base INTEGER := 10;
BEGIN
  INSERT INTO public.conquistas_ensino (
    pessoa_id, pontos_ganhos, tipo_conquista, detalhes
  ) VALUES (
    (SELECT pessoa_id FROM public.matriculas WHERE id = NEW.matricula_id),
    pontos_base,
    'licao_completa',
    jsonb_build_object('licao_id', NEW.licao_id, 'progresso_percent', NEW.progresso_percent)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_progresso_leitura()
RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.criar_historico_patrimonio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Registrar mudanças importantes
  IF OLD.status != NEW.status THEN
    INSERT INTO public.historico_patrimonio (patrimonio_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_status', 'Mudança de status', OLD.status, NEW.status, auth.uid());
  END IF;
  
  IF OLD.localizacao_atual IS DISTINCT FROM NEW.localizacao_atual THEN
    INSERT INTO public.historico_patrimonio (patrimonio_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_localizacao', 'Mudança de localização', 
            COALESCE(OLD.localizacao_atual, 'não informado'), 
            COALESCE(NEW.localizacao_atual, 'não informado'), 
            auth.uid());
  END IF;
  
  IF OLD.responsavel_id IS DISTINCT FROM NEW.responsavel_id THEN
    INSERT INTO public.historico_patrimonio (patrimonio_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_responsavel', 'Mudança de responsável', 
            COALESCE(OLD.responsavel_id::text, 'nenhum'), 
            COALESCE(NEW.responsavel_id::text, 'nenhum'), 
            auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$;