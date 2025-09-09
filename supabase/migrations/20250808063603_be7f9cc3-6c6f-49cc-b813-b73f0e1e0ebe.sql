-- Remover o trigger problemático existente
DROP TRIGGER IF EXISTS trigger_criar_familia_automatica ON pessoas;

-- Recriar a função criar_familia_automatica para ser executada BEFORE INSERT
-- Ela só cria a família e define o familia_id, sem criar o vínculo
CREATE OR REPLACE FUNCTION public.criar_familia_automatica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  nova_familia_id UUID;
  nome_familia TEXT;
BEGIN
  -- Se a pessoa não tem família e tem sobrenome, criar uma família
  IF NEW.familia_id IS NULL AND NEW.nome_completo IS NOT NULL THEN
    -- Extrair sobrenome (última palavra do nome)
    nome_familia := split_part(NEW.nome_completo, ' ', -1);
    
    IF nome_familia != '' AND nome_familia != NEW.nome_completo THEN
      nome_familia := 'Família ' || nome_familia;
      
      -- Criar nova família
      INSERT INTO public.familias (nome_familia, endereco, telefone_principal)
      VALUES (nome_familia, NEW.endereco, NEW.telefone)
      RETURNING id INTO nova_familia_id;
      
      -- Atualizar a pessoa com a família
      NEW.familia_id := nova_familia_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar novo trigger BEFORE INSERT
CREATE TRIGGER trigger_criar_familia_automatica
    BEFORE INSERT ON pessoas
    FOR EACH ROW
    EXECUTE FUNCTION criar_familia_automatica();

-- Criar função para criar vínculo familiar AFTER INSERT
CREATE OR REPLACE FUNCTION public.criar_vinculo_familiar_automatico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Se a pessoa tem família, criar vínculo familiar automaticamente
  IF NEW.familia_id IS NOT NULL THEN
    -- Verificar se já existe vínculo para evitar duplicatas
    IF NOT EXISTS (
      SELECT 1 FROM public.vinculos_familiares 
      WHERE familia_id = NEW.familia_id AND pessoa_id = NEW.id
    ) THEN
      INSERT INTO public.vinculos_familiares (familia_id, pessoa_id, tipo_vinculo, responsavel_familiar)
      VALUES (NEW.familia_id, NEW.id, 'responsavel', true)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger AFTER INSERT para criar vínculo familiar
CREATE TRIGGER trigger_criar_vinculo_familiar_automatico
    AFTER INSERT ON pessoas
    FOR EACH ROW
    EXECUTE FUNCTION criar_vinculo_familiar_automatico();