-- Criar políticas RLS para a tabela cursos

-- Política para administradores verem todos os cursos
CREATE POLICY "Admins podem gerenciar todos os cursos"
ON public.cursos
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Política para usuários autenticados verem cursos publicados
CREATE POLICY "Usuários podem ver cursos ativos e publicados"
ON public.cursos
FOR SELECT
USING (ativo = true AND status = 'publicado');

-- Política para visitantes verem cursos públicos
CREATE POLICY "Qualquer um pode ver cursos públicos ativos"
ON public.cursos
FOR SELECT
USING (ativo = true AND status = 'publicado' AND publico_alvo IS NULL);