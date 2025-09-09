-- Inserir alguns insights de exemplo para demonstrar a funcionalidade
INSERT INTO insights_celulas (
  tipo_insight, 
  nivel_hierarquia, 
  entidade_id, 
  titulo, 
  descricao, 
  metrica_principal, 
  data_analise, 
  prioridade, 
  ativo
) VALUES 
(
  'crescimento',
  'supervisao',
  '00000000-0000-0000-0000-000000000000', -- ID placeholder que será substituído
  'Células com Alto Crescimento',
  'Identifiquei 3 células com crescimento acima de 15% no último mês. É recomendado replicar as práticas dessas células.',
  '{"percentual_crescimento": 18.5, "celulas_identificadas": 3}',
  CURRENT_DATE,
  'alta',
  true
),
(
  'frequencia',
  'supervisao', 
  '00000000-0000-0000-0000-000000000000',
  'Alerta: Queda na Frequência',
  'Detectei uma queda de 12% na frequência média das células nas últimas 4 semanas. Sugiro investigar possíveis causas.',
  '{"queda_percentual": -12, "semanas_analisadas": 4}',
  CURRENT_DATE,
  'critica',
  true
),
(
  'visitantes',
  'supervisao',
  '00000000-0000-0000-0000-000000000000', 
  'Oportunidade: Mais Visitantes',
  'O número de visitantes aumentou 25% este mês. Este é um bom momento para focar em estratégias de retenção.',
  '{"aumento_visitantes": 25, "periodo": "mes_atual"}',
  CURRENT_DATE,
  'media',
  true
),
(
  'lideranca',
  'supervisao',
  '00000000-0000-0000-0000-000000000000',
  'Necessidade de Capacitação',
  '2 células estão com líderes novos que podem se beneficiar de mentoria adicional baseada no desempenho inicial.',
  '{"lideres_novos": 2, "tempo_lideranca": "menos_3_meses"}',
  CURRENT_DATE,
  'media',
  true
);