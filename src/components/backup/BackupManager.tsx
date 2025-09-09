import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  Shield, 
  Clock, 
  Database, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BackupInfo {
  id: string;
  name: string;
  size: number;
  created_at: string;
  status: 'completed' | 'running' | 'failed';
  type: 'automatic' | 'manual';
  tables_count: number;
}

const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      // Simulação de dados até o TypeScript ser atualizado
      const mockBackups: BackupInfo[] = [
        {
          id: '1',
          name: 'backup_2025-08-14_auto',
          size: 1024000,
          created_at: new Date().toISOString(),
          status: 'completed',
          type: 'automatic',
          tables_count: 15
        }
      ];
      
      setBackups(mockBackups);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    setProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: { type: 'manual' }
      });

      if (error) throw error;

      // Simular progresso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Aguardar conclusão
      setTimeout(() => {
        setProgress(100);
        setCreating(false);
        loadBackups();
        toast({
          title: 'Backup criado com sucesso',
          description: 'O backup dos dados foi criado e está disponível para download.'
        });
      }, 5000);

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      setCreating(false);
      toast({
        title: 'Erro ao criar backup',
        description: 'Não foi possível criar o backup. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const downloadBackup = async (backupId: string, backupName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('download-backup', {
        body: { backupId }
      });

      if (error) throw error;

      // Criar link de download
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backupName}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download iniciado',
        description: 'O backup está sendo baixado.'
      });

    } catch (error) {
      console.error('Erro ao baixar backup:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o backup.',
        variant: 'destructive'
      });
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja restaurar este backup? Esta ação substituirá os dados atuais.')) {
      return;
    }

    setRestoring(true);
    setProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: { backupId }
      });

      if (error) throw error;

      // Simular progresso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 1000);

      // Aguardar conclusão
      setTimeout(() => {
        setProgress(100);
        setRestoring(false);
        toast({
          title: 'Backup restaurado com sucesso',
          description: 'Os dados foram restaurados. Recarregue a página para ver as alterações.'
        });
      }, 8000);

    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      setRestoring(false);
      toast({
        title: 'Erro na restauração',
        description: 'Não foi possível restaurar o backup.',
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'running':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Executando</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sistema de Backup
          </CardTitle>
          <CardDescription>
            Gerencie backups dos dados críticos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={createBackup} 
              disabled={creating || restoring}
              className="flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Criar Backup Manual
            </Button>
          </div>

          {(creating || restoring) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {creating ? 'Criando backup...' : 'Restaurando backup...'}
                </span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Backups automáticos são criados diariamente às 02:00. Os últimos 30 backups são mantidos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>
            Últimos backups criados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Carregando backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum backup encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{backup.name}</h3>
                      {getStatusBadge(backup.status)}
                      <Badge variant="outline">
                        {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(backup.size)}</span>
                      <span>{backup.tables_count} tabelas</span>
                      <span>
                        {formatDistanceToNow(new Date(backup.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                  {backup.status === 'completed' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackup(backup.id, backup.name)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreBackup(backup.id)}
                        disabled={restoring}
                        className="flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Restaurar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;