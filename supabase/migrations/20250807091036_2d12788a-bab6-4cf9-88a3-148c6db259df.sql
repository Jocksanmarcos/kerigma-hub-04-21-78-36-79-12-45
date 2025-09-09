-- KERIGMA HUB - Configuração de Segurança (RLS Policies)
-- Corrigindo problemas de segurança detectados pelo linter

-- =============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =============================================

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_celula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. CRIAR FUNÇÕES DE SEGURANÇA ESSENCIAIS
-- =============================================

-- Função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION user_has_permission(action_name text, subject_name text, resource_type_param text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pessoas pe
    JOIN profile_permissions pp ON pe.profile_id = pp.profile_id
    JOIN permissions p ON pp.permission_id = p.id
    WHERE pe.user_id = auth.uid()
    AND pp.granted = true
    AND p.action = action_name
    AND p.subject = subject_name
    AND (resource_type_param IS NULL OR p.resource_type = resource_type_param)
  );
END;
$$;

-- Função para verificar se usuário é administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN user_has_permission('manage', 'all');
END;
$$;

-- Função para obter ID da pessoa pelo user_id
CREATE OR REPLACE FUNCTION get_current_person_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM pessoas 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;

-- =============================================
-- 3. POLÍTICAS RLS PARA PESSOAS
-- =============================================

-- Usuários podem ver suas próprias informações e admins podem ver tudo
CREATE POLICY "usuarios_podem_ver_proprias_informacoes"
ON public.pessoas
FOR SELECT
USING (
  user_id = auth.uid() OR 
  is_admin() OR
  user_has_permission('read', 'pessoas')
);

-- Usuários podem criar perfis próprios, admins podem criar qualquer perfil
CREATE POLICY "usuarios_podem_criar_proprio_perfil"
ON public.pessoas
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR 
  is_admin() OR
  user_has_permission('create', 'pessoas')
);

-- Usuários podem atualizar próprias informações, admins podem atualizar qualquer perfil
CREATE POLICY "usuarios_podem_atualizar_proprio_perfil"
ON public.pessoas
FOR UPDATE
USING (
  user_id = auth.uid() OR 
  is_admin() OR
  user_has_permission('update', 'pessoas')
);

-- Apenas admins podem deletar perfis
CREATE POLICY "apenas_admins_podem_deletar_pessoas"
ON public.pessoas
FOR DELETE
USING (
  is_admin() OR
  user_has_permission('delete', 'pessoas')
);

-- =============================================
-- 4. POLÍTICAS RLS PARA PROFILES
-- =============================================

-- Qualquer usuário autenticado pode ver os profiles
CREATE POLICY "qualquer_usuario_pode_ver_profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Apenas admins podem gerenciar profiles
CREATE POLICY "apenas_admins_podem_gerenciar_profiles"
ON public.profiles
FOR ALL
USING (is_admin());

-- =============================================
-- 5. POLÍTICAS RLS PARA PERMISSIONS
-- =============================================

-- Qualquer usuário autenticado pode ver as permissões
CREATE POLICY "qualquer_usuario_pode_ver_permissions"
ON public.permissions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Apenas admins podem gerenciar permissões
CREATE POLICY "apenas_admins_podem_gerenciar_permissions"
ON public.permissions
FOR ALL
USING (is_admin());

-- =============================================
-- 6. POLÍTICAS RLS PARA PROFILE_PERMISSIONS
-- =============================================

-- Qualquer usuário autenticado pode ver as associações
CREATE POLICY "qualquer_usuario_pode_ver_profile_permissions"
ON public.profile_permissions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Apenas admins podem gerenciar associações
CREATE POLICY "apenas_admins_podem_gerenciar_profile_permissions"
ON public.profile_permissions
FOR ALL
USING (is_admin());

-- =============================================
-- 7. POLÍTICAS RLS PARA CÉLULAS
-- =============================================

-- Usuários podem ver células onde participam ou são líderes, ou se têm permissão geral
CREATE POLICY "usuarios_podem_ver_celulas_relacionadas"
ON public.celulas
FOR SELECT
USING (
  is_admin() OR
  user_has_permission('read', 'celulas') OR
  lider_id = get_current_person_id() OR
  auxiliar_id = get_current_person_id() OR
  anfitriao_id = get_current_person_id() OR
  EXISTS (
    SELECT 1 FROM pessoas 
    WHERE user_id = auth.uid() AND celula_id = celulas.id
  )
);

-- Apenas líderes e admins podem criar células
CREATE POLICY "lideres_podem_criar_celulas"
ON public.celulas
FOR INSERT
WITH CHECK (
  is_admin() OR
  user_has_permission('create', 'celulas')
);

-- Líderes podem atualizar suas células
CREATE POLICY "lideres_podem_atualizar_suas_celulas"
ON public.celulas
FOR UPDATE
USING (
  is_admin() OR
  user_has_permission('update', 'celulas') OR
  lider_id = get_current_person_id()
);

