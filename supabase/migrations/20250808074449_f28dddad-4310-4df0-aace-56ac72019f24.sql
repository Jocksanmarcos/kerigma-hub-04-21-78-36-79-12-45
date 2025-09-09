-- CORRIGIR POLÍTICAS DE SEGURANÇA E ADICIONAR POLICIES COMPLETAS

-- Primeiro, remover policies básicas existentes que causaram conflito
DROP POLICY IF EXISTS "Acesso financeiro admin" ON public.contas_bancarias;
DROP POLICY IF EXISTS "Acesso financeiro admin" ON public.categorias_financeiras;
DROP POLICY IF EXISTS "Acesso financeiro admin" ON public.fundos_contabeis;
DROP POLICY IF EXISTS "Acesso financeiro admin" ON public.campanhas_financeiras;
DROP POLICY IF EXISTS "Acesso financeiro admin" ON public.orcamentos;
DROP POLICY IF EXISTS "Acesso financeiro admin" ON public.lancamentos_financeiros_v2;
DROP POLICY IF EXISTS "Acesso financeiro admin" ON public.conciliacao_bancaria;

-- 1. POLICIES PARA CONTAS BANCÁRIAS
CREATE POLICY "Admin pode gerenciar contas bancárias" 
ON public.contas_bancarias FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Tesoureiro pode visualizar contas bancárias" 
ON public.contas_bancarias FOR SELECT 
USING (user_has_permission('read', 'financeiro'));

-- 2. POLICIES PARA CATEGORIAS FINANCEIRAS
CREATE POLICY "Admin pode gerenciar categorias financeiras" 
ON public.categorias_financeiras FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Todos podem visualizar categorias ativas" 
ON public.categorias_financeiras FOR SELECT 
USING (ativa = true);

-- 3. POLICIES PARA FUNDOS CONTÁBEIS
CREATE POLICY "Admin pode gerenciar fundos contábeis" 
ON public.fundos_contabeis FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Todos podem visualizar fundos ativos" 
ON public.fundos_contabeis FOR SELECT 
USING (ativo = true);

-- 4. POLICIES PARA CAMPANHAS FINANCEIRAS
CREATE POLICY "Admin pode gerenciar campanhas financeiras" 
ON public.campanhas_financeiras FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Todos podem visualizar campanhas ativas" 
ON public.campanhas_financeiras FOR SELECT 
USING (ativa = true);

-- 5. POLICIES PARA ORÇAMENTOS
CREATE POLICY "Admin pode gerenciar orçamentos" 
ON public.orcamentos FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Tesoureiro pode visualizar orçamentos" 
ON public.orcamentos FOR SELECT 
USING (user_has_permission('read', 'financeiro'));

-- 6. POLICIES PARA LANÇAMENTOS FINANCEIROS V2
CREATE POLICY "Admin pode gerenciar lançamentos financeiros" 
ON public.lancamentos_financeiros_v2 FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Tesoureiro pode inserir lançamentos" 
ON public.lancamentos_financeiros_v2 FOR INSERT 
WITH CHECK (user_has_permission('create', 'financeiro'));

CREATE POLICY "Tesoureiro pode visualizar lançamentos" 
ON public.lancamentos_financeiros_v2 FOR SELECT 
USING (user_has_permission('read', 'financeiro'));

CREATE POLICY "Tesoureiro pode atualizar lançamentos próprios" 
ON public.lancamentos_financeiros_v2 FOR UPDATE 
USING (user_has_permission('update', 'financeiro') AND created_by = auth.uid());

-- 7. POLICIES PARA CONCILIAÇÃO BANCÁRIA
CREATE POLICY "Admin pode gerenciar conciliação bancária" 
ON public.conciliacao_bancaria FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Tesoureiro pode visualizar conciliação" 
ON public.conciliacao_bancaria FOR SELECT 
USING (user_has_permission('read', 'financeiro'));

