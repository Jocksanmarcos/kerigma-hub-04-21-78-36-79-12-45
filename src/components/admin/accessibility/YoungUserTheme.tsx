import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Instagram, 
  MessageCircle, 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Heart,
  Share2,
  Gift
} from 'lucide-react';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';

interface YoungUserThemeProps {
  onShareToSocial?: (platform: string, content: string) => void;
  onGamificationAction?: (action: string) => void;
}

export const YoungUserTheme: React.FC<YoungUserThemeProps> = ({
  onShareToSocial,
  onGamificationAction
}) => {
  const socialPlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 hover:bg-pink-100'
    }
  ];

  const gamificationElements = [
    {
      id: 'points',
      title: 'Pontos de Participação',
      description: 'Ganhe pontos participando de eventos e atividades',
      icon: Star,
      color: 'text-yellow-500',
      action: 'view_points'
    },
    {
      id: 'achievements',
      title: 'Conquistas',
      description: 'Desbloqueie medalhas completando desafios',
      icon: Trophy,
      color: 'text-purple-500',
      action: 'view_achievements'
    },
    {
      id: 'streaks',
      title: 'Sequências',
      description: 'Mantenha sua sequência de participação',
      icon: Zap,
      color: 'text-orange-500',
      action: 'view_streaks'
    },
    {
      id: 'challenges',
      title: 'Desafios',
      description: 'Participe de desafios mensais',
      icon: Target,
      color: 'text-blue-500',
      action: 'view_challenges'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header Jovem */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-6 text-white">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Olá, Jovem! 🌟</h2>
          <p className="text-purple-100 mb-4">
            Conecte-se, compartilhe e cresça na sua jornada espiritual
          </p>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Nível 3 - Discípulo
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              847 pontos
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Compartilhamento Social */}
        <Card className="border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-600">
              <Share2 className="h-5 w-5" />
              Compartilhar
            </CardTitle>
            <CardDescription>
              Espalhe a palavra nas suas redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  variant="outline"
                  className={`w-full justify-start gap-3 h-12 ${platform.bgColor} border-current`}
                  onClick={() => onShareToSocial?.(platform.id, 'Confira este evento incrível!')}
                >
                  <Icon className={`h-5 w-5 ${platform.color}`} />
                  <span>Compartilhar no {platform.name}</span>
                </Button>
              );
            })}
            
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Gift className="h-4 w-4" />
                <span className="font-medium">Dica:</span>
                Ganhe 25 pontos cada vez que compartilhar um evento!
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gamificação */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Trophy className="h-5 w-5" />
              Seu Progresso
            </CardTitle>
            <CardDescription>
              Acompanhe suas conquistas e desafios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gamificationElements.map((element) => {
              const Icon = element.icon;
              return (
                <button
                  key={element.id}
                  onClick={() => onGamificationAction?.(element.action)}
                  className="w-full p-3 rounded-lg border border-border hover:border-primary/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background ${element.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-primary transition-colors">
                        {element.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {element.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes */}
      <ActivityFeed onViewAllEvents={() => onGamificationAction?.('view_next_challenge')} />
    </div>
  );
};