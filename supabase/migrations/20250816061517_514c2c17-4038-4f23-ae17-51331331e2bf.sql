-- ETAPA 1: ESTRUTURAÇÃO DA BASE DE DADOS MULTI-IGREJA

-- Criar tabela de igrejas
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  cnpj TEXT,
  type TEXT NOT NULL DEFAULT 'missao' CHECK (type IN ('sede', 'missao')),
  parent_church_id UUID REFERENCES public.churches(id),
  pastor_responsavel TEXT,
  data_fundacao DATE,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar enum para roles do sistema (usando DO block para verificar existência)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'church_role') THEN
    CREATE TYPE church_role AS ENUM (
      'super_admin',
      'pastor', 
      'tesoureiro',
      'lider_celula',
      'secretario',
      'membro'
    );
  END IF;
END $$;

-- Criar tabela de roles de usuários por igreja
CREATE TABLE IF NOT EXISTS public.user_church_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  role church_role NOT NULL DEFAULT 'membro',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, church_id, role)
);

-- Inserir igreja sede padrão
INSERT INTO public.churches (id, name, type, address, email) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Igreja Sede - CBN Kerigma',
  'sede',
  'Endereço da Sede',
  'sede@cbnkerigma.com.br'
) ON CONFLICT (id) DO NOTHING;

-- Adicionar church_id às tabelas existentes
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.celulas ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.lancamentos_financeiros_v2 ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.patrimonio ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- Atualizar dados existentes para referenciar a sede
UPDATE public.pessoas SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE public.celulas SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE public.lancamentos_financeiros_v2 SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;