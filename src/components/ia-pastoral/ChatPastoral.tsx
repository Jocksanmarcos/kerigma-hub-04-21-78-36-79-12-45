import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, Heart, BookOpen, Users } from 'lucide-react';

interface Mensagem {
  id: string;
  tipo: 'user' | 'bot';
  conteudo: string;
  timestamp: Date;
  categoria?: string;
}

export const ChatPastoral: React.FC = () => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      tipo: 'bot',
      conteudo: 'Olá! Sou seu assistente pastoral com IA. Como posso ajudá-lo hoje? Posso auxiliar com orientações bíblicas, sugestões de aconselhamento, planejamento pastoral e muito mais.',
      timestamp: new Date(),
      categoria: 'saudacao'
    }
  ]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sugestões rápidas
  const sugestoesRapidas = [
    { texto: 'Como aconselhar sobre ansiedade?', categoria: 'aconselhamento' },
    { texto: 'Versículos sobre perdão', categoria: 'biblico' },
    { texto: 'Plano de discipulado para novos convertidos', categoria: 'discipulado' },
    { texto: 'Como organizar um retiro espiritual?', categoria: 'eventos' }
  ];

  const enviarMensagem = async (mensagem: string = novaMensagem) => {
    if (!mensagem.trim()) return;

    const mensagemUser: Mensagem = {
      id: Date.now().toString(),
      tipo: 'user',
      conteudo: mensagem,
      timestamp: new Date()
    };

    setMensagens(prev => [...prev, mensagemUser]);
    setNovaMensagem('');
    setCarregando(true);

    // Simular resposta da IA (em produção, seria uma chamada real para a API)
    setTimeout(() => {
      const respostaBot: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'bot',
        conteudo: gerarRespostaMockada(mensagem),
        timestamp: new Date(),
        categoria: categorizarMensagem(mensagem)
      };

      setMensagens(prev => [...prev, respostaBot]);
      setCarregando(false);
    }, 1500);
  };

  const gerarRespostaMockada = (pergunta: string): string => {
    const perguntaLower = pergunta.toLowerCase();
    
    if (perguntaLower.includes('ansiedade')) {
      return `Para aconselhar sobre ansiedade, considere estas abordagens pastorais:

📖 **Versículos-chave:**
• Filipenses 4:6-7 - "Não andeis ansiosos por coisa alguma..."
• 1 Pedro 5:7 - "Lançando sobre ele toda a vossa ansiedade..."

🤝 **Orientações práticas:**
• Escute com empatia, sem julgamentos
• Valide os sentimentos da pessoa
• Ofereça oração e acompanhamento
• Encoraje práticas espirituais (oração, leitura bíblica)
• Se necessário, recomende ajuda profissional

💡 **Dica pastoral:** Lembre-se de que ansiedade não é falta de fé, mas uma condição humana que pode ser trabalhada com cuidado pastoral adequado.`;
    }
    
    if (perguntaLower.includes('perdão')) {
      return `Aqui estão versículos poderosos sobre perdão para seu ministério:

✝️ **Versículos fundamentais:**
• Efésios 4:32 - "Sede uns para com os outros benignos..."
• Mateus 6:14-15 - "Porque, se perdoardes aos homens..."
• Colossenses 3:13 - "Suportando-vos uns aos outros..."

📚 **Para estudo mais profundo:**
• Parábola do credor incompassivo (Mateus 18:21-35)
• O perdão de Jesus na cruz (Lucas 23:34)
• José perdoando seus irmãos (Gênesis 50:15-21)

🎯 **Aplicação prática:**
Use estes versículos em aconselhamentos sobre relacionamentos, mágoas familiares e restauração de vínculos quebrados.`;
    }
    
    if (perguntaLower.includes('discipulado') || perguntaLower.includes('novos convertidos')) {
      return `Plano de discipulado para novos convertidos (primeiros 90 dias):

🌱 **Primeiros 30 dias - Fundamentos:**
• Certeza da salvação (1 João 5:11-13)
• Importância da oração (Mateus 6:9-13)
• Leitura bíblica diária (começar com João)
• Integração na igreja local

📈 **30-60 dias - Crescimento:**
• Batismo e seu significado
• Participação em célula/pequeno grupo
• Início de estudos bíblicos temáticos
• Desenvolvimento de relacionamentos cristãos

🚀 **60-90 dias - Serviço:**
• Descoberta de dons espirituais
• Envolvimento em ministérios
• Início do discipulado de outros
• Compromisso com a visão da igreja

📝 **Materiais recomendados:** Livros básicos, estudos bíblicos estruturados e acompanhamento semanal.`;
    }
    
    return `Obrigado pela sua pergunta! Como assistente pastoral, posso ajudar com:

🔹 **Aconselhamento bíblico** - Orientações baseadas nas Escrituras
🔹 **Planejamento ministerial** - Estratégias para seu ministério
🔹 **Estudos bíblicos** - Sugestões de temas e versículos
🔹 **Discipulado** - Planos personalizados de crescimento
🔹 **Eventos da igreja** - Ideias para programações especiais

Como posso ser mais específico para ajudá-lo?`;
  };

  const categorizarMensagem = (mensagem: string): string => {
    const mensagemLower = mensagem.toLowerCase();
    if (mensagemLower.includes('aconselhamento') || mensagemLower.includes('ansiedade')) return 'aconselhamento';
    if (mensagemLower.includes('versículo') || mensagemLower.includes('bíblia')) return 'biblico';
    if (mensagemLower.includes('discipulado')) return 'discipulado';
    if (mensagemLower.includes('evento') || mensagemLower.includes('retiro')) return 'eventos';
    return 'geral';
  };

  const getCategoriaIcon = (categoria?: string) => {
    switch (categoria) {
      case 'aconselhamento': return <Heart className="h-3 w-3" />;
      case 'biblico': return <BookOpen className="h-3 w-3" />;
      case 'discipulado': return <Users className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getCategoriaColor = (categoria?: string) => {
    switch (categoria) {
      case 'aconselhamento': return 'bg-red-100 text-red-800';
      case 'biblico': return 'bg-blue-100 text-blue-800';
      case 'discipulado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sugestões Rápidas */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sugestões Rápidas</CardTitle>
            <CardDescription>
              Clique para enviar perguntas comuns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sugestoesRapidas.map((sugestao, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => enviarMensagem(sugestao.texto)}
              >
                <div className="flex items-start space-x-2">
                  {getCategoriaIcon(sugestao.categoria)}
                  <span className="text-sm">{sugestao.texto}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-3">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Assistente Pastoral IA</span>
            </CardTitle>
            <CardDescription>
              Converse com nossa IA especializada em assuntos pastorais
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Área de Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mensagens.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`flex ${mensagem.tipo === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        mensagem.tipo === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {mensagem.tipo === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {mensagem.tipo === 'user' ? 'Você' : 'IA Pastoral'}
                        </span>
                        {mensagem.categoria && (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getCategoriaColor(mensagem.categoria)}`}
                          >
                            {getCategoriaIcon(mensagem.categoria)}
                            <span className="ml-1 capitalize">{mensagem.categoria}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {mensagem.conteudo}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {mensagem.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {carregando && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm">IA Pastoral está digitando...</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua pergunta pastoral..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                  disabled={carregando}
                />
                <Button 
                  onClick={() => enviarMensagem()}
                  disabled={carregando || !novaMensagem.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};