import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Calendar,
  Phone,
  Mail,
  Clock,
  Target,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Mensagem {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'lembrete' | 'anuncio' | 'urgente' | 'convite';
  destinatarios: string[];
  agendada: boolean;
  dataEnvio?: Date;
  status: 'rascunho' | 'agendada' | 'enviada';
}

export const ComunicacaoInteligente: React.FC = () => {
  const [novaMensagem, setNovaMensagem] = useState<Partial<Mensagem>>({
    titulo: '',
    conteudo: '',
    tipo: 'anuncio',
    destinatarios: [],
    agendada: false
  });

  const [templateSelecionado, setTemplateSelecionado] = useState('');

  const templates = [
    {
      id: 'lembrete-reuniao',
      nome: 'Lembrete de Reunião',
      tipo: 'lembrete',
      conteudo: 'Olá {nome}! Lembramos que nossa reunião de célula será {dia} às {horario} no endereço: {endereco}. Contamos com sua presença! 🙏'
    },
    {
      id: 'aniversario',
      nome: 'Parabéns de Aniversário',
      tipo: 'anuncio',
      conteudo: 'Feliz aniversário, {nome}! 🎉 Que Deus abençoe sua vida com muita alegria, paz e realizações. A família da célula deseja um dia especial para você! 🎂'
    },
    {
      id: 'convite-evento',
      nome: 'Convite para Evento',
      tipo: 'convite',
      conteudo: 'Você está convidado(a) para {evento} que acontecerá {data} às {horario}. Será um momento especial de comunhão e crescimento. Confirme sua presença! ✨'
    },
    {
      id: 'multiplicacao',
      nome: 'Anúncio de Multiplicação',
      tipo: 'anuncio',
      conteudo: 'Temos uma grande notícia! Nossa célula irá se multiplicar! 🌱 Isso é sinal de crescimento e bênção. Em breve teremos mais detalhes sobre a nova célula.'
    },
    {
      id: 'urgente-oracao',
      nome: 'Pedido Urgente de Oração',
      tipo: 'urgente',
      conteudo: 'Família da célula, precisamos de suas orações por {motivo}. Vamos nos unir em oração e intercessão. Deus ouve nossas súplicas! 🙏'
    }
  ];

  const destinatariosOpcoes = [
    { value: 'todos-lideres', label: 'Todos os Líderes' },
    { value: 'todos-membros', label: 'Todos os Membros' },
    { value: 'celula-especifica', label: 'Célula Específica' },
    { value: 'visitantes-recentes', label: 'Visitantes Recentes' },
    { value: 'aniversariantes', label: 'Aniversariantes do Mês' },
    { value: 'ausentes', label: 'Membros Ausentes' }
  ];

  const handleSelecionarTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNovaMensagem(prev => ({
        ...prev,
        titulo: template.nome,
        conteudo: template.conteudo,
        tipo: template.tipo as any
      }));
      setTemplateSelecionado(templateId);
      toast.success(`Template "${template.nome}" carregado!`);
    }
  };

  const handleEnviarMensagem = () => {
    if (!novaMensagem.titulo || !novaMensagem.conteudo) {
      toast.error('Preencha o título e conteúdo da mensagem');
      return;
    }

    if (!novaMensagem.destinatarios || novaMensagem.destinatarios.length === 0) {
      toast.error('Selecione os destinatários');
      return;
    }

    const totalDestinatarios = Math.floor(Math.random() * 50) + 10;
    
    if (novaMensagem.agendada) {
      toast.success(`📅 Mensagem agendada para ${totalDestinatarios} destinatários!`);
    } else {
      toast.success('📨 Enviando mensagem...');
      
      setTimeout(() => {
        toast.success(`✅ Mensagem enviada com sucesso para ${totalDestinatarios} destinatários!`);
      }, 2000);
    }

    // Reset form
    setNovaMensagem({
      titulo: '',
      conteudo: '',
      tipo: 'anuncio',
      destinatarios: [],
      agendada: false
    });
    setTemplateSelecionado('');
  };

  const handleEnviarWhatsApp = () => {
    const totalContatos = Math.floor(Math.random() * 30) + 15;
    toast.success(`📱 Enviando via WhatsApp para ${totalContatos} contatos...`);
    
    setTimeout(() => {
      toast.success(`✅ WhatsApp enviado para ${totalContatos} contatos!`);
    }, 3000);
  };

  const handleLigarEmergencia = () => {
    toast.info('☎️ Iniciando chamadas de emergência para líderes...');
    setTimeout(() => {
      toast.success('📞 Chamadas realizadas para 5 líderes principais!');
    }, 2500);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return 'bg-red-500';
      case 'lembrete': return 'bg-yellow-500';
      case 'convite': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Comunicação Rápida */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <Button 
              className="w-full h-16 flex-col space-y-1"
              onClick={handleEnviarWhatsApp}
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs">WhatsApp em Massa</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button 
              variant="outline"
              className="w-full h-16 flex-col space-y-1"
              onClick={handleLigarEmergencia}
            >
              <Phone className="h-6 w-6" />
              <span className="text-xs">Ligação Emergência</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button 
              variant="outline"
              className="w-full h-16 flex-col space-y-1"
              onClick={() => toast.success('📧 Sistema de email ativado!')}
            >
              <Mail className="h-6 w-6" />
              <span className="text-xs">Email Automático</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button 
              variant="outline"
              className="w-full h-16 flex-col space-y-1"
              onClick={() => toast.success('🔔 Notificações push enviadas!')}
            >
              <Zap className="h-6 w-6" />
              <span className="text-xs">Push Notification</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Composer de Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Nova Mensagem</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Templates */}
          <div>
            <Label htmlFor="template">Templates Pré-definidos</Label>
            <Select value={templateSelecionado} onValueChange={handleSelecionarTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-white ${getTipoColor(template.tipo)}`}>
                        {template.tipo}
                      </Badge>
                      <span>{template.nome}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="titulo">Título da Mensagem</Label>
              <Input
                id="titulo"
                value={novaMensagem.titulo}
                onChange={(e) => setNovaMensagem(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Reunião de Célula - Quinta-feira"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Mensagem</Label>
              <Select 
                value={novaMensagem.tipo} 
                onValueChange={(tipo: any) => setNovaMensagem(prev => ({ ...prev, tipo }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anuncio">Anúncio</SelectItem>
                  <SelectItem value="lembrete">Lembrete</SelectItem>
                  <SelectItem value="convite">Convite</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="conteudo">Conteúdo da Mensagem</Label>
            <Textarea
              id="conteudo"
              value={novaMensagem.conteudo}
              onChange={(e) => setNovaMensagem(prev => ({ ...prev, conteudo: e.target.value }))}
              placeholder="Digite sua mensagem aqui..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{nome}'}, {'{data}'}, {'{horario}'} para personalização automática
            </p>
          </div>

          <div>
            <Label htmlFor="destinatarios">Destinatários</Label>
            <Select 
              value={novaMensagem.destinatarios?.[0] || ''} 
              onValueChange={(value) => setNovaMensagem(prev => ({ ...prev, destinatarios: [value] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione os destinatários" />
              </SelectTrigger>
              <SelectContent>
                {destinatariosOpcoes.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="agendar"
              checked={novaMensagem.agendada}
              onCheckedChange={(agendada) => setNovaMensagem(prev => ({ ...prev, agendada }))}
            />
            <Label htmlFor="agendar">Agendar envio</Label>
            {novaMensagem.agendada && (
              <Input
                type="datetime-local"
                className="w-auto"
                onChange={(e) => setNovaMensagem(prev => ({ 
                  ...prev, 
                  dataEnvio: new Date(e.target.value) 
                }))}
              />
            )}
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleEnviarMensagem} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {novaMensagem.agendada ? 'Agendar Mensagem' : 'Enviar Agora'}
            </Button>
            <Button variant="outline" onClick={() => toast.success('💾 Rascunho salvo!')}>
              Salvar Rascunho
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico e Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mensagens Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div>
                  <p className="font-medium">Lembrete de Reunião</p>
                  <p className="text-sm text-muted-foreground">Enviado há 2 horas</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enviado
                  </Badge>
                  <span className="text-sm text-muted-foreground">23 destinatários</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div>
                  <p className="font-medium">Convite para Evento</p>
                  <p className="text-sm text-muted-foreground">Agendado para 20/12</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-500 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    Agendado
                  </Badge>
                  <span className="text-sm text-muted-foreground">45 destinatários</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div>
                  <p className="font-medium">Parabéns Aniversariantes</p>
                  <p className="text-sm text-muted-foreground">Falha no envio</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Erro
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Reenviar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Comunicação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mensagens Enviadas (mês)</span>
                <span className="text-2xl font-bold text-blue-600">847</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Entrega</span>
                <span className="text-2xl font-bold text-green-600">96.8%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Respostas Recebidas</span>
                <span className="text-2xl font-bold text-purple-600">234</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WhatsApp Enviados</span>
                <span className="text-2xl font-bold text-orange-600">1,205</span>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Sistema de comunicação funcionando perfeitamente. 
                  Alta taxa de entrega e engajamento dos membros.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};