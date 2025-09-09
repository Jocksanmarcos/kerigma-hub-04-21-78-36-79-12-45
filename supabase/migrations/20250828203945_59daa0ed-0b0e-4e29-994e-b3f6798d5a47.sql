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

-- Tabela para perfis de usuários na jornada
CREATE TABLE IF NOT EXISTS public.jornada_perfis_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
    pontos_sabedoria INTEGER NOT NULL DEFAULT 0,
    nivel TEXT NOT NULL DEFAULT 'Neófito',
    sequencia_estudo INTEGER NOT NULL DEFAULT 0,
    melhor_sequencia INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(pessoa_id)
);

COMMENT ON TABLE public.jornada_perfis_usuarios IS 'Perfis dos usuários na Jornada de Crescimento com pontos e níveis.';

-- Tabela para histórico de respostas do quiz
CREATE TABLE IF NOT EXISTS public.biblia_quiz_respostas_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pergunta_id UUID NOT NULL REFERENCES public.biblia_quiz_perguntas(id) ON DELETE CASCADE,
    resposta_dada TEXT NOT NULL,
    acertou BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pergunta_id)
);

COMMENT ON TABLE public.biblia_quiz_respostas_usuarios IS 'Histórico de respostas dos usuários nos quizzes bíblicos.';

-- Ativando a Segurança nas tabelas
ALTER TABLE public.jornada_niveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_perfis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_quiz_respostas_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para jornada_niveis
CREATE POLICY IF NOT EXISTS "Qualquer usuário pode ler os níveis" 
ON public.jornada_niveis FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Apenas admins podem gerenciar os níveis" 
ON public.jornada_niveis FOR ALL 
USING (is_admin_user());

-- Políticas de segurança para jornada_perfis_usuarios
CREATE POLICY IF NOT EXISTS "Usuários podem ver seu próprio perfil" 
ON public.jornada_perfis_usuarios FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar seu próprio perfil" 
ON public.jornada_perfis_usuarios FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Sistema pode criar perfis" 
ON public.jornada_perfis_usuarios FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Admins podem ver todos os perfis" 
ON public.jornada_perfis_usuarios FOR SELECT 
USING (is_admin_user());

-- Políticas de segurança para biblia_quiz_respostas_usuarios
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias respostas" 
ON public.biblia_quiz_respostas_usuarios FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Sistema pode inserir respostas" 
ON public.biblia_quiz_respostas_usuarios FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Admins podem ver todas as respostas" 
ON public.biblia_quiz_respostas_usuarios FOR SELECT 
USING (is_admin_user());

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.create_jornada_profile()
RETURNS TRIGGER AS $$
DECLARE
    pessoa_record RECORD;
BEGIN
    -- Buscar a pessoa associada ao usuário
    SELECT * INTO pessoa_record 
    FROM public.pessoas 
    WHERE user_id = NEW.id 
    LIMIT 1;
    
    -- Criar perfil da jornada
    INSERT INTO public.jornada_perfis_usuarios (user_id, pessoa_id, pontos_sabedoria, nivel)
    VALUES (NEW.id, pessoa_record.id, 0, 'Neófito')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Silenciar erros para não bloquear o registro
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created_jornada ON auth.users;
CREATE TRIGGER on_auth_user_created_jornada
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_jornada_profile();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_jornada_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_jornada_niveis_updated_at
    BEFORE UPDATE ON public.jornada_niveis
    FOR EACH ROW EXECUTE FUNCTION public.update_jornada_updated_at();

CREATE TRIGGER update_jornada_perfis_usuarios_updated_at
    BEFORE UPDATE ON public.jornada_perfis_usuarios
    FOR EACH ROW EXECUTE FUNCTION public.update_jornada_updated_at();