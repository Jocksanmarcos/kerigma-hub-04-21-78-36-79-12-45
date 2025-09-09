-- Fix migration: ensure trilhas_formacao has required columns before seeding
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='trilhas_formacao'
  ) THEN
    CREATE TABLE public.trilhas_formacao (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      titulo text NOT NULL,
      descricao text,
      slug text,
      ordem integer DEFAULT 1,
      ativo boolean DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  ELSE
    -- Add missing columns if table already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='trilhas_formacao' AND column_name='slug'
    ) THEN
      ALTER TABLE public.trilhas_formacao ADD COLUMN slug text;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='trilhas_formacao' AND column_name='ordem'
    ) THEN
      ALTER TABLE public.trilhas_formacao ADD COLUMN ordem integer DEFAULT 1;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='trilhas_formacao' AND column_name='ativo'
    ) THEN
      ALTER TABLE public.trilhas_formacao ADD COLUMN ativo boolean DEFAULT true;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='trilhas_formacao' AND column_name='created_at'
    ) THEN
      ALTER TABLE public.trilhas_formacao ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='trilhas_formacao' AND column_name='updated_at'
    ) THEN
      ALTER TABLE public.trilhas_formacao ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    END IF;
  END IF;
END $$;

ALTER TABLE public.trilhas_formacao ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname='public' AND tablename='trilhas_formacao' AND indexname='idx_trilhas_formacao_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_trilhas_formacao_slug_unique ON public.trilhas_formacao (slug);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'trilhas_formacao' AND policyname = 'Qualquer um pode ver trilhas ativas'
  ) THEN
    CREATE POLICY "Qualquer um pode ver trilhas ativas"
    ON public.trilhas_formacao
    FOR SELECT
    USING (ativo = true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'trilhas_formacao' AND policyname = 'Admins podem gerenciar trilhas'
  ) THEN
    CREATE POLICY "Admins podem gerenciar trilhas"
    ON public.trilhas_formacao
    FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Re-run full EAD setup now that trilhas_formacao is consistent
-- (reuse previous migration content safely)

-- 2) Ajustes na tabela cursos (reutilizando a existente)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='cursos' AND column_name='slug'
  ) THEN
    ALTER TABLE public.cursos ADD COLUMN slug text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname='public' AND tablename='cursos' AND indexname='idx_cursos_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_cursos_slug_unique ON public.cursos (slug);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='cursos' AND column_name='trilha_id'
  ) THEN
    ALTER TABLE public.cursos ADD COLUMN trilha_id uuid REFERENCES public.trilhas_formacao(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='cursos' AND column_name='ordem'
  ) THEN
    ALTER TABLE public.cursos ADD COLUMN ordem integer DEFAULT 1;
  END IF;
END $$;

-- 3) Módulos do curso (opcional)
CREATE TABLE IF NOT EXISTS public.modulos_curso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  ordem integer DEFAULT 1,
  ativo boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.modulos_curso ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='modulos_curso' AND policyname='Ver módulos ativos'
  ) THEN
    CREATE POLICY "Ver módulos ativos"
    ON public.modulos_curso FOR SELECT
    USING (ativo = true OR is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='modulos_curso' AND policyname='Gerenciar módulos'
  ) THEN
    CREATE POLICY "Gerenciar módulos"
    ON public.modulos_curso FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- 4) Lições
CREATE TABLE IF NOT EXISTS public.licoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  modulo_id uuid REFERENCES public.modulos_curso(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  ordem integer DEFAULT 1,
  video_url text,
  conteudo_texto text,
  slug text UNIQUE,
  ativo boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.licoes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='licoes' AND policyname='Ver lições ativas'
  ) THEN
    CREATE POLICY "Ver lições ativas"
    ON public.licoes FOR SELECT
    USING (ativo = true OR is_admin() OR user_has_permission('read', 'cursos'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='licoes' AND policyname='Gerenciar lições'
  ) THEN
    CREATE POLICY "Gerenciar lições"
    ON public.licoes FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- 5) Anexos de lição (metadados)
