-- Criar edge function para limpeza de dados genealógicos
CREATE OR REPLACE FUNCTION public.limpar_genealogia_pessoas(
  p_pessoa_ids UUID[] DEFAULT NULL,
  p_resetar_todas BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  pessoas_processadas INTEGER,
  familias_removidas INTEGER,
  vinculos_removidos INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pessoas_processadas INTEGER := 0;
  v_familias_removidas INTEGER := 0;
  v_vinculos_removidos INTEGER := 0;
  v_pessoa_id UUID;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  -- Se resetar todas as pessoas
  IF p_resetar_todas THEN
    -- Remover todos os vínculos familiares
    DELETE FROM vinculos_familiares;
    GET DIAGNOSTICS v_vinculos_removidos = ROW_COUNT;
    
    -- Resetar familia_id de todas as pessoas
    UPDATE pessoas SET familia_id = NULL WHERE familia_id IS NOT NULL;
    GET DIAGNOSTICS v_pessoas_processadas = ROW_COUNT;
    
    -- Remover famílias órfãs
    DELETE FROM familias WHERE id NOT IN (
      SELECT DISTINCT familia_id FROM pessoas WHERE familia_id IS NOT NULL
    );
    GET DIAGNOSTICS v_familias_removidas = ROW_COUNT;
    
  ELSE
    -- Processar pessoas específicas
    IF p_pessoa_ids IS NOT NULL THEN
      FOREACH v_pessoa_id IN ARRAY p_pessoa_ids
      LOOP
        -- Remover vínculos específicos desta pessoa
        DELETE FROM vinculos_familiares 
        WHERE pessoa_id = v_pessoa_id OR pessoa_relacionada_id = v_pessoa_id;
        
        -- Resetar familia_id desta pessoa
        UPDATE pessoas SET familia_id = NULL WHERE id = v_pessoa_id;
        
        v_pessoas_processadas := v_pessoas_processadas + 1;
      END LOOP;
      
      -- Contar vínculos removidos (aproximação)
      v_vinculos_removidos := array_length(p_pessoa_ids, 1) * 2;
      
      -- Remover famílias órfãs
      DELETE FROM familias WHERE id NOT IN (
        SELECT DISTINCT familia_id FROM pessoas WHERE familia_id IS NOT NULL
      );
      GET DIAGNOSTICS v_familias_removidas = ROW_COUNT;
    END IF;
  END IF;

  RETURN QUERY SELECT v_pessoas_processadas, v_familias_removidas, v_vinculos_removidos;
END;
$$;

-- Criar função para buscar pessoas importadas recentemente (candidatas a limpeza)
CREATE OR REPLACE FUNCTION public.buscar_pessoas_importadas_recentemente(
  p_dias INTEGER DEFAULT 30
)
RETURNS TABLE(
  id UUID,
  nome_completo TEXT,
  email TEXT,
  familia_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  tem_vinculos BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    p.email,
    p.familia_id,
    p.created_at,
    EXISTS(
      SELECT 1 FROM vinculos_familiares vf 
      WHERE vf.pessoa_id = p.id OR vf.pessoa_relacionada_id = p.id
    ) as tem_vinculos
  FROM pessoas p
  WHERE p.created_at >= (CURRENT_TIMESTAMP - INTERVAL '1 day' * p_dias)
    AND (p.familia_id IS NOT NULL OR EXISTS(
      SELECT 1 FROM vinculos_familiares vf 
      WHERE vf.pessoa_id = p.id OR vf.pessoa_relacionada_id = p.id
    ))
  ORDER BY p.created_at DESC;
END;
$$;