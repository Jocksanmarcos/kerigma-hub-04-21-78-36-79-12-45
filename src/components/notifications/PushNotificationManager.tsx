import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  Calendar, 
  Book, 
  Users, 
  DollarSign,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationPreferences {
  eventos_proximos: boolean;
  novos_conteudos_ensino: boolean;
  lembretes_celula: boolean;
  lembretes_financeiro: boolean;
  horario_preferido: string;
}

export const PushNotificationManager: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    eventos_proximos: true,
    novos_conteudos_ensino: true,
    lembretes_celula: true,
    lembretes_financeiro: false,
    horario_preferido: '09:00:00'
  });
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se Push Notifications são suportadas
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar preferências:', error);
        return;
      }

      if (data) {
        setPreferences({
          eventos_proximos: (data as any).eventos_proximos || true,
          novos_conteudos_ensino: (data as any).novos_conteudos_ensino || true,
          lembretes_celula: (data as any).lembretes_celula || true,
          lembretes_financeiro: (data as any).lembretes_financeiro || false,
          horario_preferido: (data as any).horario_preferido || '09:00:00'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.user.id,
          ...newPreferences
        });

      if (error) {
        throw error;
      }

      setPreferences(newPreferences);
      toast({
        title: "Preferências salvas!",
        description: "Suas configurações de notificação foram atualizadas.",
      });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar preferências de notificação.",
        variant: "destructive"
      });
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeUser();
        toast({
          title: "Notificações habilitadas!",
          description: "Você receberá notificações importantes do sistema.",
        });
      } else {
        toast({
          title: "Permissão negada",
          description: "Não será possível enviar notificações.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar permissão para notificações.",
        variant: "destructive"
      });
    }
  };

  const subscribeUser = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Registrar o token (simulado - em produção usar Firebase)
      const fakeToken = `web_token_${user.user.id}_${Date.now()}`;
      
      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: user.user.id,
          token: fakeToken,
          device_type: 'web',
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          },
          active: true
        });

      if (error) {
        throw error;
      }

      setIsSubscribed(true);
    } catch (error) {
      console.error('Erro ao registrar token:', error);
    }
  };

  const unsubscribeUser = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ active: false })
        .eq('user_id', user.user.id);

      if (error) {
        throw error;
      }

      setIsSubscribed(false);
      toast({
        title: "Notificações desabilitadas",
        description: "Você não receberá mais notificações push.",
      });
    } catch (error) {
      console.error('Erro ao desinscrever:', error);
    }
  };

  const testNotification = async () => {
    try {
      const response = await supabase.functions.invoke('push-notifications', {
        body: {
          title: 'Teste de Notificação',
          body: 'Esta é uma notificação de teste do Kerigma Hub',
          type: 'test',
          send_immediately: true
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Notificação enviada!",
        description: "Verifique se recebeu a notificação de teste.",
      });
    } catch (error) {
      console.error('Erro ao enviar notificação teste:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação de teste.",
        variant: "destructive"
      });
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Seu navegador não suporta notificações push.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status das notificações */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Status das Notificações</h3>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' && isSubscribed ? 'Ativas' : 
                 permission === 'denied' ? 'Bloqueadas' : 'Inativas'}
              </p>
            </div>
            {permission !== 'granted' ? (
              <Button onClick={requestPermission}>
                Habilitar Notificações
              </Button>
            ) : isSubscribed ? (
              <Button variant="outline" onClick={unsubscribeUser}>
                Desabilitar
              </Button>
            ) : (
              <Button onClick={subscribeUser}>
                Reativar
              </Button>
            )}
          </div>

          {/* Teste de notificação */}
          {permission === 'granted' && isSubscribed && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Teste de Notificação</h4>
                <p className="text-sm text-muted-foreground">
                  Envie uma notificação de teste para verificar se está funcionando
                </p>
              </div>
              <Button variant="outline" onClick={testNotification}>
                Enviar Teste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferências de notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <Label>Eventos Próximos</Label>
                <p className="text-sm text-muted-foreground">
                  Lembrete 24h antes de eventos
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.eventos_proximos}
              onCheckedChange={(checked) => updatePreference('eventos_proximos', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="h-5 w-5 text-primary" />
              <div>
                <Label>Novos Conteúdos de Ensino</Label>
                <p className="text-sm text-muted-foreground">
                  Quando novos cursos ou materiais são adicionados
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.novos_conteudos_ensino}
              onCheckedChange={(checked) => updatePreference('novos_conteudos_ensino', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <Label>Lembretes de Célula</Label>
                <p className="text-sm text-muted-foreground">
                  Reuniões e atividades da célula
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.lembretes_celula}
              onCheckedChange={(checked) => updatePreference('lembretes_celula', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <Label>Lembretes Financeiros</Label>
                <p className="text-sm text-muted-foreground">
                  Dízimos, ofertas e campanhas
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.lembretes_financeiro}
              onCheckedChange={(checked) => updatePreference('lembretes_financeiro', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <Label>Horário Preferido</Label>
                <p className="text-sm text-muted-foreground">
                  Melhor horário para receber notificações
                </p>
              </div>
            </div>
            <Select
              value={preferences.horario_preferido}
              onValueChange={(value) => updatePreference('horario_preferido', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="07:00:00">07:00</SelectItem>
                <SelectItem value="08:00:00">08:00</SelectItem>
                <SelectItem value="09:00:00">09:00</SelectItem>
                <SelectItem value="10:00:00">10:00</SelectItem>
                <SelectItem value="18:00:00">18:00</SelectItem>
                <SelectItem value="19:00:00">19:00</SelectItem>
                <SelectItem value="20:00:00">20:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};