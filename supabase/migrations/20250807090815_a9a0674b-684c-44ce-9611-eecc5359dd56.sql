-- KERIGMA HUB - Limpeza e Nova Arquitetura 
-- Removendo toda estrutura legada e criando arquitetura consolidada

-- =============================================
-- 1. LIMPEZA TOTAL (remover estrutura legada)
-- =============================================

-- Remover triggers primeiro
DROP TRIGGER IF EXISTS update_pessoas_updated_at ON public.pessoas;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_celulas_updated_at ON public.celulas;
DROP TRIGGER IF EXISTS update_relatorios_updated_at ON public.relatorios_celula;
DROP TRIGGER IF EXISTS update_cursos_updated_at ON public.cursos;
DROP TRIGGER IF EXISTS update_matriculas_updated_at ON public.matriculas;

-- Remover todas as tabelas existentes (CASCADE para remover dependências)
DROP TABLE IF EXISTS public.profile_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.relatorios_celula CASCADE;
DROP TABLE IF EXISTS public.matriculas CASCADE;
DROP TABLE IF EXISTS public.cursos CASCADE;
DROP TABLE IF EXISTS public.celulas CASCADE;
DROP TABLE IF EXISTS public.pessoas CASCADE;

-- Remover todas as outras tabelas legadas
DROP TABLE IF EXISTS public.acoes_permissao CASCADE;
DROP TABLE IF EXISTS public.agenda_eventos CASCADE;
DROP TABLE IF EXISTS public.alertas_ia CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.aulas CASCADE;
DROP TABLE IF EXISTS public.avaliacoes CASCADE;
DROP TABLE IF EXISTS public.avaliacoes_ensino CASCADE;
DROP TABLE IF EXISTS public.badges_ensino CASCADE;
DROP TABLE IF EXISTS public.bloqueios_academicos CASCADE;
DROP TABLE IF EXISTS public.campanhas_arrecadacao CASCADE;
DROP TABLE IF EXISTS public.categorias_conteudo CASCADE;
DROP TABLE IF EXISTS public.categorias_cursos CASCADE;
DROP TABLE IF EXISTS public.categorias_eventos CASCADE;
DROP TABLE IF EXISTS public.categorias_financeiras CASCADE;
DROP TABLE IF EXISTS public.categorias_galeria CASCADE;
DROP TABLE IF EXISTS public.categorias_patrimonio CASCADE;
DROP TABLE IF EXISTS public.celula_participantes CASCADE;
DROP TABLE IF EXISTS public.certificados CASCADE;
DROP TABLE IF EXISTS public.chat_pastoral CASCADE;
DROP TABLE IF EXISTS public.chatbot_conversas CASCADE;
DROP TABLE IF EXISTS public.chatbot_respostas_automaticas CASCADE;
DROP TABLE IF EXISTS public.chatbot_treinamentos CASCADE;
DROP TABLE IF EXISTS public.communication_channel_members CASCADE;
DROP TABLE IF EXISTS public.communication_channels CASCADE;
DROP TABLE IF EXISTS public.communication_messages CASCADE;
DROP TABLE IF EXISTS public.configuracoes_notificacoes CASCADE;
DROP TABLE IF EXISTS public.congregacoes CASCADE;
DROP TABLE IF EXISTS public.congregations CASCADE;
DROP TABLE IF EXISTS public.conquistas_ensino CASCADE;
DROP TABLE IF EXISTS public.contas_financeiras CASCADE;
DROP TABLE IF EXISTS public.contatos CASCADE;
DROP TABLE IF EXISTS public.conteudo_site CASCADE;
DROP TABLE IF EXISTS public.contribuicoes CASCADE;
DROP TABLE IF EXISTS public.cursos_ensino CASCADE;

-- Remover sequências e funções que possam estar interferindo
DROP SEQUENCE IF EXISTS seq_patrimonio CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =============================================
-- 2. TABELA CENTRAL DE PESSOAS
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
  profile_id UUID,
  celula_id UUID,
  congregacao_id UUID,
  
  -- Metadados
  observacoes TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 3. SISTEMA DE SEGURANÇA (RBAC) CONSOLIDADO
-- =============================================

-- Profiles (Perfis de usuário)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permissions (Permissões do sistema)
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  subject TEXT NOT NULL,
  resource_type TEXT,
  conditions JSONB DEFAULT '{}',
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
-- 4. MÓDULO DE CÉLULAS CONSOLIDADO
-- =============================================

