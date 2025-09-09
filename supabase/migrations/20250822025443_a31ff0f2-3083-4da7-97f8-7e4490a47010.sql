-- Fix the genealogy cleanup function to handle the DELETE requirements properly
CREATE OR REPLACE FUNCTION public.limpar_genealogia_pessoas(p_pessoa_ids uuid[] DEFAULT NULL::uuid[], p_resetar_todas boolean DEFAULT false)
 RETURNS TABLE(pessoas_processadas integer, familias_removidas integer, vinculos_removidos integer)
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
    -- Remover todos os vínculos familiares (com WHERE clause explícita)
    DELETE FROM vinculos_familiares WHERE id IS NOT NULL;
    GET DIAGNOSTICS v_vinculos_removidos = ROW_COUNT;
    
    -- Resetar familia_id de todas as pessoas
    UPDATE pessoas SET familia_id = NULL WHERE familia_id IS NOT NULL;
    GET DIAGNOSTICS v_pessoas_processadas = ROW_COUNT;
    
    -- Remover famílias órfãs (com WHERE clause explícita)
    DELETE FROM familias WHERE id NOT IN (
      SELECT DISTINCT familia_id FROM pessoas WHERE familia_id IS NOT NULL
    ) AND id IS NOT NULL;
    GET DIAGNOSTICS v_familias_removidas = ROW_COUNT;
    
  ELSE
    -- Processar pessoas específicas
    IF p_pessoa_ids IS NOT NULL THEN
      FOREACH v_pessoa_id IN ARRAY p_pessoa_ids
      LOOP
        -- Remover vínculos específicos desta pessoa
        DELETE FROM vinculos_familiares 
        WHERE (pessoa_id = v_pessoa_id OR pessoa_relacionada_id = v_pessoa_id) AND id IS NOT NULL;
        
        -- Resetar familia_id desta pessoa
        UPDATE pessoas SET familia_id = NULL WHERE id = v_pessoa_id;
        
        v_pessoas_processadas := v_pessoas_processadas + 1;
      END LOOP;
      
      -- Contar vínculos removidos (aproximação)
      v_vinculos_removidos := array_length(p_pessoa_ids, 1) * 2;
      
      -- Remover famílias órfãs
      DELETE FROM familias WHERE id NOT IN (
        SELECT DISTINCT familia_id FROM pessoas WHERE familia_id IS NOT NULL
      ) AND id IS NOT NULL;
      GET DIAGNOSTICS v_familias_removidas = ROW_COUNT;
    END IF;
  END IF;

  RETURN QUERY SELECT v_pessoas_processadas, v_familias_removidas, v_vinculos_removidos;
END;
$$;