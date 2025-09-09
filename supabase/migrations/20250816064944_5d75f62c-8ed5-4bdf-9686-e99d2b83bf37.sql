-- Garantir que o usuário admin@cbnkerigma.org.br tenha o role de pastor
-- Primeiro, buscar o user_id baseado no email
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