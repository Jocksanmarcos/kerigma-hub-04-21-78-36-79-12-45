-- Tabela para definir a trilha de crescimento da Jornada do Discípulo
CREATE TABLE IF NOT EXISTS public.jornada_niveis (
    id SERIAL PRIMARY KEY,
    nome_nivel TEXT NOT NULL,
    pontos_necessarios INTEGER NOT NULL UNIQUE,
    imagem_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.jornada_niveis IS 'Define os níveis de progressão e os pontos necessários para alcançá-los.';

-- Populando com alguns níveis de exemplo
INSERT INTO public.jornada_niveis (nome_nivel, pontos_necessarios) 
VALUES
    ('Neófito', 0),
    ('Aprendiz', 100),
    ('Caminhante', 300),
    ('Praticante', 700),
    ('Sábio', 1500),
    ('Mestre', 3000)
ON CONFLICT (pontos_necessarios) DO NOTHING;