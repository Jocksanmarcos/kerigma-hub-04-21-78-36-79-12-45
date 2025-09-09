import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  Calendar, 
  Plus, 
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { MissoesLayout } from '@/components/missoes/MissoesLayout';
import { useChurches } from '@/hooks/useChurches';
import { useChurchContext } from '@/contexts/ChurchContext';
import { useNewUserRole } from '@/hooks/useNewRole';
import { useMissoesEventos } from '@/hooks/useMissoesEventos';
import { ResponsiveDashboardGrid } from '@/components/ui/responsive-dashboard-grid';
import { DateRange } from 'react-day-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ModalCadastrarEvento } from '@/components/missoes/modals/ModalCadastrarEvento';

const MissoesEventos: React.FC = () => {
  const { data: churches = [], isLoading } = useChurches();
  const { data: eventos = [], isLoading: eventosLoading } = useMissoesEventos();
  const { isSuperAdmin } = useChurchContext();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMissao, setSelectedMissao] = useState<string>('todas');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canManageEventos = isSuperAdmin || userRole === 'pastor';

  // Filter events based on search and filters
  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMissao = selectedMissao === 'todas' || evento.church_id === selectedMissao;
    const matchesTipo = selectedTipo === 'todos' || evento.tipo === selectedTipo;
    const matchesStatus = selectedStatus === 'todos' || evento.status === selectedStatus;
    
    let matchesPeriod = true;
    if (selectedPeriod?.from) {
      const eventoDate = new Date(evento.data_evento);
      matchesPeriod = eventoDate >= selectedPeriod.from && 
                     (!selectedPeriod.to || eventoDate <= selectedPeriod.to);
    }

    return matchesSearch && matchesMissao && matchesTipo && matchesStatus && matchesPeriod;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planejado: { label: 'Planejado', variant: 'secondary' as const },
      confirmado: { label: 'Confirmado', variant: 'default' as const },
      em_andamento: { label: 'Em Andamento', variant: 'default' as const },
      concluido: { label: 'Concluído', variant: 'default' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planejado;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      culto: { label: 'Culto', color: 'bg-blue-100 text-blue-800' },
      evangelismo: { label: 'Evangelismo', color: 'bg-green-100 text-green-800' },
      treinamento: { label: 'Treinamento', color: 'bg-purple-100 text-purple-800' },
      conferencia: { label: 'Conferência', color: 'bg-orange-100 text-orange-800' },
      social: { label: 'Social', color: 'bg-pink-100 text-pink-800' }
    };
    
    const config = tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.conferencia;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading || eventosLoading || roleLoading) {
    return (
      <MissoesLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MissoesLayout>
    );
  }

  return (
    <MissoesLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Eventos das Missões</h1>
            <p className="text-muted-foreground">
              Gerencie eventos, conferências e atividades das missões
            </p>
          </div>
          
          {canManageEventos && (
            <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <ResponsiveDashboardGrid>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold">{eventos.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próximos Eventos</p>
                  <p className="text-2xl font-bold">
                    {eventos.filter(e => new Date(e.data_evento) > new Date()).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold">
                    {eventos.filter(e => e.status === 'em_andamento').length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </ResponsiveDashboardGrid>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedMissao} onValueChange={setSelectedMissao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as missões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Missões</SelectItem>
                  {churches.filter(c => c.type === 'missao').map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="culto">Culto</SelectItem>
                  <SelectItem value="evangelismo">Evangelismo</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="conferencia">Conferência</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <DatePickerWithRange
                selected={selectedPeriod}
                onSelect={setSelectedPeriod}
              />
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {filteredEventos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEventos.map((evento) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-lg">{evento.nome}</h3>
                      <div className="flex flex-wrap gap-2">
                        {getTipoBadge(evento.tipo)}
                        {getStatusBadge(evento.status)}
                      </div>
                    </div>
                    {canManageEventos && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {evento.descricao}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(evento.data_evento).toLocaleDateString('pt-BR')}</span>
                      {evento.data_fim && (
                        <span className="text-muted-foreground">
                          até {new Date(evento.data_fim).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    
                    {evento.local && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{evento.local}</span>
                      </div>
                    )}
                    
                    {evento.church && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{evento.church.nome}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {eventos.length === 0 ? 'Nenhum evento cadastrado' : 'Nenhum evento encontrado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {eventos.length === 0 
                ? 'Comece criando seu primeiro evento para as missões.'
                : 'Tente ajustar os filtros para encontrar outros eventos.'
              }
            </p>
            {canManageEventos && eventos.length === 0 && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            )}
          </div>
        )}

        {/* Modal de Criar Evento */}
        <ModalCadastrarEvento
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </MissoesLayout>
  );
};

export default MissoesEventos;