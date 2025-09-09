-- PASSO 1: CRIAR A TABELA PRINCIPAL
-- Esta tabela irá armazenar o progresso individual de cada usuário na Jornada.
CREATE TABLE public.jornada_perfis_usuarios (
    -- Cria uma relação direta de 1 para 1 com a tabela de usuários do Supabase.
    -- Se um usuário for deletado, seu perfil da jornada também será.
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Armazena o total de Pontos de Sabedoria (PS) acumulados.
    pontos_sabedoria INTEGER NOT NULL DEFAULT 0,

    -- Guarda o Nível atual do discípulo (ex: 'Neófito', 'Aprendiz').
    nivel TEXT NOT NULL DEFAULT 'Neófito',

    -- Um array que guarda os IDs dos capítulos já lidos (ex: ["GEN.1", "EXO.3"]).
    -- Essencial para evitar que um usuário ganhe pontos pelo mesmo capítulo várias vezes.
    capitulos_lidos_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Registra a data da última atividade, útil para futuras funcionalidades como "sequências" (streaks).
    ultima_atividade_em TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona um comentário para documentar o propósito da tabela no banco de dados.
COMMENT ON TABLE public.jornada_perfis_usuarios IS 'Armazena o perfil de gamificação e progresso de cada usuário na Jornada de Crescimento.';

-- PASSO 2: ATIVAR A SEGURANÇA (RLS)
-- Garante que os dados de progresso de um usuário sejam privados.
ALTER TABLE public.jornada_perfis_usuarios ENABLE ROW LEVEL SECURITY;

-- Permite que um usuário LEIA apenas o seu próprio progresso.
CREATE POLICY "Usuários podem ler seu próprio perfil da jornada"
ON public.jornada_perfis_usuarios
FOR SELECT
USING (auth.uid() = user_id);

-- Permite que o backend (e não o usuário diretamente) ATUALIZE o progresso de um usuário.
-- Usamos 'service_role' em funções de backend para garantir a segurança.
CREATE POLICY "Serviço pode atualizar perfis de jornada"
ON public.jornada_perfis_usuarios
FOR UPDATE
USING (auth.role() = 'service_role');

-- PASSO 3: AUTOMATIZAR A CRIAÇÃO DE PERFIS
-- Este gatilho (trigger) cria um perfil de jornada automaticamente
-- para cada novo usuário que se cadastra na plataforma.
CREATE OR REPLACE FUNCTION public.handle_new_user_journey_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.jornada_perfis_usuarios (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_create_journey_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_journey_profile();