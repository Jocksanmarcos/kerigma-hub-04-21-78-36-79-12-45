# Kerigma Hub - Documentação da API REST

## Visão Geral
O backend do Kerigma Hub foi implementado com APIs REST completas usando Supabase Edge Functions. Todas as APIs incluem autenticação JWT, rate limiting, logs de auditoria e validação de entrada.

## Endpoints Implementados

### 1. API de Células
**Base URL:** `/functions/v1/api-celulas`

#### GET /api-celulas
Lista células com paginação
- **Query Params:**
  - `page` (int): Página (padrão: 1)
  - `limit` (int): Itens por página (máx: 100, padrão: 20)
- **Auth:** Opcional (públicas visíveis sem auth)

#### POST /api-celulas
Cria nova célula
- **Auth:** Obrigatória
- **Body:**
```json
{
  "nome": "Célula Centro",
  "endereco": "Rua X, 123",
  "horario": "19:00",
  "lider_id": "uuid",
  "latitude": -23.55,
  "longitude": -46.63
}
```

#### PUT /api-celulas/{id}
Atualiza célula existente
- **Auth:** Obrigatória

#### DELETE /api-celulas/{id}
Desativa célula (soft delete)
- **Auth:** Obrigatória

### 2. API de Ensino
**Base URL:** `/functions/v1/api-ensino`

#### GET /api-ensino/{id}
Obtém aula específica
- **Auth:** Opcional
- **Features:**
  - Rastreamento automático de progresso
  - Sistema de favoritos

#### GET /api-ensino
Lista aulas com filtros
- **Query Params:**
  - `categoria`: Filtrar por categoria
  - `curso_id`: Filtrar por curso
  - `search`: Busca por título/descrição
  - `page`, `limit`: Paginação

#### POST /api-ensino
Cria nova aula
- **Auth:** Obrigatória
- **Body:**
```json
{
  "titulo": "Fundamentos da Fé",
  "conteudo": "...",
  "curso_id": "uuid",
  "duracao_estimada": 45
}
```
- **Webhook:** Notifica automaticamente membros das células

### 3. API Financeira
**Base URL:** `/functions/v1/api-financeiro`

#### GET /api-financeiro/lancamentos
Lista lançamentos com paginação e filtros
- **Auth:** Obrigatória
- **Query Params:**
  - `tipo`: receita|despesa
  - `status`: confirmado|pendente
  - `data_inicio`, `data_fim`: Período
- **Features:**
  - Cálculo automático de saldo (receitas - despesas)
  - Filtros avançados

#### POST /api-financeiro/lancamentos
Cria novo lançamento
- **Auth:** Obrigatória
- **Body:**
```json
{
  "tipo": "receita",
  "descricao": "Dízimo",
  "valor": 500.00,
  "conta_id": "uuid",
  "categoria_id": "uuid"
}
```

#### PUT /api-financeiro/lancamentos/{id}
Atualiza lançamento

#### DELETE /api-financeiro/lancamentos/{id}
Remove lançamento

#### GET /api-financeiro/relatorios
Gera relatórios mensais
- **Query Params:**
  - `tipo`: mensal (padrão)
  - `mes`: YYYY-MM (padrão: mês atual)
- **Response:**
```json
{
  "periodo": {"inicio": "2024-01-01", "fim": "2024-02-01"},
  "resumo": {
    "receitas": 5000.00,
    "despesas": 3000.00,
    "saldo": 2000.00
  },
  "categorias": {...}
}
```

### 4. API de Eventos
**Base URL:** `/functions/v1/api-eventos`

#### GET /api-eventos
Lista eventos
- **Auth:** Opcional (públicos visíveis sem auth)
- **Filtros:** tipo, público, data, busca

#### POST /api-eventos
Cria novo evento
- **Auth:** Obrigatória
- **Webhook:** Adiciona automaticamente na agenda

#### PUT /api-eventos/{id}
Atualiza evento

#### DELETE /api-eventos/{id}
Remove evento

## Recursos Implementados

### 1. Segurança
- ✅ **Autenticação JWT** em todos endpoints protegidos
- ✅ **Rate Limiting** (100 req/min por IP)
- ✅ **Validação de entrada** em todos campos obrigatórios
- ✅ **Logs de auditoria** para ações críticas

### 2. Performance
- ✅ **Índices otimizados** no banco:
  - `idx_eventos_data` (eventos por data)
  - `idx_celulas_lider` (células por líder)
  - `idx_ensino_categoria` (ensino por categoria)
  - `idx_lancamentos_data` (lançamentos por data)
- ✅ **Paginação** em todas listagens (máx 100 itens/página)

### 3. Integrações entre Módulos
- ✅ **Sincronização automática:**
  - Líder cadastrado → Atualiza permissões
  - Evento criado → Adiciona na agenda
  - Aula publicada → Notifica membros

### 4. Funcionalidades Específicas

#### Módulo Financeiro
- ✅ Cálculo automático de saldo
- ✅ Relatórios mensais em JSON
- ✅ Filtros avançados por período/categoria

#### Módulo Ensino
- ✅ Rastreamento de progresso dos alunos
- ✅ Sistema de favoritos (preparado)
- ✅ Notificações automáticas

## Como Usar

### Exemplo: Criar uma célula
```javascript
const response = await supabase.functions.invoke('api-celulas', {
  method: 'POST',
  body: {
    nome: 'Célula Alegria',
    endereco: 'Rua das Flores, 456',
    horario: '20:00',
    lider_id: 'uuid-do-lider'
  }
});
```

### Exemplo: Listar lançamentos financeiros
```javascript
const response = await supabase.functions.invoke('api-financeiro', {
  method: 'GET',
  body: new URLSearchParams({
    tipo: 'receita',
    page: '1',
    limit: '20'
  })
});
```

## Status de Segurança

⚠️ **Avisos Pendentes:**
- Algumas funções ainda precisam de `search_path` configurado
- Proteção contra senha vazada está desabilitada (requer configuração manual no Supabase Auth)

## Rate Limits
- **100 requests por minuto** por IP
- Cleanup automático de logs antigos
- Headers de CORS configurados para todas as APIs

## Logs e Monitoramento
Todos os endpoints geram logs estruturados em `logs_sistema`:
- Ações de CRUD (create, read, update, delete)
- Erros e exceções
- Rastreamento de IP e User-Agent
- Timestamps precisos

## Próximos Passos
1. Implementar cache Redis para dados estáticos
2. Adicionar geração de PDF para relatórios
3. Expandir sistema de notificações
4. Implementar backup automático