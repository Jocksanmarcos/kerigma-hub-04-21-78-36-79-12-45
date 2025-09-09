-- Create galeria_albuns table
CREATE TABLE IF NOT EXISTS public.galeria_albuns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  capa_url TEXT,
  categoria TEXT DEFAULT 'geral'::text,
  data_evento DATE,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.galeria_albuns ENABLE ROW LEVEL SECURITY;

-- Create policies for galeria_albuns
CREATE POLICY "Qualquer um pode ver álbuns ativos" 
ON public.galeria_albuns 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar álbuns" 
ON public.galeria_albuns 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Update galeria_midia table if it exists, or create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'galeria_midia') THEN
        CREATE TABLE public.galeria_midia (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            album_id UUID REFERENCES public.galeria_albuns(id) ON DELETE CASCADE,
            titulo TEXT NOT NULL,
            descricao TEXT,
            arquivo_url TEXT NOT NULL,
            thumbnail_url TEXT,
            tipo TEXT DEFAULT 'imagem'::text CHECK (tipo IN ('imagem', 'video', 'audio')),
            tamanho_arquivo BIGINT,
            ordem INTEGER DEFAULT 0,
            tags TEXT[],
            data_upload DATE DEFAULT CURRENT_DATE,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.galeria_midia ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for galeria_midia
        CREATE POLICY "Qualquer um pode ver mídia ativa" 
        ON public.galeria_midia 
        FOR SELECT 
        USING (ativo = true);
        
        CREATE POLICY "Admins podem gerenciar mídia" 
        ON public.galeria_midia 
        FOR ALL 
        USING (is_admin())
        WITH CHECK (is_admin());
    END IF;
END $$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_galeria_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_galeria_albuns_updated_at ON public.galeria_albuns;
CREATE TRIGGER update_galeria_albuns_updated_at
    BEFORE UPDATE ON public.galeria_albuns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_galeria_updated_at_column();

DROP TRIGGER IF EXISTS update_galeria_midia_updated_at ON public.galeria_midia;
CREATE TRIGGER update_galeria_midia_updated_at
    BEFORE UPDATE ON public.galeria_midia
    FOR EACH ROW
    EXECUTE FUNCTION public.update_galeria_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.galeria_albuns (nome, descricao, categoria, data_evento, ordem) VALUES
('Cultos de Adoração', 'Momentos especiais de adoração em nossa comunidade', 'cultos', '2024-01-01', 1),
('Células em Ação', 'Encontros e atividades das nossas células', 'celulas', '2024-02-01', 2),
('Eventos Especiais', 'Conferências, batismos e eventos marcantes', 'eventos', '2024-03-01', 3),
('Ministério Infantil', 'Crianças crescendo na fé e no conhecimento', 'ministerio', '2024-04-01', 4)
ON CONFLICT DO NOTHING;