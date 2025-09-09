-- Modificar tabela agendamentos para suportar solicitações de visitantes
ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS visitante_nome VARCHAR(255),
  ADD COLUMN IF NOT EXISTS visitante_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS visitante_telefone VARCHAR(50);

-- Adicionar policy para permitir inserções públicas de agendamentos
CREATE POLICY "Visitantes podem criar agendamentos públicos"
ON public.agendamentos FOR INSERT
WITH CHECK (
  visitante_nome IS NOT NULL AND 
  visitante_email IS NOT NULL AND
  status = 'solicitado'
);