import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Clock,
  User,
  Bot,
  Send,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppMessage {
  id: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  created_at: string;
  status: string;
  message_type: string;
  phone_number: string;
  conversation_id: string;
}

interface WhatsAppConversation {
  id: string;
  phone_number: string;
  contact_name: string;
  last_message_at: string;
  status: string;
  metadata: any;
  created_at: string;
  whatsapp_messages?: WhatsAppMessage[];
}

export const WhatsAppConversations: React.FC = () => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        content: msg.message || msg.content || '',
        direction: (msg.direction as 'incoming' | 'outgoing') || 'incoming'
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);

      // Aqui você pode implementar o envio via API do WhatsApp
      // Por enquanto, vamos simular salvando no banco
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: selectedConversation.id,
          phone: selectedConversation.phone_number,
          message: newMessage,
          type: 'text',
          status: 'sent'
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation.id);

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.phone_number.includes(searchTerm) ||
    (conv.contact_name && conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 13 && phone.startsWith('55')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4, 9)}-${phone.slice(9)}`;
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      case 'transferred': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Lista de Conversas */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Conversas WhatsApp
              </CardTitle>
              <Badge variant="secondary">
                {conversations.length}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Carregando conversas...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa encontrada</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {conversation.contact_name || 'Contato'}
                          </span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(conversation.status)} text-white text-xs`}
                        >
                          {conversation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {formatPhoneNumber(conversation.phone_number)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(conversation.last_message_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Conversa Selecionada */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedConversation.contact_name || 'Contato'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatPhoneNumber(selectedConversation.phone_number)}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(selectedConversation.status)} text-white`}
                  >
                    {selectedConversation.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 flex flex-col">
                {/* Mensagens */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.direction === 'incoming' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.direction === 'incoming'
                              ? 'bg-muted'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.direction === 'incoming' ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Bot className="h-3 w-3" />
                            )}
                            <span className="text-xs opacity-70">
                              {message.direction === 'incoming' ? 'Cliente' : 'Bot'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input de Mensagem */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={sendingMessage}
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                <p>Escolha uma conversa da lista para visualizar as mensagens</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};