CREATE TABLE IF NOT EXISTS public.licao_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licao_id uuid NOT NULL REFERENCES public.licoes(id) ON DELETE CASCADE,
  nome_arquivo text NOT NULL,
  url_storage text NOT NULL,
  mime_type text,
  tamanho_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.licao_anexos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='licao_anexos' AND policyname='Ver anexos de lição (aluno ou admin)'
  ) THEN
    CREATE POLICY "Ver anexos de lição (aluno ou admin)"
    ON public.licao_anexos FOR SELECT
    USING (
      is_admin() OR EXISTS (
        SELECT 1
        FROM public.matriculas m
        JOIN public.licoes l ON l.id = licao_anexos.licao_id
        WHERE m.curso_id = l.curso_id
          AND m.pessoa_id = public.get_current_person_id()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='licao_anexos' AND policyname='Gerenciar anexos (admin)'
  ) THEN
    CREATE POLICY "Gerenciar anexos (admin)"
    ON public.licao_anexos FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- 6) Progresso de lições
CREATE TABLE IF NOT EXISTS public.progresso_licoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id uuid NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  licao_id uuid NOT NULL REFERENCES public.licoes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'iniciada',
  progresso_percent numeric NOT NULL DEFAULT 0,
  concluida_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (matricula_id, licao_id)
);

ALTER TABLE public.progresso_licoes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='progresso_licoes' AND policyname='Aluno vê seu progresso'
  ) THEN
    CREATE POLICY "Aluno vê seu progresso"
    ON public.progresso_licoes FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.matriculas m 
      WHERE m.id = progresso_licoes.matricula_id 
        AND m.pessoa_id = public.get_current_person_id()
    ) OR is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='progresso_licoes' AND policyname='Aluno gerencia seu progresso'
  ) THEN
    CREATE POLICY "Aluno gerencia seu progresso"
    ON public.progresso_licoes FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.matriculas m 
      WHERE m.id = progresso_licoes.matricula_id 
        AND m.pessoa_id = public.get_current_person_id()
    ) OR is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='progresso_licoes' AND policyname='Aluno atualiza seu progresso'
  ) THEN
    CREATE POLICY "Aluno atualiza seu progresso"
    ON public.progresso_licoes FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM public.matriculas m 
      WHERE m.id = progresso_licoes.matricula_id 
        AND m.pessoa_id = public.get_current_person_id()
    ) OR is_admin())
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.matriculas m 
      WHERE m.id = progresso_licoes.matricula_id 
        AND m.pessoa_id = public.get_current_person_id()
    ) OR is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='progresso_licoes' AND policyname='Admin pode gerenciar progresso'
  ) THEN
    CREATE POLICY "Admin pode gerenciar progresso"
    ON public.progresso_licoes FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- 7) Gamificação
