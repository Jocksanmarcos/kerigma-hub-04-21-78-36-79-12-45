-- 1) Versões da Bíblia
CREATE TABLE IF NOT EXISTS public.biblia_versoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  idioma text NOT NULL DEFAULT 'pt-BR',
  abreviacao text,
  publico boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;

-- Políticas: leitura pública; gestão por admins
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'biblia_versoes' AND policyname = 'Versões bíblicas são públicas'
  ) THEN
    CREATE POLICY "Versões bíblicas são públicas"
    ON public.biblia_versoes FOR SELECT
    USING (publico = true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'biblia_versoes' AND policyname = 'Admins gerenciam versoes'
  ) THEN
    CREATE POLICY "Admins gerenciam versoes"
    ON public.biblia_versoes FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Trigger de updated_at
DROP TRIGGER IF EXISTS trg_biblia_versoes_updated_at ON public.biblia_versoes;
CREATE TRIGGER trg_biblia_versoes_updated_at
BEFORE UPDATE ON public.biblia_versoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2) Livros da Bíblia
CREATE TABLE IF NOT EXISTS public.biblia_livros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordinal integer NOT NULL,
  nome text NOT NULL,
  abreviacao text NOT NULL,
  testamento text NOT NULL, -- 'AT' | 'NT'
  abreviacoes_alt text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ordinal)
);

ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'biblia_livros' AND policyname = 'Livros bíblicos são públicos'
  ) THEN
    CREATE POLICY "Livros bíblicos são públicos"
    ON public.biblia_livros FOR SELECT
    USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'biblia_livros' AND policyname = 'Admins gerenciam livros'
  ) THEN
    CREATE POLICY "Admins gerenciam livros"
    ON public.biblia_livros FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Trigger de updated_at
DROP TRIGGER IF EXISTS trg_biblia_livros_updated_at ON public.biblia_livros;
CREATE TRIGGER trg_biblia_livros_updated_at
BEFORE UPDATE ON public.biblia_livros
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 3) Versículos
CREATE TABLE IF NOT EXISTS public.biblia_versiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  versao_id uuid NOT NULL REFERENCES public.biblia_versoes(id) ON DELETE CASCADE,
  livro_id uuid NOT NULL REFERENCES public.biblia_livros(id) ON DELETE CASCADE,
  capitulo integer NOT NULL,
  versiculo integer NOT NULL,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (versao_id, livro_id, capitulo, versiculo)
);

ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'biblia_versiculos' AND policyname = 'Versículos públicos'
  ) THEN
    CREATE POLICY "Versículos públicos"
    ON public.biblia_versiculos FOR SELECT
    USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'biblia_versiculos' AND policyname = 'Admins gerenciam versículos'
  ) THEN
    CREATE POLICY "Admins gerenciam versículos"
    ON public.biblia_versiculos FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Índices para desempenho
CREATE INDEX IF NOT EXISTS idx_bv_livro_cap_versao
  ON public.biblia_versiculos (livro_id, capitulo, versao_id, versiculo);
CREATE INDEX IF NOT EXISTS idx_bv_busca_texto_pt
  ON public.biblia_versiculos USING GIN (to_tsvector('portuguese', texto));

-- Trigger de updated_at
DROP TRIGGER IF EXISTS trg_biblia_versiculos_updated_at ON public.biblia_versiculos;
CREATE TRIGGER trg_biblia_versiculos_updated_at
BEFORE UPDATE ON public.biblia_versiculos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 4) Progresso de Estudo Bíblico (por pessoa)
CREATE TABLE IF NOT EXISTS public.estudo_biblico_progresso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  ultimo_versiculo_lido_id uuid REFERENCES public.biblia_versiculos(id) ON DELETE SET NULL,
  sequencia_dias integer NOT NULL DEFAULT 0,
  total_versiculos_lidos integer NOT NULL DEFAULT 0,
  pontos_xp integer NOT NULL DEFAULT 0,
  preferencias jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pessoa_id)
);

ALTER TABLE public.estudo_biblico_progresso ENABLE ROW LEVEL SECURITY;

-- Políticas por usuário (pessoa)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estudo_biblico_progresso' AND policyname = 'Usuário vê seu próprio progresso'
  ) THEN
    CREATE POLICY "Usuário vê seu próprio progresso"
    ON public.estudo_biblico_progresso FOR SELECT
    USING (pessoa_id = get_current_person_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estudo_biblico_progresso' AND policyname = 'Usuário cria seu próprio progresso'
  ) THEN
    CREATE POLICY "Usuário cria seu próprio progresso"
    ON public.estudo_biblico_progresso FOR INSERT
    WITH CHECK (pessoa_id = get_current_person_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estudo_biblico_progresso' AND policyname = 'Usuário atualiza seu próprio progresso'
  ) THEN
    CREATE POLICY "Usuário atualiza seu próprio progresso"
    ON public.estudo_biblico_progresso FOR UPDATE
    USING (pessoa_id = get_current_person_id())
    WITH CHECK (pessoa_id = get_current_person_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'estudo_biblico_progresso' AND policyname = 'Usuário remove seu próprio progresso'
  ) THEN
    CREATE POLICY "Usuário remove seu próprio progresso"
    ON public.estudo_biblico_progresso FOR DELETE
    USING (pessoa_id = get_current_person_id());
  END IF;
END $$;

-- Trigger de updated_at
DROP TRIGGER IF EXISTS trg_estudo_biblico_progresso_updated_at ON public.estudo_biblico_progresso;
CREATE TRIGGER trg_estudo_biblico_progresso_updated_at
BEFORE UPDATE ON public.estudo_biblico_progresso
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