-- Células (tabela única consolidada)
CREATE TABLE public.celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  endereco TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT,
  cep TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  dia_semana TEXT NOT NULL CHECK (dia_semana IN ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')),
  horario TIME NOT NULL,
  frequencia TEXT DEFAULT 'semanal' CHECK (frequencia IN ('semanal', 'quinzenal', 'mensal')),
  lider_id UUID REFERENCES public.pessoas(id),
  auxiliar_id UUID REFERENCES public.pessoas(id),
  anfitriao_id UUID REFERENCES public.pessoas(id),
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'multiplicando', 'multiplicada')),
  meta_membros INTEGER DEFAULT 15,
  meta_visitantes_mes INTEGER DEFAULT 2,
  meta_decisoes_mes INTEGER DEFAULT 1,
  celula_mae_id UUID REFERENCES public.celulas(id),
  data_multiplicacao DATE,
  geracao INTEGER DEFAULT 1,
  arvore_genealogica TEXT,
  rede_id UUID,
  congregacao_id UUID,
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
  presentes_membros INTEGER DEFAULT 0,
  presentes_visitantes INTEGER DEFAULT 0,
  total_presentes INTEGER GENERATED ALWAYS AS (presentes_membros + presentes_visitantes) STORED,
  decisoes INTEGER DEFAULT 0,
  ofertas NUMERIC DEFAULT 0,
  testemunhos TEXT,
  motivos_oracoes TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'enviado' CHECK (status IN ('rascunho', 'enviado', 'aprovado')),
  created_by UUID REFERENCES public.pessoas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(celula_id, data_relatorio)
);

-- =============================================
-- 5. MÓDULO DE ENSINO CONSOLIDADO
-- =============================================

-- Cursos (consolidado)
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT DEFAULT 'discipulado' CHECK (categoria IN ('discipulado', 'lideranca', 'teologia', 'ministerio')),
  nivel TEXT DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  carga_horaria INTEGER,
  pre_requisitos TEXT[],
  publico_alvo TEXT[],
  material_didatico JSONB DEFAULT '[]',
  emite_certificado BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Matrículas (consolidado)
CREATE TABLE public.matriculas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'matriculado' CHECK (status IN ('matriculado', 'cursando', 'concluido', 'cancelado', 'trancado')),
  data_matricula DATE DEFAULT CURRENT_DATE,
  data_inicio DATE,
  data_conclusao DATE,
  nota_final NUMERIC CHECK (nota_final >= 0 AND nota_final <= 10),
  frequencia_percentual NUMERIC DEFAULT 0 CHECK (frequencia_percentual >= 0 AND frequencia_percentual <= 100),
  certificado_emitido BOOLEAN DEFAULT false,
  certificado_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, curso_id)
);

-- =============================================
-- 6. ADICIONANDO FOREIGN KEYS
-- =============================================

ALTER TABLE public.pessoas 
ADD CONSTRAINT fk_pessoas_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
ADD CONSTRAINT fk_pessoas_celula FOREIGN KEY (celula_id) REFERENCES public.celulas(id);

-- =============================================
-- 7. CRIANDO ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_pessoas_email ON public.pessoas(email);
CREATE INDEX idx_pessoas_user_id ON public.pessoas(user_id);
CREATE INDEX idx_pessoas_tipo ON public.pessoas(tipo_pessoa);
CREATE INDEX idx_pessoas_situacao ON public.pessoas(situacao);
CREATE INDEX idx_pessoas_celula ON public.pessoas(celula_id);
CREATE INDEX idx_pessoas_profile ON public.pessoas(profile_id);

CREATE INDEX idx_celulas_lider ON public.celulas(lider_id);
CREATE INDEX idx_celulas_status ON public.celulas(status);
CREATE INDEX idx_celulas_dia_semana ON public.celulas(dia_semana);

CREATE INDEX idx_relatorios_celula ON public.relatorios_celula(celula_id);
CREATE INDEX idx_relatorios_data ON public.relatorios_celula(data_relatorio);
CREATE INDEX idx_relatorios_status ON public.relatorios_celula(status);

CREATE INDEX idx_matriculas_pessoa ON public.matriculas(pessoa_id);
CREATE INDEX idx_matriculas_curso ON public.matriculas(curso_id);
CREATE INDEX idx_matriculas_status ON public.matriculas(status);

-- =============================================
-- 8. TRIGGERS PARA TIMESTAMPS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- 9. DADOS INICIAIS (SEEDS)
-- =============================================

INSERT INTO public.profiles (name, description, level) VALUES
('Administrador', 'Acesso total ao sistema', 5),
('Pastor', 'Gestão pastoral e supervisão', 4),
('Líder', 'Liderança de células e discipulado', 3),
('Auxiliar', 'Auxílio em células e ministérios', 2),
('Membro', 'Acesso básico do membro', 1);

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