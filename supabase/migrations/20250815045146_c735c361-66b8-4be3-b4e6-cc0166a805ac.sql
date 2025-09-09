-- Add support for directed donations to specific funds
-- Check if fundos_contabeis table already exists and create if not
CREATE TABLE IF NOT EXISTS fundos_contabeis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT true,
  meta_mensal NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the fundo_id column exists in lancamentos_financeiros_v2
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lancamentos_financeiros_v2' 
    AND column_name = 'fundo_id'
  ) THEN
    ALTER TABLE lancamentos_financeiros_v2 
    ADD COLUMN fundo_id UUID REFERENCES fundos_contabeis(id);
  END IF;
END $$;

-- Create RLS policies for fundos_contabeis
ALTER TABLE fundos_contabeis ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active funds" ON fundos_contabeis;
DROP POLICY IF EXISTS "Only admins can manage funds" ON fundos_contabeis;

-- Allow everyone to read active funds
CREATE POLICY "Anyone can view active funds" ON fundos_contabeis
FOR SELECT USING (ativo = true);

-- Only admins can manage funds
CREATE POLICY "Only admins can manage funds" ON fundos_contabeis
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Insert default funds if they don't exist
INSERT INTO fundos_contabeis (nome, descricao, cor) 
VALUES 
  ('Missões', 'Apoio às missões e evangelismo', '#ef4444'),
  ('Ação Social', 'Projetos de assistência social', '#22c55e'),
  ('Construção', 'Obras e melhorias do templo', '#f59e0b'),
  ('Dízimos', 'Dízimos regulares', '#3b82f6'),
  ('Ofertas Especiais', 'Ofertas para propósitos específicos', '#8b5cf6')
ON CONFLICT (nome) DO NOTHING;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_fundos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fundos_updated_at_trigger ON fundos_contabeis;

CREATE TRIGGER fundos_updated_at_trigger
  BEFORE UPDATE ON fundos_contabeis
  FOR EACH ROW
  EXECUTE FUNCTION update_fundos_updated_at();