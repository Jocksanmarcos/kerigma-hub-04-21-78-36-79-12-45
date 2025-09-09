-- Criar função para verificar se é líder de célula
CREATE OR REPLACE FUNCTION public.is_lider_celula(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pessoas 
    WHERE user_id = user_uuid 
    AND papel_lideranca = 'lider_celula'
    AND situacao = 'ativo'
  );
END;
$$;

-- Atualizar função get_current_person_id para ser mais confiável
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT id FROM pessoas 
    WHERE user_id = auth.uid() 
    AND situacao = 'ativo'
    LIMIT 1
  );
END;
$$;

-- Atualizar políticas RLS para células
DROP POLICY IF EXISTS "Admins podem gerenciar células" ON public.celulas;
DROP POLICY IF EXISTS "Líderes podem ver células relacionadas" ON public.celulas;

-- Políticas mais específicas para células
CREATE POLICY "Pastores podem gerenciar todas as células"
ON public.celulas
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'pastor'
    AND ur.active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'pastor'
    AND ur.active = true
  )
);

CREATE POLICY "Líderes podem ver e gerenciar suas células"
ON public.celulas
FOR ALL
TO authenticated
USING (
  -- Líderes podem ver células que lideram
  (lider_id = get_current_person_id()) OR
  (supervisor_id = get_current_person_id()) OR
  (coordenador_id = get_current_person_id()) OR
  -- Ou líderes de outras células podem ver (para relatórios)
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'lider'
    AND ur.active = true
  )
)
WITH CHECK (
  -- Só podem modificar células que lideram diretamente
  (lider_id = get_current_person_id()) OR
  (supervisor_id = get_current_person_id()) OR
  (coordenador_id = get_current_person_id()) OR
  -- Ou são pastores
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'pastor'
    AND ur.active = true
  )
);

CREATE POLICY "Membros podem ver células básicas"
ON public.celulas
FOR SELECT
TO authenticated
USING (
  -- Membros só podem ver células ativas para escolher participar
  ativo = true
);

-- Atualizar políticas para biblioteca (restringir acesso administrativo)
DROP POLICY IF EXISTS "Todos podem ver livros ativos" ON public.biblioteca_livros;
DROP POLICY IF EXISTS "Usuários autenticados podem criar livros" ON public.biblioteca_livros;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar livros" ON public.biblioteca_livros;

CREATE POLICY "Todos podem ver livros disponíveis"
ON public.biblioteca_livros
FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Apenas pastores podem gerenciar livros"
ON public.biblioteca_livros
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'pastor'
    AND ur.active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'pastor'
    AND ur.active = true
  )
);

-- Criar função para detectar papel combinado de usuário
CREATE OR REPLACE FUNCTION public.get_combined_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
  pessoa_papel text;
BEGIN
  -- Buscar role na tabela user_roles
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
  AND ur.active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Buscar papel de liderança da pessoa
  SELECT p.papel_lideranca INTO pessoa_papel
  FROM pessoas p
  WHERE p.user_id = auth.uid()
  AND p.situacao = 'ativo'
  LIMIT 1;
  
  -- Retornar o papel mais específico
  IF user_role = 'pastor' THEN
    RETURN 'pastor';
  ELSIF user_role = 'lider' OR pessoa_papel = 'lider_celula' THEN
    RETURN 'lider';
  ELSE
    RETURN 'membro';
  END IF;
END;
$$;