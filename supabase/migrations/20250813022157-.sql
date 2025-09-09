-- Seed fictitious data for public site
-- 1) Fetch an existing igreja_id to satisfy NOT NULL on eventos. Using the first found sede.
DO $$
DECLARE v_igreja_id uuid;
BEGIN
  SELECT id INTO v_igreja_id FROM public.igrejas LIMIT 1;
  IF v_igreja_id IS NULL THEN
    RAISE NOTICE 'Nenhuma igreja encontrada. Abortando seed de eventos.';
    RETURN;
  END IF;

  -- Insert three upcoming public events (only if there are no future public events yet)
  IF NOT EXISTS (
    SELECT 1 FROM public.eventos WHERE publico = true AND data_inicio >= now()
  ) THEN
    INSERT INTO public.eventos (titulo, descricao, data_inicio, local, tipo, publico, igreja_id, cover_image_url)
    VALUES
      ('Encontro de Comunhão', 'Uma noite de louvor e comunhão.', now() + interval '7 days', 'Auditório Principal', 'Culto', true, v_igreja_id, '/lovable-uploads/11700eec-d837-4103-93e0-ec07fdcc9d64.png'),
      ('Treinamento de Líderes', 'Capacitação para líderes de células.', now() + interval '14 days', 'Sala de Treinamentos', 'Treinamento', true, v_igreja_id, '/lovable-uploads/334c0fdb-b249-4044-ac5c-1bbd104ea82b.png'),
      ('Conferência da Família', 'Tempo especial para famílias.', now() + interval '21 days', 'Auditório Principal', 'Conferência', true, v_igreja_id, '/lovable-uploads/57bb8965-c932-40db-a64b-c15a6d72d4b0.png');
  END IF;
END $$;

-- 2) Insert three active cells with valid coordinates (only if none exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.celulas WHERE ativa = true AND latitude IS NOT NULL AND longitude IS NOT NULL
  ) THEN
    INSERT INTO public.celulas (
      nome, descricao, endereco, bairro, cidade, dia_semana, horario, latitude, longitude, ativa, status
    ) VALUES
      ('Célula Central', 'Célula no centro da cidade.', 'Rua das Flores, 123', 'Centro', 'São Paulo', 'Quarta', '19:30'::time, -23.5505, -46.6333, true, 'ativa'),
      ('Célula Zona Sul', 'Célula na zona sul.', 'Av. das Nações, 456', 'Zona Sul', 'São Paulo', 'Sexta', '20:00'::time, -23.6693, -46.7350, true, 'ativa'),
      ('Célula Jovem', 'Célula de jovens.', 'Rua Esperança, 789', 'Jardim Alegre', 'São Paulo', 'Sábado', '18:00'::time, -23.5700, -46.6500, true, 'ativa');
  END IF;
END $$;