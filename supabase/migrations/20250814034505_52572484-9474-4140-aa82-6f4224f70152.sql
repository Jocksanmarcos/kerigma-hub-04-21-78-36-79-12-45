-- Criar estrutura completa do módulo Bíblia

-- Tabela de conteúdo bíblico
CREATE TABLE IF NOT EXISTS public.biblia_versoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.biblia_livros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  nome_abrev TEXT NOT NULL,
  testamento TEXT NOT NULL CHECK (testamento IN ('Antigo', 'Novo')),
  ordem INTEGER NOT NULL,
  total_capitulos INTEGER NOT NULL,
  sinopse TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.biblia_versiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  versao_id UUID NOT NULL REFERENCES public.biblia_versoes(id),
  livro_id UUID NOT NULL REFERENCES public.biblia_livros(id),
  capitulo INTEGER NOT NULL,
  versiculo INTEGER NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(versao_id, livro_id, capitulo, versiculo)
);

-- Sistema de progresso e estudo
CREATE TABLE IF NOT EXISTS public.estudo_biblico_progresso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  pontos_xp INTEGER DEFAULT 0,
  total_versiculos_lidos INTEGER DEFAULT 0,
  sequencia_dias INTEGER DEFAULT 0,
  ultimo_versiculo_lido_id UUID REFERENCES public.biblia_versiculos(id),
  preferencias JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pessoa_id)
);

-- Sistema de desafios
CREATE TABLE IF NOT EXISTS public.desafios_biblicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_dias INTEGER NOT NULL,
  dificuldade TEXT NOT NULL CHECK (dificuldade IN ('iniciante', 'intermediario', 'avancado')),
  faixa_etaria TEXT NOT NULL CHECK (faixa_etaria IN ('criancas', 'jovens', 'adultos', 'idosos', 'todos')),
  tema TEXT,
  xp_por_capitulo INTEGER DEFAULT 10,
  configuracao JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuario_desafios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  desafio_id UUID NOT NULL REFERENCES public.desafios_biblicos(id),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  progresso INTEGER DEFAULT 0,
  sequencia_atual INTEGER DEFAULT 0,
  melhor_sequencia INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido', 'abandonado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pessoa_id, desafio_id)
);

-- Sistema de quiz
CREATE TABLE IF NOT EXISTS public.quiz_biblico_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  desafio_id UUID REFERENCES public.desafios_biblicos(id),
  livro_id UUID REFERENCES public.biblia_livros(id),
  capitulo INTEGER,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL,
  resposta_correta INTEGER NOT NULL,
  explicacao TEXT,
  dificuldade INTEGER DEFAULT 1 CHECK (dificuldade BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuario_quiz_respostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  pergunta_id UUID NOT NULL REFERENCES public.quiz_biblico_perguntas(id),
  resposta_escolhida INTEGER NOT NULL,
  correto BOOLEAN NOT NULL,
  tempo_resposta INTEGER, -- em segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sistema de anotações e favoritos
CREATE TABLE IF NOT EXISTS public.biblia_anotacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  versiculo_id UUID NOT NULL REFERENCES public.biblia_versiculos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('anotacao', 'destaque', 'favorito')),
  conteudo TEXT,
  cor TEXT DEFAULT '#FFD700',
  tags TEXT[],
  publica BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sistema de planos de leitura
CREATE TABLE IF NOT EXISTS public.planos_leitura (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_dias INTEGER NOT NULL,
  cronograma JSONB NOT NULL, -- estrutura: [{"dia": 1, "livros": ["Genesis"], "capitulos": [1,2,3]}]
  categoria TEXT DEFAULT 'geral',
  nivel TEXT DEFAULT 'iniciante',
  publico BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.pessoas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuario_planos_leitura (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  plano_id UUID NOT NULL REFERENCES public.planos_leitura(id),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  progresso INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir dados iniciais - versões da Bíblia
INSERT INTO public.biblia_versoes (codigo, nome, descricao) VALUES
('NVI', 'Nova Versão Internacional', 'Tradução moderna e equilibrada'),
('ARC', 'Almeida Revista e Corrigida', 'Versão clássica em português'),
('ACF', 'Almeida Corrigida Fiel', 'Versão fiel aos textos originais'),
('NAA', 'Nova Almeida Atualizada', 'Versão contemporânea e precisa')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir livros da Bíblia (alguns exemplos)
INSERT INTO public.biblia_livros (codigo, nome, nome_abrev, testamento, ordem, total_capitulos, sinopse) VALUES
('GEN', 'Gênesis', 'Gn', 'Antigo', 1, 50, 'O livro dos começos: criação, queda e promessas'),
('EXO', 'Êxodo', 'Ex', 'Antigo', 2, 40, 'A libertação de Israel do Egito'),
('LEV', 'Levítico', 'Lv', 'Antigo', 3, 27, 'Leis e rituais para a santidade'),
('MAT', 'Mateus', 'Mt', 'Novo', 40, 28, 'Jesus como o Rei prometido'),
('MAR', 'Marcos', 'Mc', 'Novo', 41, 16, 'Jesus como o Servo dedicado'),
('LUC', 'Lucas', 'Lc', 'Novo', 42, 24, 'Jesus como o Homem perfeito'),
('JOA', 'João', 'Jo', 'Novo', 43, 21, 'Jesus como o Filho de Deus')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir desafios iniciais
INSERT INTO public.desafios_biblicos (nome, descricao, duracao_dias, dificuldade, faixa_etaria, tema, xp_por_capitulo) VALUES
('Bíblia em 1 Ano', 'Leia toda a Bíblia em 365 dias', 365, 'intermediario', 'todos', 'completa', 15),
('Novo Testamento em 3 Meses', 'Foco nos Evangelhos e cartas apostólicas', 90, 'iniciante', 'todos', 'novo_testamento', 20),
('Evangelhos em 30 Dias', 'Conhecer a vida de Jesus', 30, 'iniciante', 'jovens', 'evangelhos', 25),
('Provérbios Diários', 'Um capítulo de sabedoria por dia', 31, 'iniciante', 'todos', 'sabedoria', 30)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudo_biblico_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desafios_biblicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_desafios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_biblico_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_quiz_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_leitura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_planos_leitura ENABLE ROW LEVEL SECURITY;