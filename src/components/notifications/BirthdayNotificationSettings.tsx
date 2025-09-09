import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Bell, Mail, MessageSquare, Play, Calendar, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationConfig {
  id: string;
  is_active: boolean;
  notification_type: string;
  days_before: number;
  message_template: string;
  subject_template: string;
  send_time: string;
}

interface NotificationLog {
  id: string;
  pessoa_nome: string;
  notification_type: string;
  recipient: string;
  status: string;
  sent_at: string;
}

const BirthdayNotificationSettings: React.FC = () => {
  const [configs, setConfigs] = useState<NotificationConfig[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<NotificationConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
    loadLogs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de notificação.",
        variant: "destructive",
      });
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_notification_logs')
        .select(`
          id,
          notification_type,
          recipient,
          status,
          sent_at,
          pessoas!inner(nome_completo)
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const formattedLogs = data?.map((log: any) => ({
        id: log.id,
        pessoa_nome: log.pessoas?.nome_completo || 'N/A',
        notification_type: log.notification_type,
        recipient: log.recipient,
        status: log.status,
        sent_at: log.sent_at,
      })) || [];

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (config: Partial<NotificationConfig>) => {
    try {
      if (editingConfig) {
        const { error } = await supabase
          .from('birthday_notifications')
          .update(config)
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast({
          title: "Configuração atualizada",
          description: "As configurações de notificação foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('birthday_notifications')
          .insert(config);

        if (error) throw error;
        toast({
          title: "Configuração criada",
          description: "Nova configuração de notificação criada com sucesso.",
        });
      }

      loadConfigs();
      setIsDialogOpen(false);
      setEditingConfig(null);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (config: NotificationConfig) => {
    try {
      const { error } = await supabase
        .from('birthday_notifications')
        .update({ is_active: !config.is_active })
        .eq('id', config.id);

      if (error) throw error;
      
      loadConfigs();
      toast({
        title: config.is_active ? "Notificação desativada" : "Notificação ativada",
        description: `A configuração foi ${config.is_active ? 'desativada' : 'ativada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da configuração.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotifications = async () => {
    try {
      const response = await supabase.functions.invoke('birthday-notifications', {
        body: { source: 'manual_test' }
      });

      if (response.error) throw response.error;

      toast({
        title: "Teste executado",
        description: "O teste de notificações foi executado. Verifique os logs para ver os resultados.",
      });
      
      // Recarregar logs após o teste
      setTimeout(loadLogs, 2000);
    } catch (error) {
      console.error('Erro ao testar notificações:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível executar o teste de notificações.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'both': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Configurações de Notificação</h3>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTestNotifications} size="sm" variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Testar Envio
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingConfig(null)}>
                <Bell className="h-4 w-4 mr-2" />
                Nova Configuração
              </Button>
            </DialogTrigger>
            <ConfigDialog
              config={editingConfig}
              onSave={handleSaveConfig}
              onClose={() => setIsDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Configurações existentes */}
      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  {getNotificationTypeIcon(config.notification_type)}
                  <span className="font-medium">
                    {config.notification_type === 'email' && 'Email'}
                    {config.notification_type === 'whatsapp' && 'WhatsApp'}
                    {config.notification_type === 'both' && 'Email + WhatsApp'}
                  </span>
                  <Badge variant={config.is_active ? 'default' : 'secondary'}>
                    {config.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {config.days_before === 0 ? 'No dia' : `${config.days_before} dias antes`}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {config.send_time}
                  </div>
                </div>

                <div className="text-sm">
                  <strong>Assunto:</strong> {config.subject_template}
                </div>
                <div className="text-sm">
                  <strong>Mensagem:</strong> {config.message_template.substring(0, 100)}...
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={config.is_active}
                  onCheckedChange={() => handleToggleActive(config)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingConfig(config);
                    setIsDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Logs recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Notificações Enviadas Recentemente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma notificação foi enviada ainda
            </div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getNotificationTypeIcon(log.notification_type)}
                    <div>
                      <div className="font-medium">{log.pessoa_nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.recipient} • {new Date(log.sent_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status === 'sent' && 'Enviado'}
                    {log.status === 'failed' && 'Falhou'}
                    {log.status === 'delivered' && 'Entregue'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente do diálogo de configuração
const ConfigDialog: React.FC<{
  config: NotificationConfig | null;
  onSave: (config: Partial<NotificationConfig>) => void;
  onClose: () => void;
}> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    notification_type: config?.notification_type || 'email',
    days_before: config?.days_before || 0,
    message_template: config?.message_template || 'Querido(a) {nome}, hoje é seu dia especial! 🎉\n\nQue Deus continue abençoando sua vida com muita alegria, paz e prosperidade.\n\nCom carinho,\nCBN Kerigma ❤️',
    subject_template: config?.subject_template || 'Feliz Aniversário, {nome}! 🎂✨',
    send_time: config?.send_time || '09:00',
    is_active: config?.is_active ?? true,
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {config ? 'Editar Configuração' : 'Nova Configuração de Notificação'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="notification_type">Tipo de Notificação</Label>
          <Select
            value={formData.notification_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, notification_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp (em breve)</SelectItem>
              <SelectItem value="both">Email + WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="days_before">Dias Antes do Aniversário</Label>
            <Input
              id="days_before"
              type="number"
              min="0"
              max="30"
              value={formData.days_before}
              onChange={(e) => setFormData(prev => ({ ...prev, days_before: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="send_time">Horário de Envio</Label>
            <Input
              id="send_time"
              type="time"
              value={formData.send_time}
              onChange={(e) => setFormData(prev => ({ ...prev, send_time: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject_template">Assunto do Email</Label>
          <Input
            id="subject_template"
            value={formData.subject_template}
            onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
            placeholder="Ex: Feliz Aniversário, {nome}! 🎂"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use {'{nome}'} para o primeiro nome e {'{nome_completo}'} para o nome completo
          </p>
        </div>

        <div>
          <Label htmlFor="message_template">Mensagem</Label>
          <Textarea
            id="message_template"
            rows={6}
            value={formData.message_template}
            onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
            placeholder="Digite sua mensagem personalizada..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use {'{nome}'} para o primeiro nome e {'{nome_completo}'} para o nome completo
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Configuração ativa</Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {config ? 'Atualizar' : 'Criar'} Configuração
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default BirthdayNotificationSettings;