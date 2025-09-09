import React from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificacoesEscala } from '@/hooks/useNotificacoesEscala';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificacoesEscalaProps {
  showHeader?: boolean;
  maxItems?: number;
}

export const NotificacoesEscala: React.FC<NotificacoesEscalaProps> = ({
  showHeader = true,
  maxItems = 10
}) => {
  const {
    notificacoes,
    totalNaoLidas,
    isLoading,
    isRespondendo,
    aceitarConvocacao,
    recusarConvocacao,
    marcarComoLida,
  } = useNotificacoesEscala();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações de Escala</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando notificações...</p>
        </CardContent>
      </Card>
    );
  }

  const notificacoesFiltradas = notificacoes.slice(0, maxItems);

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações de Escala</CardTitle>
              {totalNaoLidas > 0 && (
                <Badge variant="destructive">{totalNaoLidas}</Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Convocações e atualizações do ministério de louvor
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        {notificacoesFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma notificação pendente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificacoesFiltradas.map((notificacao) => (
              <div
                key={notificacao.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{notificacao.titulo}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notificacao.mensagem}
                    </p>
                    
                    {/* Detalhes do evento */}
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-2">
                        <span>📅 {notificacao.escalas_membros?.escalas_eventos?.nome_evento}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🎵 {notificacao.escalas_membros?.louvor_cargos?.nome_cargo}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(notificacao.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de ação para convocações */}
                {notificacao.tipo === 'convocacao' && 
                 notificacao.escalas_membros.status === 'convidado' && (
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        aceitarConvocacao(
                          notificacao.escala_membro_id,
                          notificacao.id
                        )
                      }
                      disabled={isRespondendo}
                      className="flex items-center space-x-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Aceitar</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        recusarConvocacao(
                          notificacao.escala_membro_id,
                          notificacao.id
                        )
                      }
                      disabled={isRespondendo}
                      className="flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Recusar</span>
                    </Button>
                  </div>
                )}

                {/* Botão para marcar como lida */}
                {notificacao.tipo !== 'convocacao' && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => marcarComoLida(notificacao.id)}
                      className="text-xs"
                    >
                      Marcar como lida
                    </Button>
                  </div>
                )}

                {/* Status da resposta */}
                {notificacao.escalas_membros.status !== 'convidado' && (
                  <div className="mt-2">
                    <Badge
                      variant={
                        notificacao.escalas_membros.status === 'confirmado'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {notificacao.escalas_membros.status === 'confirmado'
                        ? 'Confirmado'
                        : 'Recusado'}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};