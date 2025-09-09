import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Users,
  BookOpen
} from 'lucide-react';

interface BibliotecaNotificacoesPanelProps {
  estatisticas?: {
    total: number;
    enviados: number;
    erros: number;
    porTipo: Record<string, number>;
  };
  historicoRecente?: Array<{
    id: string;
    tipo_notificacao: string;
    status_envio: string;
    email_destinatario: string;
    created_at: string;
  }>;
}

export const BibliotecaNotificacoesPanel: React.FC<BibliotecaNotificacoesPanelProps> = ({
  estatisticas,
  historicoRecente = []
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'erro':
        return <X className="h-4 w-4 text-red-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTipoNotificacaoLabel = (tipo: string) => {
    const labels = {
      'confirmacao': 'Confirmação',
      'aprovacao': 'Aprovação',
      'recusa': 'Recusa',
      'lembrete_retirada': 'Lembrete Retirada',
      'lembrete_devolucao': 'Lembrete Devolução',
      'erro': 'Erro'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'enviado':
        return 'default';
      case 'erro':
        return 'destructive';
      case 'pendente':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!estatisticas) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Carregando estatísticas de notificações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Notificações</p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enviadas com Sucesso</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.enviados}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Erros de Envio</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.erros}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Notificações por Tipo
          </CardTitle>
          <CardDescription>
            Distribuição das notificações enviadas por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(estatisticas.porTipo).map(([tipo, quantidade]) => (
              <div key={tipo} className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {getTipoNotificacaoLabel(tipo)}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ 
                        width: `${(quantidade / estatisticas.total) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-8 text-right">
                    {quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas notificações enviadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historicoRecente.length > 0 ? (
            <div className="space-y-3">
              {historicoRecente.slice(0, 5).map((notificacao) => (
                <div key={notificacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(notificacao.status_envio)}
                    <div>
                      <p className="text-sm font-medium">
                        {getTipoNotificacaoLabel(notificacao.tipo_notificacao)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notificacao.email_destinatario}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusBadgeVariant(notificacao.status_envio)}>
                      {notificacao.status_envio}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notificacao.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação recente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};