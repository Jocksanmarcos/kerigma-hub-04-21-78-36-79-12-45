import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Phone, 
  MessageCircle, 
  Calendar, 
  Eye, 
  UserCheck, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Visitante {
  id: string;
  nome_completo: string;
  telefone?: string;
  email?: string;
  situacao: string;
  status_acompanhamento?: string;
  created_at: string;
  data_ultima_visita?: string;
  observacoes?: string;
}

interface NotaAcompanhamento {
  id: string;
  data_contato: string;
  tipo_contato: string;
  resultado: string;
  observacoes?: string;
  proximo_contato?: string;
  created_at: string;
}

const AcompanhamentoVisitantes: React.FC = () => {
  const { toast } = useToast();
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitante, setSelectedVisitante] = useState<Visitante | null>(null);
  const [notas, setNotas] = useState<NotaAcompanhamento[]>([]);
  const [isNotaDialogOpen, setIsNotaDialogOpen] = useState(false);
  const [novaNota, setNovaNota] = useState({
    tipo_contato: 'ligacao',
    resultado: 'sem_resposta',
    observacoes: '',
    proximo_contato: ''
  });

  const statusOptions = [
    { value: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
    { value: 'contatado', label: 'Contatado', color: 'bg-green-100 text-green-800' },
    { value: 'em_acompanhamento', label: 'Em Acompanhamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'integrado', label: 'Integrado', color: 'bg-purple-100 text-purple-800' },
    { value: 'inativo', label: 'Inativo', color: 'bg-gray-100 text-gray-800' }
  ];

  const tiposContato = [
    { value: 'ligacao', label: 'Ligação', icon: Phone },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'visita', label: 'Visita', icon: Eye },
    { value: 'email', label: 'E-mail', icon: AlertCircle }
  ];

  const resultadosContato = [
    { value: 'contatado', label: 'Contatado com sucesso', icon: CheckCircle },
    { value: 'sem_resposta', label: 'Sem resposta', icon: XCircle },
    { value: 'reagendado', label: 'Reagendado', icon: Calendar },
    { value: 'integrado', label: 'Visitante integrado', icon: UserCheck }
  ];

  useEffect(() => {
    fetchVisitantes();
  }, []);

  const fetchVisitantes = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .eq('situacao', 'visitante')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitantes(data || []);
    } catch (error) {
      console.error('Erro ao buscar visitantes:', error);
      toast({
        title: "Erro ao carregar visitantes",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotasVisitante = async (visitanteId: string) => {
    try {
      const { data, error } = await supabase
        .from('notas_acompanhamento_visitantes')
        .select('*')
        .eq('pessoa_id', visitanteId)
        .order('data_contato', { ascending: false });

      if (error) throw error;
      setNotas(data || []);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      toast({
        title: "Erro ao carregar notas",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const atualizarStatusVisitante = async (visitanteId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ status_acompanhamento: novoStatus })
        .eq('id', visitanteId);

      if (error) throw error;

      setVisitantes(prev => prev.map(v => 
        v.id === visitanteId ? { ...v, status_acompanhamento: novoStatus } : v
      ));

      toast({
        title: "Status atualizado",
        description: "Status do visitante foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const adicionarNota = async () => {
    if (!selectedVisitante) return;

    try {
      const { error } = await supabase
        .from('notas_acompanhamento_visitantes')
        .insert({
          pessoa_id: selectedVisitante.id,
          tipo_contato: novaNota.tipo_contato,
          resultado: novaNota.resultado,
          observacoes: novaNota.observacoes || null,
          proximo_contato: novaNota.proximo_contato || null
        });

      if (error) throw error;

      // Atualizar status do visitante baseado no resultado
      if (novaNota.resultado === 'contatado' && selectedVisitante.status_acompanhamento === 'novo') {
        await atualizarStatusVisitante(selectedVisitante.id, 'contatado');
      } else if (novaNota.resultado === 'integrado') {
        await atualizarStatusVisitante(selectedVisitante.id, 'integrado');
      }

      await fetchNotasVisitante(selectedVisitante.id);
      setIsNotaDialogOpen(false);
      setNovaNota({
        tipo_contato: 'ligacao',
        resultado: 'sem_resposta',
        observacoes: '',
        proximo_contato: ''
      });

      toast({
        title: "Nota adicionada",
        description: "Nota de acompanhamento registrada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast({
        title: "Erro ao adicionar nota",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const converterParaMembro = async (visitante: Visitante) => {
    try {
      const { data, error } = await supabase.rpc('converter_visitante_em_membro', {
        p_pessoa_id: visitante.id
      });

      if (error) throw error;

      const resultado = data as any;
      if (resultado?.success) {
        toast({
          title: "Visitante convertido!",
          description: `${visitante.nome_completo} agora é membro da igreja.`,
        });
        fetchVisitantes(); // Recarregar lista
      } else {
        throw new Error(resultado?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao converter visitante:', error);
      toast({
        title: "Erro ao converter visitante",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusInfo = statusOptions.find(s => s.value === status) || statusOptions[0];
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando visitantes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Acompanhamento de Visitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto border rounded-lg">
            <Table className="w-full min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primeira Visita</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitantes.map((visitante) => (
                  <TableRow key={visitante.id}>
                    <TableCell className="font-medium">{visitante.nome_completo}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {visitante.telefone && <p>{visitante.telefone}</p>}
                        {visitante.email && <p className="text-muted-foreground">{visitante.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={visitante.status_acompanhamento || 'novo'}
                        onValueChange={(value) => atualizarStatusVisitante(visitante.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(visitante.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVisitante(visitante);
                                fetchNotasVisitante(visitante.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Acompanhamento - {visitante.nome_completo}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Informações do visitante */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                  <Label className="text-sm font-medium">Status Atual</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(visitante.status_acompanhamento)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Primeira Visita</Label>
                                  <p className="text-sm">
                                    {format(new Date(visitante.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                  </p>
                                </div>
                              </div>

                              {/* Histórico de contatos */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-semibold">Histórico de Contatos</h3>
                                  <Button
                                    onClick={() => setIsNotaDialogOpen(true)}
                                    size="sm"
                                  >
                                    Adicionar Contato
                                  </Button>
                                </div>
                                
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {notas.length > 0 ? notas.map((nota) => {
                                    const tipoContato = tiposContato.find(t => t.value === nota.tipo_contato);
                                    const resultado = resultadosContato.find(r => r.value === nota.resultado);
                                    const TipoIcon = tipoContato?.icon || Phone;
                                    const ResultadoIcon = resultado?.icon || AlertCircle;
                                    
                                    return (
                                      <div key={nota.id} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <TipoIcon className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{tipoContato?.label}</span>
                                          </div>
                                          <span className="text-sm text-muted-foreground">
                                            {format(new Date(nota.data_contato), 'dd/MM/yyyy', { locale: ptBR })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <ResultadoIcon className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{resultado?.label}</span>
                                        </div>
                                        {nota.observacoes && (
                                          <p className="text-sm text-muted-foreground">{nota.observacoes}</p>
                                        )}
                                        {nota.proximo_contato && (
                                          <p className="text-sm text-blue-600 mt-1">
                                            Próximo contato: {format(new Date(nota.proximo_contato), 'dd/MM/yyyy', { locale: ptBR })}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }) : (
                                    <p className="text-center text-muted-foreground py-8">
                                      Nenhum contato registrado ainda
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Botão de conversão */}
                              <div className="pt-4 border-t">
                                <Button
                                  onClick={() => converterParaMembro(visitante)}
                                  className="w-full"
                                  variant="default"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Converter em Membro
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {visitantes.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum visitante encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar nota */}
      <Dialog open={isNotaDialogOpen} onOpenChange={setIsNotaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Contato</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Tipo de Contato</Label>
              <Select
                value={novaNota.tipo_contato}
                onValueChange={(value) => setNovaNota(prev => ({ ...prev, tipo_contato: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposContato.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resultado</Label>
              <Select
                value={novaNota.resultado}
                onValueChange={(value) => setNovaNota(prev => ({ ...prev, resultado: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resultadosContato.map((resultado) => (
                    <SelectItem key={resultado.value} value={resultado.value}>
                      {resultado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={novaNota.observacoes}
                onChange={(e) => setNovaNota(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Detalhes sobre o contato..."
                rows={3}
              />
            </div>

            <div>
              <Label>Próximo Contato</Label>
              <Input
                type="date"
                value={novaNota.proximo_contato}
                onChange={(e) => setNovaNota(prev => ({ ...prev, proximo_contato: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNotaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={adicionarNota}>
                Salvar Contato
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcompanhamentoVisitantes;