-- Create essential RPC functions for church context

-- Function to get current user's church ID
CREATE OR REPLACE FUNCTION get_user_church_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    church_uuid uuid;
BEGIN
    -- Get the church ID for the current authenticated user
    SELECT church_id 
    INTO church_uuid
    FROM user_church_roles 
    WHERE user_id = auth.uid() 
    AND active = true
    LIMIT 1;
    
    RETURN church_uuid;
END;
$$;

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean := false;
BEGIN
    -- Check if the current user has super_admin role
    SELECT EXISTS(
        SELECT 1 
        FROM user_church_roles 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin'
        AND active = true
    ) INTO is_admin;
    
    RETURN is_admin;
END;
$$;

-- Create basic tables if they don't exist (for compatibility)
CREATE TABLE IF NOT EXISTS public.igrejas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    tipo text DEFAULT 'sede' CHECK (tipo IN ('sede', 'missao')),
    endereco text,
    email text,
    telefone text,
    cidade text,
    estado text,
    pastor_responsavel text,
    data_fundacao date,
    ativa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on igrejas table
ALTER TABLE public.igrejas ENABLE ROW LEVEL SECURITY;

-- Create policies for igrejas table
CREATE POLICY "Public can view active churches" 
ON public.igrejas 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Authenticated users can view all churches" 
ON public.igrejas 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create user_church_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_church_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    church_id uuid REFERENCES public.igrejas(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('super_admin', 'pastor', 'tesoureiro', 'lider_celula', 'secretario', 'membro')),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, church_id)
);

-- Enable RLS on user_church_roles table
ALTER TABLE public.user_church_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_church_roles table
CREATE POLICY "Users can view their own church roles" 
ON public.user_church_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all church roles" 
ON public.user_church_roles 
FOR SELECT 
USING (
    EXISTS(
        SELECT 1 FROM user_church_roles 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin' 
        AND active = true
    )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_igrejas_updated_at
    BEFORE UPDATE ON public.igrejas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_church_roles_updated_at
    BEFORE UPDATE ON public.user_church_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();