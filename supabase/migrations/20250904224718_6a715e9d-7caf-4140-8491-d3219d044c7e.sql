-- Tabela central para todas as notificações do sistema
CREATE TABLE public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- Ex: 'convocacao_louvor', 'novo_comunicado'
    titulo TEXT NOT NULL,
    mensagem TEXT,
    lida BOOLEAN NOT NULL DEFAULT false,
    metadata_json JSONB, -- Para guardar IDs relacionados, ex: { "evento_id": "...", "escala_membro_id": "..." }
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notificacoes IS 'Armazena as notificações no-app para os usuários.';

-- Segurança: Um usuário só pode ver as suas próprias notificações.
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem acessar apenas suas próprias notificações"
ON public.notificacoes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar suas notificações como lidas"
ON public.notificacoes FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir inserção de notificações pelo sistema
CREATE POLICY "Sistema pode inserir notificações"
ON public.notificacoes FOR INSERT WITH CHECK (true);