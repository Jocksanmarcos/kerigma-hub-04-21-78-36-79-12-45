-- Inserir calendários padrão para o sistema usando valores válidos para tipo
INSERT INTO public.calendarios (nome, descricao, cor, tipo, visivel_para_todos) VALUES
('Agenda Pastoral', 'Compromissos e reuniões pastorais', '#dc2626', 'pessoal', true),
('Aconselhamento', 'Sessões de aconselhamento pastoral', '#059669', 'pessoal', true),
('Eventos da Igreja', 'Cultos, eventos e atividades da igreja', '#7c3aed', 'compartilhado', true),
('Reuniões de Liderança', 'Reuniões com líderes e coordenadores', '#ea580c', 'compartilhado', true),
('Casamentos e Cerimônias', 'Casamentos, batismos e outras cerimônias', '#be185d', 'compartilhado', true),
('Ministério Infantil', 'Atividades e eventos do ministério infantil', '#0284c7', 'compartilhado', true),
('Ministério de Jovens', 'Atividades e eventos do ministério jovem', '#16a34a', 'compartilhado', true);