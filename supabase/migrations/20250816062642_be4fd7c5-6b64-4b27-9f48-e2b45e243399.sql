-- ETAPA 2: IMPLEMENTAÇÃO DAS POLÍTICAS RLS E CORREÇÃO DE SEGURANÇA

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_church_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para churches
CREATE POLICY "Super admins can view all churches" ON public.churches
  FOR SELECT USING (is_super_admin());

CREATE POLICY "Users can view their own church" ON public.churches
  FOR SELECT USING (can_access_church(id));

CREATE POLICY "Super admins can manage churches" ON public.churches
  FOR ALL USING (is_super_admin());

-- Políticas para user_church_roles
CREATE POLICY "Super admins can manage all roles" ON public.user_church_roles
  FOR ALL USING (is_super_admin());

CREATE POLICY "Users can view roles in their church" ON public.user_church_roles
  FOR SELECT USING (can_access_church(church_id));

-- Atualizar políticas existentes para incluir church_id

-- Políticas para pessoas
DROP POLICY IF EXISTS "usuarios_podem_ver_proprias_informacoes" ON public.pessoas;
CREATE POLICY "users_can_access_church_pessoas" ON public.pessoas
  FOR SELECT USING (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "usuarios_podem_atualizar_proprio_perfil" ON public.pessoas;
CREATE POLICY "users_can_update_church_pessoas" ON public.pessoas
  FOR UPDATE USING (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "usuarios_podem_criar_proprio_perfil" ON public.pessoas;
CREATE POLICY "users_can_create_church_pessoas" ON public.pessoas
  FOR INSERT WITH CHECK (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "apenas_admins_podem_deletar_pessoas" ON public.pessoas;
CREATE POLICY "admins_can_delete_church_pessoas" ON public.pessoas
  FOR DELETE USING (can_access_church(church_id) OR is_super_admin());

-- Políticas para lançamentos financeiros
DROP POLICY IF EXISTS "users_can_view_church_finances" ON public.lancamentos_financeiros_v2;
DROP POLICY IF EXISTS "users_can_create_church_finances" ON public.lancamentos_financeiros_v2;
DROP POLICY IF EXISTS "users_can_update_church_finances" ON public.lancamentos_financeiros_v2;
DROP POLICY IF EXISTS "Tesoureiro pode visualizar lançamentos" ON public.lancamentos_financeiros_v2;
DROP POLICY IF EXISTS "Tesoureiro pode inserir lançamentos" ON public.lancamentos_financeiros_v2;
DROP POLICY IF EXISTS "Tesoureiro pode atualizar lançamentos próprios" ON public.lancamentos_financeiros_v2;
DROP POLICY IF EXISTS "Admin pode gerenciar lançamentos financeiros" ON public.lancamentos_financeiros_v2;

CREATE POLICY "church_users_can_view_finances" ON public.lancamentos_financeiros_v2
  FOR SELECT USING (can_access_church(church_id) OR is_super_admin());

CREATE POLICY "church_users_can_create_finances" ON public.lancamentos_financeiros_v2
  FOR INSERT WITH CHECK (can_access_church(church_id) OR is_super_admin());

CREATE POLICY "church_users_can_update_finances" ON public.lancamentos_financeiros_v2
  FOR UPDATE USING (can_access_church(church_id) OR is_super_admin());

CREATE POLICY "church_users_can_delete_finances" ON public.lancamentos_financeiros_v2
  FOR DELETE USING (can_access_church(church_id) OR is_super_admin());

-- Políticas para cursos
DROP POLICY IF EXISTS "qualquer_usuario_pode_ver_cursos_ativos" ON public.cursos;
DROP POLICY IF EXISTS "usuarios_com_permissao_podem_gerenciar_cursos" ON public.cursos;
DROP POLICY IF EXISTS "Permitir leitura pública de cursos ativos" ON public.cursos;

CREATE POLICY "church_users_can_view_courses" ON public.cursos
  FOR SELECT USING (can_access_church(church_id) OR is_super_admin() OR ativo = true);

CREATE POLICY "church_users_can_manage_courses" ON public.cursos
  FOR ALL USING (can_access_church(church_id) OR is_super_admin());

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_churches()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_churches_updated_at
  BEFORE UPDATE ON public.churches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_churches();

CREATE TRIGGER update_user_church_roles_updated_at
  BEFORE UPDATE ON public.user_church_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_churches();