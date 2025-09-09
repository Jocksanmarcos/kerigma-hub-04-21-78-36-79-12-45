import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Phone, Calendar, MessageSquare, User, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Visitante {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  idade?: number;
  data_visita: string;
  celula_nome: string;
  como_conheceu: string;
    observacoes: string;
    status_acompanhamento: string;
    retornou: boolean;
    responsavel_acompanhamento?: string;
}

interface NovoVisitante {
  nome: string;
  telefone: string;
  email: string;
  idade: string;
  celula_id: string;
  como_conheceu: string;
  observacoes: string;
}

async function fetchVisitantes(): Promise<Visitante[]> {
  const { data, error } = await supabase
    .from('visitantes_celulas')
    .select(`
      id,
      nome,
      telefone,
      email,
      idade,
      data_visita,
      como_conheceu,
      observacoes,
      status_acompanhamento,
      retornou,
      responsavel_acompanhamento,
      celulas!celula_id(nome)
    `)
    .order('data_visita', { ascending: false });

  if (error) {
    console.error('Erro ao buscar visitantes:', error);
    throw error;
  }

  return (data || []).map(v => ({
    id: v.id,
    nome: v.nome,
    telefone: v.telefone || '',
    email: v.email || '',
    idade: v.idade,
    data_visita: v.data_visita,
    celula_nome: v.celulas?.nome || 'Célula não informada',
    como_conheceu: v.como_conheceu || '',
    observacoes: v.observacoes || '',
    status_acompanhamento: v.status_acompanhamento || 'novo',
    retornou: v.retornou || false,
    responsavel_acompanhamento: v.responsavel_acompanhamento
  }));
}

async function fetchCelulas() {
  const { data, error } = await supabase
    .from('celulas')
    .select('id, nome')
    .eq('ativa', true)
    .order('nome');

  if (error) {
    console.error('Erro ao buscar células:', error);
    return [];
  }

  return data || [];
}

