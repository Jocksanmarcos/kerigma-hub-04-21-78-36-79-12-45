-- Adicionar colunas necessárias à tabela user_roles existente se não existirem
DO $$
BEGIN
  -- Adicionar active se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'active') THEN
    ALTER TABLE user_roles ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
  
  -- Adicionar assigned_by se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'assigned_by') THEN
    ALTER TABLE user_roles ADD COLUMN assigned_by UUID REFERENCES auth.users(id);
  END IF;
  
  -- Adicionar expires_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'expires_at') THEN
    ALTER TABLE user_roles ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Adicionar updated_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'updated_at') THEN
    ALTER TABLE user_roles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;