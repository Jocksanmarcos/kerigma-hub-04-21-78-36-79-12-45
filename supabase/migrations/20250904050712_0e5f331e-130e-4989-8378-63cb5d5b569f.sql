-- ===================================================================
-- CORREÇÃO CRÍTICA: MÓDULO FINANCEIRO - Estrutura Básica (CORRIGIDA)
-- ===================================================================

-- Inserir categorias financeiras essenciais com estrutura correta
INSERT INTO categorias_financeiras (nome, tipo, cor, ativa)
VALUES 
  ('Dízimos', 'receita', '#22c55e', true),
  ('Ofertas', 'receita', '#3b82f6', true),
  ('Doações Especiais', 'receita', '#8b5cf6', true),
  ('Despesas Administrativas', 'despesa', '#ef4444', true),
  ('Manutenção e Infraestrutura', 'despesa', '#f59e0b', true),
  ('Missões e Evangelismo', 'despesa', '#06b6d4', true),
  ('Eventos e Atividades', 'despesa', '#ec4899', true)
ON CONFLICT (nome) DO NOTHING;

-- Inserir contas bancárias básicas com estrutura correta
INSERT INTO contas_bancarias (nome, banco, agencia, conta, tipo_conta, saldo_inicial, ativa)
VALUES 
  ('Conta Corrente Principal', 'Banco do Brasil', '0001', '12345-6', 'corrente', 0.00, true),
  ('Conta Poupança', 'Caixa Econômica', '0001', '98765-4', 'poupanca', 0.00, true)
ON CONFLICT (conta) DO NOTHING;