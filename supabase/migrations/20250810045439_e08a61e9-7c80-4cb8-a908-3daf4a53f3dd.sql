-- Criar o trigger para atualizar agendamentos pastorais
CREATE OR REPLACE TRIGGER trigger_update_pastoral_agendamento
    AFTER INSERT OR UPDATE ON agendamentos
    FOR EACH ROW 
    EXECUTE FUNCTION update_pastoral_agendamento();