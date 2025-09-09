-- Corrigir políticas RLS para permitir criação de famílias e vínculos familiares

-- Remover políticas antigas que estão muito restritivas
DROP POLICY IF EXISTS "Usuarios podem criar vinculos familiares" ON public.vinculos_familiares;
DROP POLICY IF EXISTS "Usuarios podem ver vinculos de suas familias" ON public.vinculos_familiares;

-- Criar nova política mais flexível para INSERT em vínculos familiares
CREATE POLICY "Usuarios podem criar vinculos familiares" 
ON public.vinculos_familiares 
FOR INSERT 
WITH CHECK (
  -- Admins podem criar qualquer vínculo
  is_admin() OR 
  user_has_permission('manage', 'familias') OR
  -- Usuário pode criar vínculo para si mesmo (pessoa_id corresponde ao seu user_id)
  (EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.user_id = auth.uid() AND p.id = vinculos_familiares.pessoa_id
  )) OR
  -- Usuário pode criar vínculo se já faz parte da família
  (EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.user_id = auth.uid() AND p.familia_id = vinculos_familiares.familia_id
  ))
);

-- Criar nova política mais flexível para SELECT em vínculos familiares  
CREATE POLICY "Usuarios podem ver vinculos de suas familias"
ON public.vinculos_familiares
FOR SELECT
USING (
  -- Admins podem ver tudo
  is_admin() OR 
  user_has_permission('read', 'familias') OR
  -- Usuário pode ver vínculos da própria família
  (EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.user_id = auth.uid() AND p.familia_id = vinculos_familiares.familia_id
  )) OR
  -- Usuário pode ver vínculos onde ele é a pessoa
  (EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.user_id = auth.uid() AND p.id = vinculos_familiares.pessoa_id
  ))
);

-- Também vamos corrigir a política de UPDATE para ser mais clara
DROP POLICY IF EXISTS "Usuarios podem atualizar vinculos em suas familias" ON public.vinculos_familiares;

CREATE POLICY "Usuarios podem atualizar vinculos em suas familias"
ON public.vinculos_familiares
FOR UPDATE
USING (
  -- Admins podem atualizar qualquer vínculo
  is_admin() OR 
  user_has_permission('manage', 'familias') OR
  -- Usuário pode atualizar vínculos da própria família
  (EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.user_id = auth.uid() AND p.familia_id = vinculos_familiares.familia_id
  ))
);