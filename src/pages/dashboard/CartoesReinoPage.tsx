import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  Target,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface CartaoReino {
  id: string;
  numero: string;
  portador: string;
  email: string;
  telefone: string;
  endereco: string;
  status: 'ativo' | 'inativo' | 'suspenso' | 'pendente';
  dataEmissao: string;
  dataVencimento: string;
  categoria: 'membro' | 'lider' | 'pastor' | 'visitante';
  participacoes: number;
  contribuicoes: number;
  observacoes?: string;
  foto?: string;
}

const CartoesReinoPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  // Dados mockados - substituir por dados reais
  const cartoes: CartaoReino[] = [
    {
      id: '1',
      numero: 'CR-2024-001',
      portador: 'João Silva Santos',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      status: 'ativo',
      dataEmissao: '2024-01-15',
      dataVencimento: '2025-01-15',
      categoria: 'membro',
      participacoes: 48,
      contribuicoes: 12,
      observacoes: 'Membro muito ativo na comunidade'
    },
    {
      id: '2',
      numero: 'CR-2024-002',
      portador: 'Maria Santos Oliveira',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      endereco: 'Av. Paulista, 456 - São Paulo/SP',
      status: 'ativo',
      dataEmissao: '2024-02-20',
      dataVencimento: '2025-02-20',
      categoria: 'lider',
      participacoes: 52,
      contribuicoes: 12,
      observacoes: 'Líder de célula da região central'
    },
    {
      id: '3',
      numero: 'CR-2024-003',
      portador: 'Pedro Costa Lima',
      email: 'pedro@email.com',
      telefone: '(11) 77777-7777',
      endereco: 'Rua do Campo, 789 - Santo André/SP',
      status: 'pendente',
      dataEmissao: '2024-03-10',
      dataVencimento: '2025-03-10',
      categoria: 'visitante',
      participacoes: 3,
      contribuicoes: 0,
      observacoes: 'Novo convertido, aguardando batismo'
    }
  ];

  const statusOptions = ['ativo', 'inativo', 'suspenso', 'pendente'];
  const categoriaOptions = ['membro', 'lider', 'pastor', 'visitante'];

  const cartoesFiltrados = cartoes.filter(cartao => {
    const matchesSearch = cartao.portador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cartao.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cartao.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filtroStatus || cartao.status === filtroStatus;
    const matchesCategoria = !filtroCategoria || cartao.categoria === filtroCategoria;
    const matchesTab = activeTab === 'todos' || 
                      (activeTab === 'vencendo' && isVencendoEm30Dias(cartao.dataVencimento)) ||
                      (activeTab === 'novos' && isNovoCartao(cartao.dataEmissao));
    return matchesSearch && matchesStatus && matchesCategoria && matchesTab;
  });

  function isVencendoEm30Dias(dataVencimento: string): boolean {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }

  function isNovoCartao(dataEmissao: string): boolean {
    const hoje = new Date();
    const emissao = new Date(dataEmissao);
    const diffTime = hoje.getTime() - emissao.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ativo</Badge>;
      case 'inativo':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Inativo</Badge>;
      case 'suspenso':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Suspenso</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoriaBadge = (categoria: string) => {
    switch (categoria) {
      case 'pastor':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Pastor</Badge>;
      case 'lider':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Líder</Badge>;
      case 'membro':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Membro</Badge>;
      case 'visitante':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Visitante</Badge>;
      default:
        return <Badge variant="secondary">{categoria}</Badge>;
    }
  };

  const totalCartoes = cartoes.length;
  const cartoesAtivos = cartoes.filter(c => c.status === 'ativo').length;
  const cartoesVencendo = cartoes.filter(c => isVencendoEm30Dias(c.dataVencimento)).length;
  const novosCartoes = cartoes.filter(c => isNovoCartao(c.dataEmissao)).length;

  return (
    <>
      <Helmet>
        <title>Cartões do Reino | CBN Kerigma</title>
        <meta name="description" content="Gerencie cartões de identificação dos membros" />
      </Helmet>
      
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <CreditCard className="h-8 w-8 text-primary" />
                Cartões do Reino
              </h1>
              <p className="text-muted-foreground">
                Gerencie cartões de identificação e acesso
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cartões</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCartoes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cartoesAtivos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencendo (30 dias)</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{cartoesVencendo}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos (30 dias)</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{novosCartoes}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Cartões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, número ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
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
                <div className="w-40">
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="">Todas categorias</option>
                    {categoriaOptions.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
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
              <TabsTrigger value="novos">Novos</TabsTrigger>
              <TabsTrigger value="vencendo">Vencendo</TabsTrigger>
              <TabsTrigger value="inativos">Inativos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {cartoesFiltrados.map(cartao => (
                  <Card key={cartao.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{cartao.portador}</h3>
                              <p className="text-muted-foreground font-mono">{cartao.numero}</p>
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(cartao.status)}
                              {getCategoriaBadge(cartao.categoria)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {cartao.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {cartao.telefone}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {cartao.endereco}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Emitido: {new Date(cartao.dataEmissao).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Vence: {new Date(cartao.dataVencimento).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span>Participações: {cartao.participacoes}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Contribuições: {cartao.contribuicoes}</span>
                            </div>
                          </div>

                          {cartao.observacoes && (
                            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                              <strong>Observações:</strong> {cartao.observacoes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="default" size="sm">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            Renovar
                          </Button>
                          <Button variant="outline" size="sm">
                            Imprimir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {cartoesFiltrados.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum cartão encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os filtros ou cadastre um novo cartão.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Cartão
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

export default CartoesReinoPage;