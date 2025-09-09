-- Criar tabela para perfis de usuários na jornada bíblica
CREATE TABLE public.jornada_perfis_usuarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    pontos_sabedoria INTEGER NOT NULL DEFAULT 0,
    capitulos_lidos_ids TEXT[] NOT NULL DEFAULT '{}',
    ultima_atividade_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.jornada_perfis_usuarios ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios perfis
CREATE POLICY "Usuários podem ver próprio perfil jornada" 
ON public.jornada_perfis_usuarios 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários criarem seus próprios perfis
CREATE POLICY "Usuários podem criar próprio perfil jornada" 
ON public.jornada_perfis_usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios perfis
CREATE POLICY "Usuários podem atualizar próprio perfil jornada" 
ON public.jornada_perfis_usuarios 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_jornada_perfis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jornada_perfis_updated_at
    BEFORE UPDATE ON public.jornada_perfis_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_jornada_perfis_updated_at();

-- Função para criar perfil automaticamente quando usuário for criado
CREATE OR REPLACE FUNCTION public.handle_new_user_jornada()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.jornada_perfis_usuarios (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created_jornada
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_jornada();