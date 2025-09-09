-- Criar tabela para rate limiting das APIs
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para otimização das consultas
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_celulas_lider ON celulas(lider_id);
CREATE INDEX IF NOT EXISTS idx_ensino_categoria ON cursos(categoria);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos_financeiros_v2(data_lancamento);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos_financeiros_v2(tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos_financeiros_v2(status);
CREATE INDEX IF NOT EXISTS idx_pessoas_tipo ON pessoas(tipo_pessoa);
CREATE INDEX IF NOT EXISTS idx_pessoas_situacao ON pessoas(situacao);
CREATE INDEX IF NOT EXISTS idx_celulas_ativa ON celulas(ativa);
CREATE INDEX IF NOT EXISTS idx_cursos_ativo ON cursos(ativo);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time ON api_rate_limits(ip_address, created_at);

-- Adicionar RLS para rate limits
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sistema pode gerenciar rate limits" 
ON api_rate_limits 
FOR ALL 
USING (auth.role() = 'service_role');

-- Função para limpeza automática de rate limits antigos
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM api_rate_limits 
  WHERE created_at < (now() - INTERVAL '1 hour');
END;
$$;