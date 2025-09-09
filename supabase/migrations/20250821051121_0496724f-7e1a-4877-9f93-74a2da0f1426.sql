-- 1) Add parent_church_id to igrejas with FK and index
ALTER TABLE public.igrejas
  ADD COLUMN IF NOT EXISTS parent_church_id uuid NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'igrejas' AND constraint_name = 'igrejas_parent_church_id_fkey'
  ) THEN
    ALTER TABLE public.igrejas
      ADD CONSTRAINT igrejas_parent_church_id_fkey
      FOREIGN KEY (parent_church_id)
      REFERENCES public.igrejas(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_igrejas_parent_church_id ON public.igrejas(parent_church_id);

-- 2) Enforce rule: missao must have parent_church_id; sede clears it
CREATE OR REPLACE FUNCTION public.enforce_missao_parent_church()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tipo IS NULL THEN
    RETURN NEW;
  END IF;
  IF lower(NEW.tipo) = 'missao' AND NEW.parent_church_id IS NULL THEN
    RAISE EXCEPTION 'Missões devem ter uma sede responsável (parent_church_id)';
  END IF;
  IF lower(NEW.tipo) = 'sede' THEN
    NEW.parent_church_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_enforce_missao_parent_church'
  ) THEN
    CREATE TRIGGER trg_enforce_missao_parent_church
    BEFORE INSERT OR UPDATE ON public.igrejas
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_missao_parent_church();
  END IF;
END $$;

-- 3) Fix pessoas default that breaks FK when no igreja exists
ALTER TABLE public.pessoas ALTER COLUMN church_id DROP DEFAULT;

-- Optional cleanup: remove placeholder FK value if present and not existent in igrejas
UPDATE public.pessoas p
SET church_id = NULL
WHERE church_id = '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM public.igrejas i WHERE i.id = '00000000-0000-0000-0000-000000000001'
  );