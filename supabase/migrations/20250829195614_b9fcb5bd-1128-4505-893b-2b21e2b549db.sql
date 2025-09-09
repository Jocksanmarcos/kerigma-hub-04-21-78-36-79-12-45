-- Corrigir/garantir schema para Bíblia usando IDs de texto (ex.: GEN, PSA)
-- Versões
CREATE TABLE IF NOT EXISTS public.biblia_versoes (
  id text PRIMARY KEY,
  nome text NOT NULL,
  abreviacao text,
  descricao text,
  idioma text NOT NULL DEFAULT 'pt'
);

-- RLS e política de leitura pública
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='biblia_versoes' AND policyname='Todos podem ver versoes da biblia'
  ) THEN
    CREATE POLICY "Todos podem ver versoes da biblia" ON public.biblia_versoes FOR SELECT USING (true);
  END IF;
END $$;

-- Livros
CREATE TABLE IF NOT EXISTS public.biblia_livros (
  id text PRIMARY KEY,
  versao_id text NOT NULL,
  nome text NOT NULL,
  abreviacao text,
  testamento text,
  ordinal integer NOT NULL
);

-- Ajustar tipos caso já exista com UUID
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='id' AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.biblia_livros ALTER COLUMN id TYPE text USING id::text;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='versao_id' AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.biblia_livros ALTER COLUMN versao_id TYPE text USING versao_id::text;
  END IF;
END $$;

-- FK para versões (se não existir)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema='public' AND table_name='biblia_livros' AND constraint_name='biblia_livros_versao_fk'
  ) THEN
    ALTER TABLE public.biblia_livros
      ADD CONSTRAINT biblia_livros_versao_fk FOREIGN KEY (versao_id)
      REFERENCES public.biblia_versoes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS e política de leitura pública
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='biblia_livros' AND policyname='Todos podem ver livros da biblia'
  ) THEN
    CREATE POLICY "Todos podem ver livros da biblia" ON public.biblia_livros FOR SELECT USING (true);
  END IF;
END $$;

-- Versículos
CREATE TABLE IF NOT EXISTS public.biblia_versiculos (
  versao_id text NOT NULL,
  livro_id text NOT NULL,
  capitulo integer NOT NULL,
  versiculo integer NOT NULL,
  texto text NOT NULL,
  PRIMARY KEY (versao_id, livro_id, capitulo, versiculo)
);

-- Ajustar tipos caso já exista com UUID
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='versao_id' AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.biblia_versiculos ALTER COLUMN versao_id TYPE text USING versao_id::text;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='livro_id' AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.biblia_versiculos ALTER COLUMN livro_id TYPE text USING livro_id::text;
  END IF;
END $$;

-- FKs para versões e livros (se não existirem)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema='public' AND table_name='biblia_versiculos' AND constraint_name='biblia_versiculos_versao_fk'
  ) THEN
    ALTER TABLE public.biblia_versiculos
      ADD CONSTRAINT biblia_versiculos_versao_fk FOREIGN KEY (versao_id)
      REFERENCES public.biblia_versoes(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema='public' AND table_name='biblia_versiculos' AND constraint_name='biblia_versiculos_livro_fk'
  ) THEN
    ALTER TABLE public.biblia_versiculos
      ADD CONSTRAINT biblia_versiculos_livro_fk FOREIGN KEY (livro_id)
      REFERENCES public.biblia_livros(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS e política de leitura pública
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='biblia_versiculos' AND policyname='Todos podem ver versiculos'
  ) THEN
    CREATE POLICY "Todos podem ver versiculos" ON public.biblia_versiculos FOR SELECT USING (true);
  END IF;
END $$;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_bv_livro ON public.biblia_versiculos(livro_id, capitulo, versiculo);
CREATE INDEX IF NOT EXISTS idx_bl_versao ON public.biblia_livros(versao_id, ordinal);