-- Criar tabelas de patrimônio se não existirem
DO $$ 
BEGIN
  -- Criar tabela patrimonios se não existir
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'patrimonios') THEN
    CREATE TABLE public.patrimonios (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      codigo_patrimonio TEXT UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria_id UUID,
      valor_aquisicao NUMERIC DEFAULT 0,
      valor_atual NUMERIC DEFAULT 0,
      valor_total NUMERIC GENERATED ALWAYS AS (COALESCE(valor_aquisicao, 0)) STORED,
      data_aquisicao DATE,
      fornecedor TEXT,
      numero_nota_fiscal TEXT,
      localizacao_atual TEXT,
      responsavel_id UUID,
      status TEXT DEFAULT 'ativo',
      observacoes TEXT,
      foto_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Criar trigger para gerar código automático
    CREATE OR REPLACE FUNCTION gerar_codigo_patrimonio()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.codigo_patrimonio IS NULL THEN
        NEW.codigo_patrimonio := 'PAT' || LPAD(nextval('seq_patrimonio')::text, 6, '0');
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Criar sequência se não existir
    CREATE SEQUENCE IF NOT EXISTS seq_patrimonio START 1;

    -- Criar trigger
    CREATE TRIGGER trigger_gerar_codigo_patrimonio
      BEFORE INSERT ON public.patrimonios
      FOR EACH ROW
      EXECUTE FUNCTION gerar_codigo_patrimonio();

    -- Trigger para updated_at
    CREATE TRIGGER set_updated_at_patrimonios
      BEFORE UPDATE ON public.patrimonios
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Habilitar RLS
    ALTER TABLE public.patrimonios ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Patrimônios podem ser vistos por usuários autenticados"
      ON public.patrimonios FOR SELECT
      USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Admins podem gerenciar patrimônios"
      ON public.patrimonios FOR ALL
      USING (is_admin() OR user_has_permission('manage', 'patrimonio'))
      WITH CHECK (is_admin() OR user_has_permission('manage', 'patrimonio'));
  END IF;

  -- Criar tabela categorias_patrimonio se não existir
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categorias_patrimonio') THEN
    CREATE TABLE public.categorias_patrimonio (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativa BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Habilitar RLS
    ALTER TABLE public.categorias_patrimonio ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Categorias podem ser vistas por usuários autenticados"
      ON public.categorias_patrimonio FOR SELECT
      USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Admins podem gerenciar categorias"
      ON public.categorias_patrimonio FOR ALL
      USING (is_admin() OR user_has_permission('manage', 'patrimonio'))
      WITH CHECK (is_admin() OR user_has_permission('manage', 'patrimonio'));
  END IF;

  -- Criar tabela patrimonio_reservas se não existir
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'patrimonio_reservas') THEN
    CREATE TABLE public.patrimonio_reservas (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      patrimonio_id UUID NOT NULL,
      solicitante_id UUID NOT NULL,
      inicio TIMESTAMPTZ NOT NULL,
      fim TIMESTAMPTZ NOT NULL,
      finalidade TEXT,
      status TEXT DEFAULT 'reservado',
      observacoes TEXT,
      aprovado_por UUID,
      data_aprovacao TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Trigger para updated_at
    CREATE TRIGGER set_updated_at_patrimonio_reservas
      BEFORE UPDATE ON public.patrimonio_reservas
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Habilitar RLS
    ALTER TABLE public.patrimonio_reservas ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Reservas podem ser vistas por usuários autenticados"
      ON public.patrimonio_reservas FOR SELECT
      USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Usuários podem criar reservas próprias"
      ON public.patrimonio_reservas FOR INSERT
      WITH CHECK (auth.uid() = solicitante_id);

    CREATE POLICY "Admins podem gerenciar todas as reservas"
      ON public.patrimonio_reservas FOR ALL
      USING (is_admin() OR user_has_permission('manage', 'patrimonio'))
      WITH CHECK (is_admin() OR user_has_permission('manage', 'patrimonio'));
  END IF;

  -- Criar tabela historico_patrimonio se não existir
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'historico_patrimonio') THEN
    CREATE TABLE public.historico_patrimonio (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      patrimonio_id UUID NOT NULL,
      tipo_evento TEXT NOT NULL,
      descricao TEXT,
      valor_anterior TEXT,
      valor_novo TEXT,
      usuario_responsavel UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Habilitar RLS
    ALTER TABLE public.historico_patrimonio ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Histórico pode ser visto por usuários autenticados"
      ON public.historico_patrimonio FOR SELECT
      USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Sistema pode inserir histórico"
      ON public.historico_patrimonio FOR INSERT
      WITH CHECK (true);
  END IF;

  -- Adicionar foreign keys se não existirem
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patrimonios_categoria_id_fkey'
  ) THEN
    ALTER TABLE public.patrimonios 
    ADD CONSTRAINT patrimonios_categoria_id_fkey 
    FOREIGN KEY (categoria_id) REFERENCES public.categorias_patrimonio(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patrimonio_reservas_patrimonio_id_fkey'
  ) THEN
    ALTER TABLE public.patrimonio_reservas 
    ADD CONSTRAINT patrimonio_reservas_patrimonio_id_fkey 
    FOREIGN KEY (patrimonio_id) REFERENCES public.patrimonios(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'historico_patrimonio_patrimonio_id_fkey'
  ) THEN
    ALTER TABLE public.historico_patrimonio 
    ADD CONSTRAINT historico_patrimonio_patrimonio_id_fkey 
    FOREIGN KEY (patrimonio_id) REFERENCES public.patrimonios(id);
  END IF;

  -- Inserir categorias padrão se não existirem
  INSERT INTO public.categorias_patrimonio (nome, descricao) VALUES 
    ('Equipamentos de Som', 'Microfones, amplificadores, caixas de som'),
    ('Equipamentos de Vídeo', 'Projetores, telas, câmeras'),
    ('Móveis', 'Cadeiras, mesas, armários'),
    ('Instrumentos Musicais', 'Violões, pianos, baterias'),
    ('Equipamentos de Informática', 'Computadores, impressoras, roteadores'),
    ('Eletrodomésticos', 'Geladeiras, fornos microondas, cafeteiras'),
    ('Veículos', 'Carros, motos, ônibus'),
    ('Livros e Material Didático', 'Bíblias, livros, materiais de estudo')
  ON CONFLICT (nome) DO NOTHING;

END $$;