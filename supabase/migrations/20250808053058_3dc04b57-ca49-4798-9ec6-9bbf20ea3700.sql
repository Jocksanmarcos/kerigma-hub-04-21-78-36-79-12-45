-- Add missing columns to support Pessoa management
-- 1) estado_espiritual column used by UI
ALTER TABLE public.pessoas
  ADD COLUMN IF NOT EXISTS estado_espiritual TEXT;

-- 2) celula_id to link pessoa -> celulas
ALTER TABLE public.pessoas
  ADD COLUMN IF NOT EXISTS celula_id UUID;

-- 3) Foreign key for celula_id (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='pessoas' AND constraint_name='pessoas_celula_id_fkey'
  ) THEN
    ALTER TABLE public.pessoas
      ADD CONSTRAINT pessoas_celula_id_fkey FOREIGN KEY (celula_id)
      REFERENCES public.celulas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4) Helpful index
CREATE INDEX IF NOT EXISTS idx_pessoas_celula_id ON public.pessoas(celula_id);
