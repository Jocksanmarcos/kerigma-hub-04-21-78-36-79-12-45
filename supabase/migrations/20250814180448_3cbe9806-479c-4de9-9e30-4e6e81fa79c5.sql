-- Enable RLS on public access for eventos table
CREATE POLICY "public_can_read_published_events" ON public.eventos
FOR SELECT USING (publico = true AND data_evento >= CURRENT_DATE - INTERVAL '30 days');

-- Enable RLS on public access for cursos table  
CREATE POLICY "public_can_read_active_courses" ON public.cursos
FOR SELECT USING (ativo = true);

-- Enable RLS on public access for celulas table
CREATE POLICY "public_can_read_active_cells" ON public.celulas
FOR SELECT USING (ativa = true);

-- Create events API edge function policy
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