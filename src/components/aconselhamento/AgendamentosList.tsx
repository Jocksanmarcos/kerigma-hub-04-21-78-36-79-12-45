import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Check, 
  X, 
  Trash2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgendamentos, type Agendamento } from '@/hooks/useAgendamentos';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const statusMap = {
  solicitado: { label: 'Solicitado', color: 'bg-yellow-500' },
  agendado: { label: 'Agendado', color: 'bg-green-500' },
  recusado: { label: 'Recusado', color: 'bg-red-500' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500' },
  realizado: { label: 'Realizado', color: 'bg-blue-500' }
};

interface RecusarModalProps {
  agendamento: Agendamento;
  onRecusar: (agendamentoId: string, motivo: string) => void;
  isLoading: boolean;
}

function RecusarModal({ agendamento, onRecusar, isLoading }: RecusarModalProps) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleRecusar = () => {
    onRecusar(agendamento.id, motivo);
    setOpen(false);
    setMotivo('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <X className="h-4 w-4 mr-1" />
          Recusar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recusar Agendamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Você está prestes a recusar o agendamento "{agendamento.titulo}".
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da recusa (opcional)</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Informe o motivo da recusa para ajudar o solicitante"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRecusar}
              disabled={isLoading}
            >
              {isLoading ? 'Recusando...' : 'Recusar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AgendamentosList() {
  const { 
    agendamentos, 
    currentUser, 
    isConselheiro, 
    gerenciarAgendamento, 
    gerenciandoAgendamento,
    agendamentosLoading
  } = useAgendamentos();

  const handleAprovar = async (agendamentoId: string) => {
    await gerenciarAgendamento({
      acao: 'aprovar',
      agendamento_id: agendamentoId
    });
  };

  const handleRecusar = async (agendamentoId: string, motivo?: string) => {
    await gerenciarAgendamento({
      acao: 'recusar',
      agendamento_id: agendamentoId,
      motivo_recusa: motivo
    });
  };

  const handleCancelar = async (agendamentoId: string) => {
    await gerenciarAgendamento({
      acao: 'cancelar',
      agendamento_id: agendamentoId
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const isMyAgendamento = (agendamento: Agendamento) => {
    return agendamento.solicitante_id === currentUser?.user_id || 
           agendamento.conselheiro_id === currentUser?.user_id;
  };

  const canApproveReject = (agendamento: Agendamento) => {
    return isConselheiro && 
           agendamento.conselheiro_id === currentUser?.user_id && 
           agendamento.status === 'solicitado';
  };

  const canCancel = (agendamento: Agendamento) => {
    return isMyAgendamento(agendamento) && 
           (agendamento.status === 'solicitado' || agendamento.status === 'agendado');
  };

  if (agendamentosLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const myAgendamentos = agendamentos?.filter(isMyAgendamento) || [];

  if (myAgendamentos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-muted-foreground">
            {isConselheiro 
              ? 'Você não possui solicitações ou agendamentos no momento.'
              : 'Você ainda não solicitou nenhum agendamento.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {myAgendamentos.map((agendamento) => {
        const status = statusMap[agendamento.status];
        const isPastDate = new Date(agendamento.data_hora_inicio) < new Date();
        const isCurrentUser = agendamento.solicitante_id === currentUser?.user_id;
        
        // Determine which person's info to show
        const otherPerson = isCurrentUser ? agendamento.conselheiro : agendamento.solicitante;
        const otherPersonRole = isCurrentUser ? 'Conselheiro' : 'Solicitante';

        return (
          <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(otherPerson?.nome_completo || 'NN')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{agendamento.titulo}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <User className="h-4 w-4 mr-1" />
                      <span>{otherPersonRole}: {otherPerson?.nome_completo || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${status.color} text-white`}>
                  {status.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(new Date(agendamento.data_hora_inicio), "PPP", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(new Date(agendamento.data_hora_inicio), "HH:mm", { locale: ptBR })} - 
                    {format(new Date(agendamento.data_hora_fim), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {agendamento.observacoes && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium mb-1">Observações:</div>
                      <div className="text-sm text-muted-foreground">{agendamento.observacoes}</div>
                    </div>
                  </div>
                </div>
              )}

              {agendamento.motivo_recusa && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <X className="h-4 w-4 mr-2 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-800 mb-1">Motivo da recusa:</div>
                      <div className="text-sm text-red-700">{agendamento.motivo_recusa}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                {/* Ações para conselheiros */}
                {canApproveReject(agendamento) && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleAprovar(agendamento.id)}
                      disabled={gerenciandoAgendamento}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <RecusarModal 
                      agendamento={agendamento}
                      onRecusar={handleRecusar}
                      isLoading={gerenciandoAgendamento}
                    />
                  </>
                )}

                {/* Botão para entrar na reunião */}
                {agendamento.status === 'agendado' && agendamento.link_meet && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => window.open(agendamento.link_meet, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Entrar na Reunião
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}

                {/* Botão de cancelar */}
                {canCancel(agendamento) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza de que deseja cancelar este agendamento? 
                          Ambas as partes serão notificadas sobre o cancelamento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Não, manter</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleCancelar(agendamento.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sim, cancelar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}