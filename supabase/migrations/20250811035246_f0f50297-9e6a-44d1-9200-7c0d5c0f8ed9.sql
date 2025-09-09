-- Verificar se tabelas já existem e criar apenas as que faltam
DO $$ 
BEGIN
    -- Criar enum se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_confirmacao_escala') THEN
        CREATE TYPE public.status_confirmacao_escala AS ENUM ('Convidado', 'Confirmado', 'Recusado');
    END IF;

    -- Criar tabela ministerio_funcoes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ministerio_funcoes') THEN
        CREATE TABLE public.ministerio_funcoes (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
            nome_funcao TEXT NOT NULL,
            descricao TEXT,
            nivel_experiencia TEXT DEFAULT 'iniciante',
            ativo BOOLEAN NOT NULL DEFAULT true,
            ordem INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(ministerio_id, nome_funcao)
        );
        
        ALTER TABLE public.ministerio_funcoes ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Criar tabela ministerio_membros se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ministerio_membros') THEN
        CREATE TABLE public.ministerio_membros (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
            ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
            funcoes UUID[] DEFAULT '{}',
            nivel_competencia TEXT DEFAULT 'iniciante',
            data_ingresso DATE DEFAULT CURRENT_DATE,
            ativo BOOLEAN NOT NULL DEFAULT true,
            observacoes TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(pessoa_id, ministerio_id)
        );
        
        ALTER TABLE public.ministerio_membros ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Criar tabela escalas_ministerio se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escalas_ministerio') THEN
        CREATE TABLE public.escalas_ministerio (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
            ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
            titulo TEXT NOT NULL,
            descricao TEXT,
            data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
            local TEXT,
            status TEXT DEFAULT 'planejada',
            criado_por UUID REFERENCES public.pessoas(id),
            instrucoes_especiais TEXT,
            materiais_necessarios JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.escalas_ministerio ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Criar tabela escala_participantes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escala_participantes') THEN
        CREATE TABLE public.escala_participantes (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            escala_id UUID NOT NULL REFERENCES public.escalas_ministerio(id) ON DELETE CASCADE,
            membro_id UUID NOT NULL REFERENCES public.ministerio_membros(id) ON DELETE CASCADE,
            funcao_escalada_id UUID REFERENCES public.ministerio_funcoes(id),
            status_confirmacao public.status_confirmacao_escala DEFAULT 'Convidado',
            data_convite TIMESTAMP WITH TIME ZONE DEFAULT now(),
            data_resposta TIMESTAMP WITH TIME ZONE,
            observacoes TEXT,
            substituido_por UUID REFERENCES public.ministerio_membros(id),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(escala_id, membro_id, funcao_escalada_id)
        );
        
        ALTER TABLE public.escala_participantes ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Criar tabela convites_ministerio se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'convites_ministerio') THEN
        CREATE TABLE public.convites_ministerio (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
            email_convidado TEXT NOT NULL,
            token_convite TEXT NOT NULL UNIQUE,
            enviado_por UUID NOT NULL REFERENCES public.pessoas(id),
            funcoes_sugeridas UUID[] DEFAULT '{}',
            mensagem_personalizada TEXT,
            data_convite TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
            usado BOOLEAN DEFAULT false,
            usado_em TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.convites_ministerio ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;