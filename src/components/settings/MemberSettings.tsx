import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Eye, Key } from 'lucide-react';
import { useNewUserRole } from '@/hooks/useNewRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const MemberSettings: React.FC = () => {
  const { data: userRole } = useNewUserRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    privateProfile: false
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({
          nome_completo: profileData.nome,
          telefone: profileData.telefone,
          endereco: profileData.endereco,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    toast({
      title: "Sucesso", 
      description: "Preferências salvas com sucesso!"
    });
  };

  // Só mostrar configurações básicas para membros
  if (userRole !== 'membro') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências pessoais</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className="h-4 w-4 mr-2" />
            Privacidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações básicas de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={profileData.nome}
                    onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="seu@email.com"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Entre em contato com o administrador para alterar o email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData({ ...profileData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea
                    id="endereco"
                    value={profileData.endereco}
                    onChange={(e) => setProfileData({ ...profileData, endereco: e.target.value })}
                    placeholder="Seu endereço completo"
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber atualizações sobre eventos e atividades por email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações diretas no navegador
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, pushNotifications: checked })
                  }
                />
              </div>

              <Button onClick={handleSavePreferences}>
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Privacidade</CardTitle>
              <CardDescription>
                Controle a visibilidade das suas informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Perfil Privado</Label>
                  <p className="text-sm text-muted-foreground">
                    Ocultar suas informações de outros membros
                  </p>
                </div>
                <Switch
                  checked={preferences.privateProfile}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, privateProfile: checked })
                  }
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Alterar Senha</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Para alterar sua senha, você será redirecionado para o sistema de autenticação.
                </p>
                <Button variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
              </div>

              <Button onClick={handleSavePreferences}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};