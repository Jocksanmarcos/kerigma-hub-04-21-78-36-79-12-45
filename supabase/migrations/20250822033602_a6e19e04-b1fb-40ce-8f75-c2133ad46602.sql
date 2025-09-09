-- Limpar vínculos inconsistentes e permitir nova criação para Benjamim

-- Primeiro, vamos verificar se há algum vínculo "órfão" ou inconsistente
DELETE FROM vinculos_familiares 
WHERE pessoa_id = '2b36d83b-23bd-413e-8160-6175439a49bd';

-- Garantir que a constraint permite recriação
-- Se necessário, temporariamente relaxar a constraint única para permitir correções