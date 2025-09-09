import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Users, 
  Calendar, 
  Info, 
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommunityNewsItem {
  id: string;
  type: 'announcement' | 'event' | 'achievement' | 'prayer';
  title: string;
  content: string;
  date: Date;
  priority: 'low' | 'medium' | 'high';
  author?: string;
}

export const CommunityNews: React.FC = () => {
  const [newsItems, setNewsItems] = useState<CommunityNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityNews();
  }, []);

  const loadCommunityNews = async () => {
    try {
      // Mock data - em produção viria de comunicados e notificações reais
      const mockNews: CommunityNewsItem[] = [
        {
          id: '1',
          type: 'announcement',
          title: 'Novo Curso: Fundamentos da Fé',
          content: 'Estão abertas as inscrições para o novo curso de Fundamentos da Fé. Ideal para novos convertidos e quem deseja fortalecer os conhecimentos básicos.',
          date: new Date(),
          priority: 'high',
          author: 'Pastor João'
        },
        {
          id: '2',
          type: 'event',
          title: 'Vigília de Oração - Próxima Sexta',
          content: 'Junte-se a nós para uma noite especial de oração e adoração. Início às 20h no templo principal.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          author: 'Equipe de Intercessão'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Célula da Zona Norte Batiza 5 Novos Membros',
          content: 'Celebramos a decisão de 5 pessoas que entregaram suas vidas a Cristo através do trabalho da célula liderada pelo irmão Carlos.',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          priority: 'low',
          author: 'Pastor de Rede'
        }
      ];

      setNewsItems(mockNews);
    } catch (error) {
      console.error('Erro ao carregar comunicados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNewsIcon = (type: string) => {
    switch (type) {
      case 'announcement': return Info;
      case 'event': return Calendar;
      case 'achievement': return Users;
      case 'prayer': return MessageCircle;
      default: return Bell;
    }
  };

  const getNewsColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Importante';
      case 'medium': return 'Normal';
      case 'low': return 'Informativo';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Comunicados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Comunicados
          </div>
          <Badge variant="secondary" className="text-xs">
            {newsItems.length} novos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {newsItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum comunicado no momento</p>
            <p className="text-sm">Fique atento às novidades!</p>
          </div>
        ) : (
          newsItems.map((news) => {
            const NewsIcon = getNewsIcon(news.type);
            return (
              <Card 
                key={news.id} 
                className={`border ${getNewsColor(news.priority)} cursor-pointer hover:shadow-sm transition-all`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getNewsColor(news.priority)}`}>
                      <NewsIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm leading-tight">
                          {news.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getNewsColor(news.priority)}`}
                        >
                          {getPriorityLabel(news.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {news.content}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          {news.author && `${news.author} • `}
                          {format(news.date, "dd 'de' MMM", { locale: ptBR })}
                        </div>
                        
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Ver mais <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};