-- Fix RLS policies with correct column names
DROP POLICY IF EXISTS "public_can_read_published_events" ON public.eventos;

-- Enable RLS on public access for eventos table (using correct column name)
CREATE POLICY "public_can_read_published_events" ON public.eventos
FOR SELECT USING (publico = true);

-- The financial categories and accounts inserts (keeping only these since they're safe)
INSERT INTO public.categorias_financeiras (nome, tipo, cor, icone, ativa) 
VALUES 
  ('Dízimos', 'receita', '#10b981', 'heart', true),
  ('Ofertas', 'receita', '#3b82f6', 'gift', true),
  ('Eventos', 'receita', '#8b5cf6', 'calendar', true),
  ('Sede', 'despesa', '#ef4444', 'building', true),
  ('Missões', 'despesa', '#f59e0b', 'globe', true)
ON CONFLICT (nome) DO NOTHING;

-- Create basic accounts if they don't exist
INSERT INTO public.contas_bancarias (nome, tipo, banco, saldo_atual, ativa)
VALUES 
  ('Conta Corrente Principal', 'corrente', 'Banco do Brasil', 0, true),
  ('Poupança Igreja', 'poupanca', 'Caixa Econômica', 0, true)
ON CONFLICT (nome) DO NOTHING;