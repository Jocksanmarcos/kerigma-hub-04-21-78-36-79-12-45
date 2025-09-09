-- Patrimônio schema check & creation (idempotent)

-- 1) Categorias de patrimônio
CREATE TABLE IF NOT EXISTS public.categorias_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Subcategorias
CREATE TABLE IF NOT EXISTS public.subcategorias_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL REFERENCES public.categorias_patrimonio(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (categoria_id, nome)
);

-- 3) Enum de status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patrimonio_status') THEN
    CREATE TYPE public.patrimonio_status AS ENUM ('ativo','emprestado','manutencao','inativo','baixado');
  END IF;
END$$;

-- 4) Tabela principal de patrimonios
CREATE TABLE IF NOT EXISTS public.patrimonios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  categoria_id uuid NOT NULL REFERENCES public.categorias_patrimonio(id),
  subcategoria_id uuid REFERENCES public.subcategorias_patrimonio(id),
  codigo_patrimonio text UNIQUE,
  numero_serie text,
  valor_aquisicao numeric,
  data_aquisicao date,
  localizacao text,
  status public.patrimonio_status NOT NULL DEFAULT 'ativo',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Manutenções (cria somente se não existir; caso exista não altera)
CREATE TABLE IF NOT EXISTS public.manutencoes_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patrimonio_id uuid NOT NULL REFERENCES public.patrimonios(id) ON DELETE CASCADE,
  tipo_manutencao text NOT NULL,
  descricao text NOT NULL,
  data_manutencao date NOT NULL,
  valor_gasto numeric,
  empresa_responsavel text,
  comprovante_url text,
  responsavel_id uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Empréstimos (mantém definição existente caso já exista)
CREATE TABLE IF NOT EXISTS public.emprestimos_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patrimonio_id uuid NOT NULL REFERENCES public.patrimonios(id) ON DELETE CASCADE,
  solicitante_id uuid NOT NULL,
  responsavel_liberacao_id uuid,
  responsavel_devolucao_id uuid,
  data_retirada date NOT NULL,
  data_prevista_devolucao date NOT NULL,
  data_devolucao date,
  local_uso text,
  situacao_devolucao text,
  termo_pdf_url text,
  observacoes text,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7) Histórico (mantém definição existente caso já exista)
CREATE TABLE IF NOT EXISTS public.historico_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patrimonio_id uuid NOT NULL REFERENCES public.patrimonios(id) ON DELETE CASCADE,
  tipo_evento text NOT NULL,
  descricao text NOT NULL,
  valor_anterior text,
  valor_novo text,
  usuario_responsavel uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8) Índices básicos
CREATE INDEX IF NOT EXISTS idx_patrimonios_categoria ON public.patrimonios(categoria_id);
CREATE INDEX IF NOT EXISTS idx_patrimonios_subcategoria ON public.patrimonios(subcategoria_id);
CREATE INDEX IF NOT EXISTS idx_patrimonios_status ON public.patrimonios(status);

-- 9) Função de atualização de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10) Triggers (cria apenas se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_patrimonios_updated_at'
  ) THEN
    CREATE TRIGGER trg_patrimonios_updated_at BEFORE UPDATE ON public.patrimonios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_manutencoes_patrimonio_updated_at'
  ) THEN
    CREATE TRIGGER trg_manutencoes_patrimonio_updated_at BEFORE UPDATE ON public.manutencoes_patrimonio
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_emprestimos_patrimonio_updated_at'
  ) THEN
    CREATE TRIGGER trg_emprestimos_patrimonio_updated_at BEFORE UPDATE ON public.emprestimos_patrimonio
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 11) RLS
ALTER TABLE public.categorias_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emprestimos_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_patrimonio ENABLE ROW LEVEL SECURITY;

-- Políticas
-- Categorias
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Categorias visíveis a todos' AND tablename = 'categorias_patrimonio'
  ) THEN
    CREATE POLICY "Categorias visíveis a todos" ON public.categorias_patrimonio FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Gerenciar categorias (admin)' AND tablename = 'categorias_patrimonio'
  ) THEN
    CREATE POLICY "Gerenciar categorias (admin)" ON public.categorias_patrimonio FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END$$;

-- Subcategorias
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Subcategorias visíveis a todos' AND tablename = 'subcategorias_patrimonio'
  ) THEN
    CREATE POLICY "Subcategorias visíveis a todos" ON public.subcategorias_patrimonio FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Gerenciar subcategorias (admin)' AND tablename = 'subcategorias_patrimonio'
  ) THEN
    CREATE POLICY "Gerenciar subcategorias (admin)" ON public.subcategorias_patrimonio FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END$$;

-- Patrimonios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Patrimônios visíveis' AND tablename = 'patrimonios'
  ) THEN
    CREATE POLICY "Patrimônios visíveis" ON public.patrimonios FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Gerenciar patrimonios (admin)' AND tablename = 'patrimonios'
  ) THEN
    CREATE POLICY "Gerenciar patrimonios (admin)" ON public.patrimonios FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END$$;

-- Manutenções
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Gerenciar manutenções (admin/lider)' AND tablename = 'manutencoes_patrimonio'
  ) THEN
    CREATE POLICY "Gerenciar manutenções (admin/lider)" ON public.manutencoes_patrimonio FOR ALL USING (
      EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true AND papel = ANY (ARRAY['admin','lider']))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true AND papel = ANY (ARRAY['admin','lider']))
    );
  END IF;
END$$;

-- Empréstimos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins e líderes podem gerenciar empréstimos' AND tablename = 'emprestimos_patrimonio'
  ) THEN
    CREATE POLICY "Admins e líderes podem gerenciar empréstimos" ON public.emprestimos_patrimonio FOR ALL USING (
      EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true AND papel = ANY (ARRAY['admin','lider']))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true AND papel = ANY (ARRAY['admin','lider']))
    );
  END IF;
END$$;

-- Histórico
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Sistema pode inserir histórico patrimônio' AND tablename = 'historico_patrimonio'
  ) THEN
    CREATE POLICY "Sistema pode inserir histórico patrimônio" ON public.historico_patrimonio FOR INSERT WITH CHECK (true);
  END IF;
END$$;