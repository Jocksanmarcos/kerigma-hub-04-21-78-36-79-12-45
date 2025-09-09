import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useScheduling, type ScheduleInvitation } from '@/hooks/useScheduling';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const VolunteerInvitations: React.FC = () => {
  const {
    myInvitations,
    myInvitationsLoading,
    respondToInvitation,
    responseLoading
  } = useScheduling();

  const [selectedInvitation, setSelectedInvitation] = React.useState<string>('');
  const [responseNotes, setResponseNotes] = React.useState('');

  const handleResponse = async (invitationId: string, status: string, notes?: string) => {
    try {
      await respondToInvitation({
        invitationId,
        status,
        notes
      });
      setSelectedInvitation('');
      setResponseNotes('');
    } catch (error) {
      console.error('Erro ao responder convite:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'convidado':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          Aguardando Resposta
        </Badge>;
      case 'confirmado':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Confirmado
        </Badge>;
      case 'recusado':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Recusado
        </Badge>;
      case 'disponível para troca':
        return <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-600">
          <AlertCircle className="h-3 w-3" />
          Disponível para Troca
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não informada';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPending = (status: string) => {
    return status.toLowerCase() === 'convidado';
  };

  if (myInvitationsLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!myInvitations || myInvitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Meus Convites para Servir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum convite recebido</h3>
            <p className="text-muted-foreground">
              Quando você for convidado para servir em escalas ministeriais, os convites aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separar convites por status
  const pendingInvitations = myInvitations.filter(inv => isPending(inv.status_confirmacao));
  const respondedInvitations = myInvitations.filter(inv => !isPending(inv.status_confirmacao));

  return (
    <div className="space-y-6">
      {/* Convites Pendentes */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Convites Pendentes ({pendingInvitations.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Responda aos convites abaixo para confirmar sua participação
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{invitation.funcao}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(invitation.status_confirmacao)}
                      <span className="text-sm text-muted-foreground">
                        Convite enviado em {formatTime(invitation.data_convite)} • {formatDate(invitation.data_convite)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleResponse(invitation.id, 'Confirmado')}
                    disabled={responseLoading}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirmar Presença
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={responseLoading}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Recusar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recusar Convite</DialogTitle>
                        <DialogDescription>
                          Você está recusando o convite para servir como {invitation.funcao}. 
                          Você pode adicionar uma observação opcional.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Observações (opcional)</Label>
                          <Textarea
                            id="notes"
                            value={responseNotes}
                            onChange={(e) => setResponseNotes(e.target.value)}
                            placeholder="Ex: Não estarei disponível nesta data devido a compromisso familiar"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleResponse(invitation.id, 'Recusado', responseNotes)}
                            disabled={responseLoading}
                            variant="destructive"
                            className="flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Confirmar Recusa
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={responseLoading}
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Solicitar Troca
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Troca de Escala</DialogTitle>
                        <DialogDescription>
                          Você está solicitando uma troca para este serviço. Explique o motivo para facilitar 
                          o processo de substituição.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Motivo da troca</Label>
                          <Textarea
                            id="notes"
                            value={responseNotes}
                            onChange={(e) => setResponseNotes(e.target.value)}
                            placeholder="Ex: Tenho um compromisso imprevisto nesta data"
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleResponse(invitation.id, 'Disponível para Troca', responseNotes)}
                            disabled={responseLoading || !responseNotes.trim()}
                            variant="outline"
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                          >
                            <AlertCircle className="h-4 w-4" />
                            Solicitar Troca
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Convites */}
      {respondedInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Convites ({respondedInvitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {respondedInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{invitation.funcao}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(invitation.status_confirmacao)}
                      <span className="text-sm text-muted-foreground">
                        {invitation.data_resposta && `Respondido em ${formatTime(invitation.data_resposta)} • ${formatDate(invitation.data_resposta)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {invitation.observacoes && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Observações:</p>
                        <p className="text-sm text-muted-foreground">{invitation.observacoes}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};