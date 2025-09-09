-- Criar tabela de planos de leitura para a jornada de crescimento
CREATE TABLE IF NOT EXISTS public.planos_de_leitura (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  lista_de_capitulos JSONB NOT NULL DEFAULT '[]',
  imagem_url TEXT,
  nivel TEXT NOT NULL DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  duracao_dias INTEGER NOT NULL DEFAULT 30,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  ativo BOOLEAN NOT NULL DEFAULT true,
  categoria TEXT NOT NULL DEFAULT 'geral',
  church_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.planos_de_leitura ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver planos ativos" ON public.planos_de_leitura
  FOR SELECT USING (ativo = true);

CREATE POLICY "Admins podem gerenciar planos" ON public.planos_de_leitura
  FOR ALL USING (is_admin());

-- Inserir alguns planos de exemplo
INSERT INTO public.planos_de_leitura (titulo, descricao, lista_de_capitulos, imagem_url, nivel, duracao_dias, cor, categoria) VALUES
('Jornada através dos Evangelhos', 'Acompanhe a vida de Jesus através dos quatro evangelhos', 
 '[{"dia": 1, "livro": "Mateus", "capitulo": 1, "titulo": "Nascimento de Jesus"}, 
   {"dia": 2, "livro": "Mateus", "capitulo": 2, "titulo": "Os Magos do Oriente"}, 
   {"dia": 3, "livro": "Mateus", "capitulo": 3, "titulo": "João Batista"}]', 
 '/placeholder.svg', 'iniciante', 30, '#10b981', 'evangelhos'),
 
('Salmos de Esperança', 'Encontre esperança e conforto nos Salmos', 
 '[{"dia": 1, "livro": "Salmos", "capitulo": 23, "titulo": "O Senhor é meu Pastor"}, 
   {"dia": 2, "livro": "Salmos", "capitulo": 91, "titulo": "Refúgio no Altíssimo"}, 
   {"dia": 3, "livro": "Salmos", "capitulo": 139, "titulo": "Conhecimento Perfeito"}]', 
 '/placeholder.svg', 'iniciante', 14, '#8b5cf6', 'salmos'),
 
('Paulo e suas Cartas', 'Explore os ensinamentos do apóstolo Paulo', 
 '[{"dia": 1, "livro": "Romanos", "capitulo": 1, "titulo": "O Evangelho de Cristo"}, 
   {"dia": 2, "livro": "Romanos", "capitulo": 3, "titulo": "Justificação pela Fé"}, 
   {"dia": 3, "livro": "Romanos", "capitulo": 8, "titulo": "Vida no Espírito"}]', 
 '/placeholder.svg', 'intermediario', 45, '#f59e0b', 'epistolas');

-- Criar tabela para acompanhar progresso dos usuários nos planos
CREATE TABLE IF NOT EXISTS public.progresso_planos_leitura (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  plano_id UUID NOT NULL REFERENCES public.planos_de_leitura(id) ON DELETE CASCADE,
  dia_atual INTEGER NOT NULL DEFAULT 1,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_ultima_leitura DATE,
  concluido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, plano_id)
);

-- Habilitar RLS
ALTER TABLE public.progresso_planos_leitura ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver próprio progresso" ON public.progresso_planos_leitura
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = progresso_planos_leitura.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar próprio progresso" ON public.progresso_planos_leitura
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = progresso_planos_leitura.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar próprio progresso" ON public.progresso_planos_leitura
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = progresso_planos_leitura.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_progresso_planos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progresso_planos_updated_at
  BEFORE UPDATE ON public.progresso_planos_leitura
  FOR EACH ROW
  EXECUTE FUNCTION update_progresso_planos_updated_at();