-- Fix seed for celulas respecting dia_semana check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.celulas WHERE ativa = true AND latitude IS NOT NULL AND longitude IS NOT NULL
  ) THEN
    INSERT INTO public.celulas (
      nome, descricao, endereco, bairro, cidade, dia_semana, horario, latitude, longitude, ativa, status
    ) VALUES
      ('Célula Central', 'Célula no centro da cidade.', 'Rua das Flores, 123', 'Centro', 'São Paulo', 'quarta', '19:30'::time, -23.5505, -46.6333, true, 'ativa'),
      ('Célula Zona Sul', 'Célula na zona sul.', 'Av. das Nações, 456', 'Zona Sul', 'São Paulo', 'sexta', '20:00'::time, -23.6693, -46.7350, true, 'ativa'),
      ('Célula Jovem', 'Célula de jovens.', 'Rua Esperança, 789', 'Jardim Alegre', 'São Paulo', 'sabado', '18:00'::time, -23.5700, -46.6500, true, 'ativa');
  END IF;
END $$;