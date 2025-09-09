import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  HeartHandshake, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Eye,
  CheckCircle,
  X,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoPastoral {
  id: string;
  solicitante_id: string;
  pastor_responsavel_id: string | null;
  motivo_contato: string;
  detalhes_pedido: string | null;
  urgencia: string;
  status: string;
  telefone_contato: string | null;
  email_contato: string | null;
  preferencia_horario: string | null;
  observacoes_pastor: string | null;
  data_solicitacao: string;
  data_agendamento: string | null;
  data_conclusao: string | null;
  agendamento_id: string | null;
  confidencial: boolean;
  created_at: string;
  updated_at: string;
  pessoas?: {
    nome_completo: string;
    email: string;
    telefone: string;
  };
  pastor?: {
    nome_completo: string;
  };
}

export const PastoralInbox: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoPastoral[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<AgendamentoPastoral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [urgenciaFilter, setUrgenciaFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoPastoral | null>(null);
  const [observacoesPastor, setObservacoesPastor] = useState('');

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  useEffect(() => {
    filterAgendamentos();
  }, [agendamentos, statusFilter, urgenciaFilter, searchTerm]);

  const fetchAgendamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos_pastorais')
        .select(`
          *,
          pessoas:solicitante_id (
            nome_completo,
            email,
            telefone
          ),
          pastor:pastor_responsavel_id (
            nome_completo
          )
        `)
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;
      setAgendamentos((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgendamentos = () => {
    let filtered = agendamentos;

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (urgenciaFilter !== 'todos') {
      filtered = filtered.filter(a => a.urgencia === urgenciaFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.pessoas?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.motivo_contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email_contato?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgendamentos(filtered);
  };

  const updateStatus = async (id: string, newStatus: 'agendado' | 'concluido' | 'cancelado') => {
    try {
      const { error } = await supabase
        .from('agendamentos_pastorais')
        .update({ 
          status: newStatus,
          data_agendamento: newStatus === 'agendado' ? new Date().toISOString() : null,
          data_conclusao: newStatus === 'concluido' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchAgendamentos();
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const saveObservacoes = async () => {
    if (!selectedAgendamento) return;

    try {
      const { error } = await supabase
        .from('agendamentos_pastorais')
        .update({ observacoes_pastor: observacoesPastor })
        .eq('id', selectedAgendamento.id);

      if (error) throw error;
      
      await fetchAgendamentos();
      toast.success('Observações salvas com sucesso');
      setSelectedAgendamento(null);
      setObservacoesPastor('');
    } catch (error) {
      console.error('Erro ao salvar observações:', error);
      toast.error('Erro ao salvar observações');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      solicitado: { variant: 'outline' as const, text: 'Solicitado', icon: Clock },
      agendado: { variant: 'default' as const, text: 'Agendado', icon: Calendar },
      concluido: { variant: 'default' as const, text: 'Concluído', icon: CheckCircle },
      cancelado: { variant: 'destructive' as const, text: 'Cancelado', icon: X }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getUrgenciaBadge = (urgencia: string) => {
    const configs = {
      baixa: { variant: 'outline' as const, text: 'Baixa' },
      media: { variant: 'secondary' as const, text: 'Média' },
      alta: { variant: 'destructive' as const, text: 'Alta' }
    };
    
    const config = configs[urgencia as keyof typeof configs];
    
    return (
      <Badge variant={config.variant}>
        {urgencia === 'alta' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <HeartHandshake className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="solicitado">Solicitado</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Urgência</label>
              <Select value={urgenciaFilter} onValueChange={setUrgenciaFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Buscar</label>
              <Input
                placeholder="Buscar por nome, motivo ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agendamentos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações ({filteredAgendamentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agendamento.pessoas?.nome_completo}</div>
                        <div className="text-sm text-muted-foreground">
                          {agendamento.email_contato}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={agendamento.motivo_contato}>
                        {agendamento.motivo_contato}
                      </div>
                    </TableCell>
                    <TableCell>{getUrgenciaBadge(agendamento.urgencia)}</TableCell>
                    <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                    <TableCell>
                      {format(new Date(agendamento.data_solicitacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedAgendamento(agendamento);
                                setObservacoesPastor(agendamento.observacoes_pastor || '');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Solicitação</DialogTitle>
                              <DialogDescription>
                                Informações detalhadas do pedido de aconselhamento
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedAgendamento && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Solicitante</label>
                                    <p className="text-sm">{selectedAgendamento.pessoas?.nome_completo}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Data da Solicitação</label>
                                    <p className="text-sm">
                                      {format(new Date(selectedAgendamento.data_solicitacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">E-mail</label>
                                    <p className="text-sm">{selectedAgendamento.email_contato}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Telefone</label>
                                    <p className="text-sm">{selectedAgendamento.telefone_contato}</p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Motivo do Contato</label>
                                  <p className="text-sm bg-muted/50 p-3 rounded-md mt-1">
                                    {selectedAgendamento.motivo_contato}
                                  </p>
                                </div>

                                {selectedAgendamento.detalhes_pedido && (
                                  <div>
                                    <label className="text-sm font-medium">Detalhes Adicionais</label>
                                    <p className="text-sm bg-muted/50 p-3 rounded-md mt-1">
                                      {selectedAgendamento.detalhes_pedido}
                                    </p>
                                  </div>
                                )}

                                {selectedAgendamento.preferencia_horario && (
                                  <div>
                                    <label className="text-sm font-medium">Preferência de Horário</label>
                                    <p className="text-sm">{selectedAgendamento.preferencia_horario}</p>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium">Observações Pastorais</label>
                                  <Textarea
                                    value={observacoesPastor}
                                    onChange={(e) => setObservacoesPastor(e.target.value)}
                                    placeholder="Adicione observações internas..."
                                    className="mt-1"
                                  />
                                </div>

                                <div className="flex justify-between pt-4">
                                  <div className="flex gap-2">
                                     {selectedAgendamento.status === 'solicitado' && (
                                       <>
                                         <Dialog>
                                           <DialogTrigger asChild>
                                             <Button size="sm">
                                               <Calendar className="h-4 w-4 mr-2" />
                                               Agendar na Central
                                             </Button>
                                           </DialogTrigger>
                                           <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                                             <DialogHeader>
                                               <DialogTitle>
                                                 Agendar Sessão - {selectedAgendamento.pessoas?.nome_completo}
                                               </DialogTitle>
                                             </DialogHeader>
                                             <div className="max-h-[70vh] overflow-y-auto">
                                               {/* Aqui seria o SchedulingWizard quando implementado */}
                                               <div className="p-4 text-center text-muted-foreground">
                                                 <Calendar className="h-12 w-12 mx-auto mb-4" />
                                                 <p>Central de Agenda em construção...</p>
                                                 <p className="text-sm mt-2">Por enquanto, use o botão "Agendar" simples abaixo.</p>
                                               </div>
                                             </div>
                                           </DialogContent>
                                         </Dialog>
                                         
                                         <Button 
                                           onClick={() => updateStatus(selectedAgendamento.id, 'agendado')}
                                           size="sm"
                                           variant="outline"
                                         >
                                           <Calendar className="h-4 w-4 mr-2" />
                                           Agendar Simples
                                         </Button>
                                        <Button 
                                          variant="outline"
                                          onClick={() => updateStatus(selectedAgendamento.id, 'cancelado')}
                                          size="sm"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Cancelar
                                        </Button>
                                      </>
                                    )}
                                    
                                    {selectedAgendamento.status === 'agendado' && (
                                      <Button 
                                        onClick={() => updateStatus(selectedAgendamento.id, 'concluido')}
                                        size="sm"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Concluir
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <Button onClick={saveObservacoes}>
                                    Salvar Observações
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAgendamentos.length === 0 && (
              <div className="text-center py-8">
                <HeartHandshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};