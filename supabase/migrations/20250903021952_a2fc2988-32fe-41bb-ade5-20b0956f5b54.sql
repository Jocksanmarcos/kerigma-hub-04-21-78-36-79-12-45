-- Verificar e corrigir políticas RLS para as novas tabelas

-- Primeiro, verificar se a tabela profiles tem políticas básicas
DO $$
BEGIN
  -- Política para profiles permitir que usuários vejam e atualizem seus próprios perfis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Usuarios podem ver proprios perfis'
  ) THEN
    CREATE POLICY "Usuarios podem ver proprios perfis"
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Usuarios podem atualizar proprios perfis'
  ) THEN
    CREATE POLICY "Usuarios podem atualizar proprios perfis"
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Admins podem gerenciar todos os perfis'
  ) THEN
    CREATE POLICY "Admins podem gerenciar todos os perfis"
    ON public.profiles 
    FOR ALL 
    USING ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'administrador');
  END IF;
END $$;