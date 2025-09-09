-- Criar tabela para armazenar análises da IA pastoral
CREATE TABLE public.analises_ia_pastoral (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo_analise TEXT NOT NULL CHECK (tipo_analise IN ('analise_perfil', 'sugestoes_discipulado', 'match_ministerio')),
  resultado TEXT NOT NULL,
  dados_contexto JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.analises_ia_pastoral ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins podem gerenciar análises IA pastoral"
ON public.analises_ia_pastoral
FOR ALL
USING (is_sede_admin() OR is_pastor_missao());

CREATE POLICY "Visualizar análises IA pastoral próprias"
ON public.analises_ia_pastoral
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pessoas p
    WHERE p.id = pessoa_id AND p.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_analises_ia_pastoral_updated_at
  BEFORE UPDATE ON public.analises_ia_pastoral
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_analises_ia_pastoral_pessoa_id ON public.analises_ia_pastoral(pessoa_id);
CREATE INDEX idx_analises_ia_pastoral_tipo ON public.analises_ia_pastoral(tipo_analise);
CREATE INDEX idx_analises_ia_pastoral_created_at ON public.analises_ia_pastoral(created_at DESC);