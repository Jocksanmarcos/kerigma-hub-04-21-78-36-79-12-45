import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AcompanhamentoVisitantes from '@/components/visitantes/AcompanhamentoVisitantes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Heart,
  MapPin,
  Clock,
  Target,
  Search,
  Filter,
  Grid3X3,
  List,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  MoreHorizontal,
  Plus,
  UserCheck,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Edit,
  Trash2,
  UserX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ModalAdicionarPessoa } from '@/components/missoes/modals/ModalAdicionarPessoa';
import { ModalPerfilPessoa } from '@/components/pessoas/ModalPerfilPessoa';
import { ModalEditarPessoa } from '@/components/pessoas/ModalEditarPessoa';
import GestaoFamilias from '@/components/familias/GestaoFamilias';
import MapaLocalizacao from '@/components/localizacao/MapaLocalizacao';

interface KPIData {
  novosMembros: number;
  visitantes: number;
  aniversariantes: number;
  totalAtivos: number;
  engajamento: number;
  crescimentoTendencia?: 'up' | 'down' | 'stable';
  membrosPorFaixaEtaria?: { faixa: string; total: number }[];
  distribuicaoPorCelula?: { nome: string; total: number }[];
  historicoMensal?: { mes: string; membros: number; visitantes: number }[];
}

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  tipo_pessoa: string;
  situacao: string;
  data_nascimento?: string;
  data_membresia?: string;
  celula_id?: string;
  celulas?: { nome: string };
  foto_url?: string;
  dons_talentos?: string[];
}

interface FiltrosPessoas {
  termoBusca: string;
  status: string;
  celulaId: string;
  tipoPessoa: string;
}

interface SegmentedNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SegmentedNav: React.FC<SegmentedNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { value: 'diretorio', label: 'Diretório', icon: Users },
    { value: 'visitantes', label: 'Visitantes', icon: UserCheck },
    { value: 'aniversarios', label: 'Aniversários', icon: Calendar },
    { value: 'analises', label: 'Análises', icon: TrendingUp },
    { value: 'familias', label: 'Famílias', icon: Heart },
    { value: 'localizacao', label: 'Localização', icon: MapPin },
  ];

  return (
    <div className="w-full">
      {/* Mobile: Grid layout com quebra de linha */}
      <div className="sm:hidden">
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-background text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }
                `}
              >
                <Icon className={`h-4 w-4 mb-1 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Full horizontal layout */}
      <div className="hidden sm:flex gap-1 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`
                flex items-center justify-center flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }
              `}
            >
              <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-primary' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-8 w-8 bg-muted rounded"></div>
          </div>
          <div className="h-8 bg-muted rounded w-12 mb-2"></div>
          <div className="h-3 bg-muted rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              <Badge 
                variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                className="text-xs px-1.5 py-0.5"
              >
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface CardMembroProps {
  pessoa: Pessoa;
  onAction: (action: string, pessoa: Pessoa) => void;
}

const CardMembro: React.FC<CardMembroProps> = ({ pessoa, onAction }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'visitante': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-muted">
            <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(pessoa.nome_completo)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate">{pessoa.nome_completo}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onAction('view', pessoa)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction('edit', pessoa)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onAction('deactivate', pessoa)}
                    className="text-orange-600"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Desativar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onAction('delete', pessoa)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-1">
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0.5 ${getStatusColor(pessoa.situacao)}`}
              >
                {pessoa.tipo_pessoa}
              </Badge>
              
              {pessoa.celulas?.nome && (
                <p className="text-xs text-muted-foreground truncate">
                  Célula: {pessoa.celulas.nome}
                </p>
              )}
              
              {pessoa.email && (
                <p className="text-xs text-muted-foreground truncate">{pessoa.email}</p>
              )}
            </div>
            
            {/* Ações Rápidas */}
            <div className="flex gap-1 mt-3">
              {pessoa.telefone && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('whatsapp', pessoa)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('call', pessoa)}
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                </>
              )}
              {pessoa.email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => onAction('email', pessoa)}
                >
                  <Mail className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ListaMembroProps {
  pessoas: Pessoa[];
  onAction: (action: string, pessoa: Pessoa) => void;
}

