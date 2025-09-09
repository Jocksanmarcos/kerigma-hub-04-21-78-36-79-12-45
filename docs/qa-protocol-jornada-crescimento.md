# 📋 Protocolo de Verificação e Qualidade (QA) - Jornada de Crescimento

## 🎯 Objetivo
Garantir que todas as funcionalidades do módulo "Jornada de Crescimento" estejam operando corretamente, com foco em:
- Cálculo preciso de pontos de sabedoria
- Funcionamento das sequências de estudo (streaks)
- Sistema de rankings e medalhas
- Progressão de níveis
- Integração entre componentes

---

## 👤 Matriz de Perfis de Teste

### Contas Necessárias para Teste

| Perfil | Role | Email de Teste | Descrição |
|--------|------|----------------|-----------|
| **Pastor** | `pastor` | `pastor.teste@kerigma.test` | Acesso completo, pode gerenciar quizzes |
| **Líder** | `lider` | `lider.teste@kerigma.test` | Acesso intermediário, pode ver rankings |
| **Membro** | `membro` | `membro.teste@kerigma.test` | Usuário básico da jornada |
| **Membro Novo** | `membro` | `membro.novo@kerigma.test` | Perfil zerado para testar onboarding |

---

## 🧪 Roteiros de Teste Detalhados

### 1. LEITURA BÍBLICA E PONTUAÇÃO

#### 1.1 Primeira Leitura de Capítulo
**Perfil:** Membro Novo  
**Pré-requisitos:** Usuário sem leituras anteriores

**Passos:**
1. Fazer login como membro novo
2. Acessar `/jornada` - verificar que pontos = 0
3. Clicar em "Continuar Leitura" ou ir para `/biblia`
4. Selecionar um livro bíblico (ex: João)
5. Selecionar capítulo 1
6. Ler até o final da página
7. Clicar no botão "Marcar como Lido e Ganhar PS"

**Resultado Esperado:**
- ✅ Notificação de sucesso aparece
- ✅ Pontos de sabedoria aumentam (+10 PS)
- ✅ Capítulo fica marcado como lido
- ✅ Sequência atual = 1 dia
- ✅ Progresso atualizado em `/jornada`

**Status:** [ ] OK / [ ] Falhou  
**Observações:** ________________

#### 1.2 Sequência de Leitura (Streak)
**Perfil:** Membro  
**Pré-requisitos:** Usuário com ao menos 1 leitura anterior

**Passos:**
1. Ler um capítulo no dia atual
2. Verificar que sequência aumentou
3. Aguardar até o dia seguinte (ou simular com alteração de data)
4. Ler outro capítulo
5. Verificar continuidade da sequência

**Resultado Esperado:**
- ✅ Sequência atual incrementa corretamente
- ✅ Visualização dos últimos 7 dias funciona
- ✅ Quebra de sequência é detectada corretamente

**Status:** [ ] OK / [ ] Falhou

### 2. SISTEMA DE QUIZZES

#### 2.1 Responder Quiz Bíblico
**Perfil:** Membro  
**Pré-requisitos:** Quizzes cadastrados no sistema

**Passos:**
1. Acessar área de quizzes (via `/jornada` ou link específico)
2. Selecionar um quiz disponível
3. Responder todas as perguntas
4. Submeter respostas
5. Verificar pontuação recebida

**Resultado Esperado:**
- ✅ Perguntas carregam corretamente
- ✅ Múltipla escolha funciona
- ✅ Pontuação é calculada adequadamente
- ✅ Resultado é salvo no histórico
- ✅ Pontos são adicionados ao perfil

**Status:** [ ] OK / [ ] Falhou

#### 2.2 Geração de Quiz (Administrador)
**Perfil:** Pastor  
**Pré-requisitos:** Acesso ao painel administrativo

**Passos:**
1. Login como pastor
2. Acessar `/admin/jornada/quizzes`
3. Selecionar um capítulo bíblico
4. Clicar em "Gerar Quiz com IA"
5. Aguardar processamento
6. Verificar perguntas geradas

**Resultado Esperado:**
- ✅ Edge function `gerar-quiz-ia` executa sem erro
- ✅ 3 perguntas são geradas automaticamente
- ✅ Cada pergunta tem 4 alternativas
- ✅ Perguntas são salvas no banco
- ✅ Quiz fica disponível para membros

**Status:** [ ] OK / [ ] Falhou

### 3. SISTEMA DE RANKINGS

#### 3.1 Ranking Geral
**Perfil:** Qualquer membro  
**Pré-requisitos:** Múltiplos usuários com pontuações diferentes

**Passos:**
1. Acessar `/jornada/ranking`
2. Verificar lista de participantes
3. Confirmar ordenação por pontos
4. Verificar se posição atual está correta

**Resultado Esperado:**
- ✅ Lista carrega sem erros
- ✅ Ordenação decrescente por pontos
- ✅ Nome e pontuação exibidos corretamente
- ✅ Posição do usuário atual destacada

