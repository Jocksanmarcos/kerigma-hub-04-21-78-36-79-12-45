-- Fix seeding unique codes without conflicts
DO $$
DECLARE
  _exists boolean;
BEGIN
  -- Drop existing unique constraint temporarily if present
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'equipas_ministeriais_codigo_convite_key'
  ) INTO _exists;
  IF _exists THEN
    EXECUTE 'ALTER TABLE public.equipas_ministeriais DROP CONSTRAINT equipas_ministeriais_codigo_convite_key';
  END IF;
END$$;

-- Ensure helper exists
CREATE OR REPLACE FUNCTION public.generate_random_code(p_length int DEFAULT 8)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..p_length LOOP
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Seed per-row with uniqueness check
DO $$
DECLARE
  r RECORD;
  new_code text;
BEGIN
  FOR r IN SELECT id FROM public.equipas_ministeriais WHERE codigo_convite IS NULL LOOP
    LOOP
      new_code := generate_random_code(8);
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.equipas_ministeriais WHERE codigo_convite = new_code
      );
    END LOOP;
    UPDATE public.equipas_ministeriais SET codigo_convite = new_code WHERE id = r.id;
  END LOOP;
END$$;

-- Recreate unique constraint safely
ALTER TABLE public.equipas_ministeriais ADD CONSTRAINT equipas_ministeriais_codigo_convite_key UNIQUE (codigo_convite);
