-- Criar tabela para perguntas de quiz da Bíblia
CREATE TABLE public.biblia_quiz_perguntas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_id TEXT NOT NULL,
    texto_pergunta TEXT NOT NULL,
    opcoes JSONB NOT NULL DEFAULT '[]'::jsonb,
    resposta_correta TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.biblia_quiz_perguntas ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem quizzes
CREATE POLICY "Admins podem gerenciar quizzes"
ON public.biblia_quiz_perguntas
FOR ALL
USING (is_admin() OR user_has_permission('manage', 'jornada'))
WITH CHECK (is_admin() OR user_has_permission('manage', 'jornada'));

-- Política para leitura pública (para membros responderem)
CREATE POLICY "Membros podem ver perguntas"
ON public.biblia_quiz_perguntas
FOR SELECT
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_biblia_quiz_perguntas_updated_at
BEFORE UPDATE ON public.biblia_quiz_perguntas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_trigger();

-- Adicionar índices para melhor performance
CREATE INDEX idx_biblia_quiz_reference_id ON public.biblia_quiz_perguntas(reference_id);
CREATE INDEX idx_biblia_quiz_created_at ON public.biblia_quiz_perguntas(created_at);