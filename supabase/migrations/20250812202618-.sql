-- =============================================================
-- MIGRAÇÃO: ATIVAÇÃO COMPLETA DO STUDIO DE PRODUÇÃO DE CULTOS
-- =============================================================

-- Verificar e criar tabela de músicas do louvor se não existir
CREATE TABLE IF NOT EXISTS public.louvor_musicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  artista TEXT,
  compositor TEXT,
  categoria TEXT NOT NULL DEFAULT 'adoracao',
  bpm INTEGER,
  tonalidade TEXT,
  letra TEXT,
  link_audio_youtube TEXT,
  link_cifra_pdf TEXT,
  observacoes TEXT,
  tags TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_louvor_musicas_categoria ON public.louvor_musicas(categoria);
CREATE INDEX IF NOT EXISTS idx_louvor_musicas_ativa ON public.louvor_musicas(ativa);
CREATE INDEX IF NOT EXISTS idx_louvor_musicas_titulo ON public.louvor_musicas(titulo);

-- Verificar e criar tabela de presets de ambiente se não existir
CREATE TABLE IF NOT EXISTS public.louvor_presets_ambiente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_preset TEXT NOT NULL,
  tonalidade_base TEXT DEFAULT 'C',
  bpm INTEGER DEFAULT 72,
  volume_pad INTEGER DEFAULT 50,
  volume_pratos INTEGER DEFAULT 25,
  volume_bumbo INTEGER DEFAULT 35,
  volume_vocoder INTEGER DEFAULT 20,
  configuracao_json JSONB DEFAULT '{}',
  tipo_preset TEXT DEFAULT 'geral',
  descricao TEXT,
  publico BOOLEAN DEFAULT false,
  criado_por UUID REFERENCES auth.users(id),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índices para presets
CREATE INDEX IF NOT EXISTS idx_presets_ambiente_tipo ON public.louvor_presets_ambiente(tipo_preset);
CREATE INDEX IF NOT EXISTS idx_presets_ambiente_publico ON public.louvor_presets_ambiente(publico);

-- Verificar e criar tabela para histórico de serviços
CREATE TABLE IF NOT EXISTS public.historico_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  funcao_id UUID REFERENCES public.funcoes_equipa(id),
  data_servico DATE NOT NULL,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índices para histórico
CREATE INDEX IF NOT EXISTS idx_historico_pessoa_funcao ON public.historico_servicos(pessoa_id, funcao_id);
CREATE INDEX IF NOT EXISTS idx_historico_data_servico ON public.historico_servicos(data_servico);

