-- Retry seeding focusing on 'eventos' tipo not null

DO $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.eventos WHERE publico = true AND data_inicio > now();
  IF v_count = 0 THEN
    INSERT INTO public.eventos (titulo, tipo, data_inicio, local, cover_image_url, publico)
    VALUES
    ('Conferência de Avivamento', 'geral', now() + interval '3 days', 'Auditório Central', '/lovable-uploads/11700eec-d837-4103-93e0-ec07fdcc9d64.png', true),
    ('Noite de Louvor', 'geral', now() + interval '7 days', 'Sede', '/lovable-uploads/334c0fdb-b249-4044-ac5c-1bbd104ea82b.png', true),
    ('Encontro de Casais', 'geral', now() + interval '14 days', 'Salão Social', '/lovable-uploads/57bb8965-c932-40db-a64b-c15a6d72d4b0.png', true),
    ('Domingo da Família', 'geral', now() + interval '21 days', 'Templo Principal', '/lovable-uploads/e022986f-6c9b-4d80-be21-b972b8cf2b9d.png', true);
  END IF;
END $$;