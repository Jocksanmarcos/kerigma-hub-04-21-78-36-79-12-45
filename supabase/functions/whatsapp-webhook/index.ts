import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')!;
    const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')!;
    const geminiKey = Deno.env.get('GEMINI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      // Webhook verification
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === 'webhook_verify_token') {
        console.log('Webhook verified');
        return new Response(challenge, { status: 200 });
      } else {
        return new Response('Verification failed', { status: 403 });
      }
    }

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Webhook received:', JSON.stringify(body, null, 2));

      if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const messageText = message.text?.body;
        const messageId = message.id;

        if (messageText) {
          console.log(`Message from ${from}: ${messageText}`);

          // Buscar ou criar conversa
          let conversation = await supabase
            .from('whatsapp_conversations')
            .select('*')
            .eq('phone_number', from)
            .single();

          if (!conversation.data) {
            const { data: newConversation } = await supabase
              .from('whatsapp_conversations')
              .insert({
                phone_number: from,
                contact_name: body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || null,
                last_message_at: new Date().toISOString()
              })
              .select()
              .single();
            conversation.data = newConversation;
          }

          // Salvar mensagem recebida
          await supabase
            .from('whatsapp_messages')
            .insert({
              conversation_id: conversation.data?.id,
              message_id: messageId,
              phone_number: from,
              message_type: 'text',
              content: messageText,
              direction: 'incoming',
              status: 'received'
            });

          // Gerar resposta com IA
          const aiResponse = await generateAIResponse(messageText, from, supabase, geminiKey);

          // Enviar resposta
          if (aiResponse) {
            await sendWhatsAppMessage(from, aiResponse, whatsappPhoneNumberId, whatsappToken);
            
            // Salvar mensagem enviada
            await supabase
              .from('whatsapp_messages')
              .insert({
                conversation_id: conversation.data?.id,
                phone_number: from,
                message_type: 'text',
                content: aiResponse,
                direction: 'outgoing',
                status: 'sent'
              });
          }
        }
      }

      return new Response('OK', { status: 200 });
    }

  } catch (error) {
    console.error('Error in whatsapp-webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateAIResponse(message: string, phoneNumber: string, supabase: any, geminiKey: string): Promise<string | null> {
  try {
    // Buscar conhecimento relevante
    const { data: knowledge } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('active', true)
      .textSearch('content', message)
      .limit(3);

    // Buscar configurações do chatbot
    const { data: settings } = await supabase
      .from('chatbot_settings')
      .select('*');

    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {}) || {};

    const personality = settingsMap.chatbot_personality || {
      context: "Você é um assistente virtual de uma igreja cristã. Seja sempre respeitoso, acolhedor e útil."
    };

    // Buscar histórico de conversa
    const { data: conversation } = await supabase
      .from('whatsapp_conversations')
      .select(`
        *,
        whatsapp_messages!inner(content, direction, created_at)
      `)
      .eq('phone_number', phoneNumber)
      .single();

    const conversationHistory = conversation?.whatsapp_messages
      ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      ?.slice(-10) // Últimas 10 mensagens
      ?.map((msg: any) => ({
        role: msg.direction === 'incoming' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) || [];

    // Preparar contexto para IA
    let contextualInfo = '';
    if (knowledge && knowledge.length > 0) {
      contextualInfo = '\n\nInformações relevantes da igreja:\n' + 
        knowledge.map((k: any) => `- ${k.title}: ${k.content}`).join('\n');
    }

    const systemPrompt = `${personality.context}

Você tem acesso às seguintes informações sobre a igreja:${contextualInfo}

Responda de forma natural, calorosa e útil. Se não souber algo específico, seja honesto mas ofereça ajuda alternativa.
Use emojis quando apropriado e mantenha um tom pastoral e acolhedor.
Limite suas respostas a no máximo 2 parágrafos para WhatsApp.`;

    // Fazer chamada para Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          },
          ...conversationHistory,
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    const aiData = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', aiData);
      return "Olá! 👋 Sou o assistente virtual da igreja. No momento estou com dificuldades técnicas, mas em breve estarei funcionando perfeitamente. Como posso ajudá-lo?";
    }

    const aiResponse = aiData.candidates[0].content.parts[0].text;

    // Salvar interação para aprendizado
    if (settingsMap.auto_learning?.enabled) {
      await supabase
        .from('chatbot_training')
        .insert({
          question: message,
          answer: aiResponse,
          source_type: 'conversation',
          confidence_score: 0.8
        });
    }

    return aiResponse;

  } catch (error) {
    console.error('Error generating AI response:', error);
    return "Olá! 👋 Sou o assistente virtual da igreja. Como posso ajudá-lo hoje?";
  }
}

async function sendWhatsAppMessage(to: string, message: string, phoneNumberId: string, accessToken: string): Promise<void> {
  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        text: { body: message }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      throw new Error(`WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    console.log('WhatsApp message sent successfully');
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}