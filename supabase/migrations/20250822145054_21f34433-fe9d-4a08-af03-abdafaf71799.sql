-- Verificar a situação atual da família Araujo Barros
SELECT 
  p.nome_completo,
  p.familia_id,
  p.tipo_responsabilidade_familiar,
  p.responsavel_principal_familia,
  f.nome_familia
FROM pessoas p
LEFT JOIN familias f ON f.id = p.familia_id
WHERE p.familia_id = (
  SELECT familia_id 
  FROM pessoas 
  WHERE nome_completo ILIKE '%wilton%' 
  AND situacao = 'ativo'
  LIMIT 1
)
AND p.situacao = 'ativo'
ORDER BY p.responsavel_principal_familia DESC, p.nome_completo;

-- Corrigir: definir apenas o Wilton como responsável principal
-- Primeiro, remover responsabilidade de todos
UPDATE pessoas 
SET responsavel_principal_familia = false
WHERE familia_id = (
  SELECT familia_id 
  FROM pessoas 
  WHERE nome_completo ILIKE '%wilton%' 
  AND situacao = 'ativo'
  LIMIT 1
)
AND situacao = 'ativo';

-- Depois, definir apenas o Wilton como responsável principal
UPDATE pessoas 
SET 
  tipo_responsabilidade_familiar = 'responsavel',
  responsavel_principal_familia = true
WHERE nome_completo ILIKE '%wilton%' 
AND familia_id IS NOT NULL
AND situacao = 'ativo';

-- Definir outros como membros
UPDATE pessoas 
SET tipo_responsabilidade_familiar = 'membro'
WHERE familia_id = (
  SELECT familia_id 
  FROM pessoas 
  WHERE nome_completo ILIKE '%wilton%' 
  AND situacao = 'ativo'
  LIMIT 1
)
AND nome_completo NOT ILIKE '%wilton%'
AND situacao = 'ativo';

-- Verificar resultado final
SELECT 
  p.nome_completo,
  p.familia_id,
  p.tipo_responsabilidade_familiar,
  p.responsavel_principal_familia,
  f.nome_familia
FROM pessoas p
LEFT JOIN familias f ON f.id = p.familia_id
WHERE p.familia_id = (
  SELECT familia_id 
  FROM pessoas 
  WHERE nome_completo ILIKE '%wilton%' 
  AND situacao = 'ativo'
  LIMIT 1
)
AND p.situacao = 'ativo'
ORDER BY p.responsavel_principal_familia DESC, p.nome_completo;