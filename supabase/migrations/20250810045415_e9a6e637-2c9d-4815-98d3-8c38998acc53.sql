-- Adicionar integração entre agendamentos e aconselhamento pastoral
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS agendamento_pastoral_id UUID REFERENCES agendamentos_pastorais(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_pastoral 
ON agendamentos(agendamento_pastoral_id) WHERE agendamento_pastoral_id IS NOT NULL;

-- Melhorar tabela de calendários com configurações avançadas
ALTER TABLE calendarios 
ADD COLUMN IF NOT EXISTS configuracoes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fusos_horario TEXT DEFAULT 'America/Sao_Paulo';

-- Adicionar trigger para atualizar data_agendamento quando agendamento é criado
CREATE OR REPLACE FUNCTION update_pastoral_agendamento()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o status e data do aconselhamento quando um agendamento é criado
  IF NEW.agendamento_pastoral_id IS NOT NULL THEN
    UPDATE agendamentos_pastorais 
    SET 
      agendamento_id = NEW.id,
      data_agendamento = NEW.data_hora_inicio,
      status = 'agendado',
      updated_at = NOW()
    WHERE id = NEW.agendamento_pastoral_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;