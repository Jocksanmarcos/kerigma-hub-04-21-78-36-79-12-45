-- === ETAPA 1: ADICIONAR NOVOS CAMPOS À TABELA DE PERFIS EXISTENTE ===

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS data_batismo DATE,
ADD COLUMN IF NOT EXISTS data_membresia DATE,
ADD COLUMN IF NOT EXISTS dons_talentos TEXT[]; -- Usando um array de texto para tags

COMMENT ON COLUMN public.profiles.dons_talentos IS 'Armazena uma lista de dons e talentos do membro, ex: {"Música", "Ensino"}.';


-- === ETAPA 2: CRIAR A NOVA TABELA PARA RELACIONAMENTOS FAMILIARES ===

CREATE TABLE IF NOT EXISTS public.relacionamentos_familiares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pessoa2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo_relacionamento TEXT NOT NULL, -- Ex: 'Cônjuge', 'Pai/Filho', 'Irmão(ã)'
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  -- Garante que um relacionamento entre duas pessoas seja único
  UNIQUE(pessoa1_id, pessoa2_id)
);

COMMENT ON TABLE public.relacionamentos_familiares IS 'Mapeia as conexões familiares entre os membros (Árvore Genealógica).';

ALTER TABLE public.relacionamentos_familiares ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflitos
DROP POLICY IF EXISTS "Membros autenticados podem ver relacionamentos" ON public.relacionamentos_familiares;
DROP POLICY IF EXISTS "Admins podem gerenciar relacionamentos" ON public.relacionamentos_familiares;

-- Criar novas políticas
CREATE POLICY "Membros autenticados podem ver relacionamentos" 
ON public.relacionamentos_familiares 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem gerenciar relacionamentos" 
ON public.relacionamentos_familiares 
FOR ALL 
USING ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'administrador');


-- === ETAPA 3: CRIAR A NOVA TABELA PARA NOTAS PASTORAIS CONFIDENCIAIS ===

CREATE TABLE IF NOT EXISTS public.notas_pastorais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pastor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notas_pastorais IS 'Armazena notas pastorais confidenciais sobre os membros.';

ALTER TABLE public.notas_pastorais ENABLE ROW LEVEL SECURITY;

-- Remover política existente se houver conflitos
DROP POLICY IF EXISTS "Acesso restrito a notas pastorais" ON public.notas_pastorais;

-- Criar política de segurança EXTREMAMENTE RESTRITA:
-- Apenas o pastor que criou a nota ou um admin podem vê-la. O próprio membro não pode ver.
CREATE POLICY "Acesso restrito a notas pastorais"
ON public.notas_pastorais
FOR ALL
USING (auth.uid() = pastor_id OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'administrador');