-- KERIGMA HUB - Nova Arquitetura de Banco de Dados
-- Eliminando estrutura legada e criando arquitetura consolidada

-- =============================================
-- 1. TABELA CENTRAL DE PESSOAS
-- =============================================
CREATE TABLE public.pessoas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE, -- Referência ao auth.users
  nome_completo TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  data_nascimento DATE,
  endereco TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  
  -- Informações ministeriais
  tipo_pessoa TEXT DEFAULT 'membro' CHECK (tipo_pessoa IN ('membro', 'visitante', 'lider', 'pastor')),
  situacao TEXT DEFAULT 'ativo' CHECK (situacao IN ('ativo', 'inativo', 'transferido')),
  data_batismo DATE,
  data_conversao DATE,
  status_discipulado TEXT DEFAULT 'nao_iniciado' CHECK (status_discipulado IN ('nao_iniciado', 'em_andamento', 'concluido')),
  
  -- Relacionamentos
  profile_id UUID, -- Será definido após criar a tabela profiles
  celula_id UUID, -- Será definido após criar a tabela celulas
  congregacao_id UUID,
  
  -- Metadados
  observacoes TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 2. SISTEMA DE SEGURANÇA (RBAC) CONSOLIDADO
-- =============================================

-- Profiles (Perfis de usuário)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER DEFAULT 1, -- Nível hierárquico (1=baixo, 5=alto)
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permissions (Permissões do sistema)
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'manage'
  subject TEXT NOT NULL, -- 'pessoas', 'celulas', 'cursos', 'relatorios'
  resource_type TEXT, -- Tipo específico de recurso (opcional)
  conditions JSONB DEFAULT '{}', -- Condições específicas
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profile Permissions (Relacionamento N:N)
CREATE TABLE public.profile_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, permission_id)
);

-- =============================================
-- 3. MÓDULO DE CÉLULAS CONSOLIDADO
-- =============================================

-- Células (tabela única consolidada)
CREATE TABLE public.celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Localização
  endereco TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT,
  cep TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Horários
  dia_semana TEXT NOT NULL CHECK (dia_semana IN ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')),
  horario TIME NOT NULL,
  frequencia TEXT DEFAULT 'semanal' CHECK (frequencia IN ('semanal', 'quinzenal', 'mensal')),
  
  -- Liderança
  lider_id UUID REFERENCES public.pessoas(id),
  auxiliar_id UUID,
  anfitriao_id UUID,
  
  -- Status e metas
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'multiplicando', 'multiplicada')),
  meta_membros INTEGER DEFAULT 15,
  meta_visitantes_mes INTEGER DEFAULT 2,
  meta_decisoes_mes INTEGER DEFAULT 1,
  
  -- Multiplicação
  celula_mae_id UUID REFERENCES public.celulas(id),
  data_multiplicacao DATE,
  geracao INTEGER DEFAULT 1,
  arvore_genealogica TEXT,
  
  -- Organização
  rede_id UUID,
  congregacao_id UUID,
  
  -- Metadados
  observacoes TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Relatórios de Célula (consolidado)
CREATE TABLE public.relatorios_celula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  data_relatorio DATE NOT NULL,
  
  -- Números do relatório
  presentes_membros INTEGER DEFAULT 0,
  presentes_visitantes INTEGER DEFAULT 0,
  total_presentes INTEGER GENERATED ALWAYS AS (presentes_membros + presentes_visitantes) STORED,
  decisoes INTEGER DEFAULT 0,
  ofertas NUMERIC DEFAULT 0,
  
  -- Observações
  testemunhos TEXT,
  motivos_oracoes TEXT,
  observacoes TEXT,
  
  -- Status
  status TEXT DEFAULT 'enviado' CHECK (status IN ('rascunho', 'enviado', 'aprovado')),
  
  -- Metadados
  created_by UUID REFERENCES public.pessoas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(celula_id, data_relatorio)
);

-- =============================================
-- 4. MÓDULO DE ENSINO CONSOLIDADO
-- =============================================

-- Cursos (consolidado)
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT DEFAULT 'discipulado' CHECK (categoria IN ('discipulado', 'lideranca', 'teologia', 'ministerio')),
  nivel TEXT DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  
  -- Configurações do curso
  carga_horaria INTEGER,
  pre_requisitos TEXT[],
  publico_alvo TEXT[],
  material_didatico JSONB DEFAULT '[]',
  emite_certificado BOOLEAN DEFAULT true,
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Matrículas (consolidado)
CREATE TABLE public.matriculas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  
  -- Status da matrícula
  status TEXT DEFAULT 'matriculado' CHECK (status IN ('matriculado', 'cursando', 'concluido', 'cancelado', 'trancado')),
  data_matricula DATE DEFAULT CURRENT_DATE,
  data_inicio DATE,
  data_conclusao DATE,
  
  -- Avaliação
  nota_final NUMERIC CHECK (nota_final >= 0 AND nota_final <= 10),
  frequencia_percentual NUMERIC DEFAULT 0 CHECK (frequencia_percentual >= 0 AND frequencia_percentual <= 100),
  certificado_emitido BOOLEAN DEFAULT false,
  certificado_url TEXT,
  
  -- Metadados
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(pessoa_id, curso_id)
);

