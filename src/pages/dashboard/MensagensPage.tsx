import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Search, Filter, Plus } from 'lucide-react';

const MensagensPage: React.FC = () => {
  const [novaMensagem, setNovaMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [conversaSelecionada, setConversaSelecionada] = useState<any>(null);
  const [mensagens, setMensagens] = useState<any[]>([]);

  React.useEffect(() => {
    document.title = "Mensagens – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Central de mensagens e comunicação");
  }, []);

  const [conversas, setConversas] = useState([
    { id: 1, nome: "Grupo Líderes", ultima: "Confirmem presença no retiro", tempo: "2h", naoLidas: 3, tipo: "grupo" },
    { id: 2, nome: "Pastor João", ultima: "Obrigado pela oração", tempo: "1d", naoLidas: 0, tipo: "individual" },
    { id: 3, nome: "Célula Centro", ultima: "Local mudou para casa da Ana", tempo: "2d", naoLidas: 1, tipo: "celula" },
    { id: 4, nome: "Ministério Louvor", ultima: "Ensaio amanhã às 19h", tempo: "3d", naoLidas: 0, tipo: "ministerio" },
  ]);

  const mensagensExemplo = {
    1: [
      { id: 1, autor: "Pastor João", texto: "Confirmem presença no retiro", tempo: "2h", minha: false },
      { id: 2, autor: "Líder Ana", texto: "Confirmado! Vou levar 3 pessoas", tempo: "1h", minha: false },
      { id: 3, autor: "Você", texto: "Também confirmado", tempo: "30min", minha: true }
    ],
    2: [
      { id: 1, autor: "Pastor João", texto: "Obrigado pela oração", tempo: "1d", minha: false },
      { id: 2, autor: "Você", texto: "Sempre, pastor!", tempo: "23h", minha: true }
    ]
  };

  const selecionarConversa = (conversa: any) => {
    setConversaSelecionada(conversa);
    setMensagens(mensagensExemplo[conversa.id as keyof typeof mensagensExemplo] || []);
    // Marcar como lida
    setConversas(conversas.map(c => c.id === conversa.id ? {...c, naoLidas: 0} : c));
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;
    
    const novaMsgObj = {
      id: Date.now(),
      autor: "Você",
      texto: novaMensagem,
      tempo: "agora",
      minha: true
    };
    
    setMensagens([...mensagens, novaMsgObj]);
    setNovaMensagem('');
    
    // Atualizar última mensagem na conversa
    setConversas(conversas.map(c => 
      c.id === conversaSelecionada.id 
        ? {...c, ultima: novaMensagem, tempo: "agora"} 
        : c
    ));
  };

  const getTipoBadge = (tipo: string) => {
    const config = {
      grupo: { variant: "default" as const, label: "Grupo" },
      individual: { variant: "secondary" as const, label: "Direto" },
      celula: { variant: "outline" as const, label: "Célula" },
      ministerio: { variant: "destructive" as const, label: "Ministério" }
    };
    const c = config[tipo as keyof typeof config] || config.grupo;
    return <Badge variant={c.variant} className="text-xs">{c.label}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
            <p className="text-muted-foreground">Central de comunicação e mensagens</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Conversa
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lista de Conversas */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversas
                  .filter(c => c.nome.toLowerCase().includes(filtro.toLowerCase()))
                  .map((conversa) => (
                    <div
                      key={conversa.id}
                      onClick={() => selecionarConversa(conversa)}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                        conversaSelecionada?.id === conversa.id 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'border-transparent hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-foreground truncate">{conversa.nome}</h3>
                          <div className="flex items-center gap-2">
                            {getTipoBadge(conversa.tipo)}
                            {conversa.naoLidas > 0 && (
                              <Badge variant="destructive" className="text-xs min-w-[20px] h-5 rounded-full">
                                {conversa.naoLidas}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversa.ultima}</p>
                        <p className="text-xs text-muted-foreground mt-1">{conversa.tempo}</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Área de Mensagens */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {conversaSelecionada ? conversaSelecionada.nome : 'Selecione uma conversa'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Área de mensagens */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {conversaSelecionada ? (
                    <div className="space-y-4">
                      {mensagens.map((mensagem) => (
                        <div
                          key={mensagem.id}
                          className={`flex ${mensagem.minha ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              mensagem.minha
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            {!mensagem.minha && (
                              <p className="text-xs opacity-70 mb-1">{mensagem.autor}</p>
                            )}
                            <p className="text-sm">{mensagem.texto}</p>
                            <p className="text-xs opacity-70 mt-1">{mensagem.tempo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Selecione uma conversa para começar</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input de nova mensagem */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={conversaSelecionada ? "Digite sua mensagem..." : "Selecione uma conversa primeiro"}
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), enviarMensagem())}
                      className="flex-1 min-h-[44px] max-h-[120px] resize-none"
                      disabled={!conversaSelecionada}
                    />
                    <Button size="icon" onClick={enviarMensagem} disabled={!conversaSelecionada || !novaMensagem.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MensagensPage;