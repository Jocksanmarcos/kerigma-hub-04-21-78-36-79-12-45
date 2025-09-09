-- Criar tabela para armazenar resultados dos quizzes (opcional)
CREATE TABLE IF NOT EXISTS public.quiz_resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  total_perguntas INTEGER NOT NULL DEFAULT 0,
  acertos INTEGER NOT NULL DEFAULT 0,
  pontos_ganhos INTEGER NOT NULL DEFAULT 0,
  percentual NUMERIC NOT NULL DEFAULT 0,
  respostas_detalhadas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_quiz_resultados_pessoa_id ON public.quiz_resultados(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_quiz_resultados_reference_id ON public.quiz_resultados(reference_id);
CREATE INDEX IF NOT EXISTS idx_quiz_resultados_created_at ON public.quiz_resultados(created_at);

-- RLS policies
ALTER TABLE public.quiz_resultados ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios resultados
CREATE POLICY "Usuários podem ver próprios resultados de quiz"
ON public.quiz_resultados
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pessoas
    WHERE pessoas.id::text = quiz_resultados.pessoa_id
    AND pessoas.user_id = auth.uid()
  )
);

-- Política para sistema inserir resultados
CREATE POLICY "Sistema pode inserir resultados"
ON public.quiz_resultados
FOR INSERT
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_quiz_resultados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_resultados_updated_at_trigger
  BEFORE UPDATE ON public.quiz_resultados
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_resultados_updated_at();