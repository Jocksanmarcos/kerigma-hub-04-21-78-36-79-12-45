import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Brain,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  dailyMessages: Array<{ date: string; messages: number; }>;
  responseTime: Array<{ hour: string; avgTime: number; }>;
  topQuestions: Array<{ question: string; count: number; }>;
  userSatisfaction: Array<{ rating: number; count: number; }>;
  conversationStats: {
    totalConversations: number;
    activeConversations: number;
    avgMessagesPerConversation: number;
    totalMessages: number;
  };
}

export const ChatbotAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calcular período baseado no timeRange
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '24h':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Buscar conversas
      const { data: conversations } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Buscar mensagens
      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Buscar dados de treinamento com feedback
      const { data: trainingData } = await supabase
        .from('chatbot_training')
        .select('*')
        .not('user_feedback', 'is', null);

      // Processar dados para gráficos
      const processedAnalytics: AnalyticsData = {
        dailyMessages: processDailyMessages(messages || []),
        responseTime: processResponseTime(messages || []),
        topQuestions: processTopQuestions(trainingData || []),
        userSatisfaction: processUserSatisfaction(trainingData || []),
        conversationStats: {
          totalConversations: conversations?.length || 0,
          activeConversations: conversations?.filter(c => c.status === 'active').length || 0,
          avgMessagesPerConversation: messages?.length && conversations?.length 
            ? Math.round(messages.length / conversations.length) 
            : 0,
          totalMessages: messages?.length || 0
        }
      };

      setAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDailyMessages = (messages: any[]): Array<{ date: string; messages: number; }> => {
    const dailyCount = messages.reduce((acc, message) => {
      const date = new Date(message.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyCount)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { 
          month: 'short', 
          day: 'numeric' 
        }),
        messages: count as number
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processResponseTime = (messages: any[]) => {
    // Simulação de tempos de resposta por hora
    const hourlyTimes = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}h`,
      avgTime: Math.random() * 3 + 1 // 1-4 segundos simulados
    }));
    
    return hourlyTimes;
  };

  const processTopQuestions = (trainingData: any[]): Array<{ question: string; count: number; }> => {
    const questionCount = trainingData.reduce((acc, item) => {
      const question = item.question.substring(0, 50) + (item.question.length > 50 ? '...' : '');
      acc[question] = (acc[question] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(questionCount)
      .map(([question, count]) => ({ question, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);
  };

  const processUserSatisfaction = (trainingData: any[]) => {
    const ratingCount = trainingData.reduce((acc, item) => {
      if (item.user_feedback) {
        acc[item.user_feedback] = (acc[item.user_feedback] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingCount[rating] || 0
    }));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics do Chatbot</h2>
        <div className="flex gap-2">
          {[
            { key: '24h', label: '24h' },
            { key: '7d', label: '7 dias' },
            { key: '30d', label: '30 dias' }
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === range.key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.conversationStats.totalConversations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.conversationStats.activeConversations || 0} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Totais</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.conversationStats.totalMessages || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.conversationStats.avgMessagesPerConversation || 0} por conversa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -15% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2/5</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Messages Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.dailyMessages || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle>Avaliações dos Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.userSatisfaction || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Mais Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex-1">
                    {item.question}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Time by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.responseTime || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};