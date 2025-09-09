-- Check if profiles table exists, if not create it first
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Create profiles table if it doesn't exist
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(user_id)
        );

        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own profile" ON public.profiles  
            FOR UPDATE USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Create update trigger
        CREATE TRIGGER update_profiles_updated_at
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- Add the new volunteer columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS volunteer_interests TEXT[], -- Array de interesses. Ex: {'crianças', 'louvor', 'social'}
ADD COLUMN IF NOT EXISTS volunteer_skills TEXT[]; -- Array de habilidades. Ex: {'fotografia', 'instrumento musical', 'liderança'}