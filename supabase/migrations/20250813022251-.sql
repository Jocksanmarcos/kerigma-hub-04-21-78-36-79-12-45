-- Fix seed for eventos respecting tipo check constraint
DO $$
DECLARE v_igreja_id uuid;
BEGIN
  SELECT id INTO v_igreja_id FROM public.igrejas LIMIT 1;
  IF v_igreja_id IS NULL THEN
    RAISE NOTICE 'Nenhuma igreja encontrada. Abortando seed de eventos.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.eventos WHERE publico = true AND data_inicio >= now()
  ) THEN
    INSERT INTO public.eventos (titulo, descricao, data_inicio, local, tipo, publico, igreja_id, cover_image_url)
    VALUES
      ('Encontro de Comunhão', 'Uma noite de louvor e comunhão.', now() + interval '7 days', 'Auditório Principal', 'culto', true, v_igreja_id, '/lovable-uploads/11700eec-d837-4103-93e0-ec07fdcc9d64.png'),
      ('Treinamento de Líderes', 'Capacitação para líderes de células.', now() + interval '14 days', 'Sala de Treinamentos', 'lideranca', true, v_igreja_id, '/lovable-uploads/334c0fdb-b249-4044-ac5c-1bbd104ea82b.png'),
      ('Conferência da Família', 'Tempo especial para famílias.', now() + interval '21 days', 'Auditório Principal', 'familia', true, v_igreja_id, '/lovable-uploads/57bb8965-c932-40db-a64b-c15a6d72d4b0.png');
  END IF;
END $$;