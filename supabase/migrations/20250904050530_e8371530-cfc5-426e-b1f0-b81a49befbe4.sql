-- ===================================================================
-- CORREÇÃO CRÍTICA: MÓDULO FINANCEIRO - Estrutura Básica
-- ===================================================================

-- Inserir categorias financeiras essenciais se não existirem
INSERT INTO categorias_financeiras (nome, tipo, descricao, ativo, cor)
VALUES 
  ('Dízimos', 'receita', 'Dízimos dos membros', true, '#22c55e'),
  ('Ofertas', 'receita', 'Ofertas especiais e campanhas', true, '#3b82f6'),
  ('Doações Especiais', 'receita', 'Doações para projetos específicos', true, '#8b5cf6'),
  ('Despesas Administrativas', 'despesa', 'Gastos com administração da igreja', true, '#ef4444'),
  ('Manutenção e Infraestrutura', 'despesa', 'Reparos, limpeza e manutenção', true, '#f59e0b'),
  ('Missões e Evangelismo', 'despesa', 'Investimentos em missões', true, '#06b6d4'),
  ('Eventos e Atividades', 'despesa', 'Custos de eventos da igreja', true, '#ec4899')
ON CONFLICT (nome) DO NOTHING;

-- Verificar se existem contas bancárias básicas
INSERT INTO contas_bancarias (nome, tipo, banco, agencia, numero_conta, saldo_inicial, ativa)
VALUES 
  ('Conta Corrente Principal', 'corrente', 'Banco do Brasil', '0001', '12345-6', 0.00, true),
  ('Conta Poupança', 'poupanca', 'Caixa Econômica', '0001', '98765-4', 0.00, true)
ON CONFLICT (numero_conta) DO NOTHING;