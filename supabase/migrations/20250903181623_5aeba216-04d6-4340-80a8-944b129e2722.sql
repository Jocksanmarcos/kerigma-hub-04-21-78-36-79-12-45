-- Criar políticas RLS para a tabela vinculos_familiares
-- Política para visualizar vínculos familiares
CREATE POLICY "Usuários podem ver vínculos familiares da sua igreja" 
ON vinculos_familiares 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.id = vinculos_familiares.pessoa_id 
    AND (
      is_sede_admin() 
      OR p.church_id = get_user_church_id()
    )
  )
);

-- Política para criar vínculos familiares
CREATE POLICY "Usuários podem criar vínculos familiares na sua igreja" 
ON vinculos_familiares 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.id = vinculos_familiares.pessoa_id 
    AND (
      is_sede_admin() 
      OR p.church_id = get_user_church_id()
    )
  )
);

-- Política para atualizar vínculos familiares
CREATE POLICY "Usuários podem atualizar vínculos familiares na sua igreja" 
ON vinculos_familiares 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.id = vinculos_familiares.pessoa_id 
    AND (
      is_sede_admin() 
      OR p.church_id = get_user_church_id()
    )
  )
);

-- Política para deletar vínculos familiares
CREATE POLICY "Usuários podem deletar vínculos familiares na sua igreja" 
ON vinculos_familiares 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.id = vinculos_familiares.pessoa_id 
    AND (
      is_sede_admin() 
      OR p.church_id = get_user_church_id()
    )
  )
);