async function criarVisitante(visitante: NovoVisitante) {
  const { data, error } = await supabase
    .from('visitantes_celulas')
    .insert({
      nome: visitante.nome,
      telefone: visitante.telefone,
      email: visitante.email,
      idade: visitante.idade ? parseInt(visitante.idade) : null,
      celula_id: visitante.celula_id,
      como_conheceu: visitante.como_conheceu,
      observacoes: visitante.observacoes,
      data_visita: new Date().toISOString().split('T')[0],
      status_acompanhamento: 'novo'
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar visitante:', error);
    throw error;
  }

  return data;
}

async function atualizarStatusVisitante(id: string, status: string) {
  const { error } = await supabase
    .from('visitantes_celulas')
    .update({ 
      status_acompanhamento: status,
      ultimo_contato: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

export const GestaoVisitantesEnhanced: React.FC = () => {
  const [novoVisitante, setNovoVisitante] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<NovoVisitante>({
    nome: '',
    telefone: '',
    email: '',
    idade: '',
    celula_id: '',
    como_conheceu: '',
    observacoes: ''
  });

  const queryClient = useQueryClient();

  const { data: visitantes = [], isLoading, error } = useQuery({
    queryKey: ['visitantes-celulas'],
    queryFn: fetchVisitantes,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  });

  const { data: celulas = [] } = useQuery({
    queryKey: ['celulas-ativas'],
    queryFn: fetchCelulas,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const criarVisitanteMutation = useMutation({
    mutationFn: criarVisitante,
    onSuccess: () => {
      toast.success('Visitante cadastrado com sucesso!');
      setNovoVisitante(false);
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        idade: '',
        celula_id: '',
        como_conheceu: '',
        observacoes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['visitantes-celulas'] });
    },
    onError: (error) => {
      console.error('Erro ao criar visitante:', error);
      toast.error('Erro ao cadastrar visitante');
    }
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      atualizarStatusVisitante(id, status),
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['visitantes-celulas'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  });

  if (error) {
    toast.error('Erro ao carregar visitantes');
  }

  const visitantesFiltrados = visitantes.filter(visitante => {
    const filtroStatusOk = filtroStatus === 'todos' || visitante.status_acompanhamento === filtroStatus;
    const filtroBuscaOk = termoBusca === '' || 
      visitante.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      visitante.celula_nome.toLowerCase().includes(termoBusca.toLowerCase());
    
    return filtroStatusOk && filtroBuscaOk;
  });

  const estatisticas = {
    totalVisitantes: visitantes.length,
    visitantesEsteMes: visitantes.filter(v => {
      const hoje = new Date();
      const dataVisita = new Date(v.data_visita);
      return dataVisita.getMonth() === hoje.getMonth() && dataVisita.getFullYear() === hoje.getFullYear();
    }).length,
    taxaRetorno: visitantes.length > 0 ? Math.round((visitantes.filter(v => v.retornou).length / visitantes.length) * 100) : 0,
    conversoes: visitantes.filter(v => v.status_acompanhamento === 'convertido').length,
    pendentes: visitantes.filter(v => v.status_acompanhamento === 'novo' || v.status_acompanhamento === 'pendente').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'contatado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'agendado':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'convertido':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'sem_interesse':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleWhatsApp = (telefone: string, nome: string) => {
    if (!telefone) {
      toast.error('Telefone não disponível');
      return;
    }
    
    const numeroLimpo = telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá ${nome}! Foi um prazer tê-lo(a) conosco na célula. Como está? Gostaria de conversar um pouco mais sobre nossa comunidade?`);
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

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone || !formData.celula_id) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    criarVisitanteMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Visitantes</h2>
          <p className="text-muted-foreground">
            Acompanhamento automatizado do processo de integração
          </p>
        </div>
        <Dialog open={novoVisitante} onOpenChange={setNovoVisitante}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Visitante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Visitante</DialogTitle>
              <DialogDescription>
                Registre um novo visitante para acompanhamento automático
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome Completo *</label>
                <Input 
                  placeholder="Nome do visitante"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone *</label>
                <Input 
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Idade</label>
                <Input 
                  type="number"
                  placeholder="Idade"
                  value={formData.idade}
                  onChange={(e) => setFormData({...formData, idade: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Célula Visitada *</label>
                <Select value={formData.celula_id} onValueChange={(value) => setFormData({...formData, celula_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a célula" />
                  </SelectTrigger>
                  <SelectContent>
                    {celulas.map((celula) => (
                      <SelectItem key={celula.id} value={celula.id}>
                        {celula.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Como Conheceu</label>
                <Select value={formData.como_conheceu} onValueChange={(value) => setFormData({...formData, como_conheceu: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como conheceu a igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amigo">Convite de um amigo</SelectItem>
                    <SelectItem value="evento">Evento da igreja</SelectItem>
                    <SelectItem value="campanha">Campanha evangelística</SelectItem>
                    <SelectItem value="site">Site da igreja</SelectItem>
                    <SelectItem value="redes_sociais">Redes sociais</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea 
                  placeholder="Observações sobre o visitante..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={criarVisitanteMutation.isPending}
                >
                  {criarVisitanteMutation.isPending ? 'Cadastrando...' : 'Cadastrar Visitante'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setNovoVisitante(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitantes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalVisitantes}</div>
            <p className="text-xs text-muted-foreground">Todos os tempos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estatisticas.visitantesEsteMes}</div>
            <p className="text-xs text-muted-foreground">Novos visitantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.taxaRetorno}%</div>
            <p className="text-xs text-muted-foreground">Visitantes que retornaram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estatisticas.conversoes}</div>
            <p className="text-xs text-muted-foreground">Novos membros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estatisticas.pendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando contato</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou célula..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="contatado">Contatado</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="convertido">Convertido</SelectItem>
                <SelectItem value="sem_interesse">Sem interesse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Visitantes */}
      <Card>
        <CardHeader>
          <CardTitle>Visitantes em Acompanhamento</CardTitle>
          <CardDescription>
            Lista de visitantes com status do acompanhamento ({visitantesFiltrados.length} encontrados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Carregando visitantes...</div>
              </div>
            ) : visitantesFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  {termoBusca || filtroStatus !== 'todos' 
                    ? 'Nenhum visitante encontrado com os filtros aplicados'
                    : 'Nenhum visitante cadastrado ainda'
                  }
                </div>
              </div>
            ) : (
              visitantesFiltrados.map((visitante) => (
                <div key={visitante.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{visitante.nome}</h4>
                        <p className="text-sm text-muted-foreground">{visitante.celula_nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Visitou em {new Date(visitante.data_visita).toLocaleDateString('pt-BR')} 
                          {visitante.idade && ` • ${visitante.idade} anos`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(visitante.status_acompanhamento)}>
                        {visitante.status_acompanhamento.replace('_', ' ')}
                      </Badge>
                      {visitante.retornou && (
                        <Badge variant="outline" className="text-emerald-600">
                          Retornou
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <div className="text-sm">
                      <span className="font-medium">Contato:</span> {visitante.telefone || 'Não informado'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Como conheceu:</span> {visitante.como_conheceu || 'Não informado'}
                    </div>
                    {visitante.observacoes && (
                    <div className="text-sm">
                      <span className="font-medium">Observações:</span> {visitante.observacoes || 'Nenhuma observação'}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {visitante.status_acompanhamento.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePhoneCall(visitante.telefone, visitante.nome)}
                      disabled={!visitante.telefone}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleWhatsApp(visitante.telefone, visitante.nome)}
                      disabled={!visitante.telefone}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.info('Abrindo agendador de visitas')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar
                    </Button>
                    <Select 
                      value={visitante.status_acompanhamento}
                      onValueChange={(value) => atualizarStatusMutation.mutate({ id: visitante.id, status: value })}
                      disabled={atualizarStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="contatado">Contatado</SelectItem>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="convertido">Convertido</SelectItem>
                        <SelectItem value="sem_interesse">Sem interesse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fluxo Automatizado */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Acompanhamento Automatizado</CardTitle>
          <CardDescription>
            Como o sistema automaticamente acompanha novos visitantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium">Cadastro Automático</h4>
                <p className="text-sm text-muted-foreground">
                  Quando um líder reporta um visitante, o sistema cria automaticamente uma tarefa de acompanhamento
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium">Atribuição ao Supervisor</h4>
                <p className="text-sm text-muted-foreground">
                  A tarefa é automaticamente atribuída ao supervisor da célula com prazo de 48h para primeiro contato
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium">Lembretes Inteligentes</h4>
                <p className="text-sm text-muted-foreground">
                  Sistema envia lembretes e sugere próximas ações baseadas no status do visitante
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <h4 className="font-medium">Integração na Jornada do Membro</h4>
                <p className="text-sm text-muted-foreground">
                  Visitantes convertidos são automaticamente inseridos na jornada de crescimento da igreja
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};