import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  AlertTriangle,
  Eye,
  Plus,
  FileText
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SistemaAprovacaoGastosProps {
  churches: any[];
}

export const SistemaAprovacaoGastos: React.FC<SistemaAprovacaoGastosProps> = ({ churches }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [newRequest, setNewRequest] = useState({
    valor: '',
    descricao: '',
    categoria: '',
    igreja_id: '',
    urgencia: 'normal'
  });
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);

  const queryClient = useQueryClient();

  // Hook para buscar solicitações de aprovação
  const { data: approvalRequests, isLoading } = useQuery({
    queryKey: ['approval-requests', selectedStatus],
    queryFn: async () => {
      try {
        let query = supabase
          .from('lancamentos_financeiros_v2')
          .select(`
            id,
            valor,
            descricao,
            data_lancamento,
            status,
            created_at,
            church_id
          `)
          .eq('tipo', 'despesa');

        if (selectedStatus !== 'todos') {
          query = query.eq('status', selectedStatus);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;

        // Simular dados de aprovação para demonstração
        return data?.map(item => ({
          ...item,
          solicitante: 'Pastor Local',
          igreja_nome: churches.find(c => c.id === item.church_id)?.name || 'Igreja Local',
          urgencia: 'normal',
          justificativa: item.descricao,
          data_solicitacao: item.created_at,
          categoria: 'outros'
        })) || [];
      } catch (error) {
        console.error('Error fetching approval requests:', error);
        return [];
      }
    },
    enabled: true,
  });

  // Mutation para aprovar/rejeitar solicitação
  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, action, observacoes }: { id: string, action: 'aprovar' | 'rejeitar', observacoes?: string }) => {
      const { error } = await supabase
        .from('lancamentos_financeiros_v2')
        .update({
          status: action === 'aprovar' ? 'confirmado' : 'rejeitado',
          observacoes: observacoes || `${action === 'aprovar' ? 'Aprovado' : 'Rejeitado'} em ${new Date().toLocaleDateString('pt-BR')}`
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      toast({
        title: "Solicitação processada",
        description: `Solicitação ${variables.action === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive",
      });
    }
  });

  // Mutation para criar nova solicitação
  const createRequestMutation = useMutation({
    mutationFn: async (request: typeof newRequest) => {
      const { error } = await supabase
        .from('lancamentos_financeiros_v2')
        .insert({
          tipo: 'despesa',
          valor: parseFloat(request.valor),
          descricao: request.descricao,
          status: 'pendente',
          data_lancamento: new Date().toISOString().split('T')[0],
          church_id: request.igreja_id,
          observacoes: `Categoria: ${request.categoria} | Urgência: ${request.urgencia} | ${request.descricao}`,
          categoria_id: '00000000-0000-0000-0000-000000000001', // UUID padrão
          conta_id: '00000000-0000-0000-0000-000000000002' // UUID padrão
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      setShowNewRequestDialog(false);
      setNewRequest({
        valor: '',
        descricao: '',
        categoria: '',
        igreja_id: '',
        urgencia: 'normal'
      });
      toast({
        title: "Solicitação criada",
        description: "Solicitação de gasto enviada para aprovação.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a solicitação.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
      case 'confirmado':
        return <Badge variant="default" className="gap-1 bg-success"><CheckCircle className="h-3 w-3" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'media':
        return <Badge variant="default">Média</Badge>;
      case 'baixa':
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros e ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Sistema de Aprovação de Gastos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie solicitações de gastos das missões
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="confirmado">Aprovados</SelectItem>
              <SelectItem value="rejeitado">Rejeitados</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Solicitação de Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="igreja">Igreja/Missão</Label>
                  <Select value={newRequest.igreja_id} onValueChange={(value) => 
                    setNewRequest(prev => ({ ...prev, igreja_id: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a igreja" />
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map(church => (
                        <SelectItem key={church.id} value={church.id}>
                          {church.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={newRequest.valor}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={newRequest.categoria} onValueChange={(value) => 
                    setNewRequest(prev => ({ ...prev, categoria: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="eventos">Eventos</SelectItem>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgencia">Urgência</Label>
                  <Select value={newRequest.urgencia} onValueChange={(value) => 
                    setNewRequest(prev => ({ ...prev, urgencia: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição/Justificativa</Label>
                  <Textarea
                    id="descricao"
                    value={newRequest.descricao}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o motivo do gasto..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => createRequestMutation.mutate(newRequest)}
                    disabled={!newRequest.valor || !newRequest.descricao || !newRequest.igreja_id}
                    className="flex-1"
                  >
                    Criar Solicitação
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewRequestDialog(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de solicitações */}
      <div className="space-y-4">
        {approvalRequests?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-muted-foreground">
                {selectedStatus === 'todos' 
                  ? 'Não há solicitações de gastos no momento.'
                  : `Não há solicitações com status "${selectedStatus}".`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          approvalRequests?.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{request.descricao}</CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{request.igreja_nome}</span>
                      <span>•</span>
                      <span>{request.solicitante}</span>
                      <span>•</span>
                      <span>{new Date(request.data_solicitacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      R$ {Number(request.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{request.categoria}</Badge>
                      {getUrgenciaBadge(request.urgencia)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Justificativa:</Label>
                    <p className="text-sm text-muted-foreground mt-1">{request.justificativa}</p>
                  </div>

                  {request.status === 'pendente' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveRequestMutation.mutate({ 
                          id: request.id, 
                          action: 'aprovar' 
                        })}
                        disabled={approveRequestMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => approveRequestMutation.mutate({ 
                          id: request.id, 
                          action: 'rejeitar' 
                        })}
                        disabled={approveRequestMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>
                  )}

                  {request.status !== 'pendente' && (
                    <div className="text-sm text-muted-foreground">
                      {request.status === 'confirmado' ? 'Aprovado' : 'Rejeitado'} em{' '}
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};