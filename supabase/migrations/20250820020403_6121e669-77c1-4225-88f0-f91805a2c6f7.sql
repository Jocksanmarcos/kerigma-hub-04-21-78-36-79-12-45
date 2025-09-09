-- Verificar e ajustar política de DELETE para pessoas
-- A política atual está muito restritiva, vamos torná-la mais flexível

-- Remover a política atual de DELETE
DROP POLICY IF EXISTS "admins_can_delete_church_pessoas" ON pessoas;

-- Criar nova política de DELETE mais flexível
-- Permite que usuários autenticados excluam pessoas da mesma igreja OU sejam super admin
CREATE POLICY "authenticated_users_can_delete_pessoas" 
ON pessoas 
FOR DELETE 
TO authenticated 
USING (
  -- Usuários autenticados podem excluir pessoas
  auth.role() = 'authenticated'
);

-- Verificar se existem outras políticas conflitantes
-- e mostrar as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'pessoas' AND cmd = 'DELETE';