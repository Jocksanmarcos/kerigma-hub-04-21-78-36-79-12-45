import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Lock, 
  Globe,
  Smartphone,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SecurityDashboard: React.FC = () => {
  // Query para estatísticas de segurança
  const { data: securityStats } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const [events, sessions, users] = await Promise.all([
        supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('security_active_sessions').select('*'),
        supabase.from('pessoas').select('*, profiles(name, level)').order('created_at', { ascending: false }).limit(10)
      ]);
      
      return {
        recentEvents: events.data || [],
        activeSessions: sessions.data || [],
        recentUsers: users.data || []
      };
    }
  });

  // Derivar alertas críticos a partir de eventos de segurança
  const criticalAlerts = (securityStats?.recentEvents || [])
    .filter((e: any) => e.event_type === 'login_failed' || (e.risk_score && e.risk_score >= 70))
    .slice(0, 5)
    .map((e: any) => ({
      id: e.id,
      type: e.event_type === 'login_failed' || (e.risk_score && e.risk_score >= 70) ? 'high' : 'medium',
      message: e.event_type === 'login_failed' ? 'Múltiplas tentativas de login falharam' : (e.event_type || 'Evento de segurança'),
      time: new Date(e.created_at).toLocaleTimeString('pt-BR')
    }));

  // Agrupar logins recentes por localização
  const loginLocations = (() => {
    const map = new Map<string, { users: number; lastTime: string }>();
    (securityStats?.recentEvents || [])
      .filter((e: any) => e.event_type === 'login_success')
      .forEach((e: any) => {
        const loc = e.location_data || {};
        const city = loc.city || loc.region || 'Desconhecido';
        const country = loc.country || 'BR';
        const key = `${city}, ${country}`;
        const prev = map.get(key);
        const time = new Date(e.created_at).toLocaleTimeString('pt-BR');
        if (prev) {
          map.set(key, { users: prev.users + 1, lastTime: time });
        } else {
          map.set(key, { users: 1, lastTime: time });
        }
      });
    return Array.from(map.entries()).map(([location, meta]) => ({
      location,
      users: meta.users,
      time: meta.lastTime,
      status: meta.users > 5 ? 'success' : 'warning'
    }));
  })();

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.activeSessions.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.recentEvents.length || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
            <Lock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">Score de segurança</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapa de Logins Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Logins Recentes por Localização</span>
            </CardTitle>
            <CardDescription>Atividade de login nas últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loginLocations.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{item.location}</p>
                      <p className="text-sm text-muted-foreground">{item.users} usuários</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas de Segurança</span>
            </CardTitle>
            <CardDescription>Eventos que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.type === 'high' ? 'border-destructive' : 'border-yellow-500'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <span className="text-sm">{alert.message}</span>
                      <Badge variant={alert.type === 'high' ? 'destructive' : 'secondary'}>
                        {alert.type === 'high' ? 'Alto' : 'Médio'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feed de Auditoria Crítica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Feed de Auditoria Crítica</span>
          </CardTitle>
          <CardDescription>Ações administrativas recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityStats?.recentEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {event.event_type === 'login_success' ? 'Login realizado' : event.event_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.user_id && `Usuário ${event.user_id.slice(0, 8)}...`}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(event.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};