-- 1) Criar bucket para comprovantes financeiros (privado)
insert into storage.buckets (id, name, public)
values ('financeiro-comprovantes', 'financeiro-comprovantes', false)
on conflict (id) do nothing;

-- 2) Políticas de acesso ao bucket 'financeiro-comprovantes'
-- SELECT (leitura) para admin e leitores de financeiro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'financeiro-comprovantes select'
  ) THEN
    CREATE POLICY "financeiro-comprovantes select"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'financeiro-comprovantes'
      AND (public.is_admin() OR public.user_has_permission('read'::text, 'financeiro'::text))
    );
  END IF;
END$$;

-- INSERT (upload) para admin e gestores de financeiro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'financeiro-comprovantes insert'
  ) THEN
    CREATE POLICY "financeiro-comprovantes insert"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'financeiro-comprovantes'
      AND (public.is_admin() OR public.user_has_permission('manage'::text, 'financeiro'::text))
    );
  END IF;
END$$;

-- UPDATE (renomear/mover) para admin e gestores de financeiro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'financeiro-comprovantes update'
  ) THEN
    CREATE POLICY "financeiro-comprovantes update"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'financeiro-comprovantes'
      AND (public.is_admin() OR public.user_has_permission('manage'::text, 'financeiro'::text))
    )
    WITH CHECK (
      bucket_id = 'financeiro-comprovantes'
      AND (public.is_admin() OR public.user_has_permission('manage'::text, 'financeiro'::text))
    );
  END IF;
END$$;

-- DELETE para admin e gestores de financeiro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'financeiro-comprovantes delete'
  ) THEN
    CREATE POLICY "financeiro-comprovantes delete"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'financeiro-comprovantes'
      AND (public.is_admin() OR public.user_has_permission('manage'::text, 'financeiro'::text))
    );
  END IF;
END$$;

-- 3) Ajustes finos no módulo Orçamento
-- Trigger para manter updated_at consistente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='orcamentos'
  ) THEN
    -- Remover trigger antigo se existir
    IF EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'update_orcamentos_updated_at'
    ) THEN
      DROP TRIGGER update_orcamentos_updated_at ON public.orcamentos;
    END IF;

    CREATE TRIGGER update_orcamentos_updated_at
    BEFORE UPDATE ON public.orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

    -- Índice para acelerar consultas por igreja/ano/mês
    CREATE INDEX IF NOT EXISTS idx_orcamentos_igreja_ano_mes 
      ON public.orcamentos(igreja_id, ano, mes);
  END IF;
END$$;