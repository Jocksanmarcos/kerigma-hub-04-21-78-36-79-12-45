-- Corrigir problemas de segurança críticos da migração anterior

-- Verificar e habilitar RLS em tabelas que podem estar sem
DO $$
DECLARE
    r record;
BEGIN
    -- Verificar todas as tabelas públicas e habilitar RLS se necessário
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND NOT EXISTS (
            SELECT 1 FROM pg_class 
            WHERE relname = tablename 
            AND relrowsecurity = true
        )
    LOOP
        -- Habilitar RLS apenas em tabelas que realmente precisam
        IF r.tablename NOT IN ('schema_migrations') THEN
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
        END IF;
    END LOOP;
END
$$;

-- Corrigir a função update_updated_at_column adicionando search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;