-- Inserir insights de exemplo usando apenas os tipos permitidos pela constraint
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
  '00000000-0000-0000-0000-000000000000',
  'Células com Alto Crescimento',
  'Identifiquei 3 células com crescimento acima de 15% no último mês. É recomendado replicar as práticas dessas células para expandir este resultado.',
  '{"percentual_crescimento": 18.5, "celulas_identificadas": 3}',
  CURRENT_DATE,
  'alta',
  true
),
(
  'alerta',
  'supervisao', 
  '00000000-0000-0000-0000-000000000000',
  'Alerta: Queda na Frequência',
  'Detectei uma queda de 12% na frequência média das células nas últimas 4 semanas. Sugiro investigar possíveis causas e implementar estratégias de engajamento.',
  '{"queda_percentual": -12, "semanas_analisadas": 4}',
  CURRENT_DATE,
  'critica',
  true
),
(
  'retencao',
  'supervisao',
  '00000000-0000-0000-0000-000000000000', 
  'Oportunidade: Melhorar Retenção',
  'O número de visitantes aumentou 25% este mês, mas a taxa de retenção está em 45%. Este é um bom momento para focar em estratégias de acompanhamento.',
  '{"aumento_visitantes": 25, "taxa_retencao": 45, "periodo": "mes_atual"}',
  CURRENT_DATE,
  'media',
  true
),
(
  'multiplicacao',
  'supervisao',
  '00000000-0000-0000-0000-000000000000',
  'Potencial de Multiplicação',
  '2 células atingiram o tamanho ideal para multiplicação (15+ membros ativos). Recomendo iniciar o processo de preparação de novos líderes.',
  '{"celulas_prontas": 2, "membros_por_celula": 16, "lideres_em_treinamento": 1}',
  CURRENT_DATE,
  'alta',
  true
),
(
  'engajamento',
  'supervisao',
  '00000000-0000-0000-0000-000000000000',
  'Melhoria no Engajamento',
  'As células que implementaram atividades interativas têm 30% mais participação. Considere expandir essas práticas para todas as células.',
  '{"aumento_engajamento": 30, "celulas_implementadas": 5, "total_celulas": 12}',
  CURRENT_DATE,
  'media',
  true
);