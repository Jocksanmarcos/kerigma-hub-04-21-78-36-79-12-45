import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Home, TrendingUp, Calendar, MapPin, Building2, BarChart3 } from 'lucide-react';
import { useChurches } from '@/hooks/useChurches';
import { useChurchContext } from '@/contexts/ChurchContext';
import { useNewUserRole } from '@/hooks/useNewRole';
import { ResponsiveDashboardGrid } from '@/components/ui/responsive-dashboard-grid';
import { MissoesLayout } from '@/components/missoes/MissoesLayout';
import { ModalCadastrarIgreja } from '@/components/missoes/modals/ModalCadastrarIgreja';
import { MissionCard } from '@/components/missoes/MissionCard';
import { AnalyticsCharts } from '@/components/missoes/AnalyticsCharts';

const Missoes: React.FC = () => {
  const { data: churches = [], isLoading } = useChurches();
  const { isSuperAdmin } = useChurchContext();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<'sede' | 'missao'>('sede');
  const [modalLockType, setModalLockType] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Permitir acesso a pastores, líderes e super admins
  const hasAccess = isSuperAdmin || userRole === 'pastor' || userRole === 'lider';
  const canCreateChurch = isSuperAdmin || userRole === 'pastor';

  // Dados de exemplo para os gráficos
  const crescimentoData = [
    { mes: 'Jan', membros: 120, receitas: 15000, eventos: 8 },
    { mes: 'Fev', membros: 135, receitas: 18000, eventos: 10 },
    { mes: 'Mar', membros: 142, receitas: 16500, eventos: 12 },
    { mes: 'Abr', membros: 158, receitas: 22000, eventos: 9 },
    { mes: 'Mai', membros: 165, receitas: 24000, eventos: 15 },
    { mes: 'Jun', membros: 178, receitas: 26500, eventos: 11 },
  ];

  const distribuicaoData = [
    { name: 'Células Ativas', value: 85 },
    { name: 'Células Inativas', value: 15 },
  ];

  if (roleLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-muted-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas pastores e líderes podem acessar o dashboard de missões.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Dashboard de Missões</h1>
            <p className="text-muted-foreground">
              Visão geral de todas as igrejas e missões da rede
            </p>
          </div>
        </div>
        <ResponsiveDashboardGrid variant="pastor">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveDashboardGrid>
      </div>
    );
  }

  const sedeChurches = churches.filter(church => church.type === 'sede');
  const missaoChurches = churches.filter(church => church.type === 'missao');

  const handleNovaIgreja = (tipo: 'sede' | 'missao', lockType: boolean = false) => {
    setModalInitialType(tipo);
    setModalLockType(lockType);
    setShowCreateModal(true);
  };

  return (
    <MissoesLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Dashboard de Missões</h1>
          <p className="text-muted-foreground">
            Visão geral de todas as igrejas e missões da rede CBN Kerigma
          </p>
        </div>
        {canCreateChurch && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showAnalytics ? 'Ocultar' : 'Mostrar'} Analytics
            </Button>
            <Button 
              className="gap-2"
              onClick={() => handleNovaIgreja('missao')}
              disabled={sedeChurches.length === 0}
            >
              <Plus className="h-4 w-4" />
              Nova Missão
            </Button>
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Avançado
          </h2>
          <AnalyticsCharts 
            crescimentoData={crescimentoData}
            distribuicaoData={distribuicaoData}
          />
        </div>
      )}

      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{churches.length}</div>
                <div className="text-sm text-muted-foreground">Total de Igrejas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{sedeChurches.length}</div>
                <div className="text-sm text-muted-foreground">Igrejas Sede</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{missaoChurches.length}</div>
                <div className="text-sm text-muted-foreground">Missões</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">
                  0
                </div>
                <div className="text-sm text-muted-foreground">Total de Membros</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Igrejas Sede */}
      {sedeChurches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Home className="h-6 w-6" />
            Igrejas Sede
          </h2>
          <ResponsiveDashboardGrid variant="pastor">
            {sedeChurches.map((church) => (
              <MissionCard key={church.id} church={church} />
            ))}
          </ResponsiveDashboardGrid>
        </div>
      )}

      {/* Missões */}
      {missaoChurches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Missões
          </h2>
          <ResponsiveDashboardGrid variant="pastor">
            {missaoChurches.map((church) => (
              <MissionCard key={church.id} church={church} />
            ))}
          </ResponsiveDashboardGrid>
        </div>
      )}

      {/* Empty state */}
      {churches.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-muted-foreground">Nenhuma igreja encontrada</h2>
            <p className="text-muted-foreground">
              Comece criando sua primeira igreja ou missão.
            </p>
          </div>
          {canCreateChurch && (
            <Button 
              className="gap-2"
              onClick={() => handleNovaIgreja('sede', true)}
            >
              <Plus className="h-4 w-4" />
              Criar Primeira Igreja
            </Button>
          )}
        </div>
      )}
      </div>

      <ModalCadastrarIgreja
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        initialType={modalInitialType}
        lockType={modalLockType}
      />
    </MissoesLayout>
  );
};

export default Missoes;