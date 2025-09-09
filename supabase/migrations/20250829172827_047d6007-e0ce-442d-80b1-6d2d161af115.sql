-- Fase 4: Infraestrutura de Desafios e Medalhas (Jornada)
-- Criar tabelas alinhadas ao padrão do projeto (pessoa_id, created_at/updated_at, RLS)

-- 1) Catálogo de Medalhas
CREATE TABLE IF NOT EXISTS public.jornada_medalhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_medalha TEXT NOT NULL,
  descricao TEXT NOT NULL,
  imagem_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.jornada_medalhas IS 'Define todas as medalhas/conquistas desbloqueáveis na Jornada.';

-- 2) Quadro de Medalhas por Pessoa
CREATE TABLE IF NOT EXISTS public.jornada_medalhas_usuarios (
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  medalha_id UUID NOT NULL REFERENCES public.jornada_medalhas(id) ON DELETE CASCADE,
  data_conquista TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pessoa_id, medalha_id)
);
COMMENT ON TABLE public.jornada_medalhas_usuarios IS 'Registra as medalhas que cada pessoa conquistou.';

-- 3) Catálogo de Desafios
CREATE TABLE IF NOT EXISTS public.jornada_desafios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo_desafio TEXT NOT NULL, -- e.g. 'leitura_livro', 'quiz_capitulo', 'streak_dias'
  meta_json JSONB NOT NULL,   -- e.g. {"bookId": "JHN"} ou {"dias": 7}
  pontos_bonus INTEGER NOT NULL DEFAULT 0,
  medalha_id_recompensa UUID REFERENCES public.jornada_medalhas(id) ON DELETE SET NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.jornada_desafios IS 'Define os desafios disponíveis para os membros.';

-- 4) Progresso de Desafios por Pessoa
CREATE TABLE IF NOT EXISTS public.jornada_desafios_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  desafio_id UUID NOT NULL REFERENCES public.jornada_desafios(id) ON DELETE CASCADE,
  progresso_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ativo', -- 'ativo', 'concluido'
  iniciado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.jornada_desafios_usuarios IS 'Registra o progresso de cada pessoa nos desafios que aceitou.';

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_jmu_pessoa ON public.jornada_medalhas_usuarios(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_jdu_pessoa ON public.jornada_desafios_usuarios(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_jdu_desafio ON public.jornada_desafios_usuarios(desafio_id);

-- Triggers de updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jornada_medalhas_updated_at'
  ) THEN
    CREATE TRIGGER trg_jornada_medalhas_updated_at
    BEFORE UPDATE ON public.jornada_medalhas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jornada_medalhas_usuarios_updated_at'
  ) THEN
    CREATE TRIGGER trg_jornada_medalhas_usuarios_updated_at
    BEFORE UPDATE ON public.jornada_medalhas_usuarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jornada_desafios_updated_at'
  ) THEN
    CREATE TRIGGER trg_jornada_desafios_updated_at
    BEFORE UPDATE ON public.jornada_desafios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jornada_desafios_usuarios_updated_at'
  ) THEN
    CREATE TRIGGER trg_jornada_desafios_usuarios_updated_at
    BEFORE UPDATE ON public.jornada_desafios_usuarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.jornada_medalhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_medalhas_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_desafios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_desafios_usuarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Leitura pública para medalhas e desafios
