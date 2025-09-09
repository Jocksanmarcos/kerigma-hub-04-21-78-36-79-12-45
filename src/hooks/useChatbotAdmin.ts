import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatbotStats {
  conversations: number;
  newConversationsToday: number;
  messages: number;
  messagesToday: number;
  knowledgeItems: number;
  aiAccuracy: number;
  autoLearning: boolean;
}

export function useChatbotAdmin() {
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas de conversas
      const { data: conversationsData } = await supabase
        .from('whatsapp_conversations')
        .select('id, created_at');

      // Buscar estatísticas de mensagens
      const { data: messagesData } = await supabase
        .from('whatsapp_messages')
        .select('id, created_at');

      // Buscar base de conhecimento
      const { data: knowledgeData } = await supabase
        .from('chatbot_knowledge')
        .select('id')
        .eq('active', true);

      // Buscar configurações
      const { data: settingsData } = await supabase
        .from('chatbot_settings')
        .select('*');

      const settings = settingsData?.reduce((acc: any, setting: any) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {}) || {};

      const today = new Date().toISOString().split('T')[0];

      const newStats: ChatbotStats = {
        conversations: conversationsData?.length || 0,
        newConversationsToday: conversationsData?.filter(c => 
          c.created_at.startsWith(today)
        ).length || 0,
        messages: messagesData?.length || 0,
        messagesToday: messagesData?.filter(m => 
          m.created_at.startsWith(today)
        ).length || 0,
        knowledgeItems: knowledgeData?.length || 0,
        aiAccuracy: 0.85, // Placeholder - calcular baseado em feedbacks reais
        autoLearning: settings.auto_learning?.enabled || false
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching chatbot stats:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do chatbot.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const indexSite = async () => {
    try {
      setLoading(true);
      toast({
        title: "Indexando site...",
        description: "Isso pode levar alguns minutos.",
      });

      const { error } = await supabase.functions.invoke('chatbot-indexer', {
        body: { action: 'index_site' }
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Site indexado com sucesso. O chatbot já tem o conhecimento atualizado.",
      });

      // Atualizar stats
      await fetchStats();
    } catch (error) {
      console.error('Error indexing site:', error);
      toast({
        title: "Erro",
        description: "Não foi possível indexar o site. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const { data: conversations } = await supabase
        .from('whatsapp_conversations')
        .select('*');

      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('*');

      const { data: knowledge } = await supabase
        .from('chatbot_knowledge')
        .select('*');

      const exportData = {
        conversations,
        messages,
        knowledge,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Dados do chatbot exportados com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    }
  };

  const refreshStats = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    indexSite,
    exportData,
    refreshStats
  };
}