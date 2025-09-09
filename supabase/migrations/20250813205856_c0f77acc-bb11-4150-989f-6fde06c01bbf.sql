-- Criar esquema para estudo bíblico interativo com API.Bible (corrigido)
-- Tabela de versões da Bíblia
CREATE TABLE IF NOT EXISTS public.biblia_versoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bible_id TEXT NOT NULL UNIQUE, -- ID da versão na API.Bible
  nome TEXT NOT NULL,
  abreviacao TEXT NOT NULL,
  idioma TEXT NOT NULL DEFAULT 'pt',
  descricao TEXT,
  direitos_autorais TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de livros da Bíblia
CREATE TABLE IF NOT EXISTS public.biblia_livros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  versao_id UUID NOT NULL REFERENCES public.biblia_versoes(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL, -- ID do livro na API.Bible
  nome TEXT NOT NULL,
  abreviacao TEXT NOT NULL,
  testamento TEXT NOT NULL CHECK (testamento IN ('AT', 'NT')),
  ordem INTEGER NOT NULL,
  total_capitulos INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(versao_id, book_id)
);

-- Tabela de capítulos
CREATE TABLE IF NOT EXISTS public.biblia_capitulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblia_livros(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL, -- ID do capítulo na API.Bible
  numero INTEGER NOT NULL,
  total_versiculos INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(livro_id, numero)
);

-- Tabela de versículos
CREATE TABLE IF NOT EXISTS public.biblia_versiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capitulo_id UUID NOT NULL REFERENCES public.biblia_capitulos(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL, -- ID do versículo na API.Bible
  numero INTEGER NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(capitulo_id, numero)
);

-- Tabela de planos de leitura
CREATE TABLE IF NOT EXISTS public.planos_leitura_biblica (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_dias INTEGER NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'geral',
  nivel TEXT NOT NULL DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  cronograma JSONB NOT NULL DEFAULT '[]', -- Array de {dia: 1, referencia: "João 1:1-14", livro_id: "...", capitulo_inicio: 1, versiculo_inicio: 1, etc}
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de progresso de estudo bíblico do usuário
CREATE TABLE IF NOT EXISTS public.estudo_biblico_progresso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  plano_id UUID REFERENCES public.planos_leitura_biblica(id) ON DELETE SET NULL,
  versao_favorita_id UUID REFERENCES public.biblia_versoes(id) ON DELETE SET NULL,
  total_capitulos_lidos INTEGER NOT NULL DEFAULT 0,
  total_versiculos_lidos INTEGER NOT NULL DEFAULT 0,
  sequencia_dias_consecutivos INTEGER NOT NULL DEFAULT 0,
  ultima_leitura_data DATE,
  pontos_xp INTEGER NOT NULL DEFAULT 0,
  nivel_usuario INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id)
);

-- Tabela de leituras registradas
CREATE TABLE IF NOT EXISTS public.leituras_biblicas_registro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  capitulo_id UUID REFERENCES public.biblia_capitulos(id) ON DELETE SET NULL,
  plano_id UUID REFERENCES public.planos_leitura_biblica(id) ON DELETE SET NULL,
  data_leitura DATE NOT NULL DEFAULT CURRENT_DATE,
  tempo_leitura_minutos INTEGER DEFAULT 0,
  versiculos_lidos INTEGER DEFAULT 0,
  pontos_ganhos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de medalhas/conquistas bíblicas
CREATE TABLE IF NOT EXISTS public.medalhas_biblia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  criterio JSONB NOT NULL, -- {tipo: "dias_consecutivos", valor: 7} ou {tipo: "capitulos_lidos", valor: 50}
  icone_url TEXT,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  pontos_bonus INTEGER NOT NULL DEFAULT 10,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de medalhas conquistadas pelos usuários
CREATE TABLE IF NOT EXISTS public.pessoas_medalhas_biblia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  medalha_id UUID NOT NULL REFERENCES public.medalhas_biblia(id) ON DELETE CASCADE,
  data_conquista TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, medalha_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_capitulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_leitura_biblica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudo_biblico_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leituras_biblicas_registro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medalhas_biblia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas_medalhas_biblia ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Conteúdo bíblico é público para leitura
