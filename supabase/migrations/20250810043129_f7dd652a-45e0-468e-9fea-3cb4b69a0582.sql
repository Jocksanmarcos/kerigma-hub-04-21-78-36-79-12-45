-- Inserir calendários padrão para o sistema com valores corretos
INSERT INTO public.calendarios (nome, descricao, cor, tipo, visivel_para_todos) VALUES
('Agenda Pastoral', 'Compromissos e reuniões pastorais', '#dc2626', 'ministerio', true),
('Aconselhamento', 'Sessões de aconselhamento pastoral', '#059669', 'ministerio', true),
('Eventos da Igreja', 'Cultos, eventos e atividades da igreja', '#7c3aed', 'publico', true),
('Reuniões de Liderança', 'Reuniões com líderes e coordenadores', '#ea580c', 'ministerio', true),
('Casamentos e Cerimônias', 'Casamentos, batismos e outras cerimônias', '#be185d', 'publico', true),
('Ministério Infantil', 'Atividades e eventos do ministério infantil', '#0284c7', 'ministerio', true),
('Ministério de Jovens', 'Atividades e eventos do ministério jovem', '#16a34a', 'ministerio', true);