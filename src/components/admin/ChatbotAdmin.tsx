import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageSquare, 
  Database, 
  Settings, 
  Phone, 
  BarChart3,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useChatbotAdmin } from '@/hooks/useChatbotAdmin';
import { ChatbotKnowledge } from './chatbot/ChatbotKnowledge';
import { ChatbotTraining } from './chatbot/ChatbotTraining';
import { ChatbotSettings } from './chatbot/ChatbotSettings';
import { WhatsAppConversations } from './chatbot/WhatsAppConversations';
import { ChatbotAnalytics } from './chatbot/ChatbotAnalytics';

export const ChatbotAdmin: React.FC = () => {
  const {
    stats,
    loading,
    indexSite,
    exportData,
    refreshStats
  } = useChatbotAdmin();

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chatbot Inteligente
          </h1>
          <p className="text-muted-foreground">
            Gerencie o assistente virtual da igreja com WhatsApp e IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshStats} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={indexSite} disabled={loading}>
            <Brain className="h-4 w-4 mr-2" />
            Indexar Site
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversas WhatsApp
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newConversationsToday || 0} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mensagens Processadas
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.messages || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.messagesToday || 0} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Base de Conhecimento
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.knowledgeItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              itens ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Precisão da IA
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.aiAccuracy ? `${Math.round(stats.aiAccuracy * 100)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              baseado em feedbacks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ChatbotAnalytics />
        </TabsContent>

        <TabsContent value="knowledge">
          <ChatbotKnowledge />
        </TabsContent>

        <TabsContent value="conversations">
          <WhatsAppConversations />
        </TabsContent>

        <TabsContent value="training">
          <ChatbotTraining />
        </TabsContent>

        <TabsContent value="settings">
          <ChatbotSettings />
        </TabsContent>
      </Tabs>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">WhatsApp Webhook</span>
              <Badge variant="default" className="bg-green-500">
                Ativo
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">IA Gemini</span>
              <Badge variant="default" className="bg-green-500">
                Conectado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aprendizado Automático</span>
              <Badge variant="secondary">
                {stats?.autoLearning ? 'Ativado' : 'Desativado'}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Número WhatsApp Configurado</h4>
            <p className="text-sm text-muted-foreground">
              +55 98 98837-4670
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure este número no Facebook Business para receber mensagens
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};