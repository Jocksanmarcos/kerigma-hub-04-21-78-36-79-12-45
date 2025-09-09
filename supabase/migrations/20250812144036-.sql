-- Fix linter: set immutable search_path for new functions and add storage bucket for lesson attachments

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_ensino_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate processar_conclusao_licao with explicit search_path
CREATE OR REPLACE FUNCTION public.processar_conclusao_licao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pontos_base INTEGER := 10;
BEGIN
  INSERT INTO public.conquistas_ensino (
    pessoa_id, pontos_ganhos, tipo_conquista, detalhes
  ) VALUES (
    (SELECT pessoa_id FROM public.matriculas WHERE id = NEW.matricula_id),
    pontos_base,
    'licao_completa',
    jsonb_build_object('licao_id', NEW.licao_id, 'progresso_percent', NEW.progresso_percent)
  );
  RETURN NEW;
END;
$$;

-- Create Storage bucket for lesson attachments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'licao-anexos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('licao-anexos', 'licao-anexos', true);
  END IF;
END $$;

-- Storage policies for bucket
DO $$
BEGIN
  -- Allow public read (since bucket is public, this mirrors that intent)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read licao-anexos'
  ) THEN
    CREATE POLICY "Public can read licao-anexos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'licao-anexos');
  END IF;

  -- Allow admins/managers to insert/update/delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins manage licao-anexos'
  ) THEN
    CREATE POLICY "Admins manage licao-anexos"
    ON storage.objects FOR ALL
    USING (bucket_id = 'licao-anexos' AND (public.is_admin() OR public.user_has_permission('manage', 'ensino')))
    WITH CHECK (bucket_id = 'licao-anexos' AND (public.is_admin() OR public.user_has_permission('manage', 'ensino')));
  END IF;
END $$;