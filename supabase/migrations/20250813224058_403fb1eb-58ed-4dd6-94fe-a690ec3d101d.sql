-- Assign admin role to existing users for bootstrapping
-- This will allow the first user to have admin access

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO first_user_id
    FROM auth.users
    LIMIT 1;
    
    -- If there's a user and no role assigned yet, give them admin role
    IF first_user_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = first_user_id
    ) THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (first_user_id, 'admin');
    END IF;
END $$;