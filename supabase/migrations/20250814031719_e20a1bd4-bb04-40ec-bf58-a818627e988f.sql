-- Continuar corrigindo funções sem search_path definido

CREATE OR REPLACE FUNCTION public.update_orcamentos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.atualizar_arvore_genealogica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se tem célula mãe, construir a árvore genealógica
  IF NEW.celula_mae_id IS NOT NULL THEN
    -- Buscar a árvore da célula mãe
    SELECT 
      COALESCE(arvore_genealogica, id::text) || '->' || NEW.id::text,
      COALESCE(geracao, 1) + 1
    INTO NEW.arvore_genealogica, NEW.geracao
    FROM public.celulas 
    WHERE id = NEW.celula_mae_id;
    
    -- Se a célula mãe não tem árvore, criar uma
    IF NEW.arvore_genealogica IS NULL THEN
      NEW.arvore_genealogica := NEW.celula_mae_id::text || '->' || NEW.id::text;
      NEW.geracao := 2;
    END IF;
  ELSE
    -- Célula original (sem mãe)
    NEW.arvore_genealogica := NEW.id::text;
    NEW.geracao := 1;
  END IF;
  
  RETURN NEW;
END;
$$;