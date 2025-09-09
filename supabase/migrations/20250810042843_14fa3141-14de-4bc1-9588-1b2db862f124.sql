-- Inserir calendários padrão para o sistema
INSERT INTO public.calendarios (nome, descricao, cor, tipo, visivel_para_todos, proprietario_id) VALUES
('Agenda Pastoral', 'Compromissos e reuniões pastorais', '#dc2626', 'ministerial', true, NULL),
('Aconselhamento', 'Sessões de aconselhamento pastoral', '#059669', 'aconselhamento', true, NULL),
('Eventos da Igreja', 'Cultos, eventos e atividades da igreja', '#7c3aed', 'eventos', true, NULL),
('Reuniões de Liderança', 'Reuniões com líderes e coordenadores', '#ea580c', 'ministerial', true, NULL),
('Casamentos e Cerimônias', 'Casamentos, batismos e outras cerimônias', '#be185d', 'eventos', true, NULL),
('Ministério Infantil', 'Atividades e eventos do ministério infantil', '#0284c7', 'ministerial', true, NULL),
('Ministério de Jovens', 'Atividades e eventos do ministério jovem', '#16a34a', 'ministerial', true, NULL)
ON CONFLICT (nome) DO NOTHING;