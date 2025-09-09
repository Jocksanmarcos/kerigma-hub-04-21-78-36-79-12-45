-- Remover a constraint única existente em pessoa_id e criar a constraint correta
ALTER TABLE vinculos_familiares 
DROP CONSTRAINT IF EXISTS vinculos_familiares_pessoa_id_key;

-- Adicionar a constraint única correta para permitir uma pessoa em múltiplas famílias, mas apenas uma vez por família
ALTER TABLE vinculos_familiares 
ADD CONSTRAINT unique_pessoa_familia UNIQUE (pessoa_id, familia_id);

-- Função para sincronizar todos os vínculos familiares existentes (versão corrigida)
CREATE OR REPLACE FUNCTION public.sincronizar_vinculos_existentes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER := 0;
  v_pessoa RECORD;
  v_familia_id uuid;
  v_count_responsaveis integer;
BEGIN
  -- Limpar vínculos existentes para recriá-los corretamente
  DELETE FROM vinculos_familiares;
  
  -- Processar todas as pessoas com familia_id
  FOR v_pessoa IN 
    SELECT id, familia_id, pai_id, mae_id 
    FROM pessoas 
    WHERE familia_id IS NOT NULL
    ORDER BY familia_id, responsavel_principal_familia DESC NULLS LAST, created_at ASC
  LOOP
    v_familia_id := v_pessoa.familia_id;
    
    -- Verificar quantos responsáveis já existem nesta família
    SELECT COUNT(*) INTO v_count_responsaveis
    FROM vinculos_familiares
    WHERE familia_id = v_familia_id AND responsavel_familiar = true;
    
    -- Aplicar a mesma lógica da trigger
    IF v_count_responsaveis = 0 THEN
      -- Primeira pessoa da família - marcar como responsável
      INSERT INTO vinculos_familiares (
        pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
      ) VALUES (
        v_pessoa.id, v_familia_id, 'responsavel', true
      );
    ELSIF v_count_responsaveis = 1 THEN
      -- Segunda pessoa - provavelmente cônjuge
      INSERT INTO vinculos_familiares (
        pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
      ) VALUES (
        v_pessoa.id, v_familia_id, 'conjuge', true
      );
    ELSE
      -- Demais pessoas - marcar como familiares
      INSERT INTO vinculos_familiares (
        pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
      ) VALUES (
        v_pessoa.id, v_familia_id, 'familiar', false
      );
    END IF;
    
    -- Processar vínculos pai/filho
    IF v_pessoa.pai_id IS NOT NULL THEN
      -- Marcar a pessoa como filho
      UPDATE vinculos_familiares 
      SET tipo_vinculo = 'filho'
      WHERE pessoa_id = v_pessoa.id AND familia_id = v_familia_id;
      
      -- Criar vínculo para o pai se ele estiver na mesma família
      IF EXISTS (SELECT 1 FROM pessoas WHERE id = v_pessoa.pai_id AND familia_id = v_familia_id) THEN
        INSERT INTO vinculos_familiares (
          pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
        ) VALUES (
          v_pessoa.pai_id, v_familia_id, 'pai', true
        ) ON CONFLICT (pessoa_id, familia_id) DO UPDATE SET tipo_vinculo = 'pai';
      END IF;
    END IF;
    
    IF v_pessoa.mae_id IS NOT NULL THEN
      -- Marcar a pessoa como filho
      UPDATE vinculos_familiares 
      SET tipo_vinculo = 'filho'
      WHERE pessoa_id = v_pessoa.id AND familia_id = v_familia_id;
      
      -- Criar vínculo para a mãe se ela estiver na mesma família
      IF EXISTS (SELECT 1 FROM pessoas WHERE id = v_pessoa.mae_id AND familia_id = v_familia_id) THEN
        INSERT INTO vinculos_familiares (
          pessoa_id, familia_id, tipo_vinculo, responsavel_familiar
        ) VALUES (
          v_pessoa.mae_id, v_familia_id, 'mae', true
        ) ON CONFLICT (pessoa_id, familia_id) DO UPDATE SET tipo_vinculo = 'mae';
      END IF;
    END IF;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Executar a sincronização para todos os cadastros existentes
SELECT sincronizar_vinculos_existentes();