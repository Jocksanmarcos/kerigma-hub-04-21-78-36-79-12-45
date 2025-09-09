-- Seed demo data in one pass; events require igreja_id

-- 1) Seed celulas
DO $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.celulas WHERE ativa = true;
  IF v_count = 0 THEN
    INSERT INTO public.celulas (
      nome, bairro, endereco, dia_semana, horario, cidade, cep, saude_celula, descricao
    ) VALUES
    ('Célula Central', 'Centro', 'Rua Principal, 123', 'quarta', '19:30:00', 'São Luís', '65000-000', 'Verde', 'Célula para todas as idades'),
    ('Célula Jovem', 'Cohama', 'Av. da Juventude, 45', 'sexta', '20:00:00', 'São Luís', '65000-001', 'Amarelo', 'Foco em jovens e adolescentes'),
    ('Célula Famílias', 'Renascença', 'Rua das Famílias, 77', 'terca', '19:30:00', 'São Luís', '65000-002', 'Verde', 'Famílias da região'),
    ('Célula Infantil', 'Turu', 'Rua das Crianças, 12', 'sabado', '16:00:00', 'São Luís', 'Verde', '65000-003', 'Crianças e pais');
  END IF;
END $$;

-- 2) Seed eventos (somente se houver uma igreja)
DO $$
DECLARE v_count int;
DECLARE v_igreja_id uuid;
BEGIN
  SELECT id INTO v_igreja_id FROM public.igrejas LIMIT 1;
  IF v_igreja_id IS NULL THEN
    RAISE NOTICE 'Nenhuma igreja encontrada; pulando seed de eventos.';
  ELSE
    SELECT COUNT(*) INTO v_count FROM public.eventos WHERE publico = true AND data_inicio > now();
    IF v_count = 0 THEN
      INSERT INTO public.eventos (titulo, tipo, data_inicio, local, cover_image_url, publico, igreja_id)
      VALUES
      ('Conferência de Avivamento', 'geral', now() + interval '3 days', 'Auditório Central', '/lovable-uploads/11700eec-d837-4103-93e0-ec07fdcc9d64.png', true, v_igreja_id),
      ('Noite de Louvor', 'geral', now() + interval '7 days', 'Sede', '/lovable-uploads/334c0fdb-b249-4044-ac5c-1bbd104ea82b.png', true, v_igreja_id),
      ('Encontro de Casais', 'geral', now() + interval '14 days', 'Salão Social', '/lovable-uploads/57bb8965-c932-40db-a64b-c15a6d72d4b0.png', true, v_igreja_id),
      ('Domingo da Família', 'geral', now() + interval '21 days', 'Templo Principal', '/lovable-uploads/e022986f-6c9b-4d80-be21-b972b8cf2b9d.png', true, v_igreja_id);
    END IF;
  END IF;
END $$;

-- 3) Seed calendario e agendamentos
DO $$
DECLARE v_cal_id uuid;
DECLARE v_count int;
BEGIN
  SELECT id INTO v_cal_id FROM public.calendarios LIMIT 1;
  IF v_cal_id IS NULL THEN
    INSERT INTO public.calendarios (nome, cor, visivel_para_todos, descricao)
    VALUES ('Eventos da Igreja', '#2563eb', true, 'Agenda geral de eventos')
    RETURNING id INTO v_cal_id;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.agendamentos;
  IF v_count = 0 THEN
    INSERT INTO public.agendamentos (calendario_id, titulo, descricao, data_hora_inicio, data_hora_fim, local, status)
    VALUES
    (v_cal_id, 'Ensaio do Louvor', 'Preparação para o culto de domingo', now() + interval '1 day', now() + interval '1 day 2 hours', 'Sala de Música', 'confirmado'),
    (v_cal_id, 'Reunião de Líderes', 'Alinhamento mensal', now() + interval '5 days 19 hours', now() + interval '5 days 21 hours', 'Sala 2', 'confirmado');
  END IF;
END $$;