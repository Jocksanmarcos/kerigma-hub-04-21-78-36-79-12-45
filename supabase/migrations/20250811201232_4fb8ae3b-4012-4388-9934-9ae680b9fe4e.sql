-- Add dirigente_id and pregador_id to culto_planos if missing
ALTER TABLE public.culto_planos
  ADD COLUMN IF NOT EXISTS dirigente_id uuid NULL REFERENCES public.pessoas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pregador_id uuid NULL REFERENCES public.pessoas(id) ON DELETE SET NULL;

-- Helpful index for joining/filters
CREATE INDEX IF NOT EXISTS idx_culto_planos_agendamento_id ON public.culto_planos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_culto_planos_dirigente_id ON public.culto_planos(dirigente_id);
CREATE INDEX IF NOT EXISTS idx_culto_planos_pregador_id ON public.culto_planos(pregador_id);
