import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  Users,
  Database,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AuditTrail: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Query para buscar logs de auditoria
  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs', searchTerm, filterAction, filterResource],
    queryFn: async () => {
      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      if (filterResource !== 'all') {
        query = query.eq('resource_type', filterResource);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Query para buscar eventos de segurança
  const { data: securityEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const getActionBadge = (action: string) => {
    const variants = {
      CREATE: 'default',
      UPDATE: 'secondary',
      DELETE: 'destructive',
      LOGIN: 'default',
      LOGOUT: 'secondary'
    };

    const labels: Record<string, string> = {
      CREATE: 'Criação',
      UPDATE: 'Atualização',
      DELETE: 'Exclusão',
      LOGIN: 'Login',
      LOGOUT: 'Logout',
    };

    return (
      <Badge variant={variants[action as keyof typeof variants] as any}>
        {labels[action] ?? action}
      </Badge>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">Alto Risco</Badge>;
    if (score >= 40) return <Badge variant="secondary">Médio Risco</Badge>;
    return <Badge variant="default">Baixo Risco</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };
  const tEventType = (type: string) => {
    const map: Record<string, string> = {
      login_success: 'Login realizado',
      login_failed: 'Falha no login',
      permission_granted: 'Permissão concedida',
      permission_denied: 'Permissão negada',
    };
    return map[type] ?? type.replace('_', ' ');
  };

  const exportAuditData = () => {
    // Implementar exportação dos dados de auditoria
    console.log('Exportando dados de auditoria...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trilha de Auditoria</h2>
          <p className="text-muted-foreground">Monitoramento completo de ações e eventos de segurança</p>
        </div>
        <Button onClick={exportAuditData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="security">Eventos de Segurança</TabsTrigger>
          <TabsTrigger value="analytics">Análise Avançada</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros de Auditoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Ações</SelectItem>
                    <SelectItem value="CREATE">Criação</SelectItem>
                    <SelectItem value="UPDATE">Atualização</SelectItem>
                    <SelectItem value="DELETE">Exclusão</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterResource} onValueChange={setFilterResource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Recursos</SelectItem>
                    <SelectItem value="pessoas">Pessoas</SelectItem>
                    <SelectItem value="celulas">Células</SelectItem>
                    <SelectItem value="lancamentos_financeiros">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Logs */}
          <div className="space-y-4">
            {auditLogs?.map((log) => (
              <Card key={log.id} className="hover:shadow-kerigma transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          {getActionBadge(log.action)}
                          <span className="font-medium">{log.resource_type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.user_id ? `Usuário ${log.user_id.slice(0, 8)}...` : 'Sistema'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp((log as any).created_at || '')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {log.ip_address && (
                        <Badge variant="outline">{String(log.ip_address)}</Badge>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="space-y-4">
            {securityEvents?.map((event) => (
              <Card key={event.id} className="hover:shadow-kerigma transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {tEventType(event.event_type)}
                          </span>
                        {(event as any).risk_score > 0 && getRiskBadge((event as any).risk_score)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.user_id ? `Usuário ${event.user_id.slice(0, 8)}...` : 'Anônimo'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(event.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {event.ip_address && (
                        <Badge variant="outline">{String(event.ip_address)}</Badge>
                      )}
                      {((event as any).risk_score >= 70) && (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditLogs?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {securityEvents?.filter(e => (e as any).risk_score >= 70).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Requer atenção</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Logins Hoje</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityEvents?.filter(e => 
                    e.event_type === 'login_success' && 
                    new Date(e.created_at).toDateString() === new Date().toDateString()
                  ).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Sessões ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alterações</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {auditLogs?.filter(l => ['CREATE', 'UPDATE', 'DELETE'].includes(l.action)).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Modificações de dados</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de atividade por hora */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade por Horário</CardTitle>
              <CardDescription>Distribuição de eventos ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráfico de atividade seria implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes do log */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle>Detalhes do Log de Auditoria</CardTitle>
              <CardDescription>
                {formatTimestamp(selectedLog.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ação:</label>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Recurso:</label>
                  <div className="font-mono text-sm">{selectedLog.resource_type}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">ID do Recurso:</label>
                  <div className="font-mono text-sm">{selectedLog.resource_id || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">IP:</label>
                  <div className="font-mono text-sm">{selectedLog.ip_address || 'N/A'}</div>
                </div>
              </div>

              {selectedLog.old_values && (
                <div>
                  <label className="text-sm font-medium">Valores Anteriores:</label>
                  <pre className="bg-muted p-3 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <label className="text-sm font-medium">Novos Valores:</label>
                  <pre className="bg-muted p-3 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setSelectedLog(null)}>Fechar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};