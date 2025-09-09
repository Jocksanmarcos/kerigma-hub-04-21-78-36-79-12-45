import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, question, cursos, matriculas } = await req.json()

    console.log(`Processando solicitação de IA: ${type}`)

    let response = ''

    if (type === 'recommendations') {
      // Gerar recomendações baseadas no perfil do usuário
      const cursosDisponiveis = cursos?.length || 0
      const cursosMatriculados = matriculas?.length || 0
      
      if (cursosMatriculados === 0) {
        response = `🎯 **Suas Recomendações Personalizadas**

Olá! Vejo que você ainda não começou sua jornada de estudos conosco. Que empolgante! 

**Para Iniciantes, recomendo:**
📚 **Fundamentos da Fé** - Perfeito para começar sua jornada
⛪ **Discipulado Básico** - Base sólida para crescimento espiritual
📖 **Introdução à Bíblia** - Conhecendo as Escrituras

**Próximos passos:**
1. Inscreva-se em pelo menos 1 curso básico
2. Dedique 15-30 minutos diários aos estudos
3. Participe dos fóruns de discussão

💡 **Dica:** Comece devagar e seja consistente. A jornada espiritual é uma maratona, não uma corrida!`
      } else {
        response = `🎯 **Suas Recomendações Personalizadas**

Parabéns! Você já está matriculado em ${cursosMatriculados} curso(s). Continue assim! 

**Baseado no seu perfil, sugiro:**
📈 **Liderança Cristã** - Desenvolva suas habilidades de liderança
🌱 **Evangelismo Pessoal** - Compartilhe sua fé com confiança
🙏 **Vida de Oração** - Aprofunde seu relacionamento com Deus

**Para maximizar seu aprendizado:**
1. Complete as lições pendentes regularmente
2. Faça anotações durante os estudos
3. Aplique o que aprender na prática
4. Conecte-se com outros alunos

🏆 **Meta sugerida:** Mantenha uma sequência de estudos de pelo menos 7 dias!`
      }
    } else if (type === 'qna') {
      // Responder perguntas específicas
      const pergunta = question?.toLowerCase() || ''
      
      if (pergunta.includes('certificado')) {
        response = `📜 **Sobre Certificados**

Todos os nossos cursos emitem certificados digitais automáticos!

**Como funciona:**
- Certificado gerado automaticamente ao completar 100% do curso
- Inclui QR Code para verificação online  
- Pode ser baixado em PDF de alta qualidade
- Válido para comprovação de estudos

**Para receber seu certificado:**
1. Complete todas as lições do curso
2. Realize as atividades práticas
3. O certificado aparecerá automaticamente na sua área

🎓 Seus certificados ficam salvos permanentemente no portal!`
      } else if (pergunta.includes('tempo') || pergunta.includes('quanto')) {
        response = `⏰ **Sobre Tempo de Estudo**

**Duração dos cursos:**
- Básicos: 8-12 horas (2-3 semanas)
- Intermediários: 15-25 horas (4-6 semanas)  
- Avançados: 30-40 horas (8-10 semanas)

**Recomendação de estudo:**
- 15-30 minutos por dia para iniciantes
- 45-60 minutos para estudantes regulares
- Flexibilidade total - estude no seu ritmo!

**Dicas para otimizar o tempo:**
1. Defina horários fixos de estudo
2. Use intervalos curtos mas frequentes
3. Faça revisões regulares do conteúdo

📅 A consistência é mais importante que a duração!`
      } else if (pergunta.includes('dificuldade') || pergunta.includes('difícil')) {
        response = `💪 **Sobre Dificuldade dos Cursos**

**Níveis disponíveis:**
🟢 **Iniciante** - Sem pré-requisitos, linguagem simples
🟡 **Intermediário** - Conhecimento básico recomendado  
🔴 **Avançado** - Para líderes e estudantes experientes

**Se está com dificuldades:**
1. Revise os pré-requisitos do curso
2. Comece pelos fundamentos
3. Use o fórum para tirar dúvidas
4. Estude em ritmo confortável

**Recursos de apoio:**
- Material complementar
- Fórum de dúvidas  
- Videos explicativos
- Exercícios práticos

🎯 Lembre-se: todo especialista já foi iniciante!`
      } else {
        response = `🤖 **Assistente de Estudos**

Estou aqui para ajudar com suas dúvidas sobre:

📚 **Cursos e Conteúdo**
- Recomendações personalizadas
- Informações sobre certificados
- Pré-requisitos e dificuldade

⏰ **Organização dos Estudos**  
- Planejamento de tempo
- Dicas de produtividade
- Metas de aprendizado

🎯 **Progressão Acadêmica**
- Próximos passos na jornada
- Áreas de especialização
- Desenvolvimento de habilidades

💡 **Exemplos de perguntas:**
- "Qual curso devo fazer primeiro?"
- "Como obter meu certificado?"
- "Quanto tempo preciso estudar por dia?"

Faça sua pergunta específica e terei prazer em ajudar!`
      }
    } else {
      response = 'Tipo de solicitação não reconhecido. Use "recommendations" ou "qna".'
    }

    console.log(`Resposta gerada com ${response.length} caracteres`)

    return new Response(
      JSON.stringify({ content: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função ensino-ai:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})