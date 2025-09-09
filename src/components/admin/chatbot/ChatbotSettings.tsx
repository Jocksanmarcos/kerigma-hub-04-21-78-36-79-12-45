import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Phone,
  Brain,
  MessageSquare,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatbotSetting {
  setting_key: string;
  setting_value: any;
  description: string;
}

export const ChatbotSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data?.reduce((acc: Record<string, any>, setting: ChatbotSetting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {}) || {};

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'setting_key' 
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      // Salvar todas as configurações
      const promises = Object.entries(settings).map(([key, value]) => 
        updateSetting(key, value)
      );
      
      await Promise.all(promises);

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configurações do Chatbot</h2>
        <Button onClick={saveAllSettings} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configurações WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome-message"
                value={settings.whatsapp_welcome_message?.message || ''}
                onChange={(e) => handleSettingChange('whatsapp_welcome_message', {
                  message: e.target.value
                })}
                placeholder="Olá! 👋 Sou o assistente virtual da Igreja..."
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Número Configurado</h4>
              <p className="text-sm text-muted-foreground">
                +55 98 98837-4670
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure este número no Facebook Business Manager
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personalidade da IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Personalidade da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-context">Contexto e Personalidade</Label>
              <Textarea
                id="ai-context"
                value={settings.chatbot_personality?.context || ''}
                onChange={(e) => handleSettingChange('chatbot_personality', {
                  ...settings.chatbot_personality,
                  context: e.target.value
                })}
                placeholder="Você é um assistente virtual de uma igreja cristã..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-tone">Tom</Label>
                <Input
                  id="ai-tone"
                  value={settings.chatbot_personality?.tone || ''}
                  onChange={(e) => handleSettingChange('chatbot_personality', {
                    ...settings.chatbot_personality,
                    tone: e.target.value
                  })}
                  placeholder="friendly"
                />
              </div>

              <div>
                <Label htmlFor="ai-style">Estilo</Label>
                <Input
                  id="ai-style"
                  value={settings.chatbot_personality?.style || ''}
                  onChange={(e) => handleSettingChange('chatbot_personality', {
                    ...settings.chatbot_personality,
                    style: e.target.value
                  })}
                  placeholder="helpful"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aprendizado Automático */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Aprendizado Automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-learning">Ativar Aprendizado</Label>
                <p className="text-xs text-muted-foreground">
                  Permite que o chatbot aprenda com as conversas
                </p>
              </div>
              <Switch
                id="auto-learning"
                checked={settings.auto_learning?.enabled || false}
                onCheckedChange={(checked) => handleSettingChange('auto_learning', {
                  ...settings.auto_learning,
                  enabled: checked
                })}
              />
            </div>

            <div>
              <Label htmlFor="confidence-threshold">Limite de Confiança (%)</Label>
              <Input
                id="confidence-threshold"
                type="number"
                min="0"
                max="100"
                value={Math.round((settings.auto_learning?.confidence_threshold || 0.8) * 100)}
                onChange={(e) => handleSettingChange('auto_learning', {
                  ...settings.auto_learning,
                  confidence_threshold: Number(e.target.value) / 100
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Apenas conversas com confiança acima deste valor serão usadas para treinar
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança e Moderação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="content-filter">Filtro de Conteúdo</Label>
                <p className="text-xs text-muted-foreground">
                  Ativar filtros para conteúdo inadequado
                </p>
              </div>
              <Switch
                id="content-filter"
                checked={settings.content_filter?.enabled || true}
                onCheckedChange={(checked) => handleSettingChange('content_filter', {
                  enabled: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rate-limit">Limite de Taxa</Label>
                <p className="text-xs text-muted-foreground">
                  Limitar mensagens por usuário por minuto
                </p>
              </div>
              <Switch
                id="rate-limit"
                checked={settings.rate_limit?.enabled || true}
                onCheckedChange={(checked) => handleSettingChange('rate_limit', {
                  ...settings.rate_limit,
                  enabled: checked
                })}
              />
            </div>

            <div>
              <Label htmlFor="max-messages">Máx. Mensagens/Minuto</Label>
              <Input
                id="max-messages"
                type="number"
                min="1"
                max="60"
                value={settings.rate_limit?.max_messages || 10}
                onChange={(e) => handleSettingChange('rate_limit', {
                  ...settings.rate_limit,
                  max_messages: Number(e.target.value)
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das Integrações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status das Integrações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">WhatsApp API</span>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                Conectado
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Gemini AI</span>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                Ativo
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Webhook</span>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                Funcionando
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Instruções de Configuração
            </h4>
            <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>1. Configure o webhook no Meta Business: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">https://sua-funcao.supabase.co/functions/v1/whatsapp-webhook</code></li>
              <li>2. Token de verificação: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">webhook_verify_token</code></li>
              <li>3. Configure as permissões necessárias no Facebook Business Manager</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};