-- Verificar e corrigir responsáveis de família
-- Primeiro, vamos verificar a situação atual
SELECT 
  p.nome_completo,
  p.familia_id,
  p.tipo_responsabilidade_familiar,
  p.responsavel_principal_familia,
  f.nome_familia
FROM pessoas p
LEFT JOIN familias f ON f.id = p.familia_id
WHERE p.nome_completo ILIKE '%wilton%'
AND p.situacao = 'ativo';

-- Se não há responsável principal definido, vamos definir o primeiro membro como responsável
-- Para cada família, garantir que há pelo menos um responsável principal
DO $$
DECLARE
  familia_record RECORD;
  primeiro_membro_id UUID;
BEGIN
  -- Para cada família sem responsável principal
  FOR familia_record IN (
    SELECT DISTINCT familia_id
    FROM pessoas 
    WHERE familia_id IS NOT NULL 
    AND situacao = 'ativo'
    AND familia_id NOT IN (
      SELECT DISTINCT familia_id 
      FROM pessoas 
      WHERE responsavel_principal_familia = true 
      AND familia_id IS NOT NULL
      AND situacao = 'ativo'
    )
  ) LOOP
    
    -- Pegar o primeiro membro da família (alfabeticamente)
    SELECT id INTO primeiro_membro_id
    FROM pessoas 
    WHERE familia_id = familia_record.familia_id 
    AND situacao = 'ativo'
    ORDER BY nome_completo
    LIMIT 1;
    
    -- Definir como responsável principal
    IF primeiro_membro_id IS NOT NULL THEN
      UPDATE pessoas 
      SET 
        tipo_responsabilidade_familiar = 'responsavel',
        responsavel_principal_familia = true
      WHERE id = primeiro_membro_id;
      
      RAISE NOTICE 'Definido responsável principal para família % - pessoa %', familia_record.familia_id, primeiro_membro_id;
    END IF;
    
  END LOOP;
END $$;

-- Verificar resultado final para Wilton
SELECT 
  p.nome_completo,
  p.familia_id,
  p.tipo_responsabilidade_familiar,
  p.responsavel_principal_familia,
  f.nome_familia
FROM pessoas p
LEFT JOIN familias f ON f.id = p.familia_id
WHERE p.nome_completo ILIKE '%wilton%'
AND p.situacao = 'ativo';