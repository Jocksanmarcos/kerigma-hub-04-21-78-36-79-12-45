-- ===================================================================
-- TESTE F2: PRIMEIRO LANÇAMENTO FINANCEIRO - EXECUÇÃO DIRETA
-- ===================================================================

-- Inserir lançamento de teste para validar estrutura
INSERT INTO lancamentos_financeiros_v2 (
  tipo, 
  valor, 
  status, 
  data_lancamento, 
  descricao, 
  categoria_id, 
  conta_id
) 
SELECT 
  'receita',
  100.00,
  'confirmado',
  CURRENT_DATE,
  'TESTE QA - Primeiro Lançamento do Sistema',
  cf.id,
  cb.id
FROM categorias_financeiras cf, contas_bancarias cb
WHERE cf.nome = 'Dízimos' 
  AND cb.nome = 'Conta Corrente Principal'
  AND cf.ativa = true 
  AND cb.ativa = true
LIMIT 1;