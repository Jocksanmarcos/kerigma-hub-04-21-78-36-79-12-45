import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Trophy, 
  Share2, 
  Zap, 
  Calendar,
  BookOpen,
  Users
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'event_participation' | 'course_completion' | 'social_share' | 'achievement' | 'donation';
  title: string;
  description: string;
  points?: number;
  timestamp: string;
  icon: typeof Heart;
  iconColor: string;
}

interface ActivityFeedProps {
  onViewAllEvents?: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ onViewAllEvents }) => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'event_participation',
      title: 'Participou do Culto Jovem',
      description: '2 horas atrás',
      points: 50,
      timestamp: '2 horas atrás',
      icon: Heart,
      iconColor: 'text-pink-500'
    },
    {
      id: '2',
      type: 'course_completion',
      title: 'Completou: Fundamentos da Fé',
      description: '1 dia atrás',
      points: 100,
      timestamp: '1 dia atrás',
      icon: Trophy,
      iconColor: 'text-yellow-500'
    },
    {
      id: '3',
      type: 'social_share',
      title: 'Compartilhou evento no Instagram',
      description: '3 dias atrás',
      points: 25,
      timestamp: '3 dias atrás',
      icon: Share2,
      iconColor: 'text-blue-500'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Atividades Recentes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Suas últimas conquistas e participações
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border hover:border-primary/30 transition-all"
            >
              <div className="p-2 rounded-full bg-background shadow-sm">
                <Icon className={`h-4 w-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
              {activity.points && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  +{activity.points} pts
                </Badge>
              )}
            </div>
          );
        })}

        {/* Call to Action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
          <div className="text-center space-y-3">
            <h3 className="font-semibold">Pronto para o próximo desafio?</h3>
            <p className="text-sm text-purple-100">
              Participe do próximo evento e ganhe pontos extras!
            </p>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white text-purple-600 hover:bg-purple-50"
              onClick={onViewAllEvents}
            >
              Ver Próximos Eventos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};