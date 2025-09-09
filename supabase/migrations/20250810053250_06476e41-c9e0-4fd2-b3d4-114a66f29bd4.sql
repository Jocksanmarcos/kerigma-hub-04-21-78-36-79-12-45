-- RLS for louvor_musicas to ensure visibility and management
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='louvor_musicas'
  ) THEN
    ALTER TABLE public.louvor_musicas ENABLE ROW LEVEL SECURITY;

    -- Public select (authenticated and anon)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='louvor_musicas' AND policyname='Todos podem ver musicas'
    ) THEN
      CREATE POLICY "Todos podem ver musicas"
      ON public.louvor_musicas
      FOR SELECT
      USING (true);
    END IF;

    -- Admins can manage
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='louvor_musicas' AND policyname='Admins podem gerenciar musicas'
    ) THEN
      CREATE POLICY "Admins podem gerenciar musicas"
      ON public.louvor_musicas
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
    END IF;
  END IF;
END $$;
