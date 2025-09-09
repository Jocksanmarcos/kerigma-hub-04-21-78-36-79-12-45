-- Criar constraint para garantir que só há um responsável principal por família
-- Primeiro, criar um índice único parcial
CREATE UNIQUE INDEX CONCURRENTLY idx_unique_responsavel_por_familia 
ON pessoas (familia_id) 
WHERE responsavel_principal_familia = true AND situacao = 'ativo';

-- Verificar que a constraint foi criada corretamente
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE indexname = 'idx_unique_responsavel_por_familia';