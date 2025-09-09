-- Criar tabela para doações no mural
CREATE TABLE public.mural_doacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doador_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'outros',
  fotos_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'doado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  church_id UUID
);

-- Criar tabela para pedidos de ajuda confidenciais
CREATE TABLE public.mural_pedidos_ajuda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitante_id UUID NOT NULL,
  descricao_necessidade TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'outros',
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_atendimento', 'atendido')),
  atendido_por_diacono_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  church_id UUID,
  observacoes_diaconia TEXT,
  publicado_anonimamente BOOLEAN DEFAULT FALSE
);

-- Criar tabela para interessados em doações
CREATE TABLE public.mural_interessados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doacao_id UUID NOT NULL REFERENCES public.mural_doacoes(id) ON DELETE CASCADE,
  interessado_id UUID NOT NULL,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  church_id UUID,
  UNIQUE(doacao_id, interessado_id)
);

-- Habilitar RLS
ALTER TABLE public.mural_doacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mural_pedidos_ajuda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mural_interessados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mural_doacoes
CREATE POLICY "Todos podem ver doações disponíveis" 
ON public.mural_doacoes 
FOR SELECT 
USING (status IN ('disponivel', 'reservado'));

CREATE POLICY "Doadores podem gerenciar suas doações" 
ON public.mural_doacoes 
FOR ALL 
USING (doador_id = get_current_person_id());

CREATE POLICY "Membros podem criar doações" 
ON public.mural_doacoes 
FOR INSERT 
WITH CHECK (doador_id = get_current_person_id());

-- Políticas RLS para mural_pedidos_ajuda
CREATE POLICY "Solicitantes podem ver próprios pedidos" 
ON public.mural_pedidos_ajuda 
FOR SELECT 
USING (solicitante_id = get_current_person_id());

CREATE POLICY "Diaconia pode gerenciar pedidos de ajuda" 
ON public.mural_pedidos_ajuda 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'diaconia'));

CREATE POLICY "Membros podem criar pedidos de ajuda" 
ON public.mural_pedidos_ajuda 
FOR INSERT 
WITH CHECK (solicitante_id = get_current_person_id());

-- Políticas RLS para mural_interessados
CREATE POLICY "Interessados podem ver próprios interesses" 
ON public.mural_interessados 
FOR SELECT 
USING (interessado_id = get_current_person_id());

CREATE POLICY "Doadores podem ver interessados em suas doações" 
ON public.mural_interessados 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.mural_doacoes 
  WHERE id = mural_interessados.doacao_id 
  AND doador_id = get_current_person_id()
));

CREATE POLICY "Membros podem demonstrar interesse" 
ON public.mural_interessados 
FOR INSERT 
WITH CHECK (interessado_id = get_current_person_id());

CREATE POLICY "Interessados podem atualizar próprios interesses" 
ON public.mural_interessados 
FOR UPDATE 
USING (interessado_id = get_current_person_id());

CREATE POLICY "Doadores podem gerenciar interessados" 
ON public.mural_interessados 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.mural_doacoes 
  WHERE id = mural_interessados.doacao_id 
  AND doador_id = get_current_person_id()
));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_mural_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mural_doacoes_updated_at
  BEFORE UPDATE ON public.mural_doacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mural_updated_at();

CREATE TRIGGER update_mural_pedidos_ajuda_updated_at
  BEFORE UPDATE ON public.mural_pedidos_ajuda
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mural_updated_at();

-- Função para obter current_person_id se não existir
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.pessoas 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;