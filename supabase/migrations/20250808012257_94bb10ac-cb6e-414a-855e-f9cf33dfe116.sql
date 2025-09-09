-- Creative Studio schema (formularios, formularios_submissoes, documentos_modelos, galeria_midia)
BEGIN;

-- Enum for media type
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_midia') THEN
    CREATE TYPE public.tipo_midia AS ENUM ('imagem','video');
  END IF;
END $$;

-- Form builder: forms
CREATE TABLE IF NOT EXISTS public.formularios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  estrutura_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  acao_pos_submissao jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.formularios ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_formularios_updated_at'
  ) THEN
    CREATE TRIGGER trg_formularios_updated_at
    BEFORE UPDATE ON public.formularios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies for forms (admin manage)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='formularios' AND policyname='Admins podem gerenciar formulários') THEN
    DROP POLICY "Admins podem gerenciar formulários" ON public.formularios;
  END IF;
  CREATE POLICY "Admins podem gerenciar formulários"
  ON public.formularios FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
END $$;

-- Form submissions
CREATE TABLE IF NOT EXISTS public.formularios_submissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id uuid NOT NULL REFERENCES public.formularios(id) ON DELETE CASCADE,
  dados_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.formularios_submissoes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_form_submissoes_formulario_id ON public.formularios_submissoes(formulario_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_submissoes_updated_at'
  ) THEN
    CREATE TRIGGER trg_form_submissoes_updated_at
    BEFORE UPDATE ON public.formularios_submissoes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies: public can insert submissions; admin manage
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='formularios_submissoes' AND policyname='Qualquer um pode criar submissões de formulário') THEN
    DROP POLICY "Qualquer um pode criar submissões de formulário" ON public.formularios_submissoes;
  END IF;
  CREATE POLICY "Qualquer um pode criar submissões de formulário"
  ON public.formularios_submissoes FOR INSERT
  WITH CHECK (true);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='formularios_submissoes' AND policyname='Admins podem gerenciar submissões') THEN
    DROP POLICY "Admins podem gerenciar submissões" ON public.formularios_submissoes;
  END IF;
  CREATE POLICY "Admins podem gerenciar submissões"
  ON public.formularios_submissoes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
END $$;

-- Document templates
CREATE TABLE IF NOT EXISTS public.documentos_modelos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo_template text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documentos_modelos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_documentos_modelos_updated_at'
  ) THEN
    CREATE TRIGGER trg_documentos_modelos_updated_at
    BEFORE UPDATE ON public.documentos_modelos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documentos_modelos' AND policyname='Admins podem gerenciar modelos') THEN
    DROP POLICY "Admins podem gerenciar modelos" ON public.documentos_modelos;
  END IF;
  CREATE POLICY "Admins podem gerenciar modelos"
  ON public.documentos_modelos FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
END $$;

-- Media gallery
CREATE TABLE IF NOT EXISTS public.galeria_midia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arquivo_url text NOT NULL,
  tipo public.tipo_midia NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.galeria_midia ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_galeria_midia_tags ON public.galeria_midia USING GIN (tags);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_galeria_midia_updated_at'
  ) THEN
    CREATE TRIGGER trg_galeria_midia_updated_at
    BEFORE UPDATE ON public.galeria_midia
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies: public read, admin manage
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='galeria_midia' AND policyname='Qualquer um pode ver galeria de mídia') THEN
    DROP POLICY "Qualquer um pode ver galeria de mídia" ON public.galeria_midia;
  END IF;
  CREATE POLICY "Qualquer um pode ver galeria de mídia"
  ON public.galeria_midia FOR SELECT
  USING (true);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='galeria_midia' AND policyname='Admins podem gerenciar galeria de mídia') THEN
    DROP POLICY "Admins podem gerenciar galeria de mídia" ON public.galeria_midia;
  END IF;
  CREATE POLICY "Admins podem gerenciar galeria de mídia"
  ON public.galeria_midia FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
END $$;

COMMIT;