-- =============================================
-- 5. ADICIONANDO FOREIGN KEYS PENDENTES
-- =============================================

-- Adicionar referências em pessoas
ALTER TABLE public.pessoas 
ADD CONSTRAINT fk_pessoas_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
ADD CONSTRAINT fk_pessoas_celula FOREIGN KEY (celula_id) REFERENCES public.celulas(id);

-- Adicionar referências em células
ALTER TABLE public.celulas 
ADD CONSTRAINT fk_celulas_auxiliar FOREIGN KEY (auxiliar_id) REFERENCES public.pessoas(id),
ADD CONSTRAINT fk_celulas_anfitriao FOREIGN KEY (anfitriao_id) REFERENCES public.pessoas(id);

-- =============================================
-- 6. CRIANDO ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para pessoas
CREATE INDEX idx_pessoas_email ON public.pessoas(email);
CREATE INDEX idx_pessoas_tipo ON public.pessoas(tipo_pessoa);
CREATE INDEX idx_pessoas_situacao ON public.pessoas(situacao);
CREATE INDEX idx_pessoas_celula ON public.pessoas(celula_id);
CREATE INDEX idx_pessoas_profile ON public.pessoas(profile_id);

-- Índices para células
CREATE INDEX idx_celulas_lider ON public.celulas(lider_id);
CREATE INDEX idx_celulas_status ON public.celulas(status);
CREATE INDEX idx_celulas_dia_semana ON public.celulas(dia_semana);
CREATE INDEX idx_celulas_congregacao ON public.celulas(congregacao_id);

-- Índices para relatórios
CREATE INDEX idx_relatorios_celula ON public.relatorios_celula(celula_id);
CREATE INDEX idx_relatorios_data ON public.relatorios_celula(data_relatorio);
CREATE INDEX idx_relatorios_status ON public.relatorios_celula(status);

-- Índices para cursos e matrículas
CREATE INDEX idx_matriculas_pessoa ON public.matriculas(pessoa_id);
CREATE INDEX idx_matriculas_curso ON public.matriculas(curso_id);
CREATE INDEX idx_matriculas_status ON public.matriculas(status);

-- =============================================
-- 7. TRIGGERS PARA TIMESTAMPS
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER update_pessoas_updated_at
  BEFORE UPDATE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_celulas_updated_at
  BEFORE UPDATE ON public.celulas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relatorios_updated_at
  BEFORE UPDATE ON public.relatorios_celula
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matriculas_updated_at
  BEFORE UPDATE ON public.matriculas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. DADOS INICIAIS (SEEDS)
-- =============================================

-- Profiles básicos
INSERT INTO public.profiles (name, description, level) VALUES
('Administrador', 'Acesso total ao sistema', 5),
('Pastor', 'Gestão pastoral e supervisão', 4),
('Líder', 'Liderança de células e discipulado', 3),
('Auxiliar', 'Auxílio em células e ministérios', 2),
('Membro', 'Acesso básico do membro', 1);

-- Permissões básicas
INSERT INTO public.permissions (action, subject) VALUES
('manage', 'all'),
('read', 'pessoas'),
('create', 'pessoas'),
('update', 'pessoas'),
('delete', 'pessoas'),
('read', 'celulas'),
('create', 'celulas'),
('update', 'celulas'),
('delete', 'celulas'),
('read', 'cursos'),
('create', 'cursos'),
('update', 'cursos'),
('delete', 'cursos'),
('read', 'relatorios'),
('create', 'relatorios'),
('update', 'relatorios'),
('delete', 'relatorios');

-- Relacionar permissões aos profiles
-- Administrador: todas as permissões
INSERT INTO public.profile_permissions (profile_id, permission_id)
SELECT p.id, perm.id 
FROM public.profiles p
CROSS JOIN public.permissions perm
WHERE p.name = 'Administrador';

-- Pastor: quase todas as permissões
INSERT INTO public.profile_permissions (profile_id, permission_id)
SELECT p.id, perm.id 
FROM public.profiles p
CROSS JOIN public.permissions perm
WHERE p.name = 'Pastor' AND perm.action != 'manage';

-- Líder: permissões específicas
INSERT INTO public.profile_permissions (profile_id, permission_id)
SELECT p.id, perm.id 
FROM public.profiles p
CROSS JOIN public.permissions perm
WHERE p.name = 'Líder' 
AND (
  (perm.subject = 'celulas' AND perm.action IN ('read', 'update')) OR
  (perm.subject = 'relatorios' AND perm.action IN ('read', 'create', 'update')) OR
  (perm.subject = 'pessoas' AND perm.action IN ('read', 'update')) OR
  (perm.subject = 'cursos' AND perm.action = 'read')
);

-- Membro: apenas leitura
INSERT INTO public.profile_permissions (profile_id, permission_id)
SELECT p.id, perm.id 
FROM public.profiles p
CROSS JOIN public.permissions perm
WHERE p.name = 'Membro' AND perm.action = 'read';