DO $$ BEGIN
  -- Medalhas: leitura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_medalhas' AND policyname = 'Leitura pública medalhas'
  ) THEN
    CREATE POLICY "Leitura pública medalhas" ON public.jornada_medalhas
    FOR SELECT USING (true);
  END IF;

  -- Desafios: leitura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_desafios' AND policyname = 'Leitura pública desafios'
  ) THEN
    CREATE POLICY "Leitura pública desafios" ON public.jornada_desafios
    FOR SELECT USING (true);
  END IF;

  -- Admins podem gerenciar medalhas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_medalhas' AND policyname = 'Admins gerenciam medalhas'
  ) THEN
    CREATE POLICY "Admins gerenciam medalhas" ON public.jornada_medalhas
    FOR ALL
    USING (is_admin() OR user_has_permission('manage', 'ensino'))
    WITH CHECK (is_admin() OR user_has_permission('manage', 'ensino'));
  END IF;

  -- Admins podem gerenciar desafios
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_desafios' AND policyname = 'Admins gerenciam desafios'
  ) THEN
    CREATE POLICY "Admins gerenciam desafios" ON public.jornada_desafios
    FOR ALL
    USING (is_admin() OR user_has_permission('manage', 'ensino'))
    WITH CHECK (is_admin() OR user_has_permission('manage', 'ensino'));
  END IF;

  -- Medalhas por pessoa: usuário pode ver as suas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_medalhas_usuarios' AND policyname = 'Usuário vê próprias medalhas'
  ) THEN
    CREATE POLICY "Usuário vê próprias medalhas" ON public.jornada_medalhas_usuarios
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.pessoas p
        WHERE p.id = jornada_medalhas_usuarios.pessoa_id AND p.user_id = auth.uid()
      )
    );
  END IF;

  -- Medalhas por pessoa: usuário pode inserir as suas (ou via app)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_medalhas_usuarios' AND policyname = 'Usuário insere próprias medalhas'
  ) THEN
    CREATE POLICY "Usuário insere próprias medalhas" ON public.jornada_medalhas_usuarios
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.pessoas p
        WHERE p.id = jornada_medalhas_usuarios.pessoa_id AND p.user_id = auth.uid()
      )
    );
  END IF;

  -- Medalhas por pessoa: admins podem gerenciar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_medalhas_usuarios' AND policyname = 'Admins gerenciam medalhas por pessoa'
  ) THEN
    CREATE POLICY "Admins gerenciam medalhas por pessoa" ON public.jornada_medalhas_usuarios
    FOR ALL
    USING (is_admin() OR user_has_permission('manage', 'ensino'))
    WITH CHECK (is_admin() OR user_has_permission('manage', 'ensino'));
  END IF;

  -- Desafios por pessoa: usuário pode ver
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_desafios_usuarios' AND policyname = 'Usuário vê próprios desafios'
  ) THEN
    CREATE POLICY "Usuário vê próprios desafios" ON public.jornada_desafios_usuarios
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.pessoas p
        WHERE p.id = jornada_desafios_usuarios.pessoa_id AND p.user_id = auth.uid()
      )
    );
  END IF;

  -- Desafios por pessoa: usuário pode criar (aceitar) seu desafio
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_desafios_usuarios' AND policyname = 'Usuário cria próprios desafios'
  ) THEN
    CREATE POLICY "Usuário cria próprios desafios" ON public.jornada_desafios_usuarios
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.pessoas p
        WHERE p.id = jornada_desafios_usuarios.pessoa_id AND p.user_id = auth.uid()
      )
    );
  END IF;

  -- Desafios por pessoa: usuário pode atualizar progresso dos seus
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_desafios_usuarios' AND policyname = 'Usuário atualiza próprios desafios'
  ) THEN
    CREATE POLICY "Usuário atualiza próprios desafios" ON public.jornada_desafios_usuarios
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.pessoas p
        WHERE p.id = jornada_desafios_usuarios.pessoa_id AND p.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.pessoas p
        WHERE p.id = jornada_desafios_usuarios.pessoa_id AND p.user_id = auth.uid()
      )
    );
  END IF;

  -- Desafios por pessoa: admins podem gerenciar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jornada_desafios_usuarios' AND policyname = 'Admins gerenciam desafios por pessoa'
  ) THEN
    CREATE POLICY "Admins gerenciam desafios por pessoa" ON public.jornada_desafios_usuarios
    FOR ALL
    USING (is_admin() OR user_has_permission('manage', 'ensino'))
    WITH CHECK (is_admin() OR user_has_permission('manage', 'ensino'));
  END IF;
END $$;