# 📋 Protocolo de Verificação e Qualidade (QA) - Módulos Principais
## Sistema Kerigma Hub - Expansão Multi-Módulo

**Data:** $(date)  
**Versão:** v2.0 - Expansão Multi-Módulo  
**Base:** Metodologia validada em "Jornada de Crescimento"

---

## 🎯 Objetivo Expandido
Aplicar a metodologia de QA sistemática validada na Jornada de Crescimento para garantir funcionalidade, segurança e estabilidade nos módulos:
- 💰 **Financeiro** (Lançamentos, Relatórios, Conciliação)
- 🏠 **Células** (Relatórios, Participantes, Liderança) 
- 👥 **Pessoas** (Cadastros, Vínculos, Perfis)

---

## 🚨 ANÁLISE INICIAL - PROBLEMAS CRÍTICOS IDENTIFICADOS

### 💰 MÓDULO FINANCEIRO - STATUS: 🔴 CRÍTICO
**Problemas Detectados:**
- ❌ 0 lançamentos na tabela `lancamentos_financeiros_v2`
- ❌ 0 categorias em `categorias_financeiras` 
- ❌ Sistema sem dados básicos para funcionar
- ❌ Interfaces existem mas não há backend funcional

### 🏠 MÓDULO CÉLULAS - STATUS: 🟡 PARCIAL
**Problemas Detectados:**
- ✅ 3 células ativas na base
- ❌ 0 relatórios em `relatorios_semanais_celulas`
- ⚠️ Sistema básico funciona mas relatórios não operacionais

### 👥 MÓDULO PESSOAS - STATUS: 🟢 FUNCIONAL
**Status Atual:**
- ✅ 78 pessoas ativas no sistema
- ✅ Estrutura básica operacional
- ✅ Pronto para testes avançados

---

## 👤 Matriz de Perfis de Teste Multi-Módulo

| Perfil | Role | Email de Teste | Acesso aos Módulos |
|--------|------|----------------|--------------------|
| **Super Admin** | `super_admin` | `admin.teste@kerigma.test` | Todos os módulos + administração |
| **Tesoureiro** | `tesoureiro` | `tesoureiro.teste@kerigma.test` | Financeiro completo |
| **Líder Célula** | `lider` | `lider.teste@kerigma.test` | Células + Pessoas (limitado) |
| **Pastor** | `pastor` | `pastor.teste@kerigma.test` | Acesso pastoral geral |
| **Membro** | `membro` | `membro.teste@kerigma.test` | Visualização básica |

---

## 🧪 ROTEIRO DE TESTES MÓDULO FINANCEIRO

### TESTE F1: Criação de Categoria Financeira ⚠️ PRÉ-REQUISITO
**Perfil:** Tesoureiro  
**Pré-requisitos:** Sistema sem categorias (0 registros)

**Passos:**
1. Acessar `/dashboard/financeiro/categorias`
2. Clicar em "Nova Categoria" 
3. Preencher: Nome="Dízimos", Tipo="Receita"
4. Salvar categoria

**Resultado Esperado:**
- ✅ Categoria criada na tabela `categorias_financeiras`
- ✅ Aparece na lista de categorias
- ✅ Disponível para lançamentos

**Status:** [ ] OK / [ ] Falhou  
**Prioridade:** 🔴 CRÍTICA

### TESTE F2: Primeiro Lançamento Financeiro ⚠️ CRÍTICO
**Perfil:** Tesoureiro  
**Pré-requisitos:** Pelo menos 1 categoria criada

**Passos:**
1. Acessar `/dashboard/financeiro`
2. Clicar em "Novo Lançamento"
3. Preencher: Valor=100.00, Tipo="Receita", Categoria="Dízimos"
4. Salvar lançamento

**Resultado Esperado:**
- ✅ Lançamento salvo em `lancamentos_financeiros_v2`
- ✅ Saldo atualizado no dashboard
- ✅ Histórico mostra transação

**Status:** [ ] OK / [ ] Falhou  
**Prioridade:** 🔴 CRÍTICA

### TESTE F3: Relatório Financeiro 
**Perfil:** Pastor  
**Pré-requisitos:** Lançamentos existentes

**Passos:**
1. Acessar relatórios financeiros
2. Filtrar por período (últimos 30 dias)
3. Gerar relatório de receitas x despesas

**Resultado Esperado:**
- ✅ Relatório gerado corretamente
- ✅ Valores calculados precisos
- ✅ Exportação PDF funcional

**Status:** [ ] OK / [ ] Falhou

---

## 🧪 ROTEIRO DE TESTES MÓDULO CÉLULAS

### TESTE C1: Primeiro Relatório Semanal ⚠️ CRÍTICO  
**Perfil:** Líder de Célula  
**Pré-requisitos:** Célula ativa atribuída ao líder

**Passos:**
1. Acessar `/celulas/relatorios`
2. Clicar em "Novo Relatório Semanal"
3. Preencher: Presentes=8, Visitantes=2, Decisões=1
4. Submeter relatório

**Resultado Esperado:**
- ✅ Relatório salvo em `relatorios_semanais_celulas`
- ✅ Status = "pendente_aprovacao" 
- ✅ Notificação para supervisor

**Status:** [ ] OK / [ ] Falhou  
**Prioridade:** 🔴 CRÍTICA

### TESTE C2: Aprovação de Relatório
**Perfil:** Pastor/Supervisor  
**Pré-requisitos:** Relatório pendente

**Passos:**
1. Acessar painel de aprovações
2. Visualizar relatório pendente
3. Aprovar ou rejeitar com comentários

