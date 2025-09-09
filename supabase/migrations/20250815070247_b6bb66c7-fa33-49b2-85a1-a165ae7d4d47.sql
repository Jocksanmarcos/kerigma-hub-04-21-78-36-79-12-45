-- Criar tabela de doações
CREATE TABLE public.doacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundo_id UUID REFERENCES public.fundos_contabeis(id),
  nome_fundo TEXT NOT NULL,
  nome_doador TEXT NOT NULL,
  email_doador TEXT NOT NULL,
  mensagem TEXT,
  valor NUMERIC NOT NULL,
  moeda TEXT DEFAULT 'BRL',
  payment_id TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending',
  metodo_pagamento TEXT DEFAULT 'mercado_pago',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.doacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem gerenciar doações" 
ON public.doacoes 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Usuários podem ver próprias doações" 
ON public.doacoes 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir doações" 
ON public.doacoes 
FOR INSERT 
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_doacoes_updated_at
BEFORE UPDATE ON public.doacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();