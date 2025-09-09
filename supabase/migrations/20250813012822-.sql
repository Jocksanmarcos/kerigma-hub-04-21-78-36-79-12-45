-- Seed demo data for celulas, eventos, calendarios and agendamentos (idempotent)

-- 1) Células ativas (ajuste de dia_semana para valores aceitos)
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
    ('Célula Infantil', 'Turu', 'Rua das Crianças, 12', 'sabado', '16:00:00', 'São Luís', '65000-003', 'Verde', 'Crianças e pais'),
    ('Célula Norte', 'Anil', 'Travessa Norte, 200', 'quinta', '19:30:00', 'São Luís', '65000-004', 'Vermelho', 'Em reestruturação'),
    ('Célula Leste', 'Olho d''Água', 'Alameda Leste, 300', 'domingo', '09:00:00', 'São Luís', '65000-005', 'Verde', 'Encontro matinal');
  END IF;
END $$;

-- 2) Eventos públicos futuros (apenas se ainda não houver)
DO $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.eventos WHERE publico = true AND data_inicio > now();
  IF v_count = 0 THEN
    INSERT INTO public.eventos (titulo, data_inicio, local, cover_image_url, publico)
    VALUES
    ('Conferência de Avivamento', now() + interval '3 days', 'Auditório Central', '/lovable-uploads/11700eec-d837-4103-93e0-ec07fdcc9d64.png', true),
    ('Noite de Louvor', now() + interval '7 days', 'Sede', '/lovable-uploads/334c0fdb-b249-4044-ac5c-1bbd104ea82b.png', true),
    ('Encontro de Casais', now() + interval '14 days', 'Salão Social', '/lovable-uploads/57bb8965-c932-40db-a64b-c15a6d72d4b0.png', true),
    ('Domingo da Família', now() + interval '21 days', 'Templo Principal', '/lovable-uploads/e022986f-6c9b-4d80-be21-b972b8cf2b9d.png', true);
  END IF;
END $$;

-- 3) Calendário e agendamentos (apenas se ainda não houver)
DO $$
DECLARE v_cal_id uuid;
DECLARE v_count int;
BEGIN
  -- obter qualquer calendário existente ou criar um novo
  SELECT id INTO v_cal_id FROM public.calendarios LIMIT 1;
  IF v_cal_id IS NULL THEN
    INSERT INTO public.calendarios (nome, cor, visivel_para_todos, descricao)
    VALUES ('Eventos da Igreja', '#2563eb', true, 'Agenda geral de eventos')
    RETURNING id INTO v_cal_id;
  END IF;

  -- criar alguns agendamentos se ainda não houver
  SELECT COUNT(*) INTO v_count FROM public.agendamentos;
  IF v_count = 0 THEN
    INSERT INTO public.agendamentos (calendario_id, titulo, descricao, data_hora_inicio, data_hora_fim, local, status)
    VALUES
    (v_cal_id, 'Ensaio do Louvor', 'Preparação para o culto de domingo', now() + interval '1 day', now() + interval '1 day 2 hours', 'Sala de Música', 'confirmado'),
    (v_cal_id, 'Reunião de Líderes', 'Alinhamento mensal', now() + interval '5 days 19 hours', now() + interval '5 days 21 hours', 'Sala 2', 'confirmado'),
    (v_cal_id, 'Batismos', 'Celebração de batismos', now() + interval '10 days 10 hours', now() + interval '10 days 12 hours', 'Templo', 'confirmado');
  END IF;
END $$;