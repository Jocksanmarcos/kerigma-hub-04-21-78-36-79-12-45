import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  FileText,
  PieChart
} from 'lucide-react';
import { MissoesLayout } from '@/components/missoes/MissoesLayout';
import { useChurches } from '@/hooks/useChurches';
import { useChurchContext } from '@/contexts/ChurchContext';
import { useNewUserRole } from '@/hooks/useNewRole';
import { ResponsiveDashboardGrid } from '@/components/ui/responsive-dashboard-grid';
import { DateRange } from 'react-day-picker';
import { ModalGerarRelatorio } from '@/components/missoes/modals/ModalGerarRelatorio';

interface RelatorioItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'financeiro' | 'crescimento' | 'evangelismo' | 'geral';
  icone: React.ElementType;
  cor: string;
}

const relatoriosDisponiveis: RelatorioItem[] = [
  {
    id: 'crescimento-missoes',
    titulo: 'Crescimento das Missões',
    descricao: 'Análise de crescimento de membros nas missões por período',
    tipo: 'crescimento',
    icone: TrendingUp,
    cor: 'bg-green-500'
  },
  {
    id: 'financeiro-comparativo',
    titulo: 'Financeiro Comparativo',
    descricao: 'Comparação de entradas e saídas entre missões',
    tipo: 'financeiro',
    icone: DollarSign,
    cor: 'bg-blue-500'
  },
  {
    id: 'evangelismo-resultados',
    titulo: 'Resultados de Evangelismo',
    descricao: 'Conversões, batismos e novos membros por missão',
    tipo: 'evangelismo',
    icone: Users,
    cor: 'bg-purple-500'
  },
  {
    id: 'distribuicao-geografica',
    titulo: 'Distribuição Geográfica',
    descricao: 'Mapeamento e alcance das missões por região',
    tipo: 'geral',
    icone: MapPin,
    cor: 'bg-orange-500'
  },
  {
    id: 'consolidacao-geral',
    titulo: 'Consolidação Geral',
    descricao: 'Relatório completo de todas as atividades',
    tipo: 'geral',
    icone: FileText,
    cor: 'bg-gray-500'
  },
  {
    id: 'performance-ministerios',
    titulo: 'Performance dos Ministérios',
    descricao: 'Análise de participação nos ministérios por missão',
    tipo: 'geral',
    icone: PieChart,
    cor: 'bg-indigo-500'
  }
];

const MissoesRelatorios: React.FC = () => {
  const { data: churches = [], isLoading } = useChurches();
  const { isSuperAdmin } = useChurchContext();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>();
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedChurch, setSelectedChurch] = useState<string>('todas');
  const [modalRelatorio, setModalRelatorio] = useState<{
    isOpen: boolean;
    tipo: string;
    titulo: string;
  }>({
    isOpen: false,
    tipo: '',
    titulo: ''
  });

  const hasAccess = isSuperAdmin || userRole === 'pastor' || userRole === 'lider';

  if (roleLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <MissoesLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-muted-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas pastores e líderes podem acessar os relatórios de missões.
            </p>
          </div>
        </div>
      </MissoesLayout>
    );
  }

  const filteredRelatorios = selectedType === 'todos' 
    ? relatoriosDisponiveis 
    : relatoriosDisponiveis.filter(rel => rel.tipo === selectedType);

  const handleGerarRelatorio = (relatorioId: string) => {
    const relatorio = relatoriosDisponiveis.find(r => r.id === relatorioId);
    if (relatorio) {
      setModalRelatorio({
        isOpen: true,
        tipo: relatorio.tipo,
        titulo: relatorio.titulo
      });
    }
  };

  return (
    <MissoesLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Relatórios de Missões</h1>
            <p className="text-muted-foreground">
              Análises e relatórios detalhados sobre as missões da rede
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Todos
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <DatePickerWithRange
                selected={selectedPeriod}
                onSelect={setSelectedPeriod}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="crescimento">Crescimento</SelectItem>
                  <SelectItem value="evangelismo">Evangelismo</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Igreja/Missão</label>
              <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a igreja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Igrejas</SelectItem>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{churches.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Missões</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">--</p>
                  <p className="text-sm text-muted-foreground">Crescimento Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">--</p>
                  <p className="text-sm text-muted-foreground">Membros Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relatórios Disponíveis */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Relatórios Disponíveis</h2>
          <ResponsiveDashboardGrid variant="pastor">
            {filteredRelatorios.map((relatorio) => {
              const IconComponent = relatorio.icone;
              return (
                <Card key={relatorio.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg ${relatorio.cor} flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{relatorio.titulo}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {relatorio.tipo.charAt(0).toUpperCase() + relatorio.tipo.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {relatorio.descricao}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleGerarRelatorio(relatorio.id)}
                        className="flex-1 gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Gerar Relatório
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ResponsiveDashboardGrid>
        </div>

        {/* Histórico de Relatórios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* TODO: Replace with real report history from database */}
              {[].map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Gerado em {item.data} • {item.tipo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'Concluído' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                    {item.status === 'Concluído' && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {/* Show empty state when no reports */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum relatório gerado ainda</p>
                <p className="text-sm text-muted-foreground">Os relatórios aparecerão aqui após serem gerados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Geração de Relatório */}
        <ModalGerarRelatorio
          isOpen={modalRelatorio.isOpen}
          onClose={() => setModalRelatorio({ isOpen: false, tipo: '', titulo: '' })}
          relatorioTipo={modalRelatorio.tipo}
          relatorioTitulo={modalRelatorio.titulo}
        />
      </div>
    </MissoesLayout>
  );
};

export default MissoesRelatorios;