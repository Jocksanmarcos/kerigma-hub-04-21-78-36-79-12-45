-- Inserir calendários padrão para o sistema
INSERT INTO public.calendarios (nome, descricao, cor, tipo, visivel_para_todos) VALUES
('Agenda Pastoral', 'Compromissos e reuniões pastorais', '#dc2626', 'ministerial', true),
('Aconselhamento', 'Sessões de aconselhamento pastoral', '#059669', 'aconselhamento', true),
('Eventos da Igreja', 'Cultos, eventos e atividades da igreja', '#7c3aed', 'eventos', true),
('Reuniões de Liderança', 'Reuniões com líderes e coordenadores', '#ea580c', 'ministerial', true),
('Casamentos e Cerimônias', 'Casamentos, batismos e outras cerimônias', '#be185d', 'eventos', true),
('Ministério Infantil', 'Atividades e eventos do ministério infantil', '#0284c7', 'ministerial', true),
('Ministério de Jovens', 'Atividades e eventos do ministério jovem', '#16a34a', 'ministerial', true);