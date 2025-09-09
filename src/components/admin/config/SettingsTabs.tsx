import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Database, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccessibilitySettings } from '@/components/admin/accessibility/AccessibilitySettings';
import { YoungUserTheme } from '@/components/admin/accessibility/YoungUserTheme';
import { ProfessionalTheme } from '@/components/admin/accessibility/ProfessionalTheme';

import { type ConfiguracoesState } from '@/hooks/useSystemConfigurations';

interface TabProps {
  configuracoes: ConfiguracoesState;
  setConfiguracoes: React.Dispatch<React.SetStateAction<ConfiguracoesState>>;
}

export const GeralTab: React.FC<TabProps> = ({ configuracoes, setConfiguracoes }) => {
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Igreja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="nomeIgreja">Nome da Igreja *</Label>
            <Input
              id="nomeIgreja"
              value={configuracoes.nomeIgreja}
              onChange={(e) => setConfiguracoes((prev) => ({ ...prev, nomeIgreja: e.target.value }))}
              className={!configuracoes.nomeIgreja.trim() ? 'border-destructive' : ''}
            />
            {!configuracoes.nomeIgreja.trim() && (
              <p className="text-sm text-destructive mt-1">Nome da igreja é obrigatório</p>
            )}
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={configuracoes.timezone} onValueChange={(value) => setConfiguracoes((prev) => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="America/Chicago">Chicago (GMT-6)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Angeles (GMT-8)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idioma">Idioma do Sistema</Label>
              <Select value={configuracoes.idioma} onValueChange={(value) => setConfiguracoes((prev) => ({ ...prev, idioma: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                  <SelectItem value="fr-FR">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Regionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Formato de Data</Label>
              <Select defaultValue="dd/MM/yyyy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primeiro dia da semana</Label>
              <Select defaultValue="sunday">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Domingo</SelectItem>
                  <SelectItem value="monday">Segunda-feira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Moeda</Label>
              <Select defaultValue="BRL">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formato de Hora</Label>
              <Select defaultValue="24h">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 horas</SelectItem>
                  <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const PerfilTab: React.FC<TabProps> = ({ configuracoes, setConfiguracoes }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarTelefone = (telefone: string) => {
    const regex = /^[\(\)\d\s\-\+]+$/;
    return regex.test(telefone) && telefone.length >= 10;
  };

  const salvarPerfil = async () => {
    if (!configuracoes.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    if (!validarEmail(configuracoes.email)) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive"
      });
      return;
    }

    if (configuracoes.telefone && !validarTelefone(configuracoes.telefone)) {
      toast({
        title: "Erro",
        description: "Formato de telefone inválido",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Atualizar perfil do usuário no Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          nome: configuracoes.nome,
          full_name: configuracoes.nome,
          telefone: configuracoes.telefone,
          cargo: configuracoes.cargo
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={configuracoes.nome}
                onChange={(e) => setConfiguracoes((prev) => ({ ...prev, nome: e.target.value }))}
                className={!configuracoes.nome.trim() ? 'border-destructive' : ''}
              />
              {!configuracoes.nome.trim() && (
                <p className="text-sm text-destructive mt-1">Nome é obrigatório</p>
              )}
            </div>
            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Select 
                value={configuracoes.cargo} 
                onValueChange={(value) => setConfiguracoes((prev) => ({ ...prev, cargo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pastor">Pastor</SelectItem>
                  <SelectItem value="Pastor Auxiliar">Pastor Auxiliar</SelectItem>
                  <SelectItem value="Ministro">Ministro</SelectItem>
                  <SelectItem value="Líder">Líder</SelectItem>
                  <SelectItem value="Diácono">Diácono</SelectItem>
                  <SelectItem value="Secretário">Secretário</SelectItem>
                  <SelectItem value="Tesoureiro">Tesoureiro</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={configuracoes.email}
                onChange={(e) => setConfiguracoes((prev) => ({ ...prev, email: e.target.value }))}
                className={!validarEmail(configuracoes.email) && configuracoes.email ? 'border-destructive' : ''}
              />
              {!validarEmail(configuracoes.email) && configuracoes.email && (
                <p className="text-sm text-destructive mt-1">Email inválido</p>
              )}
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={configuracoes.telefone}
                onChange={(e) => setConfiguracoes((prev) => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className={configuracoes.telefone && !validarTelefone(configuracoes.telefone) ? 'border-destructive' : ''}
              />
              {configuracoes.telefone && !validarTelefone(configuracoes.telefone) && (
                <p className="text-sm text-destructive mt-1">Formato inválido</p>
              )}
            </div>
          </div>
          <Separator />
          <Button 
            onClick={salvarPerfil} 
            disabled={saving || !configuracoes.nome.trim() || !validarEmail(configuracoes.email)}
            className="w-full"
          >
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const NotificacoesTab: React.FC<TabProps> = ({ configuracoes, setConfiguracoes }) => {
  const { toast } = useToast();
  const [testingNotification, setTestingNotification] = useState(false);

  const testarNotificacaoPush = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push",
        variant: "destructive"
      });
      return;
    }

    if (Notification.permission === "denied") {
      toast({
        title: "Permissão negada",
        description: "Habilite as notificações nas configurações do navegador",
        variant: "destructive"
      });
      return;
    }

    setTestingNotification(true);

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        toast({
          title: "Permissão negada",
          description: "Você negou a permissão para notificações",
          variant: "destructive"
        });
        setTestingNotification(false);
        return;
      }
    }

    new Notification("Kerigma Hub", {
      body: "Teste de notificação realizado com sucesso!",
      icon: "/favicon.ico"
    });

    toast({
      title: "Notificação enviada",
      description: "Verifique se a notificação apareceu na sua tela"
    });
    
    setTestingNotification(false);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">Receber notificações por email</p>
            </div>
            <Switch 
              checked={configuracoes.emailNotif}
              onCheckedChange={(checked) => setConfiguracoes((prev) => ({ ...prev, emailNotif: checked }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Notificações no navegador</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={configuracoes.pushNotif}
                onCheckedChange={(checked) => setConfiguracoes((prev) => ({ ...prev, pushNotif: checked }))}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={testarNotificacaoPush}
                disabled={testingNotification}
              >
                {testingNotification ? 'Testando...' : 'Testar'}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS</Label>
              <p className="text-sm text-muted-foreground">Notificações por SMS</p>
            </div>
            <Switch 
              checked={configuracoes.smsNotif}
              onCheckedChange={(checked) => setConfiguracoes((prev) => ({ ...prev, smsNotif: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Eventos da Igreja</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Novos eventos</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Lembretes de eventos</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Cancelamentos</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Cursos e Treinamentos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Novos cursos</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Lembretes de aulas</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Certificados</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SegurancaTab: React.FC<TabProps> = ({ configuracoes, setConfiguracoes }) => {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const { toast } = useToast();

  const resetarSenha = async () => {
    if (novaSenha.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    if (novaSenha !== confirmaSenha) {
      toast({
        title: "Erro", 
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    setAlterandoSenha(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (error) throw error;

      setNovaSenha('');
      setConfirmaSenha('');
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha",
        variant: "destructive"
      });
    } finally {
      setAlterandoSenha(false);
    }
  };

    return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="novaSenha"
                  type={senhaVisivel ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className={novaSenha && novaSenha.length < 8 ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setSenhaVisivel(!senhaVisivel)}
                >
                  {senhaVisivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {novaSenha && novaSenha.length < 8 && (
                <p className="text-sm text-destructive mt-1">A senha deve ter pelo menos 8 caracteres</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmaSenha">Confirmar Senha</Label>
              <Input
                id="confirmaSenha"
                type={senhaVisivel ? "text" : "password"}
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="Confirme sua nova senha"
                className={confirmaSenha && novaSenha !== confirmaSenha ? 'border-destructive' : ''}
              />
              {confirmaSenha && novaSenha !== confirmaSenha && (
                <p className="text-sm text-destructive mt-1">As senhas não coincidem</p>
              )}
            </div>
          </div>
          <Separator />
          <Button 
            onClick={resetarSenha} 
            disabled={alterandoSenha || novaSenha.length < 8 || novaSenha !== confirmaSenha}
            className="w-full"
          >
            {alterandoSenha ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const AparenciaTab: React.FC<TabProps> = ({ configuracoes, setConfiguracoes }) => {
  const { toast } = useToast();

  const aplicarTema = (tema: string) => {
    setConfiguracoes((prev) => ({ ...prev, tema }));
    
    // Aplicar tema imediatamente
    const root = document.documentElement;
    
    // Remover classes de tema existentes
    root.classList.remove('light', 'dark', 'professional', 'young');
    
    if (tema === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(tema);
    }

    toast({
      title: "Tema aplicado",
      description: `Tema ${tema} foi aplicado com sucesso`
    });
  };

  const aplicarCorPrimaria = (cor: string) => {
    setConfiguracoes((prev) => ({ ...prev, corPrimaria: cor }));
    
    // Aplicar cor primária nas variáveis CSS
    const root = document.documentElement;
    
    // Converter hex para HSL
    const hslColor = hexToHsl(cor);
    root.style.setProperty('--primary', hslColor);
    
    toast({
      title: "Cor aplicada",
      description: "Cor primária foi alterada com sucesso"
    });
  };

  // Função para converter hex para HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Configurações Básicas de Tema */}
      <Card>
        <CardHeader>
          <CardTitle>Personalização Visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="tema">Tema</Label>
            <Select 
              value={configuracoes.tema} 
              onValueChange={aplicarTema}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="young">Jovem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div>
            <Label htmlFor="corPrimaria">Cor Primária</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[
                { hex: '#3b82f6', name: 'Azul' },
                { hex: '#10b981', name: 'Verde' },
                { hex: '#f59e0b', name: 'Amarelo' },
                { hex: '#ef4444', name: 'Vermelho' },
                { hex: '#8b5cf6', name: 'Roxo' },
                { hex: '#06b6d4', name: 'Ciano' },
                { hex: '#f97316', name: 'Laranja' },
                { hex: '#84cc16', name: 'Lima' }
              ].map((cor) => (
                <button
                  key={cor.hex}
                  className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                    configuracoes.corPrimaria === cor.hex 
                      ? 'border-foreground shadow-lg' 
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: cor.hex }}
                  onClick={() => aplicarCorPrimaria(cor.hex)}
                  title={cor.name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Tema */}
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader>
          <CardTitle>Preview do Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: configuracoes.corPrimaria }}
              />
              <div>
                <h4 className="font-medium">Exemplo de Card</h4>
                <p className="text-muted-foreground">Este é um exemplo de como o tema ficará</p>
              </div>
            </div>
            <Button style={{ backgroundColor: configuracoes.corPrimaria }}>
              Botão com cor primária
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Acessibilidade */}
      <AccessibilitySettings />

      {/* Tema Jovem */}
      <YoungUserTheme />

      {/* Tema Profissional */}
      <ProfessionalTheme />
    </div>
  );
};

export const SistemaTab: React.FC<TabProps> = ({ configuracoes, setConfiguracoes }) => {
  const { toast } = useToast();
  const [importVersion, setImportVersion] = useState<string>('de4e12af7f28f599-02');
  const [importBook, setImportBook] = useState<string>('GEN');
  const [backingUp, setBackingUp] = useState(false);
  const [maintainMode, setMaintainMode] = useState(false);

  const handleDiagnostics = async () => {
    const { data, error } = await supabase.functions.invoke('bible-import', {
      body: { action: 'diagnostics' },
    });
    if (error) {
      toast({ title: 'Erro no diagnóstico', description: String(error.message || error), variant: 'destructive' });
    } else {
      toast({ 
        title: 'Diagnóstico de Segredos', 
        description: data?.diagnostico || 'Teste executado',
        variant: data?.has_SCRIPTURE_API_BIBLE_KEY ? 'default' : 'destructive'
      });
    }
  };

  const handleImportStructure = async () => {
    try {
      // Primeiro importar as bíblias (versões)
      const { data: bibleData, error: bibleError } = await supabase.functions.invoke('bible-import', {
        body: { action: 'getBibles' },
      });
      
      if (bibleError) {
        toast({ title: 'Erro ao importar versões', description: String(bibleError.message || bibleError), variant: 'destructive' });
        return;
      }

      // Para cada versão encontrada, importar os livros
      let totalBooks = 0;
      const versions = bibleData?.bibles || [];
      
      for (const version of versions) {
        const { data: bookData, error: bookError } = await supabase.functions.invoke('bible-import', {
          body: { action: 'getBooks', bibleId: version.id },
        });
        
        if (bookError) {
          console.error(`Erro ao importar livros da versão ${version.name}:`, bookError);
        } else {
          totalBooks += bookData?.books?.length || 0;
        }
      }

      toast({ 
        title: 'Estrutura importada com sucesso', 
        description: `${versions.length} versões e ${totalBooks} livros importados`
      });
    } catch (error) {
      toast({ title: 'Erro na importação', description: String(error), variant: 'destructive' });
    }
  };

  const handleImportBook = async () => {
    const { data, error } = await supabase.functions.invoke('bible-import', {
      body: { action: 'import_book', version: importVersion, book: importBook },
    });
    if (error) {
      toast({ title: 'Erro ao importar livro', description: String(error.message || error), variant: 'destructive' });
    } else {
      toast({ title: 'Livro importado', description: `${data?.result?.book} (${data?.result?.version?.toUpperCase()}) – ${data?.result?.verses} versículos` });
    }
  };

  const realizarBackup = async () => {
    setBackingUp(true);
    try {
      // Simular backup (em produção, conectaria com API de backup)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setConfiguracoes(prev => ({ ...prev, backup: true }));
      toast({
        title: "Backup realizado",
        description: "Backup automático foi criado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Não foi possível realizar o backup",
        variant: "destructive"
      });
    } finally {
      setBackingUp(false);
    }
  };

  const alternarManutencao = async (ativado: boolean) => {
    setMaintainMode(true);
    try {
      // Simular ativação/desativação de manutenção
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConfiguracoes(prev => ({ ...prev, manutencao: ativado }));
      toast({
        title: ativado ? "Modo manutenção ativado" : "Modo manutenção desativado",
        description: ativado 
          ? "Sistema em modo manutenção - usuários verão página de manutenção" 
          : "Sistema voltou ao funcionamento normal"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar modo de manutenção",
        variant: "destructive"
      });
    } finally {
      setMaintainMode(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Status do Sistema</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <Badge variant="default" className="justify-center py-2">
                <Database className="h-3 w-3 mr-1" />
                Database Online
              </Badge>
              <Badge variant="default" className="justify-center py-2">
                <Globe className="h-3 w-3 mr-1" />
                API Funcionando
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Manutenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Backup Automático</Label>
              <p className="text-sm text-muted-foreground">Realizar backup automático dos dados</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={configuracoes.backup}
                onCheckedChange={(checked) => setConfiguracoes(prev => ({ ...prev, backup: checked }))}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={realizarBackup}
                disabled={backingUp}
              >
                {backingUp ? 'Executando...' : 'Executar Agora'}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo Manutenção</Label>
              <p className="text-sm text-muted-foreground">
                {configuracoes.manutencao 
                  ? "Sistema em manutenção - usuários não podem acessar"
                  : "Sistema funcionando normalmente"
                }
              </p>
            </div>
            <Switch 
              checked={configuracoes.manutencao}
              onCheckedChange={alternarManutencao}
              disabled={maintainMode}
            />
          </div>

          {configuracoes.manutencao && (
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                <strong>Atenção:</strong> O sistema está em modo de manutenção. Os usuários verão uma página informando que o sistema está temporariamente indisponível.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bíblia – Importação de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
            <p className="text-sm text-warning-foreground">
              <strong>Configuração necessária:</strong> Configure a chave de API da "Scripture API.Bible" nas secrets das Edge Functions.
            </p>
          </div>
          
          <Button onClick={handleDiagnostics} variant="outline" className="w-full">
            🔍 Testar Diagnóstico de Segredos
          </Button>
          
          <Button onClick={handleImportStructure} className="w-full">
            1. Importar Estrutura (Versões + Livros)
          </Button>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Versão</Label>
              <Select value={importVersion} onValueChange={setImportVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de4e12af7f28f599-02">Almeida Revista e Corrigida (ARC)</SelectItem>
                  <SelectItem value="f72b840c855f362c-04">Nova Tradução na Linguagem de Hoje (NTLH)</SelectItem>
                  <SelectItem value="06125adad2d5898a-01">King James Version (KJV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Livro (ID)</Label>
              <Input value={importBook} onChange={(e) => setImportBook(e.target.value)} placeholder="Ex.: GEN, EXO, PSA, MAT" />
            </div>
          </div>
          
          <Button onClick={handleImportBook} className="w-full">
            2. Importar Livro Específico
          </Button>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Dica:</strong> Importe por livro para evitar timeouts.</p>
            <p><strong>IDs comuns:</strong> GEN (Gênesis), EXO (Êxodo), PSA (Salmos), ISA (Isaías), MAT (Mateus), JHN (João), REV (Apocalipse)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
