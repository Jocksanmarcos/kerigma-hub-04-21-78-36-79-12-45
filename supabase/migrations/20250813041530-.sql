-- Corrigir avisos do linter: políticas RLS ausentes e search_path em funções SECURITY DEFINER

-- 1) Criar políticas mínimas (admin) para tabelas com RLS sem políticas
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT unnest(ARRAY[
      'convites_ministerio',
      'escala_participantes',
      'ministerio_funcoes',
      'ministerio_membros',
      'permissoes_sistema',
      'presencas_celula',
      'progresso_trilhas_dna',
      'service_schedule_volunteers',
      'service_schedules',
      'volunteer_applications'
    ]) AS table_name
  LOOP
    -- Criar política ALL para admin se ainda não existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = rec.table_name 
        AND policyname = 'Admin pode gerenciar ' || rec.table_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (is_admin()) WITH CHECK (is_admin())',
        'Admin pode gerenciar ' || rec.table_name,
        rec.table_name
      );
    END IF;
  END LOOP;
END$$;

-- 2) Adicionar SET search_path TO 'public' às funções SECURITY DEFINER que faltam
-- get_user_igreja_id
CREATE OR REPLACE FUNCTION public.get_user_igreja_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT igreja_id 
    FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;

-- generate_backup_codes
CREATE OR REPLACE FUNCTION public.generate_backup_codes()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  codes TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    codes := array_append(codes, substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
  END LOOP;
  RETURN codes;
END;
$$;

-- update_pastoral_agendamento
CREATE OR REPLACE FUNCTION public.update_pastoral_agendamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.agendamento_pastoral_id IS NOT NULL THEN
    UPDATE agendamentos_pastorais 
    SET 
      agendamento_id = NEW.id,
      data_agendamento = NEW.data_hora_inicio,
      status = 'agendado',
      updated_at = NOW()
    WHERE id = NEW.agendamento_pastoral_id;
  END IF;
  RETURN NEW;
END;
$$;