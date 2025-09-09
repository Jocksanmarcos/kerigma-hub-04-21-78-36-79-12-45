-- Criar tabelas para o sistema de chatbot inteligente (sem vector embedding)

-- Tabela para armazenar conhecimento do chatbot
CREATE TABLE public.chatbot_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'page', 'document', 'manual', 'conversation'
  source_url TEXT,
  keywords TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para conversas do WhatsApp
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'transferred'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para mensagens do WhatsApp
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id),
  message_id TEXT, -- WhatsApp message ID
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'text', 'image', 'document', 'audio'
  content TEXT,
  media_url TEXT,
  direction TEXT NOT NULL, -- 'incoming', 'outgoing'
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
  response_to UUID REFERENCES whatsapp_messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para treinamento do chatbot
CREATE TABLE public.chatbot_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'conversation', 'manual', 'imported'
  confidence_score DECIMAL(3,2),
  user_feedback INTEGER, -- 1-5 rating
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações do chatbot
CREATE TABLE public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_chatbot_knowledge_keywords ON chatbot_knowledge USING GIN(keywords);
CREATE INDEX idx_chatbot_knowledge_active ON chatbot_knowledge(active) WHERE active = true;
CREATE INDEX idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);
CREATE INDEX idx_chatbot_training_active ON chatbot_training(active) WHERE active = true;

-- Triggers para updated_at
CREATE TRIGGER update_chatbot_knowledge_updated_at
    BEFORE UPDATE ON chatbot_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();

CREATE TRIGGER update_chatbot_settings_updated_at
    BEFORE UPDATE ON chatbot_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();

-- RLS Policies
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY "Administradores podem gerenciar conhecimento" 
ON public.chatbot_knowledge FOR ALL 
USING (is_sede_admin() OR is_pastor_missao());

CREATE POLICY "Administradores podem ver conversas WhatsApp" 
ON public.whatsapp_conversations FOR ALL 
USING (is_sede_admin() OR is_pastor_missao());

CREATE POLICY "Administradores podem ver mensagens WhatsApp" 
ON public.whatsapp_messages FOR ALL 
USING (is_sede_admin() OR is_pastor_missao());

CREATE POLICY "Administradores podem gerenciar treinamento" 
ON public.chatbot_training FOR ALL 
USING (is_sede_admin() OR is_pastor_missao());

CREATE POLICY "Administradores podem gerenciar configurações" 
ON public.chatbot_settings FOR ALL 
USING (is_sede_admin() OR is_pastor_missao());

-- Inserir configurações padrão
INSERT INTO public.chatbot_settings (setting_key, setting_value, description) VALUES
('whatsapp_welcome_message', 
 '{"message": "Olá! 👋 Sou o assistente virtual da Igreja. Como posso ajudá-lo hoje?"}',
 'Mensagem de boas-vindas do WhatsApp'),
('chatbot_personality', 
 '{"tone": "friendly", "style": "helpful", "context": "Você é um assistente virtual de uma igreja cristã. Seja sempre respeitoso, acolhedor e útil. Use emojis quando apropriado e mantenha um tom caloroso e pastoral."}',
 'Personalidade e tom do chatbot'),
('auto_learning', 
 '{"enabled": true, "confidence_threshold": 0.8}',
 'Configurações de aprendizado automático');