-- FUNÇÕES AUXILIARES PARA ESTATÍSTICAS FINANCEIRAS
CREATE OR REPLACE FUNCTION public.obter_estatisticas_financeiras()
RETURNS TABLE(
  saldo_total DECIMAL,
  receitas_mes DECIMAL,
  despesas_mes DECIMAL,
  campanhas_ativas INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COALESCE(SUM(saldo_atual), 0) FROM public.contas_bancarias WHERE ativa = true),
    (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros_v2 
     WHERE tipo = 'receita' AND status = 'confirmado' 
     AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM data_lancamento) = EXTRACT(YEAR FROM CURRENT_DATE)),
    (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros_v2 
     WHERE tipo = 'despesa' AND status = 'confirmado'
     AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM data_lancamento) = EXTRACT(YEAR FROM CURRENT_DATE)),
    (SELECT COUNT(*)::INTEGER FROM public.campanhas_financeiras WHERE ativa = true)::INTEGER;
END;
$$;

-- FUNÇÃO PARA ATUALIZAR SALDO DAS CONTAS
CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmado' THEN
    IF NEW.tipo = 'receita' THEN
      UPDATE public.contas_bancarias 
      SET saldo_atual = saldo_atual + NEW.valor
      WHERE id = NEW.conta_id;
    ELSIF NEW.tipo = 'despesa' THEN
      UPDATE public.contas_bancarias 
      SET saldo_atual = saldo_atual - NEW.valor
      WHERE id = NEW.conta_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter o lançamento anterior se estava confirmado
    IF OLD.status = 'confirmado' THEN
      IF OLD.tipo = 'receita' THEN
        UPDATE public.contas_bancarias 
        SET saldo_atual = saldo_atual - OLD.valor
        WHERE id = OLD.conta_id;
      ELSIF OLD.tipo = 'despesa' THEN
        UPDATE public.contas_bancarias 
        SET saldo_atual = saldo_atual + OLD.valor
        WHERE id = OLD.conta_id;
      END IF;
    END IF;
    
    -- Aplicar o novo lançamento se confirmado
    IF NEW.status = 'confirmado' THEN
      IF NEW.tipo = 'receita' THEN
        UPDATE public.contas_bancarias 
        SET saldo_atual = saldo_atual + NEW.valor
        WHERE id = NEW.conta_id;
      ELSIF NEW.tipo = 'despesa' THEN
        UPDATE public.contas_bancarias 
        SET saldo_atual = saldo_atual - NEW.valor
        WHERE id = NEW.conta_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmado' THEN
    IF OLD.tipo = 'receita' THEN
      UPDATE public.contas_bancarias 
      SET saldo_atual = saldo_atual - OLD.valor
      WHERE id = OLD.conta_id;
    ELSIF OLD.tipo = 'despesa' THEN
      UPDATE public.contas_bancarias 
      SET saldo_atual = saldo_atual + OLD.valor
      WHERE id = OLD.conta_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE SALDO
DROP TRIGGER IF EXISTS trigger_atualizar_saldo_conta ON public.lancamentos_financeiros_v2;
CREATE TRIGGER trigger_atualizar_saldo_conta
  AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos_financeiros_v2
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_saldo_conta();

-- FUNÇÃO PARA ATUALIZAR VALOR ARRECADADO EM CAMPANHAS
CREATE OR REPLACE FUNCTION public.atualizar_valor_campanha()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.campanha_id IS NOT NULL AND NEW.status = 'confirmado' AND NEW.tipo = 'receita' THEN
    UPDATE public.campanhas_financeiras 
    SET valor_arrecadado = valor_arrecadado + NEW.valor
    WHERE id = NEW.campanha_id;
  END IF;
  RETURN NEW;
END;
$$;

-- TRIGGER PARA CAMPANHAS
DROP TRIGGER IF EXISTS trigger_atualizar_valor_campanha ON public.lancamentos_financeiros_v2;
CREATE TRIGGER trigger_atualizar_valor_campanha
  AFTER INSERT OR UPDATE ON public.lancamentos_financeiros_v2
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_valor_campanha();