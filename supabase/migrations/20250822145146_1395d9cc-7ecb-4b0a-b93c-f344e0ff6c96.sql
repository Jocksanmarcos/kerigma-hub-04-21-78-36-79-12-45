-- Primeiro, vamos ver a situação atual
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

-- Verificar os valores válidos do enum tipo_responsabilidade_enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_responsabilidade_enum');