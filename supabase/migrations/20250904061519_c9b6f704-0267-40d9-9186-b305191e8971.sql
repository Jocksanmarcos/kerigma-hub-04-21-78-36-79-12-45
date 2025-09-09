-- Criar permissões para louvor (sem ON CONFLICT já que não há constraint única)
INSERT INTO permissions (action, subject) VALUES
  ('read', 'louvor'),
  ('create', 'louvor'),
  ('update', 'louvor'), 
  ('delete', 'louvor'),
  ('manage', 'louvor');