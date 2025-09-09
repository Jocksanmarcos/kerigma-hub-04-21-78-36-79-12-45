-- Etapa 1: Aprimoramento do schema de Eventos sem apagar dados
-- 1) Garantir colunas em evento_tickets
DO $$
BEGIN
  -- quantidade_total
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'evento_tickets' AND column_name = 'quantidade_total'
  ) THEN
    EXECUTE 'ALTER TABLE public.evento_tickets ADD COLUMN quantidade_total INTEGER';
  END IF;

  -- data_inicio_vendas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'evento_tickets' AND column_name = 'data_inicio_vendas'
  ) THEN
    EXECUTE 'ALTER TABLE public.evento_tickets ADD COLUMN data_inicio_vendas TIMESTAMPTZ';
  END IF;

  -- data_fim_vendas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'evento_tickets' AND column_name = 'data_fim_vendas'
  ) THEN
    EXECUTE 'ALTER TABLE public.evento_tickets ADD COLUMN data_fim_vendas TIMESTAMPTZ';
  END IF;
END $$;

-- 2) Garantir colunas em evento_inscricoes
DO $$
BEGIN
  -- qr_code_hash
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'evento_inscricoes' AND column_name = 'qr_code_hash'
  ) THEN
    EXECUTE 'ALTER TABLE public.evento_inscricoes ADD COLUMN qr_code_hash TEXT';
  END IF;

  -- check_in_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'evento_inscricoes' AND column_name = 'check_in_status'
  ) THEN
    EXECUTE 'ALTER TABLE public.evento_inscricoes ADD COLUMN check_in_status BOOLEAN DEFAULT false';
  END IF;
END $$;

-- 2.1) Índice único para qr_code_hash (ignora se já existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'evento_inscricoes_qr_code_hash_key'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX evento_inscricoes_qr_code_hash_key ON public.evento_inscricoes (qr_code_hash)';
  END IF;
END $$;

-- 3) Criar tabela evento_cupons caso não exista
CREATE TABLE IF NOT EXISTS public.evento_cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  percentual_desconto NUMERIC NOT NULL
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.evento_cupons ENABLE ROW LEVEL SECURITY;

-- Política: somente admins/gestores de eventos podem gerenciar cupons
DROP POLICY IF EXISTS "manage cupons (admins/managers)" ON public.evento_cupons;
CREATE POLICY "manage cupons (admins/managers)"
ON public.evento_cupons
FOR ALL
USING (
  is_admin() OR user_has_permission('manage', 'eventos')
)
WITH CHECK (
  is_admin() OR user_has_permission('manage', 'eventos')
);
