-- Criar tabela para configurações de notificação de aniversário
CREATE TABLE public.birthday_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_type TEXT NOT NULL DEFAULT 'email', -- 'email', 'whatsapp', 'both'
  days_before INTEGER NOT NULL DEFAULT 0, -- 0 = no dia, 1 = 1 dia antes, etc
  message_template TEXT NOT NULL DEFAULT 'Feliz aniversário, {nome}! Desejamos que Deus abençoe sua vida com muita alegria e paz. 🎉🎂',
  subject_template TEXT DEFAULT 'Feliz Aniversário! 🎉',
  send_time TIME WITHOUT TIME ZONE NOT NULL DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  church_id UUID REFERENCES public.igrejas(id)
);

-- Habilitar RLS
ALTER TABLE public.birthday_notifications ENABLE ROW LEVEL SECURITY;

-- Política para admin gerenciar notificações
CREATE POLICY "Admin pode gerenciar notificações de aniversário" 
ON public.birthday_notifications 
FOR ALL 
USING (is_sede_admin() OR (church_id = get_user_igreja_id()));

-- Trigger para updated_at
CREATE TRIGGER update_birthday_notifications_updated_at
  BEFORE UPDATE ON public.birthday_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Criar tabela para log de notificações enviadas
CREATE TABLE public.birthday_notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  notification_config_id UUID NOT NULL REFERENCES public.birthday_notifications(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notification_type TEXT NOT NULL,
  recipient TEXT NOT NULL, -- email ou telefone
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'delivered'
  error_message TEXT,
  message_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS no log
ALTER TABLE public.birthday_notification_logs ENABLE ROW LEVEL SECURITY;

-- Política para visualizar logs
CREATE POLICY "Admin pode ver logs de notificação" 
ON public.birthday_notification_logs 
FOR SELECT 
USING (is_sede_admin() OR EXISTS(
  SELECT 1 FROM public.pessoas p 
  WHERE p.id = pessoa_id AND p.church_id = get_user_igreja_id()
));

-- Inserir configuração padrão
INSERT INTO public.birthday_notifications (
  notification_type,
  days_before,
  message_template,
  subject_template,
  is_active
) VALUES (
  'email',
  0,
  'Querido(a) {nome}, hoje é seu dia especial! 🎉

Que Deus continue abençoando sua vida com muita alegria, paz e prosperidade. 
Desejamos que este novo ano seja repleto de conquistas e momentos felizes ao lado das pessoas que você ama.

Com carinho,
CBN Kerigma ❤️',
  'Feliz Aniversário, {nome}! 🎂✨',
  true
);