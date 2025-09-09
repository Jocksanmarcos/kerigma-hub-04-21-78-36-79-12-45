import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Heart } from 'lucide-react';

interface MemberWelcomeBannerProps {
  pessoa: any;
  userRole?: string;
}

export const MemberWelcomeBanner: React.FC<MemberWelcomeBannerProps> = ({ pessoa, userRole }) => {
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Bom dia', icon: Sunrise };
    if (hour < 18) return { greeting: 'Boa tarde', icon: Sunrise };
    return { greeting: 'Boa noite', icon: Heart };
  };

  const { greeting, icon: GreetingIcon } = getTimeOfDayGreeting();
  const firstName = pessoa?.nome_completo?.split(' ')[0] || 'Irmão(ã)';

  const getVerseOfTheWeek = () => {
    return {
      text: "Porque eu sei os planos que tenho para vocês, diz o Senhor, planos de prosperidade e não de malefício, para dar-lhes um futuro e uma esperança.",
      reference: "Jeremias 29:11"
    };
  };

  const verse = getVerseOfTheWeek();

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                <AvatarImage src={pessoa?.foto_url} alt={firstName} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GreetingIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{greeting}</span>
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  {firstName}! 👋
                </h1>
                {userRole && (
                  <Badge variant="secondary" className="text-xs">
                    {userRole === 'pastor' ? 'Pastor' : userRole === 'lider' ? 'Líder' : 'Membro'}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm italic text-foreground/90 leading-relaxed">
                    "{verse.text}"
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    - {verse.reference}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};