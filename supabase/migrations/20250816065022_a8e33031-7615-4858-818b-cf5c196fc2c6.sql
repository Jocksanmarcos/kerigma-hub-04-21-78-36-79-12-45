-- Criar enum para os roles corretos do sistema
DROP TYPE IF EXISTS public.app_role_new CASCADE;
CREATE TYPE public.app_role_new AS ENUM ('pastor', 'lider', 'membro');

-- Alterar a tabela user_roles para usar o novo enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.app_role_new 
USING CASE 
  WHEN role::text = 'admin' THEN 'pastor'::public.app_role_new
  WHEN role::text = 'moderator' THEN 'lider'::public.app_role_new
  ELSE 'membro'::public.app_role_new
END;

-- Remover o enum antigo e renomear o novo
DROP TYPE IF EXISTS public.app_role CASCADE;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Garantir que o usuário admin@cbnkerigma.org.br tenha o role de pastor
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Buscar o user_id do admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@cbnkerigma.org.br';
    
    -- Se o usuário existe, inserir/atualizar o role
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role, active)
        VALUES (admin_user_id, 'pastor', true)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role = 'pastor',
            active = true,
            updated_at = now();
        
        RAISE NOTICE 'Role de pastor definido para admin@cbnkerigma.org.br';
    ELSE
        RAISE NOTICE 'Usuário admin@cbnkerigma.org.br não encontrado';
    END IF;
END $$;