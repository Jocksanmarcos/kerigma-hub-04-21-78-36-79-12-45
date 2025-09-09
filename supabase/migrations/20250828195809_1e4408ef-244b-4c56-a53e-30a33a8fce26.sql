-- Tabela 1: O Banco de Perguntas do Quiz (O Gabarito)
CREATE TABLE public.biblia_quiz_perguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL, -- Liga a pergunta a uma referência: 'GEN.1' (capítulo), 'GEN' (livro), ou 'CURSO-ID'
    texto_pergunta TEXT NOT NULL,
    opcoes JSONB NOT NULL, -- Ex: [{"id": "A", "texto": "Opção A"}, {"id": "B", "texto": "Opção B"}]
    resposta_correta TEXT NOT NULL, -- Ex: 'A'
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.biblia_quiz_perguntas IS 'Armazena o banco de perguntas e respostas para os quizzes da Jornada de Crescimento.';

-- Tabela 2: O Registro de Respostas dos Usuários (O Cartão de Respostas)
CREATE TABLE public.biblia_quiz_respostas_usuarios (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pergunta_id UUID NOT NULL REFERENCES public.biblia_quiz_perguntas(id) ON DELETE CASCADE,
    resposta_dada TEXT NOT NULL,
    acertou BOOLEAN NOT NULL,
    respondido_em TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, pergunta_id) -- Chave composta: garante que um usuário só pode responder cada pergunta UMA VEZ.
);

COMMENT ON TABLE public.biblia_quiz_respostas_usuarios IS 'Registra as respostas de cada usuário aos quizzes, prevenindo duplicatas.';

-- Ativando a Segurança (RLS) para ambas as tabelas
ALTER TABLE public.biblia_quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_quiz_respostas_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para a Tabela de Perguntas
CREATE POLICY "Qualquer usuário logado pode ler as perguntas"
ON public.biblia_quiz_perguntas FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas administradores podem gerenciar perguntas"
ON public.biblia_quiz_perguntas FOR ALL USING (
  is_admin() OR is_sede_admin() OR is_pastor_missao()
);

-- Políticas para a Tabela de Respostas
CREATE POLICY "Usuários podem registrar suas próprias respostas"
ON public.biblia_quiz_respostas_usuarios FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver apenas suas próprias respostas"
ON public.biblia_quiz_respostas_usuarios FOR SELECT USING (auth.uid() = user_id);