**Status:** [ ] OK / [ ] Falhou

#### 3.2 Ranking por Células
**Perfil:** Líder de Célula  
**Pré-requisitos:** Células cadastradas com membros

**Passos:**
1. Acessar ranking com filtro por célula
2. Verificar membros da célula específica
3. Comparar pontuações dentro do grupo

**Resultado Esperado:**
- ✅ Filtro por célula funciona
- ✅ Apenas membros da célula aparecem
- ✅ Pontuações são precisas

**Status:** [ ] OK / [ ] Falhou

### 4. SISTEMA DE NÍVEIS E PROGRESSÃO

#### 4.1 Progressão de Nível
**Perfil:** Membro  
**Pré-requisitos:** Usuário próximo da transição de nível

**Passos:**
1. Verificar nível atual em `/jornada`
2. Realizar atividades para ganhar pontos
3. Atingir threshold do próximo nível
4. Verificar se nível é atualizado

**Resultado Esperado:**
- ✅ Barra de progresso atualiza em tempo real
- ✅ Transição de nível é detectada
- ✅ Badge do nível é atualizada
- ✅ Notificação de novo nível aparece

**Status:** [ ] OK / [ ] Falhou

### 5. SISTEMA DE MEDALHAS E CONQUISTAS

#### 5.1 Conquista de Medalha
**Perfil:** Membro  
**Pré-requisitos:** Desafios/medalhas configurados

**Passos:**
1. Acessar `/jornada/medalhas`
2. Verificar medalhas disponíveis
3. Completar requisitos de uma medalha
4. Verificar se medalha é concedida

**Resultado Esperado:**
- ✅ Lista de medalhas carrega corretamente
- ✅ Progresso dos requisitos é mostrado
- ✅ Medalha é desbloqueada automaticamente
- ✅ Notificação de conquista aparece

**Status:** [ ] OK / [ ] Falhou

### 6. DESAFIOS E METAS

#### 6.1 Progresso em Desafios
**Perfil:** Membro  
**Pré-requisitos:** Desafios ativos no sistema

**Passos:**
1. Acessar `/jornada/desafios`
2. Visualizar desafios disponíveis
3. Participar de atividades relacionadas
4. Verificar progresso do desafio

**Resultado Esperado:**
- ✅ Desafios são listados claramente
- ✅ Progresso é atualizado automaticamente
- ✅ Recompensas são concedidas na conclusão

**Status:** [ ] OK / [ ] Falhou

---

## 🔄 Testes de Integração

### 7.1 Fluxo Completo do Usuário
**Cenário:** Jornada completa de um novo membro

**Passos:**
1. Cadastro e primeiro login
2. Primeira leitura bíblica
3. Primeiro quiz
4. Visualização do ranking
5. Conquista de primeira medalha
6. Verificação do perfil atualizado

**Resultado Esperado:**
- ✅ Todos os sistemas trabalham em conjunto
- ✅ Dados são consistentes entre módulos
- ✅ Performance é adequada

---

## 📊 Edge Functions - Testes Específicos

### 8.1 Função `processar-quiz`
**Teste:** Cálculo correto de pontuação
**Entrada:** 3 respostas (2 certas, 1 errada)
**Saída Esperada:** Pontuação proporcional + atualização do perfil

### 8.2 Função `get-rankings`
**Teste:** Ordenação e agregação corretas
**Entrada:** Múltiplos resultados de quiz
**Saída Esperada:** Lista ordenada por pontuação total

---

## 🚨 Critérios de Falha Crítica

**Interromper testes imediatamente se:**
- [ ] Pontos de sabedoria não são calculados corretamente
- [ ] Leituras bíblicas não são registradas
- [ ] Edge functions retornam erro 500
- [ ] Rankings exibem dados incorretos
- [ ] Sistema de autenticação falha

---

## 📝 Relatório de Execução

**Data do Teste:** ___________  
**Testador:** ___________  
**Versão do Sistema:** ___________  

**Resumo dos Resultados:**
- ✅ Aprovados: ___/___
- ❌ Falharam: ___/___
- ⚠️ Com ressalvas: ___/___

**Próximos Passos:**
- [ ] Corrigir falhas identificadas
- [ ] Re-testar funcionalidades críticas
- [ ] Atualizar documentação se necessário

---

## 📚 Recursos Úteis

**Links do Sistema:**
- Dashboard: `/dashboard`
- Jornada Principal: `/jornada`
- Leitura Bíblica: `/biblia`
- Rankings: `/jornada/ranking`
- Medalhas: `/jornada/medalhas`
- Admin Quizzes: `/admin/jornada/quizzes`

**Banco de Dados - Tabelas Principais:**
- `jornada_perfis_usuarios`
- `biblia_quiz_perguntas`
- `quiz_resultados`
- `jornada_medalhas_usuarios`
- `jornada_desafios_usuarios`

---

*Documento criado em: $(date)*  
*Última atualização: $(date)*