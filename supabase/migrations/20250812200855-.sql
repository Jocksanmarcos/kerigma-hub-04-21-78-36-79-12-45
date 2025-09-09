-- Adicionar coluna data_fundacao na tabela igrejas
ALTER TABLE public.igrejas 
ADD COLUMN data_fundacao DATE;

-- Atualizar as datas de fundação das igrejas existentes
UPDATE public.igrejas 
SET data_fundacao = '2024-08-24'
WHERE nome LIKE '%Sede%';

UPDATE public.igrejas 
SET data_fundacao = '2024-07-27'
WHERE nome LIKE '%Gapara%';

UPDATE public.igrejas 
SET data_fundacao = '2024-11-30'
WHERE nome LIKE '%Vila Maranhão%';

UPDATE public.igrejas 
SET data_fundacao = '2024-04-27'
WHERE nome LIKE '%Icatu%';

UPDATE public.igrejas 
SET data_fundacao = '2024-03-23'
WHERE nome LIKE '%Mata de Itapera%';

UPDATE public.igrejas 
SET data_fundacao = '2024-10-01'
WHERE nome LIKE '%Bacabeira%';