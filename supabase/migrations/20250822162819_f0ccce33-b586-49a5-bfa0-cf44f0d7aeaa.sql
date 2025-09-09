-- Função para sincronizar vínculos familiares automaticamente
CREATE OR REPLACE FUNCTION public.sync_vinculos_familiares()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_familia_id uuid;
  v_pessoa_responsavel uuid;
  v_count_responsaveis integer;
BEGIN
  -- Se familia_id foi definido/alterado
  IF NEW.familia_id IS NOT NULL AND (OLD.familia_id IS NULL OR OLD.familia_id != NEW.familia_id) THEN
    v_familia_id := NEW.familia_id;
    
    -- Verificar se já existe um vínculo para esta pessoa nesta família
    IF NOT EXISTS (
      SELECT 1 FROM vinculos_familiares 
      WHERE pessoa_id = NEW.id AND familia_id = v_familia_id
    ) THEN
      -- Verificar quantos responsáveis já existem nesta família
      SELECT COUNT(*) INTO v_count_responsaveis
      FROM vinculos_familiares
      WHERE familia_id = v_familia_id AND responsavel_familiar = true;
      
      -- Se não há responsáveis ou há apenas um, esta pessoa pode ser cônjuge ou responsável
      IF v_count_responsaveis = 0 THEN
        -- Primeira pessoa da família - marcar como responsável
        INSERT INTO vinculos_familiares (
          pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
        ) VALUES (
          NEW.id, v_familia_id, 'responsavel', true
        );
      ELSIF v_count_responsaveis = 1 THEN
        -- Segunda pessoa - provavelmente cônjuge
        INSERT INTO vinculos_familiares (
          pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
        ) VALUES (
          NEW.id, v_familia_id, 'conjuge', true
        );
      ELSE
        -- Demais pessoas - marcar como familiares
        INSERT INTO vinculos_familiares (
          pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
        ) VALUES (
          NEW.id, v_familia_id, 'familiar', false
        );
      END IF;
    END IF;
  END IF;
  
  -- Sincronizar vínculos pai/mãe com vinculos_familiares
  IF NEW.pai_id IS NOT NULL AND (OLD.pai_id IS NULL OR OLD.pai_id != NEW.pai_id) THEN
    -- Criar vínculo filho -> pai se não existir
    INSERT INTO vinculos_familiares (
      pessoa_id, familia_id, tipo_vinculo, responsavel_familiar, pessoa_relacionada_id
    ) VALUES (
      NEW.id, COALESCE(NEW.familia_id, v_familia_id), 'filho', false, NEW.pai_id
    ) ON CONFLICT (pessoa_id, familia_id, pessoa_relacionada_id) DO NOTHING;
    
    -- Criar vínculo pai -> filho se não existir
    INSERT INTO vinculos_familiares (
      pessoa_id, familia_id, tipo_vinculo, responsavel_familiar, pessoa_relacionada_id
    ) VALUES (
      NEW.pai_id, COALESCE(NEW.familia_id, v_familia_id), 'pai', true, NEW.id
    ) ON CONFLICT (pessoa_id, familia_id, pessoa_relacionada_id) DO NOTHING;
  END IF;
  
  IF NEW.mae_id IS NOT NULL AND (OLD.mae_id IS NULL OR OLD.mae_id != NEW.mae_id) THEN
    -- Criar vínculo filho -> mãe se não existir
    INSERT INTO vinculos_familiares (
      pessoa_id, familia_id, tipo_vinculo, responsavel_familiar, pessoa_relacionada_id
    ) VALUES (
      NEW.id, COALESCE(NEW.familia_id, v_familia_id), 'filho', false, NEW.mae_id
    ) ON CONFLICT (pessoa_id, familia_id, pessoa_relacionada_id) DO NOTHING;
    
    -- Criar vínculo mãe -> filho se não existir
    INSERT INTO vinculos_familiares (
      pessoa_id, familia_id, tipo_vinculo, responsavel_familiar, pessoa_relacionada_id
    ) VALUES (
      NEW.mae_id, COALESCE(NEW.familia_id, v_familia_id), 'mae', true, NEW.id
    ) ON CONFLICT (pessoa_id, familia_id, pessoa_relacionada_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Substituir a trigger existente
DROP TRIGGER IF EXISTS sync_family_links ON pessoas;
CREATE TRIGGER sync_family_links
  AFTER INSERT OR UPDATE ON pessoas
  FOR EACH ROW
  EXECUTE FUNCTION sync_vinculos_familiares();