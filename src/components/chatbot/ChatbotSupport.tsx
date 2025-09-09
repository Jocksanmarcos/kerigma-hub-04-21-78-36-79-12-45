import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { useChatbotSupport } from '@/hooks/useChatbotSupport';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
}

interface ChatbotSupportProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const ChatbotSupport: React.FC<ChatbotSupportProps> = ({
  isMinimized = false,
  onToggleMinimize
}) => {
  const { 
    messages, 
    loading, 
    sendMessage, 
    quickSuggestions 
  } = useChatbotSupport();
  
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const messageToSend = newMessage;
    setNewMessage('');
    
    await sendMessage(messageToSend);
    
    // Focus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setNewMessage(suggestion);
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'tutorial': return <BookOpen className="h-3 w-3" />;
      case 'tip': return <Lightbulb className="h-3 w-3" />;
      case 'help': return <HelpCircle className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'tutorial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'tip': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'help': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-16 h-16 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
          className="w-full h-full rounded-full"
        >
          <MessageSquare className="h-6 w-6 text-primary" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-xl z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            Suporte Inteligente
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-sm text-muted-foreground mb-2">Sugestões rápidas:</p>
            <div className="grid grid-cols-1 gap-1">
              {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-2 text-left text-xs"
                  onClick={() => handleQuickSuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium">
                      {message.role === 'user' ? 'Você' : 'Assistente'}
                    </span>
                    {message.category && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getCategoryColor(message.category)}`}
                      >
                        {getCategoryIcon(message.category)}
                        <span className="ml-1 capitalize">{message.category}</span>
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-3 w-3" />
                    <span className="text-sm">Assistente está digitando...</span>
                    <div className="flex gap-1">
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

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Digite sua pergunta..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={loading || !newMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};