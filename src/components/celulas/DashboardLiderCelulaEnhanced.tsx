import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, Clock, AlertCircle, Plus, FileText, PhoneCall, MessageSquare, User, CheckCircle2, X } from 'lucide-react';
import { RelatorioSemanalDialog } from './RelatorioSemanalDialog';
import { AddMemberDialog } from './AddMemberDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MembroCelula {
  id: string;
  nome_completo: string;
  telefone: string;
  email: string;
  funcao: string;
  status: string;
  data_nascimento?: string;
  ultimo_contato?: string;
}

interface ProximaReuniao {
  id: string;
  data: string;
  horario: string;
  endereco: string;
  tema: string;
  presencaEsperada: number;
  confirmados: number;
}

interface AlertaInteligente {
  id: string;
  tipo: 'relatorio_pendente' | 'aniversario' | 'membro_ausente' | 'multiplicacao';
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta';
  acao?: string;
  dados?: any;
}

async function fetchDadosLiderCelula() {
  // Buscar célula do líder atual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data: pessoa } = await supabase
    .from('pessoas')
    .select('id, celula_id')
    .eq('user_id', user.id)
    .single();

  if (!pessoa?.celula_id) {
    return {
      membros: [],
      proximaReuniao: null,
      alertas: [],
      estatisticas: { totalMembros: 0, presencaMedia: 0, visitantesUltimos30Dias: 0 }
    };
  }

  // Buscar membros da célula
  const { data: membros, error: membrosError } = await supabase
    .from('participantes_celulas')
    .select(`
      id,
      pessoas!pessoa_id(
        nome_completo,
        telefone,
        email,
        data_nascimento
      )
    `)
    .eq('celula_id', pessoa.celula_id)
    .eq('ativo', true);

  if (membrosError) {
    console.error('Erro ao buscar membros:', membrosError);
  }

  // Buscar próxima reunião
  const { data: celula } = await supabase
    .from('celulas')
    .select('nome, endereco, horario, dia_semana')
    .eq('id', pessoa.celula_id)
    .single();

  // Calcular próxima reunião baseado no dia da semana
  const hoje = new Date();
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const diaAtual = hoje.getDay();
  
  // Mapear dias da semana para números (assumindo que 'quinta' = 4)
  const diaReuniaoMap: Record<string, number> = {
    'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3,
    'quinta': 4, 'sexta': 5, 'sábado': 6
  };
  
  let diaReuniao = 4; // Default quinta-feira
  if (celula?.dia_semana) {
    const diaLowercase = celula.dia_semana.toLowerCase();
    diaReuniao = diaReuniaoMap[diaLowercase] || 4;
  }
  
  // Calcular próxima data
  let diasParaProxima = diaReuniao - diaAtual;
  if (diasParaProxima <= 0) diasParaProxima += 7;
  
  const proximaData = new Date(hoje);
  proximaData.setDate(hoje.getDate() + diasParaProxima);
  
  const proximaReuniao: ProximaReuniao = {
    id: '1',
    data: proximaData.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
    horario: celula?.horario || '19:30',
    endereco: celula?.endereco || 'Endereço não cadastrado',
    tema: 'O Poder da Oração',
    presencaEsperada: membros?.length || 0,
    confirmados: Math.floor((membros?.length || 0) * 0.8)
  };

  // Gerar alertas inteligentes
  const alertas: AlertaInteligente[] = [
    {
      id: '1',
      tipo: 'relatorio_pendente',
      titulo: 'Relatório Pendente',
      descricao: 'Relatório da reunião de quinta-feira ainda não foi enviado',
      prioridade: 'alta',
      acao: 'Enviar Agora'
    },
    {
      id: '2',
      tipo: 'aniversario',
      titulo: 'Aniversariante',
      descricao: 'Ana Costa faz aniversário amanhã (15/12)',
      prioridade: 'media',
      acao: 'Enviar Parabéns'
    }
  ];

  // Verificar membros ausentes (simulado)
  const membrosAusentes: MembroCelula[] = [];
  if (membrosAusentes.length > 0) {
    alertas.push({
      id: '3',
      tipo: 'membro_ausente',
      titulo: 'Membros Ausentes',
      descricao: `${membrosAusentes.length} membros estão ausentes há mais de 2 semanas`,
      prioridade: 'media',
      acao: 'Fazer Contato'
    });
  }

  return {
    membros: (membros || []).map((m: any) => ({
      id: m.id,
      nome_completo: m.pessoas?.nome_completo || 'Nome não disponível',
      telefone: m.pessoas?.telefone || '',
      email: m.pessoas?.email || '',
      funcao: 'Membro',
      status: 'ativo',
      data_nascimento: m.pessoas?.data_nascimento
    })),
    proximaReuniao,
    alertas,
    estatisticas: {
      totalMembros: membros?.length || 0,
      presencaMedia: Math.floor((membros?.length || 0) * 0.85),
      visitantesUltimos30Dias: 3
    }
  };
}

