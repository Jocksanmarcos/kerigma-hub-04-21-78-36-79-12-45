-- Corrigir recursão infinita nas políticas de vinculos_familiares
-- Primeiro, remover todas as políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Admins podem gerenciar vínculos familiares" ON vinculos_familiares;
DROP POLICY IF EXISTS "Usuários podem ver vínculos de suas famílias" ON vinculos_familiares;

-- Criar políticas corretas sem recursão
-- Política para administradores
CREATE POLICY "Admins podem gerenciar vinculos familiares"
ON vinculos_familiares
FOR ALL
TO authenticated
USING (is_admin() OR user_has_permission('manage', 'familias'))
WITH CHECK (is_admin() OR user_has_permission('manage', 'familias'));

-- Política para usuários verem vínculos de suas próprias famílias
CREATE POLICY "Usuarios podem ver vinculos de suas familias"
ON vinculos_familiares
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pessoas p
    WHERE p.user_id = auth.uid() 
    AND p.familia_id = vinculos_familiares.familia_id
  )
);

-- Política para inserir vínculos familiares
CREATE POLICY "Usuarios podem criar vinculos em suas familias"
ON vinculos_familiares
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pessoas p
    WHERE p.user_id = auth.uid() 
    AND p.familia_id = vinculos_familiares.familia_id
  )
);

-- Política para atualizar vínculos familiares
CREATE POLICY "Usuarios podem atualizar vinculos em suas familias"
ON vinculos_familiares
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pessoas p
    WHERE p.user_id = auth.uid() 
    AND p.familia_id = vinculos_familiares.familia_id
  )
);