CREATE POLICY "Versões da Bíblia são públicas" ON public.biblia_versoes FOR SELECT USING (ativa = true);
CREATE POLICY "Livros da Bíblia são públicos" ON public.biblia_livros FOR SELECT USING (true);
CREATE POLICY "Capítulos da Bíblia são públicos" ON public.biblia_capitulos FOR SELECT USING (true);
CREATE POLICY "Versículos da Bíblia são públicos" ON public.biblia_versiculos FOR SELECT USING (true);
CREATE POLICY "Planos de leitura são públicos" ON public.planos_leitura_biblica FOR SELECT USING (ativo = true);
CREATE POLICY "Medalhas são públicas" ON public.medalhas_biblia FOR SELECT USING (ativa = true);

-- Políticas para progresso pessoal (usuário só vê o próprio)
CREATE POLICY "Usuário pode ver próprio progresso" ON public.estudo_biblico_progresso FOR ALL USING (pessoa_id = get_current_person_id());
CREATE POLICY "Usuário pode ver próprias leituras" ON public.leituras_biblicas_registro FOR ALL USING (pessoa_id = get_current_person_id());
CREATE POLICY "Usuário pode ver próprias medalhas" ON public.pessoas_medalhas_biblia FOR ALL USING (pessoa_id = get_current_person_id());

-- Políticas administrativas
CREATE POLICY "Admin pode gerenciar conteúdo bíblico" ON public.biblia_versoes FOR ALL USING (is_admin());
CREATE POLICY "Admin pode gerenciar livros" ON public.biblia_livros FOR ALL USING (is_admin());
CREATE POLICY "Admin pode gerenciar capítulos" ON public.biblia_capitulos FOR ALL USING (is_admin());
CREATE POLICY "Admin pode gerenciar versículos" ON public.biblia_versiculos FOR ALL USING (is_admin());
CREATE POLICY "Admin pode gerenciar planos" ON public.planos_leitura_biblica FOR ALL USING (is_admin());
CREATE POLICY "Admin pode gerenciar medalhas" ON public.medalhas_biblia FOR ALL USING (is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_biblia_versoes_updated_at BEFORE UPDATE ON public.biblia_versoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_planos_leitura_updated_at BEFORE UPDATE ON public.planos_leitura_biblica FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_progresso_updated_at BEFORE UPDATE ON public.estudo_biblico_progresso FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Inserir algumas medalhas padrão
INSERT INTO public.medalhas_biblia (codigo, nome, descricao, criterio, cor, pontos_bonus) VALUES
('primeiro_capitulo', 'Primeiro Passo', 'Leu seu primeiro capítulo da Bíblia', '{"tipo": "capitulos_lidos", "valor": 1}', '#10b981', 5),
('leitor_dedicado', 'Leitor Dedicado', 'Leu por 7 dias consecutivos', '{"tipo": "dias_consecutivos", "valor": 7}', '#3b82f6', 15),
('explorador_biblico', 'Explorador Bíblico', 'Leu 10 capítulos diferentes', '{"tipo": "capitulos_lidos", "valor": 10}', '#8b5cf6', 25),
('guerreiro_da_palavra', 'Guerreiro da Palavra', 'Leu por 30 dias consecutivos', '{"tipo": "dias_consecutivos", "valor": 30}', '#f59e0b', 50),
('mestre_das_escrituras', 'Mestre das Escrituras', 'Leu 100 capítulos', '{"tipo": "capitulos_lidos", "valor": 100}', '#ef4444', 100)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir alguns planos de leitura padrão
INSERT INTO public.planos_leitura_biblica (nome, descricao, duracao_dias, categoria, nivel, cronograma) VALUES
('Evangelho de João', 'Leitura completa do Evangelho de João em 21 dias', 21, 'evangelhos', 'iniciante', 
 '[{"dia": 1, "referencia": "João 1", "descricao": "O Verbo se fez carne"}]'
),
('Salmos de Louvor', 'Salmos selecionados para fortificar a fé', 30, 'devocional', 'iniciante',
 '[{"dia": 1, "referencia": "Salmo 1", "descricao": "Bem-aventurado o homem que não anda"}]'
),
('Novo Testamento em 90 dias', 'Leitura completa do Novo Testamento', 90, 'completo', 'intermediario',
 '[{"dia": 1, "referencia": "Mateus 1-2", "descricao": "O nascimento de Jesus"}]'
)
ON CONFLICT (nome) DO NOTHING;