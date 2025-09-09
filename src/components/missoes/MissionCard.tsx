import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useMissionStatsSimple } from '@/hooks/useMissoesRealtime';

interface MissionCardProps {
  church: any;
}

export const MissionCard: React.FC<MissionCardProps> = ({ church }) => {
  const { data: stats, isLoading } = useMissionStatsSimple(church.id);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStats = stats || {
    membros_ativos: 0,
    celulas_ativas: 0,
    entradas_mes: 0,
    eventos_mes: 0,
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border/50 bg-gradient-to-br from-background to-background/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-primary">{church.name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{church.cidade}, {church.estado}</span>
            </div>
          </div>
          <Badge variant={church.type === 'sede' ? 'default' : 'secondary'}>
            {church.type === 'sede' ? 'Sede' : 'Missão'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Membros</span>
            </div>
            <div className="text-2xl font-bold text-primary">{currentStats.membros_ativos}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Células</span>
            </div>
            <div className="text-2xl font-bold text-primary">{currentStats.celulas_ativas}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Entradas</span>
            </div>
            <div className="text-2xl font-bold text-success">
              R$ {currentStats.entradas_mes.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Eventos</span>
            </div>
            <div className="text-2xl font-bold text-primary">{currentStats.eventos_mes}</div>
          </div>
        </div>

        {/* Informações de contato */}
        {(church.email || church.telefone) && (
          <div className="pt-2 border-t border-border/50 space-y-2">
            {church.email && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{church.email}</span>
              </div>
            )}
            {church.telefone && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{church.telefone}</span>
              </div>
            )}
          </div>
        )}

        {/* Pastor responsável */}
        {church.pastor_responsavel && (
          <div className="pt-2 border-t border-border/50">
            <div className="text-sm text-muted-foreground">Pastor Responsável</div>
            <div className="font-medium text-foreground">{church.pastor_responsavel}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};