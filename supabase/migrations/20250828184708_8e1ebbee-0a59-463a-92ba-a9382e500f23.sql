-- Tabela 1: O Banco de Perguntas do Quiz
CREATE TABLE public.biblia_quiz_perguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Liga a pergunta a uma referência: um capítulo ('GEN.1'), um livro ('GEN'), ou um curso ('CURSO-LIDER-1')
    reference_id TEXT NOT NULL,
    
    -- O texto da pergunta em si.
    texto_pergunta TEXT NOT NULL,
    
    -- As opções de múltipla escolha, armazenadas em um formato flexível (JSONB).
    -- Exemplo: [{"id": "A", "texto": "Opção A"}, {"id": "B", "texto": "Opção B"}]
    opcoes JSONB NOT NULL,
    
    -- O 'id' da opção correta. Ex: 'A'.
    resposta_correta TEXT NOT NULL,
    
    -- Para sabermos quem criou a pergunta (opcional, mas boa prática).
    criado_por UUID REFERENCES auth.users(id),
    
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.biblia_quiz_perguntas IS 'Armazena o banco de perguntas e respostas para os quizzes da Jornada de Crescimento.';

-- Tabela 2: O Registro de Respostas dos Usuários
CREATE TABLE public.biblia_quiz_respostas_usuarios (
    -- Chave composta: garante que um usuário só pode responder cada pergunta UMA VEZ.
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pergunta_id UUID NOT NULL REFERENCES public.biblia_quiz_perguntas(id) ON DELETE CASCADE,
    
    -- A resposta que o usuário selecionou (ex: 'B').
    resposta_dada TEXT NOT NULL,
    
    -- Para facilitar a análise, já armazenamos se a resposta foi correta.
    acertou BOOLEAN NOT NULL,
    
    -- Quando a resposta foi enviada.
    respondido_em TIMESTAMPTZ DEFAULT NOW(),

    -- Define a chave primária como a combinação de usuário e pergunta.
    PRIMARY KEY (user_id, pergunta_id)
);

COMMENT ON TABLE public.biblia_quiz_respostas_usuarios IS 'Registra as respostas de cada usuário aos quizzes, prevenindo duplicatas.';

-- Ativando a Segurança de Nível de Linha (RLS) para ambas as tabelas
ALTER TABLE public.biblia_quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_quiz_respostas_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança para a Tabela de Perguntas
-- Permite que qualquer usuário logado LEIA as perguntas.
CREATE POLICY "Qualquer usuário autenticado pode ler as perguntas do quiz"
ON public.biblia_quiz_perguntas FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas administradores podem criar, alterar ou deletar perguntas.
-- Usando a função is_sede_admin() existente no projeto
CREATE POLICY "Administradores podem gerenciar as perguntas do quiz"
ON public.biblia_quiz_perguntas FOR ALL USING (is_sede_admin());

-- Políticas de Segurança para a Tabela de Respostas
-- Um usuário pode INSERIR uma resposta apenas para si mesmo.
CREATE POLICY "Usuários podem registrar suas próprias respostas"
ON public.biblia_quiz_respostas_usuarios FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Um usuário pode LER apenas as suas próprias respostas.
CREATE POLICY "Usuários podem ver apenas suas próprias respostas"
ON public.biblia_quiz_respostas_usuarios FOR SELECT USING (auth.uid() = user_id);