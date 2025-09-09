-- Limpar dados existentes em inglês e importar versões em português
DELETE FROM biblia_versiculos WHERE versao_id = 'arc';
DELETE FROM biblia_livros WHERE versao_id = 'arc';

-- Remover a versão em inglês e adicionar versões corretas em português
DELETE FROM biblia_versoes WHERE id = 'bible-com-pt';
DELETE FROM biblia_versoes WHERE id = 'kjv';

-- Atualizar apenas versões em português do Brasil
UPDATE biblia_versoes SET ativa = true WHERE id IN ('arc', 'ara', 'nvi', 'ntlh');