CREATE TABLE IF NOT EXISTS public.gamificacao_recompensas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  pontos integer NOT NULL DEFAULT 0,
  descricao text,
  referencia jsonb NOT NULL DEFAULT '{}'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gamificacao_recompensas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gamificacao_recompensas' AND policyname='Usuário vê suas recompensas'
  ) THEN
    CREATE POLICY "Usuário vê suas recompensas"
    ON public.gamificacao_recompensas FOR SELECT
    USING (pessoa_id = public.get_current_person_id() OR is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gamificacao_recompensas' AND policyname='Apenas admin gerencia recompensas'
  ) THEN
    CREATE POLICY "Apenas admin gerencia recompensas"
    ON public.gamificacao_recompensas FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- 8) Triggers updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trilhas_formacao_updated_at') THEN
    CREATE TRIGGER trg_trilhas_formacao_updated_at
    BEFORE UPDATE ON public.trilhas_formacao
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_modulos_curso_updated_at') THEN
    CREATE TRIGGER trg_modulos_curso_updated_at
    BEFORE UPDATE ON public.modulos_curso
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_licoes_updated_at') THEN
    CREATE TRIGGER trg_licoes_updated_at
    BEFORE UPDATE ON public.licoes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_licao_anexos_updated_at') THEN
    CREATE TRIGGER trg_licao_anexos_updated_at
    BEFORE UPDATE ON public.licao_anexos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_progresso_licoes_updated_at') THEN
    CREATE TRIGGER trg_progresso_licoes_updated_at
    BEFORE UPDATE ON public.progresso_licoes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_gamificacao_recompensas_updated_at') THEN
    CREATE TRIGGER trg_gamificacao_recompensas_updated_at
    BEFORE UPDATE ON public.gamificacao_recompensas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 9) Bucket e políticas (idempotentes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ead-anexos', 'ead-anexos', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'EAD - alunos e admins podem baixar'
  ) THEN
    CREATE POLICY "EAD - alunos e admins podem baixar"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'ead-anexos' AND (
        public.is_admin() OR EXISTS (
          SELECT 1
          FROM public.matriculas m
          WHERE m.pessoa_id = public.get_current_person_id()
            AND m.curso_id = ((storage.foldername(name))[1])::uuid
        )
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'EAD - admins podem enviar'
  ) THEN
    CREATE POLICY "EAD - admins podem enviar"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'ead-anexos' AND public.is_admin()
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'EAD - admins podem atualizar'
  ) THEN
    CREATE POLICY "EAD - admins podem atualizar"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'ead-anexos' AND public.is_admin()
    )
    WITH CHECK (
      bucket_id = 'ead-anexos' AND public.is_admin()
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'EAD - admins podem deletar'
  ) THEN
    CREATE POLICY "EAD - admins podem deletar"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'ead-anexos' AND public.is_admin()
    );
  END IF;
END $$;

-- 10) Seeds
WITH upsert_trilha AS (
  INSERT INTO public.trilhas_formacao (slug, titulo, ordem, ativo)
  VALUES ('001-dna-track', 'Trilho de Treinamento DNA', 1, true)
  ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo, ordem = EXCLUDED.ordem, ativo = EXCLUDED.ativo
  RETURNING id as trilha_id
),
upsert_cursos AS (
  INSERT INTO public.cursos (slug, nome, ordem, trilha_id, ativo)
  SELECT 'curso-descubra', 'Descubra', 1, trilha_id, true FROM upsert_trilha
  UNION ALL SELECT 'curso-dna-celulas', 'DNA da Igreja em Células', 2, (SELECT trilha_id FROM upsert_trilha), true
  UNION ALL SELECT 'curso-dna-discipulado', 'DNA do Discipulado', 3, (SELECT trilha_id FROM upsert_trilha), true
  UNION ALL SELECT 'curso-dna-lideranca', 'DNA da Liderança', 4, (SELECT trilha_id FROM upsert_trilha), true
  ON CONFLICT (slug) DO UPDATE SET nome = EXCLUDED.nome, trilha_id = EXCLUDED.trilha_id, ordem = EXCLUDED.ordem, ativo = EXCLUDED.ativo
  RETURNING id, slug
),
ids AS (
  SELECT 
    (SELECT id FROM upsert_cursos WHERE slug='curso-descubra') as curso_descubra,
    (SELECT id FROM upsert_cursos WHERE slug='curso-dna-celulas') as curso_dna_celulas,
    (SELECT id FROM upsert_cursos WHERE slug='curso-dna-discipulado') as curso_dna_discipulado,
    (SELECT id FROM upsert_cursos WHERE slug='curso-dna-lideranca') as curso_dna_lideranca
)
INSERT INTO public.licoes (curso_id, titulo, ordem, ativo)
SELECT curso_descubra, 'Aula 1: O Encontro', 1, true FROM ids
UNION ALL SELECT curso_descubra, 'Aula 2: A Descoberta', 2, true FROM ids
UNION ALL SELECT curso_descubra, 'Aula 3: O Chamado', 3, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 1: O que é a Igreja?', 1, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 2: A Visão Celular', 2, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 3: O Ganhar', 3, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 4: O Consolidar', 4, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 5: O Discipular', 5, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 6: O Enviar', 6, true FROM ids
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cursos_updated_at'
  ) THEN
    CREATE TRIGGER trg_cursos_updated_at
    BEFORE UPDATE ON public.cursos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
