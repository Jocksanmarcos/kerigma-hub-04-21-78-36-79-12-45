
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNewUserRole } from '@/hooks/useNewRole';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
}

export const useChatbotSupport = () => {
  const { data: userRole } = useNewUserRole();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou seu assistente de suporte inteligente. Como posso ajudá-lo(a) hoje? Posso auxiliar com navegação na plataforma, dicas de uso, tutoriais e muito mais!',
      role: 'assistant',
      timestamp: new Date(),
      category: 'help'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sugestões rápidas baseadas no perfil do usuário
  const getQuickSuggestions = () => {
    const baseSuggestions = [
      'Como visualizar minha agenda?',
      'Como me inscrever em eventos?',
      'Quais são os atalhos de teclado?'
    ];

    const liderSuggestions = [
      'Como gerenciar minha célula?',
      'Como criar escalas?',
      'Como acessar relatórios?',
      'Como registrar presença em reuniões?'
    ];

    const pastorSuggestions = [
      'Como fazer lançamentos financeiros?',
      'Como usar a IA Pastoral?',
      'Como configurar permissões?',
      'Como gerar relatórios detalhados?',
      'Como gerenciar patrimônio?',
      'Como exportar dados?',
      'Como gerenciar células?'
    ];

    switch (userRole) {
      case 'pastor':
        return [...baseSuggestions, ...liderSuggestions, ...pastorSuggestions];
      case 'lider':
        return [...baseSuggestions, ...liderSuggestions];
      case 'membro':
      default:
        return [...baseSuggestions, 'Como acessar cursos de ensino?', 'Como atualizar meus dados?'];
    }
  };

  const quickSuggestions = getQuickSuggestions();

  const sendMessage = useCallback(async (messageContent: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Get user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Try to call the chatbot function
      const { data, error } = await supabase.functions.invoke('chatbot-suporte', {
        body: {
          message: messageContent,
          userId: user?.id,
          userRole: userRole || 'membro',
          conversationHistory
        }
      });

      let responseContent = '';

      if (error || !data?.response) {
        console.warn('Chatbot function error, using fallback:', error);
        // Fallback response when the function is not available
        responseContent = generateFallbackResponse(messageContent);
      } else {
        responseContent = data.response;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
        category: categorizarResposta(responseContent)
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Use fallback response
      const fallbackResponse = generateFallbackResponse(messageContent);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        role: 'assistant',
        timestamp: new Date(),
        category: 'help'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Modo offline ativo",
        description: "Usando respostas locais enquanto o servidor está indisponível.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  }, [messages, toast]);

  const generateFallbackResponse = (question: string): string => {
    const questionLower = question.toLowerCase();
    
    // Respostas personalizadas baseadas no perfil
    const getRoleBasedResponse = (baseResponse: string) => {
      const rolePrefix = userRole ? 
        `**Para ${userRole === 'pastor' ? 'Pastores' : userRole === 'lider' ? 'Líderes' : 'Membros'}:** ` : 
        '';
      return rolePrefix + baseResponse;
    };
    
    if (questionLower.includes('pessoa') || questionLower.includes('cadastr')) {
      if (userRole === 'pastor') {
        return getRoleBasedResponse(`O sistema de gestão de pessoas foi removido. Para gerenciar membros, utilize outros módulos disponíveis como Células, Eventos ou contate o suporte técnico para alternativas.`);
      } else {
        return getRoleBasedResponse(`O sistema de gestão de pessoas foi removido. Entre em contato com a liderança para gerenciar membros através de outros módulos disponíveis.`);
      }
    }
    
    if (questionLower.includes('célula') || questionLower.includes('celula')) {
      if (userRole === 'pastor' || userRole === 'lider') {
        return getRoleBasedResponse(`Para ${userRole === 'pastor' ? 'criar uma célula' : 'gerenciar sua célula'}:

1. Vá para o módulo "Células"
2. ${userRole === 'pastor' ? 'Clique em "Nova Célula"' : 'Selecione sua célula'}
3. ${userRole === 'pastor' ? 'Defina nome, líder e local de reunião' : 'Use as abas para gerenciar membros e reuniões'}
4. Configure dia e horário dos encontros
5. ${userRole === 'pastor' ? 'Adicione membros da célula' : 'Registre presenças e crie relatórios'}
6. ${userRole === 'pastor' ? 'Defina metas e objetivos' : 'Acompanhe o crescimento da célula'}

📊 **Recursos disponíveis:** Relatórios de crescimento, controle de presença e planejamento de multiplicação.`);
      } else {
        return getRoleBasedResponse(`Para participar de uma célula, entre em contato com a liderança da igreja. Eles podem te ajudar a encontrar uma célula próxima à sua região.`);
      }
    }
    
    if (questionLower.includes('financeiro') || questionLower.includes('dinheiro') || questionLower.includes('dízimo')) {
      if (userRole === 'pastor') {
        return getRoleBasedResponse(`Para gerenciar o financeiro:

💰 **Receitas:**
- Dízimos e ofertas
- Doações especiais
- Eventos e campanhas

💸 **Despesas:**
- Gastos operacionais
- Investimentos em ministérios
- Manutenção e infraestrutura

📈 **Relatórios:** Acesse gráficos detalhados e exportações para análise completa.`);
      } else {
        return getRoleBasedResponse(`O módulo financeiro está disponível apenas para pastores. Para questões sobre dízimos e ofertas, entre em contato com a liderança da igreja.`);
      }
    }
    
    if (questionLower.includes('relatório') || questionLower.includes('relatorio')) {
      if (userRole === 'pastor' || userRole === 'lider') {
        return getRoleBasedResponse(`Para gerar relatórios:

1. Acesse a seção "Relatórios" no menu
2. Escolha o tipo de relatório desejado
3. Defina o período de análise
4. Configure filtros específicos
5. Visualize ou exporte os dados

📊 **Tipos disponíveis:** ${userRole === 'pastor' ? 'Pessoas, Células, Financeiro, Eventos, Patrimônio e mais!' : 'Células, Eventos e Analytics básicos.'}`);
      } else {
        return getRoleBasedResponse(`Relatórios detalhados estão disponíveis para líderes e pastores. Como membro, você pode visualizar seus dados pessoais e participação em eventos através da agenda.`);
      }
    }

    if (questionLower.includes('agenda') || questionLower.includes('eventos')) {
      return getRoleBasedResponse(`Para visualizar sua agenda:

1. Acesse o menu "Agenda" 
2. Navegue pelo calendário para ver seus eventos
3. Clique nos eventos para ver detalhes
4. ${userRole === 'membro' ? 'Inscreva-se em novos eventos através do menu "Eventos"' : 'Gerencie eventos e escalas conforme suas permissões'}

📅 **Dica:** Use as notificações para ser lembrado de eventos importantes!`);
    }
    
    // Resposta padrão personalizada por perfil
    const getDefaultResponse = () => {
      const commonFeatures = [
        '📅 **Agenda** - Visualizar eventos e compromissos',
        '📚 **Ensino** - Cursos e certificados'
      ];

      switch (userRole) {
        case 'pastor':
          return `Obrigado pela sua pergunta! Como Pastor, posso ajudar com:

🔹 **Membros** - Dados via outros módulos
🔹 **Células** - Criação e supervisão
🔹 **Financeiro** - Dízimos, ofertas, despesas
🔹 **Relatórios** - Análises completas
🔹 **IA Pastoral** - Aconselhamento assistido
🔹 **Configurações** - Administração geral
${commonFeatures.join('\n')}

Como posso ser mais específico para ajudá-lo?`;

        case 'lider':
          return `Obrigado pela sua pergunta! Como Líder, posso ajudar com:

🔹 **Células** - Gerenciamento da sua célula
🔹 **Escalas** - Criação de escalas de serviço
🔹 **Relatórios** - Análises da sua área
🔹 **Eventos** - Organização e participação
${commonFeatures.join('\n')}

Como posso ser mais específico para ajudá-lo?`;

        case 'membro':
        default:
          return `Obrigado pela sua pergunta! Como Membro, posso ajudar com:

🔹 **Eventos** - Inscrições e participação
🔹 **Perfil** - Atualização de dados pessoais
${commonFeatures.join('\n')}
🔹 **Suporte** - Dúvidas sobre uso da plataforma

Como posso ser mais específico para ajudá-lo?`;
      }
    };

    return getDefaultResponse();
  };

  const categorizarResposta = (resposta: string): string => {
    const respostaLower = resposta.toLowerCase();
    
    if (respostaLower.includes('tutorial') || respostaLower.includes('passo a passo') || respostaLower.includes('como fazer')) {
      return 'tutorial';
    }
    if (respostaLower.includes('dica') || respostaLower.includes('sugestão') || respostaLower.includes('recomendação')) {
      return 'tip';
    }
    if (respostaLower.includes('ajuda') || respostaLower.includes('suporte') || respostaLower.includes('problema')) {
      return 'help';
    }
    
    return 'help';
  };

  // Aprender com interações do usuário
  useEffect(() => {
    const saveInteractionPattern = async () => {
      if (messages.length > 2) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const recentMessages = messages.slice(-2);
            const userMsg = recentMessages.find(m => m.role === 'user');
            const assistantMsg = recentMessages.find(m => m.role === 'assistant');
            
            if (userMsg && assistantMsg) {
              // Try to save pattern, but don't fail if table doesn't exist
              const { error: upsertError } = await supabase
                .from('chatbot_learning_patterns')
                .upsert({
                  user_id: user.id,
                  question_pattern: userMsg.content.toLowerCase(),
                  response_category: assistantMsg.category,
                  interaction_timestamp: new Date().toISOString(),
                  feedback_score: null
                });
              
              if (upsertError) {
                console.warn('Failed to save learning pattern:', upsertError);
              }
            }
          }
        } catch (error) {
          // Silently ignore database errors for learning patterns
          console.debug('Learning pattern save failed:', error);
        }
      }
    };

    saveInteractionPattern();
  }, [messages]);

  return {
    messages,
    loading,
    sendMessage,
    quickSuggestions
  };
};
