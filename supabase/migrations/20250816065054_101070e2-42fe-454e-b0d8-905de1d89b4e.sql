-- Corrigir enum e inserir role do admin
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Buscar o user_id do admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@cbnkerigma.org.br';
    
    -- Se o usuário existe, inserir o role
    IF admin_user_id IS NOT NULL THEN
        -- Primeiro verificar se já existe
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = admin_user_id) THEN
            INSERT INTO public.user_roles (user_id, role, active)
            VALUES (admin_user_id, 'pastor', true);
            
            RAISE NOTICE 'Role de pastor criado para admin@cbnkerigma.org.br';
        ELSE
            -- Atualizar se já existe
            UPDATE public.user_roles 
            SET role = 'pastor', active = true, updated_at = now()
            WHERE user_id = admin_user_id;
            
            RAISE NOTICE 'Role de pastor atualizado para admin@cbnkerigma.org.br';
        END IF;
    ELSE
        RAISE NOTICE 'Usuário admin@cbnkerigma.org.br não encontrado';
    END IF;
END $$;