-- Ensure orcamento_itens table exists with correct structure
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id uuid NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  categoria_id uuid NOT NULL REFERENCES public.categorias_financeiras(id),
  meta_valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate category items per budget
CREATE UNIQUE INDEX IF NOT EXISTS uniq_orcamento_item ON public.orcamento_itens(orcamento_id, categoria_id);

-- Enable RLS
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

-- Policies for orcamento_itens
DROP POLICY IF EXISTS "Manage orcamento_itens (finance admin)" ON public.orcamento_itens;
CREATE POLICY "Manage orcamento_itens (finance admin)"
  ON public.orcamento_itens FOR ALL
  USING (is_admin() OR user_has_permission('manage', 'financeiro'));

DROP POLICY IF EXISTS "Read orcamento_itens (finance readers)" ON public.orcamento_itens;
CREATE POLICY "Read orcamento_itens (finance readers)"
  ON public.orcamento_itens FOR SELECT
  USING (is_admin() OR user_has_permission('read', 'financeiro'));

-- Ensure orcamentos table has the correct structure 
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS nome text;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ativo';
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS valor_orcado numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS valor_realizado numeric DEFAULT 0;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS categoria_id uuid REFERENCES public.categorias_financeiras(id);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS igreja_id uuid;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS observacoes text;