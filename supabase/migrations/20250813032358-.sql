-- Patrimônio Module Activation Migration
-- 1) Sequence for patrimonio code
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'seq_patrimonio') THEN
    CREATE SEQUENCE public.seq_patrimonio START 1;
  END IF;
END $$;

-- 2) Buckets for assets (photos) and documents (invoices)
insert into storage.buckets (id, name, public)
values ('patrimonios', 'patrimonios', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('patrimonio_docs', 'patrimonio_docs', false)
on conflict (id) do nothing;

-- Storage policies for patrimonios (public read, user-owned writes)
create policy if not exists "Public can read patrimonios"
  on storage.objects for select
  using (bucket_id = 'patrimonios');

create policy if not exists "Users can upload own patrimonios"
  on storage.objects for insert
  with check (
    bucket_id = 'patrimonios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update own patrimonios"
  on storage.objects for update
  using (
    bucket_id = 'patrimonios'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'patrimonios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete own patrimonios"
  on storage.objects for delete
  using (
    bucket_id = 'patrimonios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for patrimonio_docs (private; user-owned access)
create policy if not exists "Users can read own patrimonio docs"
  on storage.objects for select
  using (
    bucket_id = 'patrimonio_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can upload own patrimonio docs"
  on storage.objects for insert
  with check (
    bucket_id = 'patrimonio_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update own patrimonio docs"
  on storage.objects for update
  using (
    bucket_id = 'patrimonio_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'patrimonio_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete own patrimonio docs"
  on storage.objects for delete
  using (
    bucket_id = 'patrimonio_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3) Extend categorias_patrimonio to support subcategories
ALTER TABLE public.categorias_patrimonio
  ADD COLUMN IF NOT EXISTS parent_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
      AND table_name = 'categorias_patrimonio' 
      AND constraint_name = 'categorias_patrimonio_parent_fk'
  ) THEN
    ALTER TABLE public.categorias_patrimonio
      ADD CONSTRAINT categorias_patrimonio_parent_fk
      FOREIGN KEY (parent_id) REFERENCES public.categorias_patrimonio(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4) Patrimonios table
CREATE TABLE IF NOT EXISTS public.patrimonios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_patrimonio text UNIQUE,
  nome text NOT NULL,
  descricao text,
  categoria_id uuid REFERENCES public.categorias_patrimonio(id),
  status text NOT NULL DEFAULT 'disponivel',
  localizacao_atual text,
  responsavel_id uuid REFERENCES public.pessoas(id),
  foto_url text,
  nota_fiscal_url text,
  valor_aquisicao numeric,
  data_aquisicao date,
  numero_serie text,
  fornecedor text,
  depreciacao_anos integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for patrimonios
ALTER TABLE public.patrimonios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patrimonios' AND policyname='Admins can manage patrimonios') THEN
    CREATE POLICY "Admins can manage patrimonios" ON public.patrimonios FOR ALL
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patrimonios' AND policyname='Authenticated can read patrimonios') THEN
    CREATE POLICY "Authenticated can read patrimonios" ON public.patrimonios FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- triggers for patrimonios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_patrimonios_update_updated_at'
  ) THEN
    CREATE TRIGGER trg_patrimonios_update_updated_at
    BEFORE UPDATE ON public.patrimonios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_patrimonios_codigo_auto'
  ) THEN
    CREATE TRIGGER trg_patrimonios_codigo_auto
    BEFORE INSERT ON public.patrimonios
    FOR EACH ROW
    EXECUTE FUNCTION public.gerar_codigo_patrimonio();
  END IF;
END $$;

-- 5) Historico Patrimonio
CREATE TABLE IF NOT EXISTS public.historico_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patrimonio_id uuid NOT NULL REFERENCES public.patrimonios(id) ON DELETE CASCADE,
  tipo_evento text NOT NULL,
  descricao text,
  valor_anterior text,
  valor_novo text,
  usuario_responsavel uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.historico_patrimonio ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='historico_patrimonio' AND policyname='Admins can read historico') THEN
    CREATE POLICY "Admins can read historico" ON public.historico_patrimonio FOR SELECT
      USING (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='historico_patrimonio' AND policyname='Admins can insert historico') THEN
    CREATE POLICY "Admins can insert historico" ON public.historico_patrimonio FOR INSERT
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_patrimonios_audit_changes'
  ) THEN
    CREATE TRIGGER trg_patrimonios_audit_changes
    AFTER UPDATE ON public.patrimonios
    FOR EACH ROW
    EXECUTE FUNCTION public.criar_historico_patrimonio();
  END IF;
END $$;

-- 6) Reservas de Patrimonio
CREATE TABLE IF NOT EXISTS public.patrimonio_reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patrimonio_id uuid NOT NULL REFERENCES public.patrimonios(id) ON DELETE CASCADE,
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'aprovacao_pendente',
  solicitante_id uuid,
  aprovado_por uuid,
  agendamento_id uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patrimonio_reservas ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patrimonio_reservas' AND policyname='Admins can manage reservas') THEN
    CREATE POLICY "Admins can manage reservas" ON public.patrimonio_reservas FOR ALL
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patrimonio_reservas' AND policyname='Authenticated can read reservas') THEN
    CREATE POLICY "Authenticated can read reservas" ON public.patrimonio_reservas FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- conflict check trigger for overlapping reservations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_check_patrimonio_reserva_conflito'
  ) THEN
    CREATE TRIGGER trg_check_patrimonio_reserva_conflito
    BEFORE INSERT OR UPDATE ON public.patrimonio_reservas
    FOR EACH ROW
    EXECUTE FUNCTION public.check_patrimonio_reserva_conflito();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_patrimonio_reservas_update_updated_at'
  ) THEN
    CREATE TRIGGER trg_patrimonio_reservas_update_updated_at
    BEFORE UPDATE ON public.patrimonio_reservas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- 7) Manutenções de Patrimonio
CREATE TABLE IF NOT EXISTS public.manutencoes_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patrimonio_id uuid NOT NULL REFERENCES public.patrimonios(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'preventiva',
  descricao text,
  data_prevista date,
  data_execucao date,
  custo numeric,
  comprovante_url text,
  responsavel_id uuid,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.manutencoes_patrimonio ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='manutencoes_patrimonio' AND policyname='Admins can manage manutencoes') THEN
    CREATE POLICY "Admins can manage manutencoes" ON public.manutencoes_patrimonio FOR ALL
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='manutencoes_patrimonio' AND policyname='Authenticated can read manutencoes') THEN
    CREATE POLICY "Authenticated can read manutencoes" ON public.manutencoes_patrimonio FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_manutencoes_patrimonio_update_updated_at'
  ) THEN
    CREATE TRIGGER trg_manutencoes_patrimonio_update_updated_at
    BEFORE UPDATE ON public.manutencoes_patrimonio
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;