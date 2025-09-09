import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  CheckCircle, 
  X,
  Clock,
  User,
  BookOpen,
  AlertCircle,
  Mail,
  History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useApproveReservation, useRejectReservation } from '@/hooks/useReservationActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Reserva {
  id: string;
  data_reserva: string;
  data_expiracao: string;
  status: string;
  biblioteca_livros: {
    titulo: string;
    autor: string;
    imagem_capa_url?: string;
  };
  pessoas: {
    nome_completo: string;
    email: string;
    telefone?: string;
    tipo_pessoa?: string;
  };
}

export const BibliotecaReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [showRecusaDialog, setShowRecusaDialog] = useState(false);
  const [showHistoricoDialog, setShowHistoricoDialog] = useState(false);
  const [historicoNotificacoes, setHistoricoNotificacoes] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const approveReservation = useApproveReservation();
  const rejectReservation = useRejectReservation();

  useEffect(() => {
    fetchReservas();
  }, []);

  useEffect(() => {
    filterReservas();
  }, [reservas, searchTerm, statusFilter]);

  const fetchReservas = async () => {
    try {
      const { data, error } = await supabase
        .from('biblioteca_reservas')
        .select(`
          *,
          biblioteca_livros!inner(titulo, autor, imagem_capa_url),
          pessoas!inner(nome_completo, email, telefone, tipo_pessoa)
        `)
        .order('data_reserva', { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar reservas',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReservas = () => {
    let filtered = reservas;

    if (searchTerm) {
      filtered = filtered.filter(reserva => 
        reserva.biblioteca_livros.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reserva.biblioteca_livros.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reserva.pessoas.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reserva => reserva.status === statusFilter);
    }

    setFilteredReservas(filtered);
  };

  const handleAprovar = async (reserva: Reserva) => {
    try {
      await approveReservation.mutateAsync({ reservaId: reserva.id });
      fetchReservas(); // Refresh the list
    } catch (error) {
      // Error already handled by the hook
    }
  };

  const handleRecusar = async () => {
    if (!selectedReserva) return;
    
    try {
      await rejectReservation.mutateAsync({ 
        reservaId: selectedReserva.id, 
        motivo: motivoRecusa || 'Não informado' 
      });
      
      setShowRecusaDialog(false);
      setMotivoRecusa('');
      setSelectedReserva(null);
      fetchReservas(); // Refresh the list
    } catch (error) {
      // Error already handled by the hook
    }
  };

  const handleVerHistorico = async (reservaId: string) => {
    try {
      const { data, error } = await supabase
        .from('biblioteca_notificacoes_log')
        .select('*')
        .eq('reserva_id', reservaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHistoricoNotificacoes(data || []);
      setShowHistoricoDialog(true);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar histórico',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string, dataExpiracao: string) => {
    const isExpirada = new Date(dataExpiracao) < new Date() && status === 'Ativa';
    
    const statusConfig = {
      'Ativa': { 
        variant: isExpirada ? 'destructive' as const : 'default' as const, 
        label: isExpirada ? 'Expirada' : 'Ativa',
        icon: isExpirada ? AlertCircle : Clock,
        color: isExpirada ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
      },
      'Aprovada': { 
        variant: 'default' as const, 
        label: 'Aprovada',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800'
      },
      'Recusada': { 
        variant: 'destructive' as const, 
        label: 'Recusada',
        icon: X,
        color: 'bg-red-100 text-red-800'
      },
      'Atendida': { 
        variant: 'default' as const, 
        label: 'Atendida',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800'
      },
      'Cancelada': { 
        variant: 'secondary' as const, 
        label: 'Cancelada',
        icon: X,
        color: 'bg-gray-100 text-gray-800'
      },
      'Expirada': { 
        variant: 'destructive' as const, 
        label: 'Expirada',
        icon: AlertCircle,
        color: 'bg-red-100 text-red-800'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Ativa'];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDiasParaExpiracao = (dataExpiracao: string) => {
    const hoje = new Date();
    const dataLimite = new Date(dataExpiracao);
    const diffTime = dataLimite.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando reservas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Reservas</CardTitle>
          <CardDescription>
            Gerencie todas as reservas de livros da biblioteca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por livro ou pessoa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Ativa">Ativas</SelectItem>
                <SelectItem value="Atendida">Atendidas</SelectItem>
                <SelectItem value="Cancelada">Canceladas</SelectItem>
                <SelectItem value="Expirada">Expiradas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livro</TableHead>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Data Reserva</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-muted rounded-sm flex items-center justify-center overflow-hidden">
                          {reserva.biblioteca_livros.imagem_capa_url ? (
                            <img 
                              src={reserva.biblioteca_livros.imagem_capa_url} 
                              alt={reserva.biblioteca_livros.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{reserva.biblioteca_livros.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {reserva.biblioteca_livros.autor}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{reserva.pessoas.nome_completo}</p>
                            {reserva.pessoas.tipo_pessoa === 'visitante' && (
                              <Badge variant="secondary" className="text-xs">
                                Site Público
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {reserva.pessoas.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(reserva.data_reserva), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div>
                        {format(new Date(reserva.data_expiracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        {reserva.status === 'Ativa' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {getDiasParaExpiracao(reserva.data_expiracao) > 0 
                              ? `${getDiasParaExpiracao(reserva.data_expiracao)} dias restantes`
                              : 'Expirada'
                            }
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reserva.status, reserva.data_expiracao)}
                    </TableCell>
                     <TableCell className="text-right">
                       <div className="flex gap-2 justify-end">
                         {reserva.status === 'Ativa' && (
                           <>
                             <Button
                               variant="default"
                               size="sm"
                                onClick={() => handleAprovar(reserva)}
                                disabled={approveReservation.isPending}
                              >
                                {approveReservation.isPending ? (
                                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                               ) : (
                                 <CheckCircle className="h-4 w-4" />
                               )}
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setSelectedReserva(reserva);
                                 setShowRecusaDialog(true);
                               }}
                               disabled={rejectReservation.isPending}
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           </>
                         )}
                         
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleVerHistorico(reserva.id)}
                           title="Ver histórico de notificações"
                         >
                           <History className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReservas.length === 0 && (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros para encontrar o que procura.'
                  : 'Ainda não há reservas registradas.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para recusar reserva */}
      <Dialog open={showRecusaDialog} onOpenChange={setShowRecusaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Solicitação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja recusar a solicitação de empréstimo de{' '}
              <strong>{selectedReserva?.pessoas.nome_completo}</strong> para o livro{' '}
              <strong>"{selectedReserva?.biblioteca_livros.titulo}"</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Motivo da recusa (opcional)</label>
              <Textarea
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Ex: Livro não disponível no momento, já emprestado, etc."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRecusaDialog(false);
                setMotivoRecusa('');
                setSelectedReserva(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRecusar}
              disabled={rejectReservation.isPending}
            >
              {rejectReservation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Recusar e Notificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para histórico de notificações */}
      <Dialog open={showHistoricoDialog} onOpenChange={setShowHistoricoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Notificações</DialogTitle>
            <DialogDescription>
              Histórico completo de todas as notificações enviadas para esta reserva.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {historicoNotificacoes.length > 0 ? (
              historicoNotificacoes.map((notificacao) => (
                <div key={notificacao.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={notificacao.status_envio === 'enviado' ? 'default' : 'destructive'}
                    >
                      {notificacao.tipo_notificacao}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(notificacao.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Destinatário:</strong> {notificacao.email_destinatario}
                    </p>
                    <p className="text-sm">
                      <strong>Status:</strong> {notificacao.status_envio}
                    </p>
                    {notificacao.motivo_recusa && (
                      <p className="text-sm">
                        <strong>Motivo:</strong> {notificacao.motivo_recusa}
                      </p>
                    )}
                    {notificacao.erro_detalhes && (
                      <p className="text-sm text-red-600">
                        <strong>Erro:</strong> {notificacao.erro_detalhes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma notificação enviada ainda.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoricoDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};