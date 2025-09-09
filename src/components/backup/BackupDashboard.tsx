import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Download, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Calendar,
  HardDrive
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BackupJob {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  backup_size_mb?: number;
  backup_location?: string;
  tables_included: string[];
  error_message?: string;
  metadata: any;
}

export const BackupDashboard: React.FC = () => {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBackupJobs();
  }, []);

  const loadBackupJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_jobs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      setBackupJobs(data || []);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de backups.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await supabase.functions.invoke('automated-backup', {
        body: {
          backup_type: 'manual',
          tables: [
            'pessoas',
            'lancamentos_financeiros_v2',
            'eventos',
            'celulas',
            'usuarios_admin',
            'igrejas'
          ]
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Backup iniciado!",
        description: "O backup manual foi iniciado com sucesso.",
      });

      // Recarregar lista após alguns segundos
      setTimeout(() => {
        loadBackupJobs();
      }, 3000);

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar backup manual.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed_with_errors':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      completed_with_errors: 'secondary',
      failed: 'destructive',
      running: 'outline',
      pending: 'outline'
    };

    const labels: Record<string, string> = {
      completed: 'Completo',
      completed_with_errors: 'Completo c/ Erros',
      failed: 'Falhou',
      running: 'Executando',
      pending: 'Pendente'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    return `${bytes.toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Carregando backups...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sistema de Backup
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie backups automáticos e manuais dos dados críticos
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadBackupJobs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                onClick={createManualBackup}
                disabled={isCreatingBackup}
              >
                {isCreatingBackup ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Backup Manual
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Backups Completos</p>
                <p className="text-2xl font-bold">
                  {backupJobs.filter(j => j.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Armazenado</p>
                <p className="text-2xl font-bold">
                  {formatBytes(
                    backupJobs
                      .filter(j => j.backup_size_mb)
                      .reduce((sum, j) => sum + (j.backup_size_mb || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Último Backup</p>
                <p className="text-lg font-semibold">
                  {backupJobs.length > 0 
                    ? formatDistanceToNow(new Date(backupJobs[0].started_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })
                    : 'Nenhum'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
        </CardHeader>
        <CardContent>
          {backupJobs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum backup encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Inicie seu primeiro backup manual ou aguarde o próximo backup automático.
              </p>
              <Button onClick={createManualBackup} disabled={isCreatingBackup}>
                {isCreatingBackup ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Criar Primeiro Backup
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {backupJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          Backup {job.job_type === 'manual' ? 'Manual' : 'Automático'}
                        </span>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Iniciado {formatDistanceToNow(new Date(job.started_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                        {job.completed_at && (
                          <> • Concluído {formatDistanceToNow(new Date(job.completed_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}</>
                        )}
                      </p>
                      {job.error_message && (
                        <p className="text-sm text-red-600 mt-1">
                          Erro: {job.error_message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatBytes(job.backup_size_mb)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.tables_included.length} tabelas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};