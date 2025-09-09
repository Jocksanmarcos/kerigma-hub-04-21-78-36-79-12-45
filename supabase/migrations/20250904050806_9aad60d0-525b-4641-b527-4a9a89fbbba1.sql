-- ===================================================================
-- TESTE F1: Criação de Primeiro Lançamento Financeiro (TESTE)
-- ===================================================================

-- Inserir um lançamento de teste para verificar funcionalidade
INSERT INTO lancamentos_financeiros_v2 (
    tipo, 
    valor, 
    descricao, 
    status, 
    data_lancamento,
    categoria_id,
    conta_id,
    forma_pagamento,
    observacoes
)
VALUES (
    'receita',
    100.00,
    'TESTE QA - Primeiro lançamento do sistema',
    'confirmado',
    CURRENT_DATE,
    (SELECT id FROM categorias_financeiras WHERE tipo = 'receita' AND ativa = true LIMIT 1),
    (SELECT id FROM contas_bancarias WHERE ativa = true LIMIT 1),
    'transferencia',
    'Lançamento criado automaticamente para teste do protocolo QA'
);