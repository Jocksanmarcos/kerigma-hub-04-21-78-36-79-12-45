-- Corrigir políticas RLS para biblia_quiz_perguntas para usar função is_admin_user() correta

-- Primeiro, remover as políticas existentes
DROP POLICY IF EXISTS "Administradores podem gerenciar as perguntas do quiz" ON public.biblia_quiz_perguntas;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ler as perguntas do quiz" ON public.biblia_quiz_perguntas;

-- Criar novas políticas usando função correta
CREATE POLICY "Admins podem gerenciar quiz perguntas" ON public.biblia_quiz_perguntas
FOR ALL 
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins podem visualizar quiz perguntas" ON public.biblia_quiz_perguntas
FOR SELECT 
TO authenticated
USING (is_admin_user());

-- Política para usuários autenticados lerem quiz quando necessário
CREATE POLICY "Usuarios autenticados podem ler quiz perguntas" ON public.biblia_quiz_perguntas
FOR SELECT 
TO authenticated
USING (auth.role() = 'authenticated');

-- Corrigir tabela de respostas para usar função correta também
DROP POLICY IF EXISTS "Usuários podem registrar suas próprias respostas" ON public.biblia_quiz_respostas_usuarios;
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias respostas" ON public.biblia_quiz_respostas_usuarios;

CREATE POLICY "Usuarios podem inserir proprias respostas" ON public.biblia_quiz_respostas_usuarios
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem ver proprias respostas" ON public.biblia_quiz_respostas_usuarios
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Adicionar política para sistema inserir respostas via edge function
CREATE POLICY "Sistema pode inserir respostas quiz" ON public.biblia_quiz_respostas_usuarios
FOR INSERT 
TO authenticated
WITH CHECK (true);