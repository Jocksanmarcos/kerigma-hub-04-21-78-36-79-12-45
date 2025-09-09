-- Chatbot tables, RLS, triggers and indexes
-- 1) Tables
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chatbot_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_pattern TEXT NOT NULL,
  response_category TEXT,
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_pattern)
);

-- 2) RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_learning_patterns ENABLE ROW LEVEL SECURITY;

-- Conversations policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chatbot_conversations' AND policyname = 'Users can view their own conversations'
  ) THEN
    CREATE POLICY "Users can view their own conversations"
    ON public.chatbot_conversations
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chatbot_conversations' AND policyname = 'Users can create their own conversations'
  ) THEN
    CREATE POLICY "Users can create their own conversations"
    ON public.chatbot_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Learning patterns policies (explicit per action to include WITH CHECK)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chatbot_learning_patterns' AND policyname = 'Users can view their own learning patterns'
  ) THEN
    CREATE POLICY "Users can view their own learning patterns"
    ON public.chatbot_learning_patterns
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chatbot_learning_patterns' AND policyname = 'Users can insert their own learning patterns'
  ) THEN
    CREATE POLICY "Users can insert their own learning patterns"
    ON public.chatbot_learning_patterns
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chatbot_learning_patterns' AND policyname = 'Users can update their own learning patterns'
  ) THEN
    CREATE POLICY "Users can update their own learning patterns"
    ON public.chatbot_learning_patterns
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chatbot_learning_patterns' AND policyname = 'Users can delete their own learning patterns'
  ) THEN
    CREATE POLICY "Users can delete their own learning patterns"
    ON public.chatbot_learning_patterns
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Trigger function to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_chatbot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Triggers
DROP TRIGGER IF EXISTS update_chatbot_conversations_updated_at ON public.chatbot_conversations;
CREATE TRIGGER update_chatbot_conversations_updated_at
  BEFORE UPDATE ON public.chatbot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chatbot_updated_at();

DROP TRIGGER IF EXISTS update_chatbot_learning_patterns_updated_at ON public.chatbot_learning_patterns;
CREATE TRIGGER update_chatbot_learning_patterns_updated_at
  BEFORE UPDATE ON public.chatbot_learning_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chatbot_updated_at();

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created_at ON public.chatbot_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_learning_patterns_user_id ON public.chatbot_learning_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_learning_patterns_question ON public.chatbot_learning_patterns(question_pattern);
