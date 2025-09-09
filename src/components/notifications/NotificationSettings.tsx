import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
// import { useNotifications } from '@/hooks/useNotifications'; // Temporariamente desabilitado
import { Bell, Mail, Smartphone, Calendar, BookOpen, Users } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  // Configurações temporárias
  const settings = { events: true, teaching_content: true, cell_messages: true, email: true, push: false };
  const updateSettings = () => {};

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSettings();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificação
        </CardTitle>
        <CardDescription>
          Configure como e quando você deseja receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-4">Tipos de Notificação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="events" className="text-sm font-medium">
                    Eventos
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Lembretes de eventos próximos
                  </p>
                </div>
              </div>
              <Switch
                id="events"
                checked={settings.events}
                onCheckedChange={(checked) => handleSettingChange('events', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="teaching" className="text-sm font-medium">
                    Conteúdo de Ensino
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Novos cursos e materiais
                  </p>
                </div>
              </div>
              <Switch
                id="teaching"
                checked={settings.teaching_content}
                onCheckedChange={(checked) => handleSettingChange('teaching_content', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <Label htmlFor="cell" className="text-sm font-medium">
                    Mensagens da Célula
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Comunicados dos líderes
                  </p>
                </div>
              </div>
              <Switch
                id="cell"
                checked={settings.cell_messages}
                onCheckedChange={(checked) => handleSettingChange('cell_messages', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-4">Métodos de Entrega</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-orange-500" />
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receber por email
                  </p>
                </div>
              </div>
              <Switch
                id="email"
                checked={settings.email}
                onCheckedChange={(checked) => handleSettingChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-red-500" />
                <div>
                  <Label htmlFor="push" className="text-sm font-medium">
                    Notificações Push
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notificações instantâneas no navegador
                  </p>
                </div>
              </div>
              <Switch
                id="push"
                checked={settings.push}
                onCheckedChange={(checked) => handleSettingChange('push', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;