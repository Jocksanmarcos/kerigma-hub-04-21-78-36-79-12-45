-- Primeiro, corrigir a função get_complete_family que estava com erro de ambiguidade
DROP FUNCTION IF EXISTS public.get_complete_family(uuid);

CREATE OR REPLACE FUNCTION public.get_complete_family(p_pessoa_id uuid)
RETURNS TABLE(
  familiar_id uuid,
  familiar_nome text,
  familiar_email text,
  familiar_telefone text,
  tipo_vinculo text,
  eh_responsavel boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_familia_id uuid;
BEGIN
  -- Buscar o familia_id da pessoa
  SELECT p.familia_id INTO v_familia_id
  FROM pessoas p
  WHERE p.id = p_pessoa_id;
  
  IF v_familia_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Buscar TODOS os vínculos através da tabela vinculos_familiares primeiro
  RETURN QUERY
  SELECT 
    p.id as familiar_id,
    p.nome_completo as familiar_nome,
    p.email as familiar_email,
    p.telefone as familiar_telefone,
    COALESCE(vf.tipo_vinculo, 'familiar') as tipo_vinculo,
    COALESCE(vf.responsavel_familiar, false) as eh_responsavel
  FROM pessoas p
  LEFT JOIN vinculos_familiares vf ON vf.pessoa_id = p.id AND vf.familia_id = v_familia_id
  WHERE p.familia_id = v_familia_id 
    AND p.id != p_pessoa_id
    AND p.situacao = 'ativo'
  
  UNION
  
  -- Buscar vínculos através de pai_id (quem tem esta pessoa como pai)
  SELECT 
    p.id as familiar_id,
    p.nome_completo as familiar_nome,
    p.email as familiar_email,
    p.telefone as familiar_telefone,
    'filho(a)' as tipo_vinculo,
    false as eh_responsavel
  FROM pessoas p
  WHERE p.pai_id = p_pessoa_id
    AND p.situacao = 'ativo'
    AND NOT EXISTS (
      SELECT 1 FROM pessoas p2 
      WHERE p2.id = p.id AND p2.familia_id = v_familia_id
    )
  
  UNION
  
  -- Buscar vínculos através de mae_id (quem tem esta pessoa como mãe)
  SELECT 
    p.id as familiar_id,
    p.nome_completo as familiar_nome,
    p.email as familiar_email,
    p.telefone as familiar_telefone,
    'filho(a)' as tipo_vinculo,
    false as eh_responsavel
  FROM pessoas p
  WHERE p.mae_id = p_pessoa_id
    AND p.situacao = 'ativo'
    AND NOT EXISTS (
      SELECT 1 FROM pessoas p2 
      WHERE p2.id = p.id AND p2.familia_id = v_familia_id
    )
  
  UNION
  
  -- Buscar pai através de pai_id
  SELECT 
    p.id as familiar_id,
    p.nome_completo as familiar_nome,
    p.email as familiar_email,
    p.telefone as familiar_telefone,
    'pai' as tipo_vinculo,
    true as eh_responsavel
  FROM pessoas p, pessoas pessoa_atual
  WHERE pessoa_atual.id = p_pessoa_id
    AND p.id = pessoa_atual.pai_id
    AND p.situacao = 'ativo'
    AND NOT EXISTS (
      SELECT 1 FROM pessoas p2 
      WHERE p2.id = p.id AND p2.familia_id = v_familia_id
    )
  
  UNION
  
  -- Buscar mãe através de mae_id
  SELECT 
    p.id as familiar_id,
    p.nome_completo as familiar_nome,
    p.email as familiar_email,
    p.telefone as familiar_telefone,
    'mae' as tipo_vinculo,
    true as eh_responsavel
  FROM pessoas p, pessoas pessoa_atual
  WHERE pessoa_atual.id = p_pessoa_id
    AND p.id = pessoa_atual.mae_id
    AND p.situacao = 'ativo'
    AND NOT EXISTS (
      SELECT 1 FROM pessoas p2 
      WHERE p2.id = p.id AND p2.familia_id = v_familia_id
    );
END;
$$;