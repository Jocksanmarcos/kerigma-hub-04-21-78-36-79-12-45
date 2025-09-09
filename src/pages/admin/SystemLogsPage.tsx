import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, Download, AlertTriangle, Info, Bug, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogEntry {
  id: string;
  usuario_id: string | null;
  tipo_acao: string;
  acao: string;
  detalhes: any;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  nivel_log: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  usuario?: {
    nome_completo: string;
    email: string;
  } | null;
}

interface LogStats {
  total_24h: number;
  por_tipo: Record<string, number>;
  por_nivel: Record<string, number>;
}

interface LogsResponse {
  logs: LogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  estatisticas: LogStats;
}

export function SystemLogsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    tipo: '',
    nivel: '',
    data_inicio: '',
    data_fim: '',
    search: ''
  });

  const { data: logsData, isLoading, error, refetch } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: async (): Promise<LogsResponse> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const { data, error } = await supabase.functions.invoke('system-logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filtering
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      tipo: '',
      nivel: '',
      data_inicio: '',
      data_fim: '',
      search: ''
    });
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          params.append(key, value.toString());
        }
      });
      params.append('limit', '1000'); // Export até 1000 registros

      const { data } = await supabase.functions.invoke('system-logs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const csvContent = generateCSV(data.logs);
      downloadCSV(csvContent, 'logs-sistema.csv');
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
  };

  const generateCSV = (logs: LogEntry[]): string => {
    const headers = ['Timestamp', 'Usuário', 'Tipo', 'Ação', 'Nível', 'IP', 'Detalhes'];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        log.usuario?.nome_completo || 'Sistema',
        log.tipo_acao,
        log.acao,
        log.nivel_log,
        log.ip_address || '',
        JSON.stringify(log.detalhes).replace(/"/g, '""')
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Erro ao carregar logs: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento e auditoria de ações críticas
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Estatísticas */}
      {logsData?.estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {logsData.estatisticas.total_24h}
              </div>
              <div className="text-sm text-muted-foreground">Logs últimas 24h</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {(logsData.estatisticas.por_nivel.error || 0) + (logsData.estatisticas.por_nivel.critical || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Erros críticos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {logsData.estatisticas.por_nivel.warning || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avisos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {logsData.estatisticas.por_nivel.info || 0}
              </div>
              <div className="text-sm text-muted-foreground">Informações</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filters.tipo} onValueChange={(value) => handleFilterChange('tipo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="celula">Célula</SelectItem>
                <SelectItem value="pessoa">Pessoa</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.nivel} onValueChange={(value) => handleFilterChange('nivel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os níveis</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={filters.data_inicio}
              onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
              placeholder="Data início"
            />
            
            <Input
              type="date"
              value={filters.data_fim}
              onChange={(e) => handleFilterChange('data_fim', e.target.value)}
              placeholder="Data fim"
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpar Filtros
            </Button>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando logs...</div>
          ) : logsData?.logs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="space-y-2">
              {logsData?.logs?.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getLevelIcon(log.nivel_log)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getLevelColor(log.nivel_log)}>
                            {log.nivel_log.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-foreground">
                            {log.tipo_acao}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {log.acao}
                          </span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            <span>
                              {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                            </span>
                            {log.usuario && (
                              <span>
                                Usuário: {log.usuario.nome_completo}
                              </span>
                            )}
                            {log.ip_address && (
                              <span>
                                IP: {log.ip_address}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {log.detalhes && Object.keys(log.detalhes).length > 0 && (
                          <div className="mt-2">
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Ver detalhes
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.detalhes, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Paginação */}
          {logsData?.pagination && logsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Página {logsData.pagination.page} de {logsData.pagination.totalPages} 
                ({logsData.pagination.total} registros)
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logsData.pagination.page === 1}
                  onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logsData.pagination.page === logsData.pagination.totalPages}
                  onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
}