**Resultado Esperado:**
- ✅ Status atualizado para "aprovado"/"rejeitado"
- ✅ Líder notificado da decisão
- ✅ Métricas atualizadas se aprovado

**Status:** [ ] OK / [ ] Falhou

### TESTE C3: Gestão de Participantes
**Perfil:** Líder de Célula

**Passos:**
1. Acessar lista de participantes da célula
2. Adicionar novo membro
3. Atualizar informações de contato
4. Marcar frequência de reunião

**Resultado Esperado:**
- ✅ Participante adicionado à `participantes_celulas`
- ✅ Dados sincronizados com `pessoas`
- ✅ Histórico de presença registrado

**Status:** [ ] OK / [ ] Falhou

---

## 🧪 ROTEIRO DE TESTES MÓDULO PESSOAS

### TESTE P1: Cadastro Completo de Pessoa
**Perfil:** Admin/Pastor  

**Passos:**
1. Acessar `/pessoas/novo`
2. Preencher dados completos (nome, email, telefone, data_nascimento)
3. Definir papel_lideranca se aplicável
4. Salvar registro

**Resultado Esperado:**
- ✅ Pessoa salva em `pessoas` com situacao='ativo'
- ✅ Dados indexados para busca
- ✅ Disponível para vínculos

**Status:** [ ] OK / [ ] Falhou

### TESTE P2: Vínculos Familiares
**Perfil:** Admin

**Passos:**
1. Selecionar duas pessoas
2. Criar vínculo familiar (pai/filho, cônjuge, etc.)
3. Verificar reciprocidade do vínculo

**Resultado Esperado:**
- ✅ Registro em `vinculos_familiares`
- ✅ Ambos os lados do vínculo visíveis
- ✅ Árvore genealógica atualizada

**Status:** [ ] OK / [ ] Falhou

### TESTE P3: Busca e Filtros
**Perfil:** Qualquer usuário

**Passos:**
1. Usar busca por nome
2. Filtrar por faixa etária
3. Filtrar por célula/ministério

**Resultado Esperado:**
- ✅ Busca retorna resultados precisos
- ✅ Filtros funcionam corretamente
- ✅ Performance adequada (< 2s)

**Status:** [ ] OK / [ ] Falhou

---

## 🔄 Testes de Integração Entre Módulos

### TESTE I1: Pessoa → Célula → Relatório
**Cenário:** Fluxo completo de participação

**Passos:**
1. Cadastrar nova pessoa
2. Adicionar à célula  
3. Incluir em relatório semanal
4. Verificar métricas consolidadas

**Resultado Esperado:**
- ✅ Dados consistentes entre módulos
- ✅ Contadores atualizados corretamente
- ✅ Sem duplicações ou inconsistências

**Status:** [ ] OK / [ ] Falhou

### TESTE I2: Financeiro → Relatório Pastoral
**Cenário:** Visibilidade financeira para liderança

**Passos:**
1. Criar lançamentos financeiros
2. Gerar relatório pastoral mensal
3. Verificar seção financeira

**Resultado Esperado:**
- ✅ Dados financeiros agregados corretamente
- ✅ Gráficos e métricas precisos
- ✅ Exportação funcional

**Status:** [ ] OK / [ ] Falhou

---

## 🚨 Critérios de Falha Crítica Multi-Módulo

**Interromper testes imediatamente se:**
- [ ] Módulo Financeiro não consegue criar lançamentos
- [ ] Células não conseguem submeter relatórios
- [ ] Pessoas não podem ser cadastradas
- [ ] Dados inconsistentes entre módulos
- [ ] Falhas de segurança/acesso

---

## 📊 PLANO DE EXECUÇÃO IMEDIATA

### Fase 1: Correções Críticas (Prioridade Máxima)
1. **🔴 FINANCEIRO** - Criar estrutura básica:
   - Categorias padrão (Dízimos, Ofertas, Despesas Administrativas)
   - Contas bancárias padrão
   - Configurações iniciais

2. **🟡 CÉLULAS** - Ativar sistema de relatórios:
   - Verificar edge functions de processamento
   - Testar fluxo completo de relatório
   - Corrigir notificações

### Fase 2: Testes Funcionais (Após correções)
1. Executar todos os testes críticos (F1, F2, C1)
2. Validar integrações entre módulos
3. Verificar permissões e segurança

### Fase 3: Otimizações (Melhoria contínua)
1. Performance de consultas
2. Interface do usuário
3. Relatórios avançados

---

## 📈 Métricas de Sucesso

**Financeiro:**
- [ ] ≥ 5 categorias criadas
- [ ] ≥ 10 lançamentos de teste
- [ ] Relatório mensal gerado

**Células:**
- [ ] ≥ 1 relatório por célula ativa
- [ ] 100% de relatórios processados
- [ ] 0 erros de aprovação

**Pessoas:**
- [ ] 100% dos registros válidos
- [ ] Busca < 2s para qualquer consulta
- [ ] ≥ 10 vínculos familiares criados

---

## 🎯 CONCLUSÃO E PRÓXIMOS PASSOS

Este protocolo expandido aplica a metodologia validada na Jornada de Crescimento para garantir que todos os módulos principais funcionem corretamente.

**Recomendação Imediata:**
1. Executar correções críticas no módulo Financeiro
2. Testar fluxo básico de cada módulo
3. Expandir para outros módulos secundários

**Meta:** Sistema completamente funcional e testado até o final da implementação.

---

*Documento gerado automaticamente baseado na metodologia QA validada*  
*Última atualização: $(date)*