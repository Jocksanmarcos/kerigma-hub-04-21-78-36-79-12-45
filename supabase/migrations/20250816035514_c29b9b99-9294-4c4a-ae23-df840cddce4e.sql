-- Verificar se a tabela participantes_celulas existe e criar se necessário
CREATE TABLE IF NOT EXISTS public.participantes_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  ativo BOOLEAN DEFAULT true,
  data_entrada DATE DEFAULT CURRENT_DATE,
  funcao TEXT DEFAULT 'membro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.participantes_celulas ENABLE ROW LEVEL SECURITY;

-- Política para líderes poderem ver participantes de suas células
CREATE POLICY "Líderes podem ver participantes de suas células" 
ON public.participantes_celulas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.celulas c 
    JOIN public.pessoas p ON p.celula_id = c.id 
    WHERE c.id = participantes_celulas.celula_id 
    AND p.user_id = auth.uid()
  ) OR is_admin()
);

-- Política para admins gerenciarem participantes
CREATE POLICY "Admins podem gerenciar participantes" 
ON public.participantes_celulas 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());