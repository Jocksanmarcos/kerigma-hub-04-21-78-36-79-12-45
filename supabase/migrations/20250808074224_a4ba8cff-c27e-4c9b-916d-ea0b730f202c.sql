-- ===== CENTRAL DE GOVERNANÇA FINANCEIRA - KERIGMA HUB =====
-- Estrutura definitiva e robusta para gestão financeira eclesiástica

-- 1. TABELA DE CONTAS BANCÁRIAS
CREATE TABLE IF NOT EXISTS public.contas_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT DEFAULT 'corrente' CHECK (tipo_conta IN ('corrente', 'poupanca', 'aplicacao')),
  saldo_atual DECIMAL(15,2) DEFAULT 0.00,
  saldo_inicial DECIMAL(15,2) DEFAULT 0.00,
  ativa BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE CATEGORIAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor TEXT DEFAULT '#3b82f6',
  icone TEXT,
  ativa BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.categorias_financeiras(id),
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE FUNDOS CONTÁBEIS
CREATE TABLE IF NOT EXISTS public.fundos_contabeis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  meta_mensal DECIMAL(15,2),
  meta_anual DECIMAL(15,2),
  cor TEXT DEFAULT '#10b981',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA DE CAMPANHAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.campanhas_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  meta_valor DECIMAL(15,2) NOT NULL,
  valor_arrecadado DECIMAL(15,2) DEFAULT 0.00,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  ativa BOOLEAN DEFAULT true,
  imagem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA DE ORÇAMENTOS
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ano INTEGER NOT NULL,
  mes INTEGER CHECK (mes BETWEEN 1 AND 12),
  categoria_id UUID REFERENCES public.categorias_financeiras(id),
  valor_orcado DECIMAL(15,2) NOT NULL,
  valor_realizado DECIMAL(15,2) DEFAULT 0.00,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ano, mes, categoria_id)
);

-- 6. TABELA PRINCIPAL DE LANÇAMENTOS FINANCEIROS (Atualizada)
CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa', 'transferencia')),
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_lancamento DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  
  -- Relacionamentos
  conta_id UUID REFERENCES public.contas_bancarias(id) NOT NULL,
  categoria_id UUID REFERENCES public.categorias_financeiras(id) NOT NULL,
  pessoa_id UUID REFERENCES public.pessoas(id),
  fundo_id UUID REFERENCES public.fundos_contabeis(id),
  campanha_id UUID REFERENCES public.campanhas_financeiras(id),
  
  -- Campos operacionais
  forma_pagamento TEXT DEFAULT 'dinheiro',
  numero_documento TEXT,
  comprovante_url TEXT,
  status TEXT DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  status_conciliacao BOOLEAN DEFAULT false,
  
  -- Campos de controle
  observacoes TEXT,
  tags TEXT[],
  recorrente BOOLEAN DEFAULT false,
  recorrencia_tipo TEXT CHECK (recorrencia_tipo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABELA DE CONCILIAÇÃO BANCÁRIA
CREATE TABLE IF NOT EXISTS public.conciliacao_bancaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id UUID REFERENCES public.contas_bancarias(id) NOT NULL,
  data_conciliacao DATE NOT NULL,
  saldo_extrato DECIMAL(15,2) NOT NULL,
  saldo_sistema DECIMAL(15,2) NOT NULL,
  diferenca DECIMAL(15,2) GENERATED ALWAYS AS (saldo_extrato - saldo_sistema) STORED,
  conciliado BOOLEAN DEFAULT false,
  observacoes TEXT,
  arquivo_extrato_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INSERIR CATEGORIAS PADRÃO
INSERT INTO public.categorias_financeiras (nome, tipo, cor, icone) VALUES
-- Receitas
('Dízimos', 'receita', '#10b981', 'heart'),
('Ofertas', 'receita', '#059669', 'gift'),
('Ofertas Especiais', 'receita', '#34d399', 'star'),
('Doações', 'receita', '#6ee7b7', 'hand-heart'),
('Eventos', 'receita', '#a7f3d0', 'calendar'),
('Vendas', 'receita', '#d1fae5', 'shopping-bag'),

-- Despesas
('Pessoal', 'despesa', '#ef4444', 'users'),
('Manutenção', 'despesa', '#dc2626', 'wrench'),
('Utilidades', 'despesa', '#b91c1c', 'zap'),
('Material de Escritório', 'despesa', '#991b1b', 'file-text'),
('Eventos e Ministérios', 'despesa', '#7f1d1d', 'calendar'),
('Missões', 'despesa', '#fbbf24', 'globe'),
('Construção/Reforma', 'despesa', '#f59e0b', 'hammer'),
('Impostos e Taxas', 'despesa', '#d97706', 'file-check')
ON CONFLICT DO NOTHING;

-- INSERIR FUNDOS PADRÃO
INSERT INTO public.fundos_contabeis (nome, descricao, cor) VALUES
('Geral', 'Fundo geral da igreja para despesas operacionais', '#3b82f6'),
('Missões', 'Fundo específico para atividades missionárias', '#fbbf24'),
('Construção', 'Fundo para obras e reformas do templo', '#f59e0b'),
('Ação Social', 'Fundo para atividades de assistência social', '#10b981'),
('Jovens', 'Fundo específico do ministério de jovens', '#8b5cf6'),
('Crianças', 'Fundo específico do ministério infantil', '#ec4899')
ON CONFLICT DO NOTHING;

-- INSERIR CONTA PADRÃO
INSERT INTO public.contas_bancarias (nome, tipo_conta) VALUES
('Caixa Principal', 'corrente'),
('Conta Poupança', 'poupanca')
ON CONFLICT DO NOTHING;

-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_contas_bancarias_updated_at ON public.contas_bancarias;
CREATE TRIGGER update_contas_bancarias_updated_at 
    BEFORE UPDATE ON public.contas_bancarias 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categorias_financeiras_updated_at ON public.categorias_financeiras;
CREATE TRIGGER update_categorias_financeiras_updated_at 
    BEFORE UPDATE ON public.categorias_financeiras 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fundos_contabeis_updated_at ON public.fundos_contabeis;
CREATE TRIGGER update_fundos_contabeis_updated_at 
    BEFORE UPDATE ON public.fundos_contabeis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lancamentos_financeiros_v2_updated_at ON public.lancamentos_financeiros_v2;
CREATE TRIGGER update_lancamentos_financeiros_v2_updated_at 
    BEFORE UPDATE ON public.lancamentos_financeiros_v2 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES
ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundos_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_financeiros_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliacao_bancaria ENABLE ROW LEVEL SECURITY;

-- Policies básicas (admin e tesoureiro)
CREATE POLICY "Acesso financeiro admin" ON public.contas_bancarias FOR ALL USING (is_admin());
CREATE POLICY "Acesso financeiro admin" ON public.categorias_financeiras FOR ALL USING (is_admin());
CREATE POLICY "Acesso financeiro admin" ON public.fundos_contabeis FOR ALL USING (is_admin());
CREATE POLICY "Acesso financeiro admin" ON public.campanhas_financeiras FOR ALL USING (is_admin());
CREATE POLICY "Acesso financeiro admin" ON public.orcamentos FOR ALL USING (is_admin());
CREATE POLICY "Acesso financeiro admin" ON public.lancamentos_financeiros_v2 FOR ALL USING (is_admin());
CREATE POLICY "Acesso financeiro admin" ON public.conciliacao_bancaria FOR ALL USING (is_admin());