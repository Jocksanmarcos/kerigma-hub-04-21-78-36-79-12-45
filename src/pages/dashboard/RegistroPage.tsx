import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  Edit,
  Eye,
  Download
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface RegistroAtividade {
  id: string;
  tipo: 'culto' | 'evento' | 'reuniao' | 'estudo' | 'batismo' | 'casamento' | 'funeral';
  titulo: string;
  data: string;
  hora: string;
  responsavel: string;
  participantes: number;
  local: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  anexos?: string[];
  tags: string[];
}

const RegistroPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  // Dados mockados - substituir por dados reais
  const registros: RegistroAtividade[] = [
    {
      id: '1',
      tipo: 'culto',
      titulo: 'Culto Dominical Matutino',
      data: '2024-03-17',
      hora: '09:00',
      responsavel: 'Pastor João Silva',
      participantes: 145,
      local: 'Templo Principal',
      status: 'concluido',
      observacoes: 'Culto com grande presença, 3 decisões por Cristo',
      anexos: ['lista_presenca.pdf', 'ofertas.xlsx'],
      tags: ['culto', 'domingo', 'evangelistico']
    },
    {
      id: '2',
      tipo: 'batismo',
      titulo: 'Cerimônia de Batismo',
      data: '2024-03-20',
      hora: '19:30',
      responsavel: 'Pastor João Silva',
      participantes: 8,
      local: 'Batistério',
      status: 'planejado',
      observacoes: '8 candidatos confirmados para o batismo',
      tags: ['batismo', 'sacramento', 'nova_vida']
    },
    {
      id: '3',
      tipo: 'evento',
      titulo: 'Conferência da Família',
      data: '2024-03-22',
      hora: '19:00',
      responsavel: 'Pr. Carlos e Pra. Ana',
      participantes: 89,
      local: 'Salão Social',
      status: 'em_andamento',
      observacoes: 'Evento com foco em fortalecimento familiar',
      anexos: ['programa.pdf'],
      tags: ['familia', 'conferencia', 'relacionamentos']
    },
    {
      id: '4',
      tipo: 'estudo',
      titulo: 'Estudo Bíblico - Livro de Atos',
      data: '2024-03-15',
      hora: '20:00',
      responsavel: 'Pastora Maria',
      participantes: 34,
      local: 'Sala de Estudos',
      status: 'concluido',
      observacoes: 'Estudo sobre o capítulo 2 de Atos',
      tags: ['estudo', 'atos', 'igreja_primitiva']
    }
  ];

  const tipoOptions = ['culto', 'evento', 'reuniao', 'estudo', 'batismo', 'casamento', 'funeral'];
  const statusOptions = ['planejado', 'em_andamento', 'concluido', 'cancelado'];

  const registrosFiltrados = registros.filter(registro => {
    const matchesSearch = registro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registro.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registro.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = !filtroTipo || registro.tipo === filtroTipo;
    const matchesStatus = !filtroStatus || registro.status === filtroStatus;
    const matchesTab = activeTab === 'todos' || 
                      (activeTab === 'recentes' && isRecente(registro.data)) ||
                      (activeTab === 'proximos' && isProximo(registro.data)) ||
                      (activeTab === 'mes' && isDoMesAtual(registro.data));
    return matchesSearch && matchesTipo && matchesStatus && matchesTab;
  });

  function isRecente(data: string): boolean {
    const hoje = new Date();
    const dataRegistro = new Date(data);
    const diffTime = hoje.getTime() - dataRegistro.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }

  function isProximo(data: string): boolean {
    const hoje = new Date();
    const dataRegistro = new Date(data);
    const diffTime = dataRegistro.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }

  function isDoMesAtual(data: string): boolean {
    const hoje = new Date();
    const dataRegistro = new Date(data);
    return dataRegistro.getMonth() === hoje.getMonth() && 
           dataRegistro.getFullYear() === hoje.getFullYear();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejado':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Planejado</Badge>;
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Em Andamento</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Concluído</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const cores = {
      culto: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      evento: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      reuniao: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      estudo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      batismo: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      casamento: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      funeral: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    
    return (
      <Badge className={cores[tipo as keyof typeof cores] || 'bg-gray-100 text-gray-800'}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    );
  };

  const totalRegistros = registros.length;
  const registrosEsteMs = registros.filter(r => isDoMesAtual(r.data)).length;
  const registrosConcluidos = registros.filter(r => r.status === 'concluido').length;
  const proximosEventos = registros.filter(r => isProximo(r.data) && r.status === 'planejado').length;

  return (
    <>
      <Helmet>
        <title>Registro de Atividades | CBN Kerigma</title>
        <meta name="description" content="Registre e acompanhe todas as atividades da igreja" />
      </Helmet>
      
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                Registro de Atividades
              </h1>
              <p className="text-muted-foreground">
                Documentação completa das atividades da igreja
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Registro
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRegistros}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrosEsteMs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrosConcluidos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos (7 dias)</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{proximosEventos}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Registros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por título, responsável ou tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-40">
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="">Todos os tipos</option>
                    {tipoOptions.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-40">
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="recentes">Recentes</TabsTrigger>
              <TabsTrigger value="proximos">Próximos</TabsTrigger>
              <TabsTrigger value="mes">Este Mês</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {registrosFiltrados.map(registro => (
                  <Card key={registro.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{registro.titulo}</h3>
                              <p className="text-muted-foreground">{registro.responsavel}</p>
                            </div>
                            <div className="flex gap-2">
                              {getTipoBadge(registro.tipo)}
                              {getStatusBadge(registro.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(registro.data).toLocaleDateString('pt-BR')} às {registro.hora}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {registro.participantes} participantes
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Local: {registro.local}
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {registro.anexos?.length || 0} anexos
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {registro.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>

                          {registro.observacoes && (
                            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                              <strong>Observações:</strong> {registro.observacoes}
                            </div>
                          )}

                          {registro.anexos && registro.anexos.length > 0 && (
                            <div className="text-sm">
                              <strong>Anexos:</strong>
                              <div className="flex gap-2 mt-1">
                                {registro.anexos.map(anexo => (
                                  <Button key={anexo} variant="outline" size="sm">
                                    <Download className="h-3 w-3 mr-1" />
                                    {anexo}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="default" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Relatório
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {registrosFiltrados.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os filtros ou crie um novo registro.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Registro
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </>
  );
};

export default RegistroPage;