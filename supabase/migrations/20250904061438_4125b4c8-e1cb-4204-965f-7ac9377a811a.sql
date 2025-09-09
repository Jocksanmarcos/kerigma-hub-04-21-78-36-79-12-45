-- Criar permissões para o módulo de louvor
INSERT INTO permissions (action, subject) VALUES
  ('read', 'louvor'),
  ('create', 'louvor'),
  ('update', 'louvor'),
  ('delete', 'louvor'),
  ('manage', 'louvor')
ON CONFLICT (action, subject) DO NOTHING;

-- Verificar se existem profiles para usuários
DO $$
BEGIN
  -- Se não existir tabela profiles, não fazemos nada ainda
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Dar permissões de louvor para administradores (se existir profile com role admin)
    INSERT INTO profile_permissions (profile_id, permission_id, granted)
    SELECT 
      p.id as profile_id,
      perm.id as permission_id,
      true as granted
    FROM profiles p
    CROSS JOIN permissions perm
    WHERE p.role = 'admin' 
    AND perm.subject = 'louvor'
    ON CONFLICT (profile_id, permission_id) DO UPDATE SET granted = true;
  END IF;
END $$;