-- Apenas admins podem deletar células
CREATE POLICY "apenas_admins_podem_deletar_celulas"
ON public.celulas
FOR DELETE
USING (
  is_admin() OR
  user_has_permission('delete', 'celulas')
);

-- =============================================
-- 8. POLÍTICAS RLS PARA RELATÓRIOS DE CÉLULA
-- =============================================

-- Usuários podem ver relatórios de células onde participam
CREATE POLICY "usuarios_podem_ver_relatorios_celulas_relacionadas"
ON public.relatorios_celula
FOR SELECT
USING (
  is_admin() OR
  user_has_permission('read', 'relatorios') OR
  EXISTS (
    SELECT 1 FROM celulas c
    WHERE c.id = relatorios_celula.celula_id
    AND (
      c.lider_id = get_current_person_id() OR
      c.auxiliar_id = get_current_person_id() OR
      c.anfitriao_id = get_current_person_id()
    )
  )
);

-- Líderes podem criar relatórios para suas células
CREATE POLICY "lideres_podem_criar_relatorios_suas_celulas"
ON public.relatorios_celula
FOR INSERT
WITH CHECK (
  is_admin() OR
  user_has_permission('create', 'relatorios') OR
  EXISTS (
    SELECT 1 FROM celulas c
    WHERE c.id = relatorios_celula.celula_id
    AND c.lider_id = get_current_person_id()
  )
);

-- Líderes podem atualizar relatórios de suas células
CREATE POLICY "lideres_podem_atualizar_relatorios_suas_celulas"
ON public.relatorios_celula
FOR UPDATE
USING (
  is_admin() OR
  user_has_permission('update', 'relatorios') OR
  created_by = get_current_person_id()
);

-- Apenas admins podem deletar relatórios
CREATE POLICY "apenas_admins_podem_deletar_relatorios"
ON public.relatorios_celula
FOR DELETE
USING (
  is_admin() OR
  user_has_permission('delete', 'relatorios')
);

-- =============================================
-- 9. POLÍTICAS RLS PARA CURSOS
-- =============================================

-- Qualquer usuário autenticado pode ver cursos ativos
CREATE POLICY "qualquer_usuario_pode_ver_cursos_ativos"
ON public.cursos
FOR SELECT
USING (
  ativo = true OR
  is_admin() OR
  user_has_permission('read', 'cursos')
);

-- Apenas usuários com permissão podem gerenciar cursos
CREATE POLICY "usuarios_com_permissao_podem_gerenciar_cursos"
ON public.cursos
FOR ALL
USING (
  is_admin() OR
  user_has_permission('manage', 'cursos') OR
  user_has_permission('create', 'cursos') OR
  user_has_permission('update', 'cursos') OR
  user_has_permission('delete', 'cursos')
);

-- =============================================
-- 10. POLÍTICAS RLS PARA MATRÍCULAS
-- =============================================

-- Usuários podem ver suas próprias matrículas
CREATE POLICY "usuarios_podem_ver_proprias_matriculas"
ON public.matriculas
FOR SELECT
USING (
  pessoa_id = get_current_person_id() OR
  is_admin() OR
  user_has_permission('read', 'matriculas')
);

-- Usuários podem criar suas próprias matrículas
CREATE POLICY "usuarios_podem_criar_proprias_matriculas"
ON public.matriculas
FOR INSERT
WITH CHECK (
  pessoa_id = get_current_person_id() OR
  is_admin() OR
  user_has_permission('create', 'matriculas')
);

-- Usuários podem atualizar suas próprias matrículas
CREATE POLICY "usuarios_podem_atualizar_proprias_matriculas"
ON public.matriculas
FOR UPDATE
USING (
  pessoa_id = get_current_person_id() OR
  is_admin() OR
  user_has_permission('update', 'matriculas')
);

-- Apenas admins podem deletar matrículas
CREATE POLICY "apenas_admins_podem_deletar_matriculas"
ON public.matriculas
FOR DELETE
USING (
  is_admin() OR
  user_has_permission('delete', 'matriculas')
);

-- =============================================
-- 11. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- =============================================

-- Função para criar perfil de pessoa quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_profile_id UUID;
BEGIN
  -- Buscar o ID do profile "Membro" (perfil padrão)
  SELECT id INTO default_profile_id
  FROM profiles 
  WHERE name = 'Membro' 
  LIMIT 1;

  -- Inserir novo registro em pessoas quando usuário se registra
  INSERT INTO public.pessoas (
    user_id, 
    email, 
    nome_completo,
    profile_id,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    default_profile_id,
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, apenas retorna
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log erro mas não falha o processo de registro
    RAISE WARNING 'Erro ao criar perfil de pessoa: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();