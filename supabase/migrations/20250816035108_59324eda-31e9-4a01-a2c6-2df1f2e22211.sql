-- Criar tabela para biblioteca de recursos das células se não existir
CREATE TABLE IF NOT EXISTS public.biblioteca_recursos_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  publico_alvo TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  downloads INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.biblioteca_recursos_celulas ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de recursos ativos
CREATE POLICY "Membros podem ver recursos ativos" 
ON public.biblioteca_recursos_celulas 
FOR SELECT 
USING (ativo = true);

-- Política para permitir que líderes gerenciem recursos
CREATE POLICY "Líderes podem gerenciar recursos" 
ON public.biblioteca_recursos_celulas 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'celulas'))
WITH CHECK (is_admin() OR user_has_permission('manage', 'celulas'));

-- Inserir alguns recursos de exemplo
INSERT INTO public.biblioteca_recursos_celulas (titulo, descricao, tipo, categoria, arquivo_url, arquivo_nome, publico_alvo, tags, downloads) VALUES
('O Poder da Oração em Família', 'Estudo completo sobre a importância da oração familiar com dinâmicas práticas', 'Estudo Semanal', 'família', '#', 'estudo-oracao-familia.pdf', '{"Líder", "Co-líder"}', '{"oração", "família", "dinâmica"}', 156),
('Quebra-Gelo: Conhecendo Nossos Sonhos', 'Dinâmica para início de reunião que promove integração e conhecimento mútuo', 'Quebra-Gelo', 'integração', '#', 'quebra-gelo-sonhos.pdf', '{"Líder", "Co-líder", "Anfitrião"}', '{"integração", "sonhos", "conhecimento"}', 89),
('Como Conduzir uma Célula - Básico', 'Vídeo-aula de 15 minutos com fundamentos para novos líderes', 'Vídeo de Treino', 'treinamento', '#', 'treino-lider-basico.mp4', '{"Líder em Treinamento"}', '{"liderança", "treinamento", "básico"}', 234);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_biblioteca_recursos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_biblioteca_recursos_celulas_updated_at
  BEFORE UPDATE ON public.biblioteca_recursos_celulas
  FOR EACH ROW
  EXECUTE FUNCTION update_biblioteca_recursos_updated_at();