import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Eye, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatsCard } from '@/components/dashboard/StatsCard';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore - pdfmake types for vfs_fonts
import pdfFonts from 'pdfmake/build/vfs_fonts';
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

interface EventoInscricoesProps {
  eventoId: string;
}

interface Inscricao {
  id: string;
  check_in_status: boolean;
  status_pagamento: string;
  pagamento_valor: number;
  created_at: string;
  dados_formulario_json: any;
  pessoa_id: string;
  pessoas?: {
    nome_completo: string;
    email: string;
    telefone: string;
  };
}

export const EventoInscricoes: React.FC<EventoInscricoesProps> = ({ eventoId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInscricao, setSelectedInscricao] = useState<Inscricao | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inscricoes, isLoading } = useQuery({
    queryKey: ['evento-inscricoes', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evento_inscricoes')
        .select(`
          *,
          pessoas (
            nome_completo,
            email,
            telefone
          )
        `)
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Inscricao[];
    }
  });

  const updateCheckInMutation = useMutation({
    mutationFn: async ({ inscricaoId, status }: { inscricaoId: string; status: boolean }) => {
      const { error } = await supabase
        .from('evento_inscricoes')
        .update({ check_in_status: status })
        .eq('id', inscricaoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evento-inscricoes', eventoId] });
      toast({ title: 'Check-in atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao atualizar check-in', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const filteredInscricoes = inscricoes?.filter(inscricao =>
    inscricao.pessoas?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inscricao.pessoas?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inscricao.pessoas?.telefone?.includes(searchTerm)
  ) || [];

  const stats = React.useMemo(() => {
    if (!inscricoes) return null;

    const total = inscricoes.length;
    const checkIns = inscricoes.filter(i => i.check_in_status).length;
    const confirmadas = inscricoes.filter(i => i.status_pagamento === 'Confirmado').length;
    const pendentes = inscricoes.filter(i => i.status_pagamento === 'Pendente').length;
    
    return {
      total,
      checkIns,
      confirmadas,
      pendentes,
      taxaCheckIn: total > 0 ? Math.round((checkIns / total) * 100) : 0
    };
  }, [inscricoes]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmado</Badge>;
      case 'Pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'Cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCheckIn = (inscricao: Inscricao) => {
    updateCheckInMutation.mutate({
      inscricaoId: inscricao.id,
      status: !inscricao.check_in_status
    });
  };

  const exportToCSV = () => {
    if (!inscricoes?.length) return;

    const headers = ['Nome', 'Email', 'Telefone', 'Data Inscrição', 'Status Pagamento', 'Check-in'];
    const rows = inscricoes.map(inscricao => [
      inscricao.pessoas?.nome_completo || '',
      inscricao.pessoas?.email || '',
      inscricao.pessoas?.telefone || '',
      format(new Date(inscricao.created_at), 'dd/MM/yyyy HH:mm'),
      inscricao.status_pagamento,
      inscricao.check_in_status ? 'Sim' : 'Não'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscricoes-evento-${eventoId}.csv`);
    link.click();
  };

  const exportToXLSX = () => {
    if (!inscricoes?.length) return;
    const rows = inscricoes.map(inscricao => ({
      Nome: inscricao.pessoas?.nome_completo || '',
      Email: inscricao.pessoas?.email || '',
      Telefone: inscricao.pessoas?.telefone || '',
      'Data Inscrição': format(new Date(inscricao.created_at), 'dd/MM/yyyy HH:mm'),
      'Status Pagamento': inscricao.status_pagamento,
      'Check-in': inscricao.check_in_status ? 'Sim' : 'Não'
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscricoes');
    XLSX.writeFile(wb, `inscricoes-evento-${eventoId}.xlsx`);
  };

  const exportToPDF = () => {
    if (!inscricoes?.length) return;
    const headers = ['Nome', 'Email', 'Telefone', 'Data Inscrição', 'Status', 'Check-in'];
    const body = [
      headers,
      ...inscricoes.map(inscricao => [
        inscricao.pessoas?.nome_completo || '',
        inscricao.pessoas?.email || '',
        inscricao.pessoas?.telefone || '',
        format(new Date(inscricao.created_at), 'dd/MM/yyyy HH:mm'),
        inscricao.status_pagamento,
        inscricao.check_in_status ? 'Sim' : 'Não'
      ])
    ];

    const docDefinition = {
      content: [
        { text: 'Inscrições do Evento', style: 'header' },
        { text: new Date().toLocaleString('pt-BR'), style: 'subheader' },
        {
          table: { headerRows: 1, widths: ['*','*','*','auto','auto','auto'], body }
        }
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 8] },
        subheader: { fontSize: 10, color: '#666', margin: [0, 0, 0, 12] }
      }
    } as any;

    (pdfMake as any).createPdf(docDefinition).download(`inscricoes-evento-${eventoId}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total de Inscrições"
            value={stats.total}
            icon={UserCheck}
            variant="primary"
          />
          <StatsCard
            title="Check-ins Realizados"
            value={stats.checkIns}
            description={`${stats.taxaCheckIn}% do total`}
            icon={CheckCircle}
            variant="default"
          />
          <StatsCard
            title="Pagamentos Confirmados"
            value={stats.confirmadas}
            icon={CheckCircle}
            variant="default"
          />
          <StatsCard
            title="Pendentes"
            value={stats.pendentes}
            icon={Clock}
            variant="default"
          />
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar inscrições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={exportToXLSX} variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            XLSX
          </Button>
          <Button onClick={exportToPDF} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Tabela de inscrições */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inscrições</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data Inscrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInscricoes.map((inscricao) => (
                <TableRow key={inscricao.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inscricao.pessoas?.nome_completo}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {inscricao.id.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {inscricao.pessoas?.email}
                      </div>
                      {inscricao.pessoas?.telefone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {inscricao.pessoas?.telefone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(inscricao.created_at), 'dd/MM/yy HH:mm')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(inscricao.status_pagamento)}
                  </TableCell>
                  
                  <TableCell>
                    <Button
                      variant={inscricao.check_in_status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCheckIn(inscricao)}
                    >
                      {inscricao.check_in_status ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInscricao(inscricao);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInscricoes.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma inscrição encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente ajustar sua busca' : 'Ainda não há inscrições para este evento'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Inscrição</DialogTitle>
          </DialogHeader>
          
          {selectedInscricao && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Participante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="font-semibold">{selectedInscricao.pessoas?.nome_completo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedInscricao.pessoas?.email}</p>
                  </div>
                  {selectedInscricao.pessoas?.telefone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <p>{selectedInscricao.pessoas?.telefone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data da Inscrição</p>
                    <p>{format(new Date(selectedInscricao.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status da Inscrição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Status do Pagamento</span>
                    {getStatusBadge(selectedInscricao.status_pagamento)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Check-in Realizado</span>
                    <Badge variant={selectedInscricao.check_in_status ? "default" : "secondary"}>
                      {selectedInscricao.check_in_status ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  {selectedInscricao.pagamento_valor > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Valor Pago</span>
                      <span className="font-semibold">
                        R$ {selectedInscricao.pagamento_valor.toFixed(2)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dados do formulário */}
              {selectedInscricao.dados_formulario_json && Object.keys(selectedInscricao.dados_formulario_json).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Adicionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(selectedInscricao.dados_formulario_json).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm font-medium text-muted-foreground">{key}</p>
                          <p>{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <div className="flex justify-end gap-4">
                <Button
                  variant={selectedInscricao.check_in_status ? "secondary" : "default"}
                  onClick={() => {
                    handleCheckIn(selectedInscricao);
                    setShowDetails(false);
                  }}
                >
                  {selectedInscricao.check_in_status ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Cancelar Check-in
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Fazer Check-in
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};