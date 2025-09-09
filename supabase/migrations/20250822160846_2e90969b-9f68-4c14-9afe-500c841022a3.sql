-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION sync_family_links()
RETURNS TRIGGER AS $$
BEGIN
  -- Para vínculos conjugais e outras relações mais complexas,
  -- a lógica bidirecional será tratada na função get_complete_family
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Corrigir função get_complete_family com search_path seguro
CREATE OR REPLACE FUNCTION get_complete_family(pessoa_uuid UUID)
RETURNS TABLE (
  pessoa_id UUID,
  nome_completo TEXT,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  tipo_vinculo TEXT,
  is_current_person BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH pessoa_atual AS (
    SELECT p.*, p.id as current_id
    FROM pessoas p 
    WHERE p.id = pessoa_uuid
  ),
  vinculos_diretos AS (
    -- Pais da pessoa atual
    SELECT 
      p.id as pessoa_id,
      p.nome_completo,
      p.email,
      p.telefone,
      p.data_nascimento,
      CASE 
        WHEN p.id = pa.pai_id THEN 'pai'
        WHEN p.id = pa.mae_id THEN 'mae'
      END as tipo_vinculo,
      false as is_current_person
    FROM pessoa_atual pa
    JOIN pessoas p ON (p.id = pa.pai_id OR p.id = pa.mae_id)
    WHERE p.situacao = 'ativo'

    UNION ALL

    -- Filhos da pessoa atual (pessoas que têm esta pessoa como pai ou mãe)
    SELECT 
      p.id as pessoa_id,
      p.nome_completo,
      p.email,
      p.telefone,
      p.data_nascimento,
      CASE 
        WHEN p.pai_id = pessoa_uuid THEN 'filho'
        WHEN p.mae_id = pessoa_uuid THEN 'filho'
      END as tipo_vinculo,
      false as is_current_person
    FROM pessoas p
    WHERE (p.pai_id = pessoa_uuid OR p.mae_id = pessoa_uuid)
    AND p.situacao = 'ativo'

    UNION ALL

    -- Irmãos (pessoas com mesmo pai ou mesma mãe)
    SELECT 
      p.id as pessoa_id,
      p.nome_completo,
      p.email,
      p.telefone,
      p.data_nascimento,
      'irmao' as tipo_vinculo,
      false as is_current_person
    FROM pessoa_atual pa
    JOIN pessoas p ON (
      (p.pai_id = pa.pai_id AND pa.pai_id IS NOT NULL) OR 
      (p.mae_id = pa.mae_id AND pa.mae_id IS NOT NULL)
    )
    WHERE p.id != pessoa_uuid
    AND p.situacao = 'ativo'

    UNION ALL

    -- Cônjuge (pessoas que têm filhos em comum)
    SELECT DISTINCT
      p.id as pessoa_id,
      p.nome_completo,
      p.email,
      p.telefone,
      p.data_nascimento,
      'conjuge' as tipo_vinculo,
      false as is_current_person
    FROM pessoas p
    WHERE p.situacao = 'ativo'
    AND p.id != pessoa_uuid
    AND EXISTS (
      SELECT 1 FROM pessoas filhos
      WHERE filhos.situacao = 'ativo'
      AND (
        (filhos.pai_id = pessoa_uuid AND filhos.mae_id = p.id) OR
        (filhos.mae_id = pessoa_uuid AND filhos.pai_id = p.id)
      )
    )

    UNION ALL

    -- A própria pessoa
    SELECT 
      pa.id as pessoa_id,
      pa.nome_completo,
      pa.email,
      pa.telefone,
      pa.data_nascimento,
      'atual' as tipo_vinculo,
      true as is_current_person
    FROM pessoa_atual pa
  )
  SELECT * FROM vinculos_diretos
  ORDER BY 
    CASE tipo_vinculo
      WHEN 'atual' THEN 1
      WHEN 'conjuge' THEN 2
      WHEN 'pai' THEN 3
      WHEN 'mae' THEN 4
      WHEN 'filho' THEN 5
      WHEN 'irmao' THEN 6
      ELSE 7
    END,
    vinculos_diretos.nome_completo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';