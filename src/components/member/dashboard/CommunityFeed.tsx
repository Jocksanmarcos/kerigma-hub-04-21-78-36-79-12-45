import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Calendar, 
  Users, 
  Star,
  ChevronRight,
  MessageCircle
} from 'lucide-react';

export const CommunityFeed: React.FC = () => {
  // Mock data - em produção viria do banco de dados
  const communityNews = [
    {
      id: 1,
      type: 'announcement',
      title: 'Nova Série de Ensino: "Viver com Propósito"',
      preview: 'A partir de domingo, começamos uma nova série sobre descobrir e viver nosso propósito em Deus...',
      author: 'Pr. Carlos Silva',
      date: 'Hoje',
      isNew: true,
      icon: Megaphone,
      color: 'text-secondary'
    },
    {
      id: 2,
      type: 'event',
      title: 'Retiro de Jovens - Inscrições Abertas',
      preview: 'De 15 a 17 de dezembro. Tema: "Jovens de Impacto". Não perca essa oportunidade...',
      author: 'Min. Jovens',
      date: 'Ontem',
      isNew: true,
      icon: Calendar,
      color: 'text-primary'
    },
    {
      id: 3,
      type: 'cell',
      title: 'Testemunho da Célula dos Santos',
      preview: 'Maria José compartilha como Deus transformou sua vida através da comunhão...',
      author: 'Líder João Santos',
      date: '2 dias atrás',
      isNew: false,
      icon: Users,
      color: 'text-primary'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Parabéns aos Novos Formandos!',
      preview: '12 irmãos concluíram o curso "Fundamentos da Fé". Cerimônia no próximo domingo...',
      author: 'Centro de Ensino',
      date: '3 dias atrás',
      isNew: false,
      icon: Star,
      color: 'text-secondary'
    }
  ];

  return (
    <Card className="shadow-kerigma">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageCircle className="h-5 w-5 text-primary" />
          Vida da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {communityNews.map((news) => {
          const IconComponent = news.icon;
          
          return (
            <div
              key={news.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-muted/50 hover:border-primary/30 transition-colors duration-200 cursor-pointer hover:bg-muted/30"
            >
              <div className={`p-2 rounded-full bg-muted/50 ${news.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {news.title}
                  </h3>
                  {news.isNew && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-secondary/10 text-secondary border-secondary/20">
                      NOVO
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {news.preview}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Por {news.author}</span>
                  <span>{news.date}</span>
                </div>
              </div>
              
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          );
        })}
        
        <div className="pt-2">
          <Button variant="outline" className="w-full" size="sm">
            Ver Todos os Comunicados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};