const ListaMembro: React.FC<ListaMembroProps> = ({ pessoas, onAction }) => {
  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'ativo': return 'text-green-600';
      case 'inativo': return 'text-gray-600';
      case 'visitante': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <table className="w-full min-w-[600px]">
        <thead className="border-b">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pessoa</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Contato</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Célula</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map((pessoa) => (
            <tr key={pessoa.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {pessoa.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{pessoa.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{pessoa.tipo_pessoa}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <div className="text-sm">
                  {pessoa.email && <p className="text-foreground">{pessoa.email}</p>}
                  {pessoa.telefone && <p className="text-muted-foreground">{pessoa.telefone}</p>}
                </div>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <p className="text-sm text-foreground">{pessoa.celulas?.nome || '-'}</p>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className={`text-xs ${getStatusColor(pessoa.situacao)}`}>
                  {pessoa.situacao}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onAction('view', pessoa)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {pessoa.telefone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onAction('whatsapp', pessoa)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onAction('edit', pessoa)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onAction('deactivate', pessoa)}
                        className="text-orange-600"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Desativar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onAction('delete', pessoa)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import BirthdayNotificationSettings from '@/components/notifications/BirthdayNotificationSettings';

// Componente para exibir aniversariantes
const AniversariosContent: React.FC = () => {
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'lista' | 'configuracoes'>('lista');

  useEffect(() => {
    const loadAniversariantes = async () => {
      try {
        const { data } = await supabase
          .from('pessoas')
          .select('id, nome_completo, data_nascimento, telefone, email, foto_url')
          .eq('situacao', 'ativo')
          .not('data_nascimento', 'is', null);

        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        
        const aniversariantesDoMes = data?.filter((pessoa: any) => {
          const dataNasc = new Date(pessoa.data_nascimento);
          return dataNasc.getMonth() === mesAtual;
        }).sort((a: any, b: any) => {
          const diaA = new Date(a.data_nascimento).getDate();
          const diaB = new Date(b.data_nascimento).getDate();
          return diaA - diaB;
        }) || [];

        setAniversariantes(aniversariantesDoMes);
      } catch (error) {
        console.error('Erro ao buscar aniversariantes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAniversariantes();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando aniversariantes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Sub-navegação */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeSubTab === 'lista' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSubTab('lista')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Lista de Aniversariantes
        </Button>
        <Button
          variant={activeSubTab === 'configuracoes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSubTab('configuracoes')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Configurar Notificações
        </Button>
      </div>

      {/* Conteúdo das sub-abas */}
      {activeSubTab === 'lista' && (
        <div className="space-y-4">
          {aniversariantes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum aniversariante neste mês
            </div>
          ) : (
            <div className="grid gap-4">
              {aniversariantes.map((pessoa) => {
                const dataNasc = new Date(pessoa.data_nascimento);
                const idade = new Date().getFullYear() - dataNasc.getFullYear();
                
                return (
                  <div key={pessoa.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {pessoa.nome_completo.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{pessoa.nome_completo}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dataNasc.getDate()}/{dataNasc.getMonth() + 1} - {idade} anos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {pessoa.telefone && (
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {pessoa.email && (
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'configuracoes' && (
        <BirthdayNotificationSettings />
      )}
    </div>
  );
};

// Componente para exibir análises
interface AnalisesContentProps {
  kpiData: KPIData;
}

const AnalisesContent: React.FC<AnalisesContentProps> = ({ kpiData }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const gerarInsights = () => {
    const insights = [];
    
    // Insight sobre engajamento
    if (kpiData.engajamento < 50) {
      insights.push({
        tipo: 'warning',
        icon: AlertTriangle,
        titulo: 'Baixo Engajamento',
        descricao: `Apenas ${kpiData.engajamento}% dos membros estão em células. Recomendamos campanha de integração.`,
        acao: 'Iniciar campanha de células'
      });
    } else if (kpiData.engajamento > 80) {
      insights.push({
        tipo: 'success',
        icon: CheckCircle,
        titulo: 'Excelente Engajamento',
        descricao: `${kpiData.engajamento}% dos membros estão ativos em células. Parabéns!`,
        acao: 'Manter estratégia atual'
      });
    }

    // Insight sobre visitantes
    if (kpiData.visitantes > 10) {
      insights.push({
        tipo: 'info',
        icon: Users,
        titulo: 'Oportunidade de Crescimento',
        descricao: `${kpiData.visitantes} visitantes podem se tornar novos membros com acompanhamento adequado.`,
        acao: 'Intensificar acompanhamento'
      });
    }

    // Insight sobre crescimento
    if (kpiData.novosMembros === 0) {
      insights.push({
        tipo: 'warning',
        icon: TrendingDown,
        titulo: 'Crescimento Estagnado',
        descricao: 'Nenhum novo membro nos últimos 30 dias. Considere estratégias de evangelismo.',
        acao: 'Planejar evangelismo'
      });
    } else if (kpiData.novosMembros > 5) {
      insights.push({
        tipo: 'success',
        icon: TrendingUp,
        titulo: 'Crescimento Acelerado',
        descricao: `${kpiData.novosMembros} novos membros este mês! Excelente trabalho evangelístico.`,
        acao: 'Preparar integração'
      });
    }

    return insights;
  };

  const insights = gerarInsights();

  return (
    <div className="space-y-6">
      {/* Métricas Principais com Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Crescimento Mensal
          </h3>
          {kpiData.historicoMensal && kpiData.historicoMensal.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kpiData.historicoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  labelClassName="text-foreground" 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="membros" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Membros"
                />
                <Line 
                  type="monotone" 
                  dataKey="visitantes" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Visitantes"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Dados insuficientes para gráfico
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Distribuição por Faixa Etária
          </h3>
          {kpiData.membrosPorFaixaEtaria && kpiData.membrosPorFaixaEtaria.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={kpiData.membrosPorFaixaEtaria}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="total"
                  nameKey="faixa"
                  label={({ faixa, value }) => `${faixa}: ${value}`}
                >
                  {kpiData.membrosPorFaixaEtaria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Dados insuficientes para gráfico
            </div>
          )}
        </Card>
      </div>

      {/* Distribuição por Célula */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Membros por Célula
        </h3>
        {kpiData.distribuicaoPorCelula && kpiData.distribuicaoPorCelula.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData.distribuicaoPorCelula}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nome" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhuma célula encontrada
          </div>
        )}
      </Card>

      {/* Insights Inteligentes */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Insights Automáticos
        </h3>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
              <p>Tudo funcionando perfeitamente! Nenhuma ação requerida.</p>
            </div>
          ) : (
            insights.map((insight, index) => {
              const Icon = insight.icon;
              const bgColor = insight.tipo === 'success' 
                ? 'bg-green-50 border-green-200' 
                : insight.tipo === 'warning' 
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200';
              
              const iconColor = insight.tipo === 'success' 
                ? 'text-green-600' 
                : insight.tipo === 'warning' 
                ? 'text-yellow-600'
                : 'text-blue-600';

              return (
                <div key={index} className={`p-4 rounded-lg border ${bgColor}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{insight.titulo}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.descricao}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {insight.acao}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{kpiData.totalAtivos}</div>
          <p className="text-sm text-muted-foreground">Total de Membros Ativos</p>
          <div className="mt-2">
            <Progress value={100} className="h-2" />
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{kpiData.visitantes}</div>
          <p className="text-sm text-muted-foreground">Visitantes Ativos</p>
          <div className="mt-2">
            <Progress 
              value={kpiData.totalAtivos ? (kpiData.visitantes / kpiData.totalAtivos) * 100 : 0} 
              className="h-2" 
            />
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{kpiData.engajamento}%</div>
          <p className="text-sm text-muted-foreground">Taxa de Engajamento</p>
          <div className="mt-2">
            <Progress value={kpiData.engajamento} className="h-2" />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Componente para gestão de famílias
const FamiliasContent: React.FC = () => {
  return <GestaoFamilias />;
};

// Componente para mapeamento por localização
const LocalizacaoContent: React.FC = () => {
  return <MapaLocalizacao />;
};

const PessoasV2Page: React.FC = () => {
  // Main state management - Mobile First foundation
  const [activeTab, setActiveTab] = useState('diretorio');
  const [viewMode, setViewMode] = useState<'lista' | 'cards'>('cards');
  const [filtrosPessoas, setFiltrosPessoas] = useState<FiltrosPessoas>({
    termoBusca: '',
    status: 'all',
    celulaId: 'all',
    tipoPessoa: 'all',
  });
  const [listaDePessoas, setListaDePessoas] = useState<Pessoa[]>([]);
  const [celulas, setCelulas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  // KPI Intelligent Cards state
  const [kpiData, setKpiData] = useState<KPIData>({
    novosMembros: 0,
    visitantes: 0,
    aniversariantes: 0,
    totalAtivos: 0,
    engajamento: 0,
  });
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
    loadCelulas();
    fetchPessoas();
  }, []);

  // Debounced effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPessoas();
    }, 300);

    return () => clearTimeout(timer);
  }, [filtrosPessoas]);

  const loadCelulas = async () => {
    try {
      const { data, error } = await supabase
        .from('celulas')
        .select('id, nome')
        .eq('ativa', true)
        .order('nome');
      
      if (error) {
        console.error('Erro ao carregar células:', error);
        return;
      }
      
      setCelulas(data || []);
    } catch (error) {
      console.error('Erro ao carregar células:', error);
    }
  };

  const fetchPessoas = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('pessoas')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
          tipo_pessoa,
          situacao,
          data_nascimento,
          celula_id,
          foto_url,
          data_membresia,
          dons_talentos,
          celulas!pessoas_celula_id_fkey (nome)
        `);

      // Aplicar filtros dinamicamente
      if (filtrosPessoas.termoBusca) {
        query = query.or(`nome_completo.ilike.%${filtrosPessoas.termoBusca}%,email.ilike.%${filtrosPessoas.termoBusca}%`);
      }
      
      if (filtrosPessoas.status && filtrosPessoas.status !== 'all') {
        query = query.eq('situacao', filtrosPessoas.status);
      }
      
      if (filtrosPessoas.tipoPessoa && filtrosPessoas.tipoPessoa !== 'all') {
        query = query.eq('tipo_pessoa', filtrosPessoas.tipoPessoa);
      }
      
      if (filtrosPessoas.celulaId && filtrosPessoas.celulaId !== 'all') {
        query = query.eq('celula_id', filtrosPessoas.celulaId);
      }

      const { data, error } = await query.order('nome_completo');

      if (error) {
        console.error('Erro no Supabase:', error);
        throw error;
      }
      
      setListaDePessoas(data || []);

    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
      toast({
        title: 'Erro ao buscar pessoas',
        description: 'Não foi possível carregar a lista de pessoas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FiltrosPessoas, value: string) => {
    setFiltrosPessoas(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFiltrosPessoas({
      termoBusca: '',
      status: 'all',
      celulaId: 'all',
      tipoPessoa: 'all',
    });
  };

  const handleMemberAction = (action: string, pessoa: Pessoa) => {
    switch (action) {
      case 'whatsapp':
        if (pessoa.telefone) {
          window.open(`https://wa.me/55${pessoa.telefone.replace(/\D/g, '')}`, '_blank');
        }
        break;
      case 'call':
        if (pessoa.telefone) {
          window.open(`tel:${pessoa.telefone}`, '_blank');
        }
        break;
      case 'email':
        if (pessoa.email) {
          window.open(`mailto:${pessoa.email}`, '_blank');
        }
        break;
      case 'view':
        setSelectedPessoa(pessoa);
        setIsPerfilModalOpen(true);
        break;
      case 'edit':
        setSelectedPessoa(pessoa);
        setIsPerfilModalOpen(false); // Fechar modal de perfil se estiver aberto
        setIsEditModalOpen(true);
        break;
      case 'deactivate':
        toast({
          title: 'Desativar Pessoa',
          description: `${pessoa.nome_completo} será desativado(a)`,
          variant: 'destructive',
        });
        break;
      case 'delete':
        toast({
          title: 'Excluir Pessoa',
          description: `${pessoa.nome_completo} será excluído(a) permanentemente`,
          variant: 'destructive',
        });
        break;
      default:
        break;
    }
  };

  // Filtered results count
  const totalResultados = listaDePessoas.length;

  const handleAddPerson = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    fetchPessoas(); // Recarregar lista
  };

  const loadKPIData = async () => {
    try {
      setKpiLoading(true);

      // Novos membros (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: novosMembros } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .gte('data_membresia', thirtyDaysAgo.toISOString().split('T')[0])
        .eq('situacao', 'ativo');

      // Visitantes ativos
      const { count: visitantes } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('tipo_pessoa', 'visitante')
        .eq('situacao', 'ativo');

      // Total de pessoas ativas
      const { count: totalAtivos } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('situacao', 'ativo');

      // Aniversariantes desta semana
      const { data: todasPessoas } = await supabase
        .from('pessoas')
        .select('data_nascimento')
        .eq('situacao', 'ativo')
        .not('data_nascimento', 'is', null);

      const aniversariantesSemana = todasPessoas?.filter((pessoa: any) => {
        if (!pessoa.data_nascimento) return false;
        
        const dataNasc = new Date(pessoa.data_nascimento);
        const hoje = new Date();
        
        const proximoAniversario = new Date(hoje.getFullYear(), dataNasc.getMonth(), dataNasc.getDate());
        if (proximoAniversario < hoje) {
          proximoAniversario.setFullYear(hoje.getFullYear() + 1);
        }
        
        const diffTime = proximoAniversario.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 0 && diffDays <= 7;
      }) || [];

      // Calcular engajamento
      const { count: pessoasComCelula } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('situacao', 'ativo')
        .not('celula_id', 'is', null);

      const engajamento = totalAtivos ? Math.round((pessoasComCelula / totalAtivos) * 100) : 0;

      // Dados para análises avançadas
      // 1. Distribuição por faixa etária
      const { data: pessoasComIdade } = await supabase
        .from('pessoas')
        .select('data_nascimento')
        .eq('situacao', 'ativo')
        .not('data_nascimento', 'is', null);

      const faixasEtarias = { '0-17': 0, '18-35': 0, '36-55': 0, '56+': 0 };
      pessoasComIdade?.forEach(pessoa => {
        if (pessoa.data_nascimento) {
          const idade = new Date().getFullYear() - new Date(pessoa.data_nascimento).getFullYear();
          if (idade <= 17) faixasEtarias['0-17']++;
          else if (idade <= 35) faixasEtarias['18-35']++;
          else if (idade <= 55) faixasEtarias['36-55']++;
          else faixasEtarias['56+']++;
        }
      });

      const membrosPorFaixaEtaria = Object.entries(faixasEtarias).map(([faixa, total]) => ({
        faixa: faixa + ' anos',
        total
      }));

      // 2. Distribuição por célula
      const { data: celulasComMembros } = await supabase
        .from('celulas')
        .select(`
          id, 
          nome,
          pessoas!pessoas_celula_id_fkey(id)
        `)
        .eq('ativa', true);

      const distribuicaoPorCelula = celulasComMembros?.map(celula => ({
        nome: celula.nome,
        total: (celula.pessoas as any[])?.length || 0
      })).sort((a, b) => b.total - a.total) || [];

      // 3. Histórico mensal (últimos 6 meses)
      const historicoMensal = [];
      for (let i = 5; i >= 0; i--) {
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - i, 1);
        const dataFim = new Date(dataInicio);
        dataFim.setMonth(dataFim.getMonth() + 1, 0);

        const { count: membrosMes } = await supabase
          .from('pessoas')
          .select('id', { count: 'exact', head: true })
          .lte('data_membresia', dataFim.toISOString().split('T')[0])
          .eq('situacao', 'ativo')
          .eq('tipo_pessoa', 'membro');

        const { count: visitantesMes } = await supabase
          .from('pessoas')  
          .select('id', { count: 'exact', head: true })
          .gte('created_at', dataInicio.toISOString())
          .lte('created_at', dataFim.toISOString())
          .eq('tipo_pessoa', 'visitante');

        historicoMensal.push({
          mes: dataInicio.toLocaleDateString('pt-BR', { month: 'short' }),
          membros: membrosMes || 0,
          visitantes: visitantesMes || 0
        });
      }

      setKpiData({
        novosMembros: novosMembros || 0,
        visitantes: visitantes || 0,
        aniversariantes: aniversariantesSemana.length,
        totalAtivos: totalAtivos || 0,
        engajamento,
        membrosPorFaixaEtaria,
        distribuicaoPorCelula,
        historicoMensal
      });

    } catch (error) {
      console.error('Erro ao carregar dados dos KPIs:', error);
    } finally {
      setKpiLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="w-full max-w-full overflow-x-hidden p-4 sm:p-6">
            <div className="space-y-4">
              {/* Título e Subtítulo */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Gestão de Pessoas
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Diretório inteligente com análises e insights em tempo real
                </p>
              </div>

              {/* Navegação Secundária */}
              <SegmentedNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-full overflow-x-hidden p-4 sm:p-6 space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KPICard
              title="Novos Membros"
              value={kpiData.novosMembros}
              icon={UserPlus}
              trend="up"
              trendValue="30 dias"
              loading={kpiLoading}
            />
            <KPICard
              title="Visitantes"
              value={kpiData.visitantes}
              icon={Users}
              trend="neutral"
              trendValue="Ativos"
              loading={kpiLoading}
            />
            <KPICard
              title="Aniversários"
              value={kpiData.aniversariantes}
              icon={Calendar}
              trend="neutral"
              trendValue="Esta semana"
              loading={kpiLoading}
            />
            <KPICard
              title="Total Ativo"
              value={kpiData.totalAtivos}
              icon={Target}
              trend="up"
              trendValue="Membros"
              loading={kpiLoading}
            />
            <div className="col-span-2 sm:col-span-1">
              <KPICard
                title="Engajamento"
                value={`${kpiData.engajamento}%`}
                icon={TrendingUp}
                trend={kpiData.engajamento >= 70 ? 'up' : kpiData.engajamento >= 50 ? 'neutral' : 'down'}
                trendValue="Em células"
              loading={kpiLoading}
              />
            </div>
          </div>

          {/* Advanced Filters Section */}
          {activeTab === 'diretorio' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5" />
                    Filtros de Busca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={filtrosPessoas.termoBusca}
                      onChange={(e) => handleFilterChange('termoBusca', e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select
                      value={filtrosPessoas.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="afastado">Afastado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filtrosPessoas.tipoPessoa}
                      onValueChange={(value) => handleFilterChange('tipoPessoa', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de Pessoa" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        <SelectItem value="membro">Membro</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filtrosPessoas.celulaId}
                      onValueChange={(value) => handleFilterChange('celulaId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Célula" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="all">Todas as Células</SelectItem>
                        {celulas.map((celula) => (
                          <SelectItem key={celula.id} value={celula.id}>
                            {celula.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Header */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Exibindo <span className="font-medium text-foreground">{totalResultados}</span> pessoas
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAddPerson}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Nova Pessoa
                  </Button>
                  
                  <div className="flex gap-1">
                    <Button
                      variant={viewMode === 'lista' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('lista')}
                      className="px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Display */}
              {isLoading ? (
                <Card className="p-8">
                  <div className="text-center space-y-4">
                    <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-muted-foreground">Carregando pessoas...</p>
                  </div>
                </Card>
              ) : listaDePessoas.length === 0 ? (
                <Card className="p-8">
                  <div className="text-center space-y-4">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhuma pessoa encontrada
                      </h3>
                      <p className="text-muted-foreground">
                        Ajuste os filtros ou adicione uma nova pessoa ao sistema.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listaDePessoas.map((pessoa) => (
                    <CardMembro
                      key={pessoa.id}
                      pessoa={pessoa}
                      onAction={handleMemberAction}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <ListaMembro
                    pessoas={listaDePessoas}
                    onAction={handleMemberAction}
                  />
                </Card>
              )}
            </>
          )}

          {/* Aba Aniversários */}
          {activeTab === 'aniversarios' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Aniversários do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AniversariosContent />
              </CardContent>
            </Card>
          )}

          {/* Aba Análises */}
          {activeTab === 'analises' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análises e Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalisesContent kpiData={kpiData} />
              </CardContent>
            </Card>
          )}

          {/* Aba Famílias */}
          {activeTab === 'familias' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Gestão de Famílias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FamiliasContent />
              </CardContent>
            </Card>
          )}

          {/* Aba Localização */}
          {activeTab === 'localizacao' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapeamento por Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocalizacaoContent />
              </CardContent>
            </Card>
          )}

          {/* Aba Visitantes */}
          {activeTab === 'visitantes' && (
            <AcompanhamentoVisitantes />
          )}
        </div>
      </div>

      {/* Modal de Adicionar Pessoa */}
      <ModalAdicionarPessoa
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

        {/* Modal para visualizar perfil da pessoa */}
        <ModalPerfilPessoa
          pessoa={selectedPessoa}
          isOpen={isPerfilModalOpen}
          onClose={() => {
            setIsPerfilModalOpen(false);
            setSelectedPessoa(null);
          }}
          onAction={handleMemberAction}
        />

        {/* Modal para editar pessoa */}
        <ModalEditarPessoa
          pessoa={selectedPessoa}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPessoa(null);
          }}
          onSuccess={() => {
            fetchPessoas(); // Recarregar lista
            setIsEditModalOpen(false);
            setSelectedPessoa(null);
          }}
        />
    </AppLayout>
  );
};

export default PessoasV2Page;