-- Enable RLS on public access for eventos table  
CREATE POLICY "public_can_read_published_events" ON public.eventos
FOR SELECT USING (publico = true);

-- Insert financial categories (with unique constraint fix)
INSERT INTO public.categorias_financeiras (nome, tipo, cor, icone, ativa) 
SELECT 'Dízimos', 'receita', '#10b981', 'heart', true
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Dízimos');

INSERT INTO public.categorias_financeiras (nome, tipo, cor, icone, ativa) 
SELECT 'Ofertas', 'receita', '#3b82f6', 'gift', true  
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ofertas');

INSERT INTO public.categorias_financeiras (nome, tipo, cor, icone, ativa) 
SELECT 'Eventos', 'receita', '#8b5cf6', 'calendar', true
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Eventos');

-- Create basic accounts (with unique constraint fix)
INSERT INTO public.contas_bancarias (nome, tipo, banco, saldo_atual, ativa)
SELECT 'Conta Corrente Principal', 'corrente', 'Banco do Brasil', 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE nome = 'Conta Corrente Principal');