-- Verificar e criar tabela de notificações de escala
CREATE TABLE IF NOT EXISTS public.notificacoes_escala (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_servico_id UUID NOT NULL REFERENCES public.escalas_servico(id) ON DELETE CASCADE,
  tipo_notificacao TEXT NOT NULL DEFAULT 'convite',
  conteudo_mensagem TEXT NOT NULL,
  metodo_envio TEXT NOT NULL DEFAULT 'app',
  enviado BOOLEAN NOT NULL DEFAULT false,
  data_envio TIMESTAMPTZ,
  tentativas_envio INTEGER DEFAULT 0,
  erro_envio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_escala_enviado ON public.notificacoes_escala(enviado);
CREATE INDEX IF NOT EXISTS idx_notificacoes_escala_tipo ON public.notificacoes_escala(tipo_notificacao);

-- Verificar se existe enum confirmation_status e criar se necessário
DO $$ BEGIN
    CREATE TYPE confirmation_status AS ENUM (
        'Convidado',
        'Confirmado', 
        'Recusado',
        'Disponível para Troca'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Garantir que a tabela escalas_servico tem a estrutura correta
ALTER TABLE public.escalas_servico 
  ALTER COLUMN status_confirmacao TYPE confirmation_status USING status_confirmacao::confirmation_status;

-- Verificar e adicionar colunas em falta na tabela escalas_servico
ALTER TABLE public.escalas_servico 
  ADD COLUMN IF NOT EXISTS resultado_presenca TEXT CHECK (resultado_presenca IN ('presente', 'falta', 'justificado')),
  ADD COLUMN IF NOT EXISTS presenca_registrada_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS funcao_id UUID REFERENCES public.funcoes_equipa(id);

-- Triggers para atualização automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de updated_at nas tabelas
DROP TRIGGER IF EXISTS update_louvor_musicas_updated_at ON public.louvor_musicas;
CREATE TRIGGER update_louvor_musicas_updated_at
  BEFORE UPDATE ON public.louvor_musicas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_presets_ambiente_updated_at ON public.louvor_presets_ambiente;
CREATE TRIGGER update_presets_ambiente_updated_at
  BEFORE UPDATE ON public.louvor_presets_ambiente
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- POLÍTICAS RLS PARA SEGURANÇA
-- =============================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.louvor_musicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.louvor_presets_ambiente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_escala ENABLE ROW LEVEL SECURITY;

-- Políticas para louvor_musicas
DROP POLICY IF EXISTS "Músicas visíveis para todos" ON public.louvor_musicas;
CREATE POLICY "Músicas visíveis para todos" ON public.louvor_musicas
  FOR SELECT USING (ativa = true);

DROP POLICY IF EXISTS "Líderes podem gerenciar músicas" ON public.louvor_musicas;
CREATE POLICY "Líderes podem gerenciar músicas" ON public.louvor_musicas
  FOR ALL USING (is_admin() OR user_has_permission('manage', 'louvor'));

-- Políticas para presets de ambiente
DROP POLICY IF EXISTS "Presets públicos visíveis" ON public.louvor_presets_ambiente;
CREATE POLICY "Presets públicos visíveis" ON public.louvor_presets_ambiente
  FOR SELECT USING (publico = true OR criado_por = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Líderes podem gerenciar presets" ON public.louvor_presets_ambiente;
CREATE POLICY "Líderes podem gerenciar presets" ON public.louvor_presets_ambiente
  FOR ALL USING (is_admin() OR user_has_permission('manage', 'louvor'));

-- Políticas para histórico de serviços
DROP POLICY IF EXISTS "Histórico visível para líderes" ON public.historico_servicos;
CREATE POLICY "Histórico visível para líderes" ON public.historico_servicos
  FOR SELECT USING (
    is_admin() OR 
    user_has_permission('read', 'escalas') OR
    pessoa_id = get_current_person_id()
  );

DROP POLICY IF EXISTS "Sistema pode criar histórico" ON public.historico_servicos;
CREATE POLICY "Sistema pode criar histórico" ON public.historico_servicos
  FOR INSERT WITH CHECK (true);

-- Políticas para notificações de escala
DROP POLICY IF EXISTS "Notificações visíveis para líderes" ON public.notificacoes_escala;
CREATE POLICY "Notificações visíveis para líderes" ON public.notificacoes_escala
  FOR SELECT USING (
    is_admin() OR 
    user_has_permission('manage', 'escalas') OR
    EXISTS (
      SELECT 1 FROM escalas_servico es 
      WHERE es.id = escala_servico_id AND es.pessoa_id = get_current_person_id()
    )
  );

DROP POLICY IF EXISTS "Líderes podem gerenciar notificações" ON public.notificacoes_escala;
CREATE POLICY "Líderes podem gerenciar notificações" ON public.notificacoes_escala
  FOR ALL USING (is_admin() OR user_has_permission('manage', 'escalas'));

-- =============================================================
-- INSERIR DADOS PADRÃO PARA FUNCIONALIDADE COMPLETA
-- =============================================================

-- Inserir categorias musicais padrão se não existirem
INSERT INTO public.louvor_musicas (titulo, artista, categoria, tonalidade, bpm, tags, letra, created_by)
SELECT 
  'Grande é o Senhor',
  'Ministério Vineyard',
  'adoracao',
  'G',
  72,
  'adoração, clássico, congregacional',
  'Grande é o Senhor e mui digno de ser louvado
Na cidade do nosso Deus, no seu santo monte
Formoso de situação, a alegria de toda terra...',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.louvor_musicas WHERE titulo = 'Grande é o Senhor');

-- Inserir presets de ambiente padrão
INSERT INTO public.louvor_presets_ambiente (
  nome_preset, tonalidade_base, bpm, volume_pad, volume_pratos, volume_bumbo, volume_vocoder,
  tipo_preset, descricao, publico, configuracao_json
)
SELECT 
  'Entrada Suave',
  'C',
  65,
  70,
  20,
  10,
  40,
  'entrada',
  'Ambiente suave para recepção e entrada dos fiéis',
  true,
  '{"layers": [{"nome": "Pad Strings", "volume": 0.7}, {"nome": "Piano Ambiente", "volume": 0.4}]}'
WHERE NOT EXISTS (SELECT 1 FROM public.louvor_presets_ambiente WHERE nome_preset = 'Entrada Suave');

INSERT INTO public.louvor_presets_ambiente (
  nome_preset, tonalidade_base, bpm, volume_pad, volume_pratos, volume_bumbo, volume_vocoder,
  tipo_preset, descricao, publico, configuracao_json
)
SELECT 
  'Adoração Intensa',
  'D',
  85,
  90,
  60,
  70,
  30,
  'adoracao',
  'Ambiente para momentos de adoração profunda',
  true,
  '{"layers": [{"nome": "Strings Épicos", "volume": 0.9}, {"nome": "Chuva de Reverb", "volume": 0.6}]}'
WHERE NOT EXISTS (SELECT 1 FROM public.louvor_presets_ambiente WHERE nome_preset = 'Adoração Intensa');

-- =============================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================================

COMMENT ON TABLE public.louvor_musicas IS 'Biblioteca musical completa para o ministério de louvor';
COMMENT ON TABLE public.louvor_presets_ambiente IS 'Presets de ambientação sonora para diferentes momentos do culto';
COMMENT ON TABLE public.historico_servicos IS 'Histórico de participação em escalas ministeriais';
COMMENT ON TABLE public.notificacoes_escala IS 'Sistema de notificações para escalas de serviço';

COMMENT ON COLUMN public.louvor_musicas.categoria IS 'Categorias: adoracao, louvor, entrega, comunhao';
COMMENT ON COLUMN public.louvor_presets_ambiente.tipo_preset IS 'Tipos: geral, entrada, adoracao, ofertorio, saida';
COMMENT ON COLUMN public.escalas_servico.resultado_presenca IS 'Resultado da presença: presente, falta, justificado';

-- Finalizar migração
SELECT 'Studio de Produção de Cultos ativado com sucesso!' as resultado;