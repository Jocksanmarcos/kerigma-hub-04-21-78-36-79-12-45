import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, HelpCircle, BookOpen, Users, Settings, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { useChatbotSupport } from '@/hooks/useChatbotSupport';

export const ChatbotSupporte: React.FC = () => {
  const { messages, loading, sendMessage, quickSuggestions } = useChatbotSupport();
  const [novaMensagem, setNovaMensagem] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoriaIcon = (categoria?: string) => {
    switch (categoria) {
      case 'tutorial': return <BookOpen className="h-3 w-3" />;
      case 'tip': return <HelpCircle className="h-3 w-3" />;
      case 'navigation': return <Settings className="h-3 w-3" />;
      case 'financial': return <DollarSign className="h-3 w-3" />;
      case 'people': return <Users className="h-3 w-3" />;
      case 'events': return <Calendar className="h-3 w-3" />;
      case 'reports': return <FileText className="h-3 w-3" />;
      case 'resources': return <Building className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getCategoriaColor = (categoria?: string) => {
    switch (categoria) {
      case 'tutorial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'tip': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'navigation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'financial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'people': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'events': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'reports': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'resources': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleEnviarMensagem = async (mensagem: string = novaMensagem) => {
    if (!mensagem.trim() || loading) return;
    
    setNovaMensagem('');
    await sendMessage(mensagem);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensagem();
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sugestões Rápidas */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Sugestões Rápidas
            </CardTitle>
            <CardDescription>
              Clique para enviar perguntas comuns sobre a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickSuggestions.map((sugestao, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-3 text-left text-sm"
                onClick={() => handleEnviarMensagem(sugestao)}
                disabled={loading}
              >
                <div className="flex items-start space-x-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-wrap">{sugestao}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Interface do Chat */}
      <div className="lg:col-span-3">
        <Card className="h-[700px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span>Assistente Inteligente - Kerigma Hub</span>
            </CardTitle>
            <CardDescription>
              Assistente especializado para ajudar com dúvidas sobre a plataforma
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Área de Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`flex ${mensagem.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        mensagem.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-muted mr-4'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {mensagem.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {mensagem.role === 'user' ? 'Você' : 'Assistente Kerigma Hub'}
                        </span>
                        {mensagem.category && (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getCategoriaColor(mensagem.category)}`}
                          >
                            {getCategoriaIcon(mensagem.category)}
                            <span className="ml-1 capitalize">{mensagem.category}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {mensagem.content}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {mensagem.timestamp.toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4 mr-4">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm">Assistente está digitando...</span>
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
            <div className="p-4 border-t bg-background flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua dúvida sobre a plataforma..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleEnviarMensagem()}
                  disabled={loading || !novaMensagem.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};