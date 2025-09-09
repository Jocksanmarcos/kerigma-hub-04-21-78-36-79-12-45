-- Criar tabela de famílias
CREATE TABLE public.familias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_familia TEXT NOT NULL,
  endereco TEXT,
  telefone_principal TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vínculos familiares
CREATE TABLE public.vinculos_familiares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  familia_id UUID NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo_vinculo TEXT NOT NULL DEFAULT 'membro', -- pai, mae, filho, conjuge, irmao, etc
  responsavel_familiar BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id) -- Uma pessoa só pode estar em uma família
);

-- Adicionar coluna família na tabela pessoas para referência rápida
ALTER TABLE public.pessoas ADD COLUMN familia_id UUID REFERENCES public.familias(id);

-- Criar índices para performance
CREATE INDEX idx_vinculos_familiares_familia_id ON public.vinculos_familiares(familia_id);
CREATE INDEX idx_vinculos_familiares_pessoa_id ON public.vinculos_familiares(pessoa_id);
CREATE INDEX idx_pessoas_familia_id ON public.pessoas(familia_id);

-- Enable RLS
ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinculos_familiares ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para famílias
CREATE POLICY "Usuários podem ver famílias relacionadas" 
ON public.familias 
FOR SELECT 
USING (
  is_admin() OR 
  user_has_permission('read', 'familias') OR 
  EXISTS (
    SELECT 1 FROM public.vinculos_familiares vf 
    JOIN public.pessoas p ON p.id = vf.pessoa_id 
    WHERE vf.familia_id = familias.id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem gerenciar famílias" 
ON public.familias 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'familias'))
WITH CHECK (is_admin() OR user_has_permission('manage', 'familias'));

-- Políticas RLS para vínculos familiares
CREATE POLICY "Usuários podem ver vínculos de suas famílias" 
ON public.vinculos_familiares 
FOR SELECT 
USING (
  is_admin() OR 
  user_has_permission('read', 'vinculos_familiares') OR 
  EXISTS (
    SELECT 1 FROM public.pessoas p 
    WHERE p.id = vinculos_familiares.pessoa_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.vinculos_familiares vf2 
    JOIN public.pessoas p2 ON p2.id = vf2.pessoa_id 
    WHERE vf2.familia_id = vinculos_familiares.familia_id AND p2.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem gerenciar vínculos familiares" 
ON public.vinculos_familiares 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'vinculos_familiares'))
WITH CHECK (is_admin() OR user_has_permission('manage', 'vinculos_familiares'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_familias_updated_at
  BEFORE UPDATE ON public.familias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vinculos_familiares_updated_at
  BEFORE UPDATE ON public.vinculos_familiares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar família automaticamente
CREATE OR REPLACE FUNCTION public.criar_familia_automatica()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  nova_familia_id UUID;
  nome_familia TEXT;
BEGIN
  -- Se a pessoa não tem família e tem sobrenome, criar uma família
  IF NEW.familia_id IS NULL AND NEW.nome_completo IS NOT NULL THEN
    -- Extrair sobrenome (última palavra do nome)
    nome_familia := split_part(NEW.nome_completo, ' ', -1);
    
    IF nome_familia != '' THEN
      nome_familia := 'Família ' || nome_familia;
      
      -- Criar nova família
      INSERT INTO public.familias (nome_familia, endereco, telefone_principal)
      VALUES (nome_familia, NEW.endereco, NEW.telefone)
      RETURNING id INTO nova_familia_id;
      
      -- Atualizar a pessoa com a família
      NEW.familia_id := nova_familia_id;
      
      -- Criar vínculo familiar
      INSERT INTO public.vinculos_familiares (familia_id, pessoa_id, tipo_vinculo, responsavel_familiar)
      VALUES (nova_familia_id, NEW.id, 'responsavel', true);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar família automaticamente
CREATE TRIGGER trigger_criar_familia_automatica
  BEFORE INSERT ON public.pessoas
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_familia_automatica();

-- Função para obter estatísticas de famílias
CREATE OR REPLACE FUNCTION public.obter_estatisticas_familias()
RETURNS TABLE(
  total_familias BIGINT,
  familias_com_criancas BIGINT,
  familias_monoparentais BIGINT,
  media_membros_por_familia NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.familias)::BIGINT,
    (SELECT COUNT(DISTINCT f.id) 
     FROM public.familias f 
     JOIN public.vinculos_familiares vf ON f.id = vf.familia_id 
     JOIN public.pessoas p ON vf.pessoa_id = p.id 
     WHERE p.data_nascimento IS NOT NULL 
     AND EXTRACT(YEAR FROM AGE(p.data_nascimento)) < 18)::BIGINT,
    (SELECT COUNT(DISTINCT f.id) 
     FROM public.familias f 
     JOIN public.vinculos_familiares vf ON f.id = vf.familia_id 
     WHERE vf.tipo_vinculo IN ('pai', 'mae')
     GROUP BY f.id 
     HAVING COUNT(*) = 1)::BIGINT,
    (SELECT ROUND(AVG(membro_count), 2) 
     FROM (
       SELECT COUNT(*) as membro_count 
       FROM public.vinculos_familiares 
       GROUP BY familia_id
     ) as familia_sizes);
END;
$$;