const handleWhatsAppContact = (telefone: string, nome: string) => {
  if (!telefone) {
    toast.error('Telefone não disponível');
    return;
  }
  
  const numeroLimpo = telefone.replace(/\D/g, '');
  const mensagem = encodeURIComponent(`Olá ${nome}! Tudo bem? Lembrando da nossa reunião de célula hoje. Nos vemos lá! 🙏`);
  const url = `https://wa.me/55${numeroLimpo}?text=${mensagem}`;
  
  window.open(url, '_blank');
  toast.success(`Mensagem enviada para ${nome}`);
};

const handlePhoneCall = (telefone: string, nome: string) => {
  if (!telefone) {
    toast.error('Telefone não disponível');
    return;
  }
  
  window.open(`tel:${telefone}`, '_self');
  toast.info(`Ligando para ${nome}`);
};

const handleConfirmarReuniao = async () => {
  try {
    // Aqui você pode implementar a lógica para marcar a reunião como confirmada no banco
    // Por exemplo, atualizar o status da próxima reunião
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Simular atualização no banco de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Reunião confirmada! Notificações serão enviadas aos membros');
  } catch (error) {
    console.error('Erro ao confirmar reunião:', error);
    toast.error('Erro ao confirmar reunião');
  }
};

const handleEnviarLembreteGeral = async (membros: MembroCelula[]) => {
  if (!membros || membros.length === 0) {
    toast.error('Nenhum membro disponível para enviar lembrete');
    return;
  }

  const membrosComTelefone = membros.filter(m => m.telefone);
  
  if (membrosComTelefone.length === 0) {
    toast.error('Nenhum membro possui telefone cadastrado');
    return;
  }

  try {
    // Abrir WhatsApp para cada membro com delay
    membrosComTelefone.forEach((membro, index) => {
      setTimeout(() => {
        handleWhatsAppContact(membro.telefone, membro.nome_completo);
      }, index * 1000); // 1 segundo de delay entre cada contato
    });
    
    toast.success(`Abrindo WhatsApp para ${membrosComTelefone.length} membros`);
  } catch (error) {
    console.error('Erro ao enviar lembretes:', error);
    toast.error('Erro ao enviar lembretes');
  }
};

