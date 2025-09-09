-- Presence tracking for worship schedules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'presence_status'
  ) THEN
    CREATE TYPE public.presence_status AS ENUM ('presente', 'falta', 'justificado');
  END IF;
END$$;

ALTER TABLE public.escalas_servico
  ADD COLUMN IF NOT EXISTS resultado_presenca public.presence_status,
  ADD COLUMN IF NOT EXISTS presenca_registrada_em TIMESTAMPTZ;

-- Helpful index to query by plano and status
CREATE INDEX IF NOT EXISTS idx_escalas_servico_plano ON public.escalas_servico(plano_id);
CREATE INDEX IF NOT EXISTS idx_escalas_servico_presenca ON public.escalas_servico(resultado_presenca);
