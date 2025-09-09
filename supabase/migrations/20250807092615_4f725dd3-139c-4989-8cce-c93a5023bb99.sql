-- ===============================================
-- CENTRO DE GOVERNANÇA - PARTE 2: POLÍTICAS E FUNÇÕES
-- ===============================================

-- ETAPA 1: Políticas RLS para sistema de perfis
CREATE POLICY "Qualquer um pode ver perfis ativos" ON public.profiles
  FOR SELECT USING (active = true);

CREATE POLICY "Apenas admins podem gerenciar perfis" ON public.profiles
  FOR ALL USING (user_has_permission('manage', 'all'));

CREATE POLICY "Qualquer um pode ver permissões" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar permissões" ON public.permissions
  FOR ALL USING (user_has_permission('manage', 'all'));

CREATE POLICY "Qualquer um pode ver profile_permissions" ON public.profile_permissions
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar profile_permissions" ON public.profile_permissions
  FOR ALL USING (user_has_permission('manage', 'all'));

-- ETAPA 2: Políticas RLS para auditoria
CREATE POLICY "Apenas admins podem ver logs de auditoria" ON public.security_audit_logs
  FOR SELECT USING (user_has_permission('manage', 'all'));

CREATE POLICY "Sistema pode inserir logs de auditoria" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem gerenciar próprias sessões" ON public.security_active_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todas as sessões" ON public.security_active_sessions
  FOR SELECT USING (user_has_permission('manage', 'all'));

CREATE POLICY "Apenas admins podem ver eventos de segurança" ON public.security_events
  FOR SELECT USING (user_has_permission('manage', 'all'));

CREATE POLICY "Sistema pode inserir eventos de segurança" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- ETAPA 3: Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_profile_id UUID;
BEGIN
  -- Buscar o ID do profile "Membro" (perfil padrão)
  SELECT id INTO default_profile_id
  FROM public.profiles 
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar pessoa automaticamente no registro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ETAPA 4: Trigger para manter updated_at
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ETAPA 5: Aplicar triggers de auditoria nas tabelas importantes
DROP TRIGGER IF EXISTS audit_pessoas_trigger ON public.pessoas;
CREATE TRIGGER audit_pessoas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_trigger();

DROP TRIGGER IF EXISTS audit_celulas_trigger ON public.celulas;
CREATE TRIGGER audit_celulas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.celulas
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_trigger();