-- Criar sistema de roles e permissões robusto
CREATE TYPE user_role AS ENUM ('pastor', 'lider', 'membro');

-- Tabela de roles com permissões específicas
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'membro',
  active BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'pastor' 
      AND ur.active = true
    )
  );

CREATE POLICY "Liders can view team roles" ON user_roles
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('pastor', 'lider') 
      AND ur.active = true
    )
  );

-- Função para verificar se usuário tem role específico
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND ur.active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Função para obter o role principal do usuário
CREATE OR REPLACE FUNCTION get_user_role(_user_id uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  ORDER BY 
    CASE 
      WHEN role = 'pastor' THEN 1
      WHEN role = 'lider' THEN 2
      WHEN role = 'membro' THEN 3
    END
  LIMIT 1;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at_trigger
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_roles_updated_at();