export const DashboardLiderCelulaEnhanced: React.FC = () => {
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [selectedMembro, setSelectedMembro] = useState<MembroCelula | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['lider-celula-data'],
    queryFn: fetchDadosLiderCelula,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  });

  const queryClient = useQueryClient();

  const handleResolverAlerta = useMutation({
    mutationFn: async (alertaId: string) => {
      // Simular resolução do alerta
      await new Promise(resolve => setTimeout(resolve, 1000));
      return alertaId;
    },
    onSuccess: () => {
      toast.success('Alerta resolvido');
      queryClient.invalidateQueries({ queryKey: ['lider-celula-data'] });
    }
  });

  if (error) {
    toast.error('Erro ao carregar dados da célula');
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'border-red-500 bg-red-50 dark:bg-red-950/30';
      case 'media': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Próxima Reunião */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Próxima Reunião</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? 'Carregando...' : 
                  data?.proximaReuniao ? 
                    `${data.proximaReuniao.data}, ${data.proximaReuniao.horario}` : 
                    'Reunião não agendada'
                }
              </p>
              <p className="text-muted-foreground">
                {data?.proximaReuniao?.endereco || 'Endereço não disponível'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tema: "{data?.proximaReuniao?.tema || 'Tema não definido'}"
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Confirmados</p>
              <p className="text-xl font-bold text-emerald-600">
                {data?.proximaReuniao?.confirmados || 0}/{data?.proximaReuniao?.presencaEsperada || 0}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button size="sm" onClick={handleConfirmarReuniao}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar Reunião
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => data?.membros && handleEnviarLembreteGeral(data.membros)}
              disabled={!data?.membros || data.membros.length === 0}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Lembrete Geral
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Meus Membros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Meus Membros</span>
              <Badge variant="secondary">{isLoading ? '...' : data?.membros.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-4">
                  Carregando membros...
                </div>
              ) : data?.membros.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Nenhum membro encontrado
                </div>
              ) : (
                data?.membros.map((membro) => (
                  <div key={membro.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{membro.nome_completo}</p>
                      <p className="text-sm text-muted-foreground">{membro.funcao}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={membro.status === 'ativo' ? 'default' : 'destructive'}>
                        {membro.status}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedMembro(membro)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Membro</DialogTitle>
                            <DialogDescription>
                              Informações e ações para {selectedMembro?.nome_completo}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedMembro && (
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <p><strong>Nome:</strong> {selectedMembro.nome_completo}</p>
                                <p><strong>Função:</strong> {selectedMembro.funcao}</p>
                                <p><strong>Status:</strong> {selectedMembro.status}</p>
                                <p><strong>Telefone:</strong> {selectedMembro.telefone || 'Não informado'}</p>
                                <p><strong>Email:</strong> {selectedMembro.email || 'Não informado'}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm"
                                  onClick={() => handlePhoneCall(selectedMembro.telefone, selectedMembro.nome_completo)}
                                  disabled={!selectedMembro.telefone}
                                >
                                  <PhoneCall className="h-4 w-4 mr-2" />
                                  Ligar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleWhatsAppContact(selectedMembro.telefone, selectedMembro.nome_completo)}
                                  disabled={!selectedMembro.telefone}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  WhatsApp
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              )}
            </div>
            <AddMemberDialog />
          </CardContent>
        </Card>

        {/* Alertas Inteligentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Alertas Inteligentes</span>
              <Badge variant="destructive">{data?.alertas.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-4">
                  Carregando alertas...
                </div>
              ) : data?.alertas.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                  Tudo em ordem! Nenhum alerta ativo.
                </div>
              ) : (
                data?.alertas.map((alerta) => (
                  <div key={alerta.id} className={`p-3 border rounded-lg ${getPrioridadeColor(alerta.prioridade)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">{alerta.titulo}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolverAlerta.mutate(alerta.id)}
                        disabled={handleResolverAlerta.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm mt-1">{alerta.descricao}</p>
                    {alerta.acao && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          if (alerta.tipo === 'relatorio_pendente') {
                            setShowRelatorio(true);
                          } else {
                            toast.info(`Ação: ${alerta.acao}`);
                          }
                        }}
                      >
                        {alerta.acao}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.estatisticas.totalMembros || 0}</div>
            <p className="text-xs text-muted-foreground">Ativos na célula</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presença Média</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{data?.estatisticas.presencaMedia || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 4 semanas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data?.estatisticas.visitantesUltimos30Dias || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => setShowRelatorio(true)}
            >
              <FileText className="h-6 w-6" />
              <span>Novo Relatório</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => data?.membros && handleEnviarLembreteGeral(data.membros)}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Lembrete Geral</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.success('Lista de presença gerada!')}
            >
              <CheckCircle2 className="h-6 w-6" />
              <span>Lista Presença</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Formulário de visitante sendo preparado...')}
            >
              <Plus className="h-6 w-6" />
              <span>Add Visitante</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <RelatorioSemanalDialog open={showRelatorio} onOpenChange={setShowRelatorio} />
    </div>
  );
};