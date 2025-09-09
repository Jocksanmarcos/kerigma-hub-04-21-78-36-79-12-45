-- ETAPA 1: FUNDAÇÃO NA BASE DE DADOS
-- Verificar e ajustar tabela culto_planos
ALTER TABLE public.culto_planos 
ADD COLUMN IF NOT EXISTS dirigente_id UUID REFERENCES public.pessoas(id),
ADD COLUMN IF NOT EXISTS pregador_id UUID REFERENCES public.pessoas(id);

-- Criar tabela de músicas para o louvor
CREATE TABLE IF NOT EXISTS public.louvor_musicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  artista TEXT,
  album TEXT,
  ano_lancamento INTEGER,
  genero TEXT,
  tonalidade_original TEXT,
  tempo_bpm INTEGER,
  duracao_segundos INTEGER,
  letra TEXT,
  cifra TEXT,
  arquivo_audio_url TEXT,
  arquivo_partitura_url TEXT,
  tags TEXT[],
  categoria TEXT DEFAULT 'adoracao',
  nivel_dificuldade TEXT DEFAULT 'intermediario',
  aprovado_para_uso BOOLEAN DEFAULT false,
  aprovado_por UUID REFERENCES public.pessoas(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  criado_por UUID REFERENCES public.pessoas(id),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de presets de ambiente sonoro
CREATE TABLE IF NOT EXISTS public.louvor_presets_ambiente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  configuracao_json JSONB NOT NULL DEFAULT '{}',
  tipo_preset TEXT DEFAULT 'geral', -- geral, entrada, adoracao, ofertorio, saida
  criado_por UUID REFERENCES public.pessoas(id),
  publico BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_louvor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_louvor_musicas_updated_at
  BEFORE UPDATE ON public.louvor_musicas
  FOR EACH ROW
  EXECUTE FUNCTION update_louvor_updated_at();

CREATE TRIGGER update_louvor_presets_updated_at
  BEFORE UPDATE ON public.louvor_presets_ambiente
  FOR EACH ROW
  EXECUTE FUNCTION update_louvor_updated_at();

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.louvor_musicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.louvor_presets_ambiente ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para músicas
CREATE POLICY "Líderes podem gerenciar músicas" ON public.louvor_musicas
  FOR ALL USING (is_admin() OR user_has_permission('manage', 'louvor'));

CREATE POLICY "Músicos podem ver músicas aprovadas" ON public.louvor_musicas
  FOR SELECT USING (aprovado_para_uso = true OR is_admin() OR user_has_permission('read', 'louvor'));

-- Políticas RLS para presets
CREATE POLICY "Usuários podem gerenciar próprios presets" ON public.louvor_presets_ambiente
  FOR ALL USING (criado_por = get_current_person_id() OR is_admin());

CREATE POLICY "Presets públicos são visíveis" ON public.louvor_presets_ambiente
  FOR SELECT USING (publico = true OR criado_por = get_current_person_id() OR is_admin());