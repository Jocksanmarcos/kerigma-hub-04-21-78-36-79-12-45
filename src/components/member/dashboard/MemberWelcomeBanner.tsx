import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Heart, Moon } from 'lucide-react';

interface MemberWelcomeBannerProps {
  pessoa: any;
  userRole?: string;
}

export const MemberWelcomeBanner: React.FC<MemberWelcomeBannerProps> = ({ 
  pessoa, 
  userRole 
}) => {
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Bom dia', icon: Sunrise };
    if (hour < 18) return { greeting: 'Boa tarde', icon: Sunrise };
    return { greeting: 'Boa noite', icon: Moon };
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
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 shadow-kerigma">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/30">
                <AvatarImage src={pessoa?.foto_url} alt={firstName} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                  {firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GreetingIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{greeting}</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {firstName}! 👋
                </h1>
                {userRole && (
                  <Badge variant="secondary" className="text-sm">
                    {userRole === 'pastor' ? 'Pastor' : userRole === 'lider' ? 'Líder' : 'Membro'}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Palavra da Semana */}
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-primary/20 shadow-kerigma">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">Palavra da Semana</h3>
                  <p className="text-sm italic text-foreground/90 leading-relaxed mb-2">
                    "{verse.text}"
                  </p>
                  <p className="text